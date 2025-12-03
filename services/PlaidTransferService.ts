import { supabase } from '@/config/supabaseConfig';

export interface PlaidTransferRequest {
  accessToken: string;
  accountId: string;
  amount: number;
  description: string;
  recipientId: string;
}

export interface PlaidTransferResult {
  success: boolean;
  transferId?: string;
  authorizationId?: string;
  status?: string;
  message: string;
}

export interface PlaidTransferStatus {
  transferId: string;
  status: string;
  amount: string;
  created: string;
  network: string;
}

export class PlaidTransferService {
  /**
   * Create a Plaid Transfer (ACH debit from user's bank account)
   */
  static async createTransfer(
    request: PlaidTransferRequest
  ): Promise<PlaidTransferResult> {
    try {
      console.log('🏦 Creating Plaid Transfer:', {
        accountId: request.accountId,
        amount: request.amount,
        recipientId: request.recipientId,
      });

      const { data, error } = await supabase.functions.invoke(
        'plaid-create-transfer',
        {
          body: {
            accessToken: request.accessToken,
            accountId: request.accountId,
            amount: request.amount,
            description: request.description,
            recipientId: request.recipientId,
          },
        }
      );

      if (error) {
        console.error('❌ Plaid transfer creation error:', error);
        throw new Error(error.message || 'Failed to create transfer');
      }

      if (!data || !data.transfer_id) {
        throw new Error('Invalid response from transfer service');
      }

      console.log('✅ Plaid Transfer created:', data.transfer_id);

      return {
        success: true,
        transferId: data.transfer_id,
        authorizationId: data.authorization_id,
        status: data.status,
        message: 'Transfer initiated successfully',
      };
    } catch (error: any) {
      console.error('PlaidTransferService.createTransfer error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create transfer',
      };
    }
  }

  /**
   * Get transfer status from Plaid
   */
  static async getTransferStatus(
    transferId: string
  ): Promise<PlaidTransferStatus | null> {
    try {
      console.log('🔍 Getting transfer status:', transferId);

      const { data, error } = await supabase.functions.invoke(
        'plaid-get-transfer-status',
        {
          body: { transferId },
        }
      );

      if (error) {
        console.error('❌ Error getting transfer status:', error);
        throw new Error(error.message || 'Failed to get transfer status');
      }

      if (!data) {
        throw new Error('Invalid response from transfer status service');
      }

      console.log('✅ Transfer status:', data.status);

      return {
        transferId: data.transfer_id,
        status: data.status,
        amount: data.amount,
        created: data.created,
        network: data.network,
      };
    } catch (error: any) {
      console.error('PlaidTransferService.getTransferStatus error:', error);
      return null;
    }
  }

  /**
   * Map Plaid transfer status to user-friendly text
   */
  static getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pending',
      posted: 'Completed',
      settled: 'Settled',
      failed: 'Failed',
      cancelled: 'Cancelled',
      returned: 'Returned',
    };

    return statusMap[status.toLowerCase()] || status;
  }

  /**
   * Check if transfer is in a final state
   */
  static isFinalStatus(status: string): boolean {
    const finalStatuses = ['posted', 'settled', 'failed', 'cancelled', 'returned'];
    return finalStatuses.includes(status.toLowerCase());
  }
}
