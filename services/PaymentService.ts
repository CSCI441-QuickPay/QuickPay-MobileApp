import { supabase } from '@/config/supabaseConfig';
import UserModel from '@/models/UserModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const DEMO_TRANSACTIONS_KEY = '@demo_transactions';

export interface PaymentSource {
  id: string;
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
  newBalance?: number;
}

export interface RecipientInfo {
  accountNumber: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string | null;
  email?: string | null;
  userId?: string;
}

/* ----- typed row shapes ----- */
type BankAccountRow = {
  id: string;
  user_id?: string | null;
  account_name?: string | null;
  account_type?: string | null;
  mask?: string | null;
  institution_name?: string | null;
  email?: string | null;
  balance?: number | null;
};

type UserRow = {
  id: string;
  clerk_id?: string | null;
  account_number?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  profile_picture?: string | null;
  balance?: number | null;
};

/* ------------------ Safe UserModel helpers ------------------ */

function getUserModelAsAny() {
  return UserModel as any;
}

async function safeGetUserBalance(): Promise<number | undefined> {
  try {
    const um = getUserModelAsAny();
    if (typeof um.balance === 'function') return await um.balance();
    if (typeof um.getBalance === 'function') return await um.getBalance();
    if (typeof um.balance === 'number') return um.balance;
  } catch {
    // ignore
  }
  return undefined;
}

function safeSetUserBalance(newBalance: number) {
  try {
    const um = getUserModelAsAny();
    if (typeof um.setBalance === 'function') {
      um.setBalance(newBalance);
      return true;
    }
    if (typeof um.set_user_balance === 'function') {
      um.set_user_balance(newBalance);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

async function safeRefreshUser(userId?: string) {
  try {
    const um = getUserModelAsAny();
    if (typeof um.refresh === 'function') return await um.refresh(userId);
    if (typeof um.reload === 'function') return await um.reload(userId);
    // If UserModel has a get or fetch method, call that as a last resort
    if (typeof um.get === 'function') return await um.get(userId);
  } catch {
    // ignore
  }
  return null;
}

async function safeGetByClerkId(clerkId: string) {
  try {
    const um = getUserModelAsAny();
    if (typeof um.getByClerkId === 'function') return await um.getByClerkId(clerkId);
    if (typeof um.findByClerkId === 'function') return await um.findByClerkId(clerkId);
  } catch {
    // ignore
  }
  return null;
}

/* ------------------ PaymentService ------------------ */

export class PaymentService {
  static validateSources(sources: PaymentSource[]): ValidationResult {
    if (!sources || sources.length === 0) {
      return { isValid: false, message: 'Please add at least one payment source' };
    }
    for (const s of sources) {
      if (s.amount <= 0) return { isValid: false, message: `Enter an amount for ${s.name}` };
      if (s.amount > s.balance) return { isValid: false, message: `Insufficient funds in ${s.name}` };
    }
    return { isValid: true };
  }

  // Helper to detect undefined-column/Postgres 42703 errors
  private static isUndefinedColumnError(err: any) {
    try {
      return err?.code === '42703' || (typeof err?.message === 'string' && err.message.includes('does not exist') && err.message.includes('column'));
    } catch {
      return false;
    }
  }

  static async getRecipientInfo(accountIdentifier: string): Promise<RecipientInfo | null> {
    if (!accountIdentifier) return null;

    // 1) Try bank_accounts.account_name (quiet on missing column)
    try {
      const { data: bankRow, error: bankErr } = await supabase
        .from<BankAccountRow>('bank_accounts')
        .select('id, user_id, account_name, account_type, mask, institution_name, email, balance')
        .eq('account_name', accountIdentifier)
        .limit(1)
        .maybeSingle();

      if (bankErr) {
        if (!this.isUndefinedColumnError(bankErr)) {
          console.warn('[PaymentService] bank_accounts(account_name) lookup warning:', bankErr);
        }
      } else if (bankRow) {
        return {
          accountNumber: bankRow.account_name ?? accountIdentifier,
          firstName: bankRow.account_name ?? '',
          lastName: '',
          profilePicture: null,
          email: bankRow.email ?? null,
          userId: bankRow.user_id ?? undefined,
        };
      }
    } catch (e) {
      console.warn('[PaymentService] bank_accounts(account_name) threw:', e);
    }

    // 2) Try users.account_number (quiet on missing column)
    try {
      const { data: userByAcct, error: userAcctErr } = await supabase
        .from<UserRow>('users')
        .select('id, account_number, first_name, last_name, email, profile_picture, balance')
        .eq('account_number', accountIdentifier)
        .limit(1)
        .maybeSingle();

      if (userAcctErr) {
        if (!this.isUndefinedColumnError(userAcctErr)) {
          console.warn('[PaymentService] users(account_number) lookup warning:', userAcctErr);
        }
      } else if (userByAcct) {
        return {
          accountNumber: userByAcct.account_number ?? accountIdentifier,
          firstName: userByAcct.first_name ?? '',
          lastName: userByAcct.last_name ?? '',
          profilePicture: userByAcct.profile_picture ?? null,
          email: userByAcct.email ?? null,
          userId: userByAcct.id,
        };
      }
    } catch (e) {
      console.warn('[PaymentService] users(account_number) threw:', e);
    }

    // 3) Try users.id
    try {
      const { data: userById, error: userIdErr } = await supabase
        .from<UserRow>('users')
        .select('id, account_number, first_name, last_name, email, profile_picture, balance')
        .eq('id', accountIdentifier)
        .limit(1)
        .maybeSingle();

      if (userIdErr) {
        console.warn('[PaymentService] users(id) lookup warning:', userIdErr);
      } else if (userById) {
        return {
          accountNumber: userById.account_number ?? accountIdentifier,
          firstName: userById.first_name ?? '',
          lastName: userById.last_name ?? '',
          profilePicture: userById.profile_picture ?? null,
          email: userById.email ?? null,
          userId: userById.id,
        };
      }
    } catch (e) {
      console.warn('[PaymentService] users(id) threw:', e);
    }

    return null;
  }

  static async resolveSenderDbId(passedSenderIdOrClerkId: string): Promise<string | null> {
    if (!passedSenderIdOrClerkId) return null;
    const looksLikeClerkId = passedSenderIdOrClerkId.startsWith?.('user_');
    if (!looksLikeClerkId) return passedSenderIdOrClerkId;

    try {
      const { data: u, error } = await supabase
        .from<UserRow>('users')
        .select('id, clerk_id')
        .eq('clerk_id', passedSenderIdOrClerkId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[PaymentService] resolveSenderDbId lookup error', error);
        const dbUser = await safeGetByClerkId(passedSenderIdOrClerkId);
        return dbUser?.id ?? null;
      }
      if (u && u.id) return u.id;
    } catch (e) {
      console.warn('[PaymentService] resolveSenderDbId threw:', e);
    }

    const dbUser = await safeGetByClerkId(passedSenderIdOrClerkId);
    return dbUser?.id ?? null;
  }

  static async processDemoPayment(request: PaymentRequest, recipientName: string): Promise<PaymentResult> {
    try {
      const mockTransaction = {
        id: `demo_${Date.now()}`,
        amount: -request.totalAmount,
        description: request.description ?? `Sent to ${recipientName}`,
        date: new Date().toISOString(),
        category: 'Transfer',
        type: 'debit',
        pending: false,
        title: `Sent to ${recipientName}`,
        subtitle: `Account: ${request.recipientAccountNumber}`,
        merchant_name: recipientName,
        isDemoTransaction: true,
      };

      const stored = await AsyncStorage.getItem(DEMO_TRANSACTIONS_KEY);
      const transactions = stored ? JSON.parse(stored) : [];
      transactions.unshift(mockTransaction);
      await AsyncStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(transactions));

      console.log('🎭 Demo Mode: Mock transaction created', mockTransaction);

      try {
        const current = await safeGetUserBalance();
        if (typeof current === 'number') safeSetUserBalance(current - request.totalAmount);
      } catch {
        // ignore
      }

      return { success: true, transactionId: mockTransaction.id, message: 'Demo payment processed', newBalance: undefined };
    } catch (err: any) {
      console.error('Demo payment processing error:', err);
      throw new Error(err?.message || 'Failed to process demo payment');
    }
  }

  static async getDemoTransactions(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem(DEMO_TRANSACTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Error loading demo transactions:', err);
      return [];
    }
  }

  static async processPayment(
    request: PaymentRequest,
    isDemoMode: boolean = false,
    recipientName?: string
  ): Promise<PaymentResult> {
    console.log('[PaymentService] processPayment called', { request, isDemoMode });

    const validation = this.validateSources(request.sources);
    if (!validation.isValid) throw new Error(validation.message);

    const calculated = request.sources.reduce((s, x) => s + x.amount, 0);
    if (Math.abs(calculated - request.totalAmount) > 0.01) throw new Error('Total amount does not match sum of sources');

    // Resolve recipient
    let recipient: RecipientInfo | null = null;
    try {
      recipient = await this.getRecipientInfo(request.recipientAccountNumber);
    } catch (err) {
      console.warn('[PaymentService] recipient lookup threw', err);
      recipient = null;
    }

    if (!recipient && isDemoMode) {
      const fallbackName = recipientName || request.recipientAccountNumber || 'Demo Recipient';
      console.log('[PaymentService] demo mode: proceeding without DB recipient, using', fallbackName);
      return await this.processDemoPayment(request, fallbackName);
    }

    if (!recipient && !isDemoMode) {
      throw new Error('Recipient account not found');
    }

    // Resolve sender DB uuid
    const senderDbId = await this.resolveSenderDbId(request.senderId);
    if (!senderDbId) throw new Error('Sender account not found (could not resolve DB id)');

    if (isDemoMode) {
      return await this.processDemoPayment(request, recipientName || `${recipient?.firstName ?? ''} ${recipient?.lastName ?? ''}`);
    }

    const sourcesData = request.sources.map((s) => ({ id: s.id, type: s.type, amount: s.amount }));

    // Attempt RPC - ensure we always pass a non-null description (empty string if missing)
    try {
      console.log('[PaymentService] attempting supabase.rpc("process_payment")', { senderDbId, recipientAccountNumber: request.recipientAccountNumber, sourcesData });
      const { data, error } = await supabase.rpc('process_payment', {
        p_sender_id: senderDbId,
        p_recipient_account_number: request.recipientAccountNumber,
        p_sources: sourcesData,
        p_total_amount: request.totalAmount,
        p_description: request.description ?? '', // <-- never null
      });

      console.log('[PaymentService] rpc returned', { data, error });
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      if (!result || !result.success) throw new Error(result?.message || 'RPC did not succeed');

      const newBal = result.new_balance ?? result.newBalance;
      if (typeof newBal === 'number') {
        safeSetUserBalance(newBal);
        try {
          // force-refresh DB-backed user so header/UI reflects the new balance
          await safeRefreshUser(senderDbId);
        } catch (e) {
          console.warn('[PaymentService] safeRefreshUser failed', e);
        }
      }

      // EMIT update so UI components listening refresh
      try {
        DeviceEventEmitter.emit('user:updated', { userId: senderDbId, newBalance: newBal });
        console.log('[PaymentService] emitted user:updated', { userId: senderDbId, newBalance: newBal });
      } catch (e) {
        console.warn('[PaymentService] emit failed', e);
      }

      return { success: true, transactionId: result.transaction_id || result.transactionId, message: result.message || 'Payment processed', newBalance: newBal };
    } catch (rpcErr) {
      console.warn('[PaymentService] RPC failed or missing, falling back to client-side updates', rpcErr);
    }

    // Client-side fallback (optimistic)
    try {
      // Fetch sender row
      const { data: senderRow, error: senderErr } = await supabase
        .from<UserRow>('users')
        .select('id, balance, account_number')
        .eq('id', senderDbId)
        .limit(1)
        .maybeSingle();

      if (senderErr || !senderRow) {
        console.error('[PaymentService] sender lookup failed', senderErr);
        throw new Error('Sender account not found or permission denied');
      }

      const prevBalance = Number(senderRow.balance || 0);
      if (prevBalance < request.totalAmount) throw new Error('Insufficient funds');

      const newSenderBalance = prevBalance - request.totalAmount;

      // conditional update
      const { data: updateData, error: updateErr } = await supabase
        .from<UserRow>('users')
        .update({ balance: newSenderBalance })
        .eq('id', senderDbId)
        .eq('balance', prevBalance)
        .select()
        .maybeSingle();

      if (updateErr || !updateData) {
        console.error('[PaymentService] conditional update failed', updateErr, updateData);
        throw new Error('Failed to debit sender account (concurrent update or permission error)');
      }

      // Identify recipient DB id (if available)
      let recipientDbId = recipient?.userId ?? null;
      if (!recipientDbId) {
        try {
          const { data: recUser, error: recErr } = await supabase
            .from<UserRow>('users')
            .select('id, balance')
            .eq('account_number', request.recipientAccountNumber)
            .limit(1)
            .maybeSingle();
          if (!recErr && recUser) recipientDbId = recUser.id;
        } catch {}
      }

      if (recipientDbId) {
        // credit recipient user
        const { data: recRow, error: recErr } = await supabase
          .from<UserRow>('users')
          .select('id, balance')
          .eq('id', recipientDbId)
          .limit(1)
          .maybeSingle();

        if (recErr || !recRow) {
          console.warn('[PaymentService] recipient lookup failed during credit, attempting rollback', recErr);
          await supabase.from('users').update({ balance: prevBalance }).eq('id', senderDbId);
          throw new Error('Recipient account lookup failed during credit');
        }

        const recipientNewBalance = Number(recRow.balance || 0) + request.totalAmount;
        const { error: creditErr } = await supabase.from('users').update({ balance: recipientNewBalance }).eq('id', recipientDbId);
        if (creditErr) {
          console.warn('[PaymentService] credit failed, attempting rollback', creditErr);
          await supabase.from('users').update({ balance: prevBalance }).eq('id', senderDbId);
          throw new Error('Failed to credit recipient');
        }
      } else {
        // try bank_accounts
        try {
          const { data: ba, error: baErr } = await supabase
            .from<BankAccountRow>('bank_accounts')
            .select('id, balance')
            .eq('account_name', request.recipientAccountNumber)
            .limit(1)
            .maybeSingle();

          if (!baErr && ba) {
            const recipientNewBalance = Number(ba.balance || 0) + request.totalAmount;
            const { error: bankCreditErr } = await supabase.from('bank_accounts').update({ balance: recipientNewBalance }).eq('id', ba.id);
            if (bankCreditErr) {
              console.warn('[PaymentService] bank credit failed', bankCreditErr);
              await supabase.from('users').update({ balance: prevBalance }).eq('id', senderDbId);
              throw new Error('Failed to credit recipient bank account');
            }
          } else {
            await supabase.from('users').update({ balance: prevBalance }).eq('id', senderDbId);
            throw new Error('Recipient account not found for crediting');
          }
        } catch (e) {
          console.warn('[PaymentService] bank account credit threw', e);
          await supabase.from('users').update({ balance: prevBalance }).eq('id', senderDbId);
          throw new Error('Recipient credit failed');
        }
      }

      // Insert transaction for sender using existing column names (merchant_name, title, subtitle) and non-null description
      const txRow = {
        user_id: senderDbId,
        amount: -request.totalAmount,
        description: request.description ?? `Sent to ${recipient?.firstName ?? request.recipientAccountNumber}`,
        merchant_name: recipient?.firstName ?? null,
        title: `Sent to ${recipient?.firstName ?? ''}`.trim(),
        subtitle: `Account: ${request.recipientAccountNumber}`,
        type: 'debit',
        pending: false,
      };

      const { data: insertedTx, error: insertErr } = await supabase.from('transactions').insert([txRow]).select().maybeSingle();
      if (insertErr || !insertedTx) {
        console.warn('[PaymentService] transaction insert failed', insertErr);
        // try to roll back balances (best-effort) and report
        try {
          await supabase.from('users').update({ balance: prevBalance }).eq('id', senderDbId);
        } catch (rollbackErr) {
          console.warn('[PaymentService] rollback failed', rollbackErr);
        }
        throw new Error('Transaction create failed after balances updated');
      }

      // Update local UserModel and force-refresh so header updates
      try {
        if (!safeSetUserBalance(newSenderBalance)) {
          await safeRefreshUser(senderDbId);
        } else {
          try {
            await safeRefreshUser(senderDbId);
          } catch {
            // ignore
          }
        }
      } catch {}

      // EMIT update for listeners
      try {
        DeviceEventEmitter.emit('user:updated', { userId: senderDbId, newBalance: newSenderBalance });
        console.log('[PaymentService] emitted user:updated (fallback)', { userId: senderDbId, newBalance: newSenderBalance });
      } catch (e) {
        console.warn('[PaymentService] emit failed (fallback)', e);
      }

      return { success: true, transactionId: insertedTx.id || insertedTx.transaction_id, message: 'Payment completed (client fallback)', newBalance: newSenderBalance };
    } catch (fallbackErr: any) {
      console.error('[PaymentService] client-side fallback error', fallbackErr);
      throw new Error(fallbackErr?.message || 'Payment failed');
    }
  }
}

export default PaymentService;