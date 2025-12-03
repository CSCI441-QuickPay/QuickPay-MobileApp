import { supabase } from '@/config/supabaseConfig';
import UserModel from '@/models/UserModel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_TRANSACTIONS_KEY = '@demo_transactions';

export interface PaymentSource {
  id: string; // bank_account.id or 'quickpay'
  type: 'bank' | 'quickpay';
  name: string;
  amount: number;
  balance: number;
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
