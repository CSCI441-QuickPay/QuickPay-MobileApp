/**
 * Set users with $0 balance to $500
 * This fixes new users who were created before migration 007
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function setZeroBalanceUsersTo500() {
  console.log('\n💰 Setting Users with $0 Balance to $500\n');
  console.log('═'.repeat(80));

  try {
    // Get all users with $0 balance
    const { data: zeroBalanceUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, balance')
      .eq('balance', 0);

    if (fetchError) throw fetchError;

    if (!zeroBalanceUsers || zeroBalanceUsers.length === 0) {
      console.log('\n✅ No users found with $0 balance!');
      console.log('   All users already have QuickPay balance\n');
      return;
    }

    console.log('\n📝 Found ' + zeroBalanceUsers.length + ' user(s) with $0 balance:');
    console.log('─'.repeat(80));

    zeroBalanceUsers.forEach((user, index) => {
      console.log('\n' + (index + 1) + '. ' + user.first_name + ' ' + user.last_name);
      console.log('   Email: ' + user.email);
      console.log('   Current Balance: $' + user.balance);
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n🔄 Updating all to $500...\n');

    // Update all users with $0 balance to $500
    const { data: updatedUsers, error: updateError } = await supabase
      .from('users')
      .update({ balance: 500 })
      .eq('balance', 0)
      .select('id, first_name, last_name, email, balance');

    if (updateError) throw updateError;

    console.log('✅ Successfully updated ' + updatedUsers.length + ' user(s):');
    console.log('─'.repeat(80));

    updatedUsers.forEach((user, index) => {
      console.log('\n' + (index + 1) + '. ' + user.first_name + ' ' + user.last_name);
      console.log('   Email: ' + user.email);
      console.log('   New Balance: $' + user.balance + ' ✓');
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n✨ DONE! All users now have $500 QuickPay balance');
    console.log('   Future users will automatically get $500 after migration 007\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

setZeroBalanceUsersTo500();
