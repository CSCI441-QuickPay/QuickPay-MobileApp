import { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function TestNetwork() {
  useEffect(() => {
    testNetwork();
  }, []);

  async function testNetwork() {
    console.log('🧪 Testing network from React Native...\n');

    console.log('Test 1: Fetch google.com');
    try {
      const response = await fetch('https://www.google.com');
      console.log('✅ Google:', response.status);
    } catch (error: any) {
      console.error('❌ Google failed:', error.message);
    }

    console.log('\nTest 2: Fetch Supabase');
    try {
      const response = await fetch('https://orptfearwcypftrjkoaa.supabase.co');
      console.log('✅ Supabase:', response.status);
    } catch (error: any) {
      console.error('❌ Supabase failed:', error.message);
    }

    console.log('\nTest 3: Fetch Supabase REST API');
    try {
      const response = await fetch(
        'https://orptfearwcypftrjkoaa.supabase.co/rest/v1/',
        {
          headers: {
            'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
          }
        }
      );
      console.log('✅ Supabase REST API:', response.status);
    } catch (error: any) {
      console.error('❌ Supabase REST API failed:', error.message);
    }
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Network Test
      </Text>
      <Text>Check console for results...</Text>
    </View>
  );
}
