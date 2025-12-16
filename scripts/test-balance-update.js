/**
 * Test balance update logic
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBalanceUpdate() {
  console.log('\n🧪 Testing Balance Update Logic\n');
  console.log('═'.repeat(60));

  try {
    // Get a bank account
    const { data: accounts } = await supabase
      .from('bank_accounts')
      .select('id, account_name, balance, available_balance, user_id')
      .limit(1)
      .single();

    if (!accounts) {
      console.log('❌ No bank accounts found');
      return;
    }

    console.log('\n📊 Bank Account Before:');
    console.log(`   Name: ${accounts.account_name}`);
    console.log(`   Balance: $${accounts.balance}`);
    console.log(`   Available: $${accounts.available_balance}`);
    console.log(`   Type: ${typeof accounts.balance}`);

    // Simulate deduction
    const amount = 10; // Send $10
    console.log(`\n💸 Simulating deduction of $${amount}`);

    const newBalance = parseFloat(accounts.balance || 0) - amount;
    const newAvailable = parseFloat(accounts.available_balance || accounts.balance || 0) - amount;

    console.log(`\n🧮 Calculation:`);
    console.log(`   parseFloat(${accounts.balance}) - ${amount} = ${newBalance}`);
    console.log(`   parseFloat(${accounts.available_balance}) - ${amount} = ${newAvailable}`);

    console.log(`\n📊 Expected Result:`);
    console.log(`   New Balance: $${newBalance}`);
    console.log(`   New Available: $${newAvailable}`);

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ Logic test complete (no actual update performed)\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
  }
}

testBalanceUpdate();
