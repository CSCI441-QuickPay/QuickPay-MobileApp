import { supabase } from '@/config/supabaseConfig';
import UserModel from '@/models/UserModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlaidTransferService } from './PlaidTransferService';

const DEMO_TRANSACTIONS_KEY = '@demo_transactions';

export interface PaymentSource {
  id: string; // bank_account.id or 'quickpay'
  type: 'bank' | 'quickpay';
  name: string;
  amount: number;
  balance: number;
  accessToken?: string; // For Plaid bank transfers
  accountId?: string; // Plaid account ID
}

export interface PaymentRequest {
  senderId: string;
  recipientAccountNumber: string;
  sources: PaymentSource[];
  totalAmount: number;
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
}

export interface RecipientInfo {
  accountNumber: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  email: string;
}

export class PaymentService {
  /**
   * Validate payment sources have sufficient funds
   */
  static validateSources(sources: PaymentSource[]): ValidationResult {
    if (sources.length === 0) {
      return {
        isValid: false,
        message: 'Please add at least one payment source',
      };
    }

    for (const source of sources) {
      if (source.amount <= 0) {
        return {
          isValid: false,
          message: `Please enter a valid amount for ${source.name}`,
        };
      }

      if (source.amount > source.balance) {
        return {
          isValid: false,
          message: `Insufficient funds in ${source.name}. Available: $${source.balance.toFixed(2)}`,
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Get recipient information by account number
   */
  static async getRecipientInfo(
    accountNumber: string
  ): Promise<RecipientInfo | null> {
    try {
      const user = await UserModel.getByAccountNumber(accountNumber);

      if (!user) {
        return null;
      }

      return {
        accountNumber: user.accountNumber!,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        email: user.email,
      };
    } catch (error) {
      console.error('Error fetching recipient info:', error);
      return null;
    }
  }

  /**
   * Process payment in Demo Mode (mock transaction)
   */
  static async processDemoPayment(
    request: PaymentRequest,
    recipientName: string
  ): Promise<PaymentResult> {
    try {
      // Format subtitle with SOURCE breakdown for multi-bank payments
      let subtitle = `Account: ${request.recipientAccountNumber}`;

      // If multiple sources used, format as SOURCE: BANK1(-$X.XX), BANK2(-$Y.YY)
      if (request.sources.length > 1) {
        const sourceBreakdown = request.sources
          .map(source => `${source.name}(-$${source.amount.toFixed(2)})`)
          .join(', ');
        subtitle = `SOURCE: ${sourceBreakdown}`;
      }

      // Create mock transaction
      const mockTransaction = {
        id: `demo_${Date.now()}`,
        amount: -request.totalAmount,
        description: request.description || `Sent to ${recipientName}`,
        date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD for TransactionList
        category: 'Transfer',
        type: 'debit',
        pending: false,
        title: `Sent to ${recipientName}`,
        subtitle: subtitle,
        merchant: recipientName,
        isDemoTransaction: true,
      };

      // Save to AsyncStorage for session persistence
      const stored = await AsyncStorage.getItem(DEMO_TRANSACTIONS_KEY);
      const transactions = stored ? JSON.parse(stored) : [];
      transactions.unshift(mockTransaction);
      await AsyncStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(transactions));

      console.log('🎭 Demo Mode: Mock transaction created', mockTransaction);

      return {
        success: true,
        transactionId: mockTransaction.id,
        message: 'Demo payment processed successfully',
      };
    } catch (error: any) {
      console.error('Demo payment processing error:', error);
      throw new Error(error.message || 'Failed to process demo payment');
    }
  }

  /**
   * Get demo transactions from cache
   */
  static async getDemoTransactions(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem(DEMO_TRANSACTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading demo transactions:', error);
      return [];
    }
  }

  /**
   * Process Plaid bank transfer (ACH transfer from bank account)
   * Stores transaction in Supabase with pending status
   */
  static async processPlaidTransfer(
    request: PaymentRequest,
    isDemoMode: boolean = false,
    recipientName?: string
  ): Promise<PaymentResult> {
    try {
      // Validate we have exactly one bank source with Plaid credentials
      if (request.sources.length !== 1 || request.sources[0].type !== 'bank') {
        throw new Error('Plaid transfer requires exactly one bank source');
      }

      const bankSource = request.sources[0];
      if (!bankSource.accessToken || !bankSource.accountId) {
        throw new Error('Missing Plaid credentials for bank transfer');
      }

      // Get recipient info
      const recipient = await this.getRecipientInfo(
        request.recipientAccountNumber
      );
      if (!recipient) {
        throw new Error('Recipient account not found');
      }

      const fullRecipientName = recipientName || `${recipient.firstName} ${recipient.lastName}`;

      // Demo/Sandbox Mode: Save to Supabase with pending status
      if (isDemoMode) {
        console.log('🎭 Processing Plaid transfer in Demo Mode - Saving to Supabase');

        // Get sender's account number for subtitle
        const { data: senderData } = await supabase
          .from('users')
          .select('account_number')
          .eq('id', request.senderId)
          .single();

        // Get the bank account ID from database to link the transaction
        const { data: bankAccount } = await supabase
          .from('bank_accounts')
          .select('id')
          .eq('plaid_account_id', bankSource.accountId)
          .eq('user_id', request.senderId)
          .single();

        // Insert pending transaction into Supabase
        const { data: transaction, error } = await supabase
          .from('transactions')
          .insert({
            user_id: request.senderId,
            bank_account_id: bankAccount?.id || null,
            amount: -request.totalAmount, // Negative for outgoing
            transaction_type: 'debit',
            category: 'Transfer',
            merchant_name: fullRecipientName,
            description: request.description || `Sent to ${fullRecipientName}`,
            transaction_date: new Date().toISOString().split('T')[0],
            pending: true, // Mark as pending
            title: `Sent to ${fullRecipientName}`,
            subtitle: `From: ${senderData?.account_number || 'Unknown'} • To: ${request.recipientAccountNumber}`,
            // These will be added after migration
            // transfer_type: 'bank_transfer',
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving pending transaction:', error);
          throw new Error('Failed to save pending transaction');
        }

        console.log('✅ Pending transaction saved to Supabase:', transaction.id);

        // Auto-approve after 2 seconds (simulates ACH processing)
        setTimeout(async () => {
          await this.approvePendingTransaction(
            transaction.id,
            request.senderId,
            recipient.accountNumber!,
            request.totalAmount
          );
        }, 2000);

        return {
          success: true,
          transactionId: transaction.id,
          message: 'Bank transfer initiated (pending approval)',
        };
      }

      // Real Mode: Try Plaid Transfer API, fallback to sandbox simulation
      console.log('🏦 Processing real Plaid bank transfer');

      try {
        const transferResult = await PlaidTransferService.createTransfer({
          accessToken: bankSource.accessToken,
          accountId: bankSource.accountId,
          amount: request.totalAmount,
          description: request.description || `Transfer to ${recipient.firstName} ${recipient.lastName}`,
          recipientId: request.recipientAccountNumber,
        });

        if (!transferResult.success) {
          throw new Error(transferResult.message);
        }

        // Save to Supabase with Plaid transfer ID
        const { data: transaction, error } = await supabase
          .from('transactions')
          .insert({
            user_id: request.senderId,
            amount: -request.totalAmount,
            transaction_type: 'debit',
            category: 'Bank Transfer',
            merchant_name: fullRecipientName,
            description: request.description || `Bank Transfer to ${fullRecipientName}`,
            transaction_date: new Date().toISOString().split('T')[0],
            pending: true,
            title: `Bank Transfer to ${fullRecipientName}`,
            subtitle: `From ${bankSource.name}`,
            // transfer_type: 'plaid_ach',
            // plaid_transfer_id: transferResult.transferId,
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving Plaid transfer transaction:', error);
        }

        return {
          success: true,
          transactionId: transaction?.id || transferResult.transferId,
          message: 'Bank transfer initiated successfully',
        };
      } catch (transferError: any) {
        // Fallback: Plaid Transfer API not available (sandbox/tartan or not configured)
        console.warn('⚠️ Plaid Transfer API failed, using sandbox simulation:', transferError.message);
        console.log('🎭 Falling back to sandbox transfer simulation');

        // Get the bank account ID from database to link the transaction
        const { data: bankAccount } = await supabase
          .from('bank_accounts')
          .select('id')
          .eq('plaid_account_id', bankSource.accountId)
          .eq('user_id', request.senderId)
          .single();

        // Insert pending transaction into Supabase (same as demo mode)
        const { data: transaction, error } = await supabase
          .from('transactions')
          .insert({
            user_id: request.senderId,
            bank_account_id: bankAccount?.id || null,
            amount: -request.totalAmount,
            transaction_type: 'debit',
            category: 'Bank Transfer',
            merchant_name: fullRecipientName,
            description: request.description || `Bank Transfer to ${fullRecipientName}`,
            transaction_date: new Date().toISOString().split('T')[0],
            pending: true,
            title: `Bank Transfer to ${fullRecipientName}`,
            subtitle: `From ${bankSource.name} (Sandbox)`,
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving pending transaction:', error);
          throw new Error('Failed to save pending transaction');
        }

        console.log('✅ Pending transaction saved (sandbox):', transaction.id);

        // Auto-approve after 2 seconds (simulates ACH processing)
        setTimeout(async () => {
          await this.approvePendingTransaction(
            transaction.id,
            request.senderId,
            recipient.accountNumber!,
            request.totalAmount
          );
        }, 2000);

        return {
          success: true,
          transactionId: transaction.id,
          message: 'Bank transfer initiated (sandbox mode - pending approval)',
        };
      }
    } catch (error: any) {
      console.error('PaymentService.processPlaidTransfer error:', error);
      throw new Error(error.message || 'Failed to process bank transfer');
    }
  }

  /**
   * Approve a pending bank transfer transaction
   * - Marks transaction as not pending
   * - Deducts from sender's bank account
   * - Credits recipient's QuickPay balance
   */
  static async approvePendingTransaction(
    transactionId: string,
    senderId: string,
    recipientAccountNumber: string,
    amount: number
  ): Promise<void> {
    try {
      console.log('✅ Auto-approving pending transaction:', transactionId);

      // Get recipient user
      const recipient = await UserModel.getByAccountNumber(recipientAccountNumber);
      if (!recipient || !recipient.id) {
        console.error('Recipient not found for approval');
        return;
      }

      // NOTE: Bank account balances are READ-ONLY from Plaid.
      // We do NOT deduct from bank_accounts table.
      // All payments flow through QuickPay balance only.

      // Update transaction to not pending
      const { error: txError } = await supabase
        .from('transactions')
        .update({ pending: false })
        .eq('id', transactionId);

      if (txError) {
        console.error('Error updating transaction status:', txError);
        return;
      }

      // Get current recipient balance first
      const { data: recipientUser, error: getUserError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', recipient.id)
        .single();

      if (getUserError) {
        console.error('Error fetching recipient balance:', getUserError);
        return;
      }

      // Credit recipient's QuickPay balance
      const newBalance = (recipientUser?.balance || 0) + amount;
      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', recipient.id);

      if (balanceError) {
        console.error('Error updating recipient balance:', balanceError);
        return;
      }

      // Get sender info for recipient's transaction
      const { data: senderData } = await supabase
        .from('users')
        .select('first_name, last_name, account_number')
        .eq('id', senderId)
        .single();

      const senderName = senderData ? `${senderData.first_name} ${senderData.last_name}` : 'Unknown';
      const senderAccountNumber = senderData?.account_number || 'Unknown';

      // Create corresponding income transaction for recipient
      await supabase
        .from('transactions')
        .insert({
          user_id: recipient.id,
          amount: amount, // Positive for incoming
          transaction_type: 'credit',
          category: 'Transfer',
          merchant_name: senderName,
          description: `Received from ${senderName}`,
          transaction_date: new Date().toISOString().split('T')[0],
          pending: false,
          title: `Received from ${senderName}`,
          subtitle: `From: ${senderAccountNumber} • To: ${recipientAccountNumber}`,
        });

      console.log('✅ Transaction approved and recipient credited');
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  }

  /**
   * Process multi-source payment (atomic transaction)
   */
  static async processPayment(
    request: PaymentRequest,
    isDemoMode: boolean = false,
    recipientName?: string
  ): Promise<PaymentResult> {
    try {
      // Additional validation
      const validation = this.validateSources(request.sources);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Verify total matches sum
      const calculatedTotal = request.sources.reduce(
        (sum, source) => sum + source.amount,
        0
      );
      if (Math.abs(calculatedTotal - request.totalAmount) > 0.01) {
        throw new Error('Total amount does not match sum of sources');
      }

      // Get recipient info to verify they exist
      const recipient = await this.getRecipientInfo(
        request.recipientAccountNumber
      );
      if (!recipient) {
        throw new Error('Recipient account not found');
      }

      // Check if this is a Plaid bank transfer (single bank source with credentials)
      const isBankTransfer = request.sources.length === 1 &&
                            request.sources[0].type === 'bank' &&
                            request.sources[0].accessToken &&
                            request.sources[0].accountId;

      if (isBankTransfer) {
        console.log('🏦 Routing to Plaid bank transfer');
        return await this.processPlaidTransfer(request, isDemoMode, recipientName);
      }

      // Demo Mode: Create mock transaction only
      if (isDemoMode) {
        console.log('🎭 Processing payment in Demo Mode');
        return await this.processDemoPayment(
          request,
          recipientName || `${recipient.firstName} ${recipient.lastName}`
        );
      }

      // Real Mode: Process actual database transaction
      console.log('💳 Processing real payment');

      // Prepare sources data for RPC function
      const sourcesData = request.sources.map((source) => ({
        id: source.id,
        type: source.type,
        amount: source.amount,
      }));

      // Call Supabase RPC function for atomic processing
      const { data, error } = await supabase.rpc('process_payment', {
        p_sender_id: request.senderId,
        p_recipient_account_number: request.recipientAccountNumber,
        p_sources: sourcesData,
        p_total_amount: request.totalAmount,
        p_description: request.description || null,
      });

      if (error) {
        console.error('Payment processing error:', error);
        throw new Error(error.message || 'Payment processing failed');
      }

      if (!data || !data.success) {
        throw new Error(data?.message || 'Payment processing failed');
      }

      return {
        success: true,
        transactionId: data.transaction_id,
        message: data.message || 'Payment processed successfully',
      };
    } catch (error: any) {
      console.error('PaymentService.processPayment error:', error);
      throw new Error(error.message || 'Failed to process payment');
    }
  }
}
