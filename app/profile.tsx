import BottomNav from '@/components/BottomNav';
import ProfileOption, { ProfileOptionProps } from '@/components/ProfileOption';
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

// Profile Screen Component
export default function Profile() {

    //  Data for profile options
    {/* Call the prop here again because it mistakely read the icon as string.*/}
    const option: ProfileOptionProps[] = [ 
        { icon: "person-outline", label: "My Profile", onPress: () => console.log("Go to My Profile") },
        { icon: "shield-checkmark-outline", label: "Security", onPress: () => console.log("Go to Security") },
        { icon: "language-outline", label: "Language", onPress: () => console.log("Go to Language") },
        { icon: "call-outline", label: "Contact Us", onPress: () => router.push("/contactus") },
        { icon: "document-text-outline", label: "Terms & Conditions", onPress: () => console.log("Go to Terms") },
    ]

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 ">
            <View className="items-center mt-4 px-4 relative h-[300px]">

                {/* Setting button */}
                <TouchableOpacity className="absolute right-10 top-5">
                    <Ionicons name="settings-outline" size={37} color="#000"/>
                </TouchableOpacity>

                {/* Profile Avatar */}
                <Image
                    source={require('@/assets/images/user_profile.jpg')}
                    className="w-[149] h-[149] rounded-full mt-[70] border border-black"
                    />

                {/* User Name & id */}
                <Text className= "text-[28px] font-bold mt-2">Emily</Text>
                <Text className= "text-gray-500 font-bold text-subheading">ID: xxx xxx xxx</Text>

            </View>

            {/* Profile Options List */}
            <View className="bg-gray-100 flex-1 items-center">
                <View className="mt-2 px-4 pt-4">

                    {/* Map through options and render ProfileOption components */}
                    {option.map((option, index) => (
                        <ProfileOption 
                            key={index} {...option}
                        />
                    ))}
                </View>

                {/* App Version Label */}
                <View className="items-center mt-2">
                    <Text className="text-gray-500 font-bold text-normal">
                        App Version: V X.xx
                    </Text>
                </View>
            </View>
        </View>
        {/* Bottom Navigation */}
        <BottomNav
            items={[
            {
                label: "Home",
                icon: (color) => <Ionicons name="home" size={34} color={color} />,
                onPress: () => router.push("/"),
                
            },
            {
                label: "Budget",
                icon: (color) => <MaterialIcons name="account-tree" size={34} color={color} />,
                onPress: () => console.log("Go Budget"),
            },
            {
                label: "Scan",
                icon: (color) => <AntDesign name="qrcode" size={40} color={color} />,
                onPress: () => console.log("Go Scan"),
                special: true,
            },
            {
                label: "Favorite",
                icon: (color) => <AntDesign name="star" size={34} color={color} />,
                onPress: () => router.push("/favorite"),
            },
            {
                label: "Profile",
                icon: (color) => <Ionicons name="person-outline" size={34} color={color} />,
                onPress: () => router.push("/profile"),
                active: true,
            }
            ]}
        />
        
    </SafeAreaView>
  );

}