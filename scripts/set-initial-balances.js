/**
 * Set all users' QuickPay balance to $500
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setInitialBalances() {
  console.log('\n💰 Setting Initial QuickPay Balances\n');
  console.log('═'.repeat(80));

  try {
    // Get all users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, balance');

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }

    console.log(`\nFound ${users.length} users\n`);

    // Update each user to $500 balance
    for (const user of users) {
      const name = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.email;

      console.log(`📧 ${name}`);
      console.log(`   Current balance: $${user.balance}`);

      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: 500 })
        .eq('id', user.id);

      if (updateError) {
        console.log(`   ❌ Error: ${updateError.message}`);
      } else {
        console.log(`   ✅ Updated to: $500\n`);
      }
    }

    console.log('═'.repeat(80));
    console.log('\n✅ All users now have $500 QuickPay balance!\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
  }
}

setInitialBalances();
