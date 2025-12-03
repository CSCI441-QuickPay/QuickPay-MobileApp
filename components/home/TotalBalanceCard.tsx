import UserModel from '@/models/UserModel';
import { useEffect, useState } from 'react';
import { DeviceEventEmitter, Text, TouchableOpacity, View } from 'react-native';

export default function TotalBalanceCard() {
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadBalance() {
    setLoading(true);
    try {
      const um = UserModel as any;
      if (!um) return;

      if (typeof um.getBalance === 'function') {
        const b = await um.getBalance();
        setTotal(typeof b === 'number' ? b : null);
        return;
      }
      if (typeof um.balance === 'function') {
        const b = await um.balance();
        setTotal(typeof b === 'number' ? b : null);
        return;
      }
      if (typeof um.balance === 'number') {
        setTotal(um.balance);
        return;
      }

      if (typeof um.refresh === 'function') {
        await um.refresh();
        if (typeof um.getBalance === 'function') {
          const b = await um.getBalance();
          setTotal(typeof b === 'number' ? b : null);
        } else if (typeof um.balance === 'function') {
          const b = await um.balance();
          setTotal(typeof b === 'number' ? b : null);
        }
      }
    } catch (e) {
      console.warn('TotalBalanceCard: failed to load balance', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBalance();

    const sub = DeviceEventEmitter.addListener('user:updated', async (payload: any) => {
      console.log('[TotalBalanceCard] received user:updated', payload);
      await loadBalance();
    });

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <View style={{ padding: 18, borderRadius: 12, backgroundColor: '#0f766e' }}>
      <Text style={{ color: '#d1fae5', fontSize: 12 }}>Total Balance</Text>
      <Text style={{ color: 'white', fontSize: 36, fontWeight: '700', marginTop: 6 }}>
        {total !== null ? `$${total.toFixed(2)}` : loading ? 'Loading…' : '$--.--'}
      </Text>

      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <TouchableOpacity style={{ marginRight: 12, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#064e45', borderRadius: 10 }}>
          <Text style={{ color: '#a7f3d0' }}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#064e45', borderRadius: 10 }}>
          <Text style={{ color: '#a7f3d0' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}