/**
 * Check if default balance is set correctly in database
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDefaultBalance() {
  console.log('\n💰 Checking Default QuickPay Balance\n');
  console.log('═'.repeat(80));

  try {
    // Get all users sorted by creation date
    const { data: users, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, balance, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    console.log('\n📝 Recent Users (Last 10):');
    console.log('─'.repeat(80));

    users.forEach((user, index) => {
      const createdDate = new Date(user.created_at).toISOString().split('T')[0];
      console.log('\n' + (index + 1) + '. ' + user.first_name + ' ' + user.last_name);
      console.log('   Email: ' + user.email);
      console.log('   Balance: $' + user.balance);
      console.log('   Created: ' + createdDate);
      console.log('   ✓ Has $500? ' + (user.balance === 500 ? 'YES ✓' : 'NO ❌'));
    });

    console.log('\n' + '═'.repeat(80));

    const usersWithout500 = users.filter(u => u.balance !== 500);
    console.log('\n💡 SUMMARY:');
    console.log('   Total users checked: ' + users.length);
    console.log('   Users with $500: ' + (users.length - usersWithout500.length));
    console.log('   Users without $500: ' + usersWithout500.length);

    if (usersWithout500.length > 0) {
      console.log('\n⚠️  ISSUE DETECTED:');
      console.log('   Some users don\'t have $500 QuickPay balance');
      console.log('\n📋 TO FIX:');
      console.log('   1. Apply migration 007 in Supabase Dashboard');
      console.log('   2. Or run: node scripts/set-all-users-balance-500.js');
    } else {
      console.log('\n✅ All users have $500 QuickPay balance!');
      console.log('   Migration 007 has been applied successfully');
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDefaultBalance();
