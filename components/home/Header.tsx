import UserModel from '@/models/UserModel';
import { fetchProfile } from "@/services/profileService";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { DeviceEventEmitter, Image, Text, TouchableOpacity, View } from "react-native";
import QRCodeModal from "./QRCodeModal";

export default function Header() {
  const [showQRModal, setShowQRModal] = useState(false);
  const { user, isLoaded } = useUser();
  const [supabaseProfile, setSupabaseProfile] = useState<{ profile_picture?: string | null } | null>(null);
  const [totalBalance, setTotalBalance] = useState<number | null>(null);

  if (!isLoaded || !user) return null;

  // Load Supabase profile (for avatar)
  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user?.id) return;
      try {
        const p = await fetchProfile(user.id);
        setSupabaseProfile(p);
      } catch (err) {
        console.log("Header fetchProfile error:", err);
      }
    };

    load();
  }, [isLoaded, user?.id]);

  // Load balance helper
  async function loadBalance() {
    try {
      const um = UserModel as any;
      if (!um) return;

      if (typeof um.getBalance === 'function') {
        const b = await um.getBalance();
        setTotalBalance(typeof b === 'number' ? b : null);
        return;
      }
      if (typeof um.balance === 'function') {
        const b = await um.balance();
        setTotalBalance(typeof b === 'number' ? b : null);
        return;
      }
      if (typeof um.balance === 'number') {
        setTotalBalance(um.balance);
        return;
      }

      // last resort: try a refresh method then retry reading
      if (typeof um.refresh === 'function') {
        await um.refresh(user.id);
        // try again after refresh
        if (typeof um.getBalance === 'function') {
          const b = await um.getBalance();
          setTotalBalance(typeof b === 'number' ? b : null);
        } else if (typeof um.balance === 'function') {
          const b = await um.balance();
          setTotalBalance(typeof b === 'number' ? b : null);
        }
      }
    } catch (e) {
      console.warn('Header: failed to load balance', e);
    }
  }

  // Subscribe to user:updated events so header reloads balance
  useEffect(() => {
    loadBalance(); // initial load

    const sub = DeviceEventEmitter.addListener('user:updated', async (payload: any) => {
      // optional: you can check payload.userId to ensure it matches current user
      await loadBalance();
    });

    return () => {
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Initials fallback
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const initials = getInitials(fullName);

  return (
    <>
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* User Info */}
        <View className="flex-row items-center">
          {/* Avatar or initials */}
          <View className="w-12 h-12 rounded-full bg-[#00332d] overflow-hidden items-center justify-center mr-3">
            {supabaseProfile?.profile_picture ? (
              <Image
                source={{ uri: supabaseProfile.profile_picture }}
                className="w-12 h-12"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-white text-lg font-bold">{initials}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm text-gray-600">Welcome back,</Text>
            <Text className="text-xl font-bold text-gray-900">
              {user.firstName}
            </Text>
            <Text className="text-base font-semibold text-[#074f46] mt-1">
              {totalBalance !== null ? `$${totalBalance.toFixed(2)}` : '$--.--'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowQRModal(true)}
            className="w-12 h-12 rounded-full bg-[#FB2C36] items-center justify-center"
            style={{
              shadowColor: "#00332d",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="qr-code-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <QRCodeModal visible={showQRModal} onClose={() => setShowQRModal(false)} />
    </>
  );
}