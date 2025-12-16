/**
 * Update existing transactions to have clean titles and account number format
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateExistingTransactions() {
  console.log('\n🔄 Updating Existing Transactions\n');
  console.log('═'.repeat(60));

  try {
    // Get all transactions
    const { data: transactions, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    console.log(`\n📋 Found ${transactions.length} transactions to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const tx of transactions) {
      try {
        let needsUpdate = false;
        const updates = {};

        // Fix title if it contains "Bank Transfer to" or "Bank Transfer Received"
        if (tx.title?.startsWith('Bank Transfer to ')) {
          const recipientName = tx.title.replace('Bank Transfer to ', '');
          updates.title = `Sent to ${recipientName}`;
          updates.category = 'Transfer';
          needsUpdate = true;
        } else if (tx.title === 'Bank Transfer Received') {
          // Get sender name from merchant_name or user lookup
          const senderName = tx.merchant_name || 'Unknown';
          updates.title = `Received from ${senderName}`;
          updates.category = 'Transfer';
          needsUpdate = true;
        }

        // Fix subtitle to include account numbers if it's a simple format
        if (tx.subtitle && !tx.subtitle.includes('•') && !tx.subtitle.includes('(-$')) {
          // Check if it's an old format like "Account: XXX" or "From BANK_NAME"
          if (tx.subtitle.startsWith('Account: ')) {
            // This is a sent transaction - get sender and recipient account numbers
            const recipientAccNum = tx.subtitle.replace('Account: ', '');

            // Get sender's account number
            const { data: senderUser } = await supabase
              .from('users')
              .select('account_number')
              .eq('id', tx.user_id)
              .single();

            if (senderUser?.account_number) {
              updates.subtitle = `From: ${senderUser.account_number} • To: ${recipientAccNum}`;
              needsUpdate = true;
            }
          } else if (tx.subtitle.startsWith('From account: ')) {
            // This is a received transaction - get sender and recipient account numbers
            const senderAccNum = tx.subtitle.replace('From account: ', '');

            // Get recipient's (current user's) account number
            const { data: recipientUser } = await supabase
              .from('users')
              .select('account_number')
              .eq('id', tx.user_id)
              .single();

            if (recipientUser?.account_number) {
              updates.subtitle = `From: ${senderAccNum} • To: ${recipientUser.account_number}`;
              needsUpdate = true;
            }
          } else if (tx.subtitle.startsWith('From ') || tx.subtitle === 'Via Bank Transfer') {
            // Bank source subtitle - try to add account numbers
            const { data: userData } = await supabase
              .from('users')
              .select('account_number')
              .eq('id', tx.user_id)
              .single();

            if (userData?.account_number && tx.merchant_name) {
              // This is likely a payment - try to find recipient
              const { data: recipientData } = await supabase
                .from('users')
                .select('account_number, first_name, last_name')
                .ilike('first_name', `%${tx.merchant_name.split(' ')[0]}%`)
                .single();

              if (recipientData?.account_number) {
                if (tx.transaction_type === 'debit') {
                  updates.subtitle = `From: ${userData.account_number} • To: ${recipientData.account_number}`;
                } else {
                  updates.subtitle = `From: ${recipientData.account_number} • To: ${userData.account_number}`;
                }
                needsUpdate = true;
              }
            }
          }
        }

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', tx.id);

          if (updateError) {
            console.error(`❌ Error updating transaction ${tx.id}:`, updateError.message);
          } else {
            updatedCount++;
            console.log(`✅ Updated: ${tx.title} -> ${updates.title || tx.title}`);
            if (updates.subtitle) {
              console.log(`   Subtitle: ${updates.subtitle}`);
            }
          }
        } else {
          skippedCount++;
        }
      } catch (err) {
        console.error(`❌ Error processing transaction ${tx.id}:`, err.message);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`\n✅ Update Complete!`);
    console.log(`   Updated: ${updatedCount} transactions`);
    console.log(`   Skipped: ${skippedCount} transactions (already correct)`);
    console.log('\n' + '═'.repeat(60));
    console.log('\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

updateExistingTransactions();
