import { supabase } from '@/config/supabaseConfig';
import UserModel from '@/models/UserModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const DEMO_TRANSACTIONS_KEY = '@demo_transactions';

/* Types (same as before) */
export interface PaymentSource { id: string; type: 'bank' | 'quickpay'; name: string; amount: number; balance: number; }
export interface PaymentRequest { senderId: string; recipientAccountNumber: string; sources: PaymentSource[]; totalAmount: number; description?: string; }
export interface ValidationResult { isValid: boolean; message?: string; }
export interface PaymentResult { success: boolean; transactionId?: string; message: string; newBalance?: number; }
export interface RecipientInfo { accountNumber: string; firstName?: string; lastName?: string; profilePicture?: string | null; email?: string | null; userId?: string; }

type BankAccountRow = { id: string; user_id?: string | null; account_name?: string | null; account_type?: string | null; mask?: string | null; institution_name?: string | null; email?: string | null; balance?: number | null; };
type UserRow = { id: string; clerk_id?: string | null; account_number?: string | null; first_name?: string | null; last_name?: string | null; email?: string | null; profile_picture?: string | null; balance?: number | null; };

/* Safe UserModel helpers (unchanged) */
function getUserModelAsAny() { return UserModel as any; }
async function safeGetUserBalance(): Promise<number | undefined> {
  try {
    const um = getUserModelAsAny();
    if (typeof um.balance === 'function') return await um.balance();
    if (typeof um.getBalance === 'function') return await um.getBalance();
    if (typeof um.balance === 'number') return um.balance;
  } catch {}
  return undefined;
}
function safeSetUserBalance(newBalance: number) {
  try {
    const um = getUserModelAsAny();
    if (typeof um.setBalance === 'function') { um.setBalance(newBalance); return true; }
    if (typeof um.set_user_balance === 'function') { um.set_user_balance(newBalance); return true; }
  } catch {}
  return false;
}
async function safeRefreshUser(userId?: string) {
  try {
    const um = getUserModelAsAny();
    if (typeof um.refresh === 'function') return await um.refresh(userId);
    if (typeof um.reload === 'function') return await um.reload(userId);
    if (typeof um.get === 'function') return await um.get(userId);
  } catch {}
  return null;
}
async function safeGetByClerkId(clerkId: string) {
  try {
    const um = getUserModelAsAny();
    if (typeof um.getByClerkId === 'function') return await um.getByClerkId(clerkId);
    if (typeof um.findByClerkId === 'function') return await um.findByClerkId(clerkId);
  } catch {}
  return null;
}

/* PaymentService implementation with per-source fallback debiting */
export class PaymentService {
  static validateSources(sources: PaymentSource[]): ValidationResult {
    if (!sources || sources.length === 0) return { isValid: false, message: 'Please add at least one payment source' };
    for (const s of sources) {
      if (s.amount <= 0) return { isValid: false, message: `Enter an amount for ${s.name}` };
      if (s.amount > s.balance) return { isValid: false, message: `Insufficient funds in ${s.name}` };
    }
    return { isValid: true };
  }

  private static isUndefinedColumnError(err: any) {
    try { return err?.code === '42703' || (typeof err?.message === 'string' && err.message.includes('does not exist') && err.message.includes('column')); } catch { return false; }
  }

  static async getRecipientInfo(accountIdentifier: string): Promise<RecipientInfo | null> {
    if (!accountIdentifier) return null;
    try {
      const { data: bankRow, error: bankErr } = await supabase.from<BankAccountRow>('bank_accounts').select('id, user_id, account_name, account_type, mask, institution_name, email, balance').eq('account_name', accountIdentifier).limit(1).maybeSingle();
      if (bankErr) {
        if (!this.isUndefinedColumnError(bankErr)) console.warn('[PaymentService] bank_accounts(account_name) lookup warning:', bankErr);
      } else if (bankRow) {
        return { accountNumber: bankRow.account_name ?? accountIdentifier, firstName: bankRow.account_name ?? '', lastName: '', profilePicture: null, email: bankRow.email ?? null, userId: bankRow.user_id ?? undefined };
      }
    } catch (e) { console.warn('[PaymentService] bank_accounts(account_name) threw:', e); }

    try {
      const { data: userByAcct, error: userAcctErr } = await supabase.from<UserRow>('users').select('id, account_number, first_name, last_name, email, profile_picture, balance').eq('account_number', accountIdentifier).limit(1).maybeSingle();
      if (userAcctErr) { if (!this.isUndefinedColumnError(userAcctErr)) console.warn('[PaymentService] users(account_number) lookup warning:', userAcctErr); }
      else if (userByAcct) return { accountNumber: userByAcct.account_number ?? accountIdentifier, firstName: userByAcct.first_name ?? '', lastName: userByAcct.last_name ?? '', profilePicture: userByAcct.profile_picture ?? null, email: userByAcct.email ?? null, userId: userByAcct.id };
    } catch (e) { console.warn('[PaymentService] users(account_number) threw:', e); }

    try {
      const { data: userById, error: userIdErr } = await supabase.from<UserRow>('users').select('id, account_number, first_name, last_name, email, profile_picture, balance').eq('id', accountIdentifier).limit(1).maybeSingle();
      if (userIdErr) console.warn('[PaymentService] users(id) lookup warning:', userIdErr);
      else if (userById) return { accountNumber: userById.account_number ?? accountIdentifier, firstName: userById.first_name ?? '', lastName: userById.last_name ?? '', profilePicture: userById.profile_picture ?? null, email: userById.email ?? null, userId: userById.id };
    } catch (e) { console.warn('[PaymentService] users(id) threw:', e); }

    return null;
  }

  static async resolveSenderDbId(passedSenderIdOrClerkId: string): Promise<string | null> {
    if (!passedSenderIdOrClerkId) return null;
    const looksLikeClerkId = passedSenderIdOrClerkId.startsWith?.('user_');
    if (!looksLikeClerkId) return passedSenderIdOrClerkId;
    try {
      const { data: u, error } = await supabase.from<UserRow>('users').select('id, clerk_id').eq('clerk_id', passedSenderIdOrClerkId).limit(1).maybeSingle();
      if (error) { console.warn('[PaymentService] resolveSenderDbId lookup error', error); const dbUser = await safeGetByClerkId(passedSenderIdOrClerkId); return dbUser?.id ?? null; }
      if (u && u.id) return u.id;
    } catch (e) { console.warn('[PaymentService] resolveSenderDbId threw:', e); }
    const dbUser = await safeGetByClerkId(passedSenderIdOrClerkId);
    return dbUser?.id ?? null;
  }

  static async processDemoPayment(request: PaymentRequest, recipientName: string): Promise<PaymentResult> {
    try {
      const mockTransaction = { id: `demo_${Date.now()}`, amount: -request.totalAmount, description: request.description ?? `Sent to ${recipientName}`, date: new Date().toISOString(), category: 'Transfer', type: 'debit', pending: false, title: `Sent to ${recipientName}`, subtitle: `Account: ${request.recipientAccountNumber}`, merchant_name: recipientName, isDemoTransaction: true };
      const stored = await AsyncStorage.getItem(DEMO_TRANSACTIONS_KEY);
      const transactions = stored ? JSON.parse(stored) : [];
      transactions.unshift(mockTransaction);
      await AsyncStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(transactions));
      try { const current = await safeGetUserBalance(); if (typeof current === 'number') safeSetUserBalance(current - request.totalAmount); } catch {}
      return { success: true, transactionId: mockTransaction.id, message: 'Demo payment processed', newBalance: undefined };
    } catch (err: any) { console.error('Demo payment processing error:', err); throw new Error(err?.message || 'Failed to process demo payment'); }
  }

  static async getDemoTransactions(): Promise<any[]> {
    try { const stored = await AsyncStorage.getItem(DEMO_TRANSACTIONS_KEY); return stored ? JSON.parse(stored) : []; } catch (err) { console.error('Error loading demo transactions:', err); return []; }
  }

  static async processPayment(request: PaymentRequest, isDemoMode: boolean = false, recipientName?: string): Promise<PaymentResult> {
    console.log('[PaymentService] processPayment called', { request, isDemoMode });

    const validation = this.validateSources(request.sources);
    if (!validation.isValid) throw new Error(validation.message);

    const calculated = request.sources.reduce((s, x) => s + x.amount, 0);
    if (Math.abs(calculated - request.totalAmount) > 0.01) throw new Error('Total amount does not match sum of sources');

    // Resolve recipient
    let recipient: RecipientInfo | null = null;
    try { recipient = await this.getRecipientInfo(request.recipientAccountNumber); } catch (err) { console.warn('[PaymentService] recipient lookup threw', err); recipient = null; }

    if (!recipient && isDemoMode) return await this.processDemoPayment(request, recipientName || request.recipientAccountNumber || 'Demo Recipient');
    if (!recipient && !isDemoMode) throw new Error('Recipient account not found');

    // Resolve sender DB uuid
    const senderDbId = await this.resolveSenderDbId(request.senderId);
    if (!senderDbId) throw new Error('Sender account not found (could not resolve DB id)');

    if (isDemoMode) return await this.processDemoPayment(request, recipientName || `${recipient?.firstName ?? ''} ${recipient?.lastName ?? ''}`);

    const sourcesData = request.sources.map((s) => ({ id: s.id, type: s.type, amount: s.amount }));

    // Log rpc payload for debugging
    console.log('[PaymentService] RPC payload:', { senderDbId, p_sources: sourcesData, p_total_amount: request.totalAmount });

    // Pre-RPC bank balance check (optional)
    try {
      const bankSources = request.sources.filter(s => s.type === 'bank');
      if (bankSources.length > 0) {
        const ids = bankSources.map(s => s.id);
        const { data: rows, error } = await supabase.from<BankAccountRow>('bank_accounts').select('id, balance, user_id').in('id', ids);
        if (error) console.warn('[PaymentService] bank account read warning before RPC', error);
        const byId = new Map((rows || []).map(r => [r.id, r]));
        for (const bs of bankSources) {
          const row = byId.get(bs.id);
          if (!row) throw new Error(`Bank source not found in DB for id ${bs.id}`);
          const avail = Number(row.balance || 0);
          if ((bs.amount || 0) > avail) throw new Error('Insufficient bank balance');
        }
      }
    } catch (precheckErr: any) {
      console.warn('[PaymentService] pre-RPC bank balance validation failed', precheckErr);
      throw precheckErr;
    }

    // Attempt RPC
    try {
      console.log('[PaymentService] attempting supabase.rpc("process_payment")', { senderDbId, recipientAccountNumber: request.recipientAccountNumber, sourcesData });
      const { data, error } = await supabase.rpc('process_payment', {
        p_sender_id: senderDbId,
        p_recipient_account_number: request.recipientAccountNumber,
        p_sources: sourcesData,
        p_total_amount: request.totalAmount,
        p_description: request.description ?? '',
      });

      console.log('[PaymentService] rpc returned', { data, error });
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      if (!result || !result.success) throw new Error(result?.message || 'RPC did not succeed');

      const newBal = result.new_balance ?? result.newBalance;
      if (typeof newBal === 'number') { safeSetUserBalance(newBal); try { await safeRefreshUser(senderDbId); } catch (e) { console.warn('[PaymentService] safeRefreshUser failed', e); } }

      let emitBalance: number | undefined = typeof newBal === 'number' ? newBal : undefined;
      if (typeof emitBalance !== 'number') {
        try { const { data: userRow } = await supabase.from('users').select('balance').eq('id', senderDbId).maybeSingle(); emitBalance = Number(userRow?.balance ?? emitBalance); } catch (e) { console.warn('[PaymentService] emit balance read failed', e); }
      }
      try { DeviceEventEmitter.emit('user:updated', { userId: senderDbId, newBalance: emitBalance }); } catch (e) { console.warn('[PaymentService] emit failed', e); }

      return { success: true, transactionId: result.transaction_id || result.transactionId, message: result.message || 'Payment processed', newBalance: emitBalance };
    } catch (rpcErr) {
      console.warn('[PaymentService] RPC failed or missing, falling back to client-side updates', rpcErr);
    }

    // CLIENT-SIDE FALLBACK: per-source debits with rollback support
    // We will apply debits to each source (users for quickpay, bank_accounts for bank),
    // then credit recipient, attempt to insert a transaction record, and emit updates.
    const appliedUpdates: Array<{ table: 'users' | 'bank_accounts'; id: string; prevBalance: number }> = [];

    const rollbackApplied = async () => {
      console.warn('[PaymentService] rolling back applied updates', appliedUpdates);
      for (let i = appliedUpdates.length - 1; i >= 0; i--) {
        const u = appliedUpdates[i];
        try {
          if (u.table === 'users') {
            await supabase.from('users').update({ balance: u.prevBalance }).eq('id', u.id);
          } else {
            await supabase.from('bank_accounts').update({ balance: u.prevBalance }).eq('id', u.id);
          }
        } catch (rbErr) {
          console.error('[PaymentService] rollback update failed for', u, rbErr);
        }
      }
    };

    try {
      // Read the authoritative sender balance
      const { data: senderRow, error: senderErr } = await supabase.from<UserRow>('users').select('id, balance').eq('id', senderDbId).limit(1).maybeSingle();
      if (senderErr || !senderRow) { console.error('[PaymentService] sender lookup failed', senderErr); throw new Error('Sender account not found or permission denied'); }
      let currentUserBalance = Number(senderRow.balance || 0);

      // 1) Apply debits per-source
      for (const s of request.sources) {
        if ((s.amount || 0) <= 0) continue;
        if (s.type === 'quickpay') {
          if (currentUserBalance < s.amount) throw new Error('Insufficient quickpay funds');
          const prev = currentUserBalance;
          const newBal = prev - s.amount;
          const { data: upd, error: updErr } = await supabase.from<UserRow>('users').update({ balance: newBal }).eq('id', senderDbId).eq('balance', prev).select().maybeSingle();
          if (updErr || !upd) { throw new Error('Failed to debit quickpay (concurrent update or permission)'); }
          appliedUpdates.push({ table: 'users', id: senderDbId, prevBalance: prev });
          currentUserBalance = newBal;
        } else if (s.type === 'bank') {
          const bankId = s.id;
          const { data: bankRow, error: bankErr } = await supabase.from<BankAccountRow>('bank_accounts').select('id, balance').eq('id', bankId).limit(1).maybeSingle();
          if (bankErr || !bankRow) throw new Error(`Bank source not found: ${bankId}`);
          const bankPrev = Number(bankRow.balance || 0);
          if (bankPrev < s.amount) throw new Error('Insufficient bank balance');
          const bankNew = bankPrev - s.amount;
          const { data: bankUpd, error: bankUpdErr } = await supabase.from('bank_accounts').update({ balance: bankNew }).eq('id', bankId).eq('balance', bankPrev).select().maybeSingle();
          if (bankUpdErr || !bankUpd) throw new Error('Failed to debit bank account (concurrent update or permission)');
          appliedUpdates.push({ table: 'bank_accounts', id: bankId, prevBalance: bankPrev });
        } else {
          throw new Error(`Unknown source type: ${s.type}`);
        }
      }

      // 2) Credit recipient (user or bank_accounts)
      let recipientDbId = recipient?.userId ?? null;
      if (!recipientDbId) {
        try {
          const { data: recUser, error: recErr } = await supabase.from<UserRow>('users').select('id, balance').eq('account_number', request.recipientAccountNumber).limit(1).maybeSingle();
          if (!recErr && recUser) recipientDbId = recUser.id;
        } catch {}
      }

      if (recipientDbId) {
        const { data: recRow, error: recErr } = await supabase.from<UserRow>('users').select('id, balance').eq('id', recipientDbId).limit(1).maybeSingle();
        if (recErr || !recRow) { await rollbackApplied(); throw new Error('Recipient account lookup failed during credit'); }
        const recipientNewBalance = Number(recRow.balance || 0) + request.totalAmount;
        const { error: creditErr } = await supabase.from<UserRow>('users').update({ balance: recipientNewBalance }).eq('id', recipientDbId);
        if (creditErr) { await rollbackApplied(); throw new Error('Failed to credit recipient'); }
      } else {
        // try bank_accounts credit path: recipientAccountNumber may be account_name or id
        try {
          // First try as id
          let ba: BankAccountRow | null = null;
          try {
            const { data: baRes, error: baErr } = await supabase.from<BankAccountRow>('bank_accounts').select('id, balance').eq('id', request.recipientAccountNumber).limit(1).maybeSingle();
            if (!baErr && baRes) ba = baRes;
          } catch {}
          if (!ba) {
            const { data: ba2, error: ba2Err } = await supabase.from<BankAccountRow>('bank_accounts').select('id, balance').eq('account_name', request.recipientAccountNumber).limit(1).maybeSingle();
            if (!ba2Err && ba2) ba = ba2;
          }

          if (ba) {
            const recipientNewBalance = Number(ba.balance || 0) + request.totalAmount;
            const { error: bankCreditErr } = await supabase.from('bank_accounts').update({ balance: recipientNewBalance }).eq('id', ba.id);
            if (bankCreditErr) { await rollbackApplied(); throw new Error('Failed to credit recipient bank account'); }
          } else {
            // Unable to find recipient target
            await rollbackApplied();
            throw new Error('Recipient account not found for crediting');
          }
        } catch (e) { await rollbackApplied(); throw new Error('Recipient credit failed'); }
      }

      // 3) Try to insert transaction row (best-effort). If schema mismatch, keep balances but return success.
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
        if (this.isUndefinedColumnError(insertErr) || (insertErr && insertErr.code === 'PGRST204')) {
          // Schema mismatch: balances moved but cannot record tx. Emit and return success.
          try {
            // Update local model and emit new user balance (if quickpay changed)
            if (appliedUpdates.length > 0) {
              const userUpdate = appliedUpdates.find(u => u.table === 'users' && u.id === senderDbId);
              if (userUpdate) {
                // Read current users.balance
                try {
                  const { data: urow } = await supabase.from<UserRow>('users').select('balance').eq('id', senderDbId).maybeSingle();
                  const newBal = Number(urow?.balance ?? null);
                  if (typeof newBal === 'number') {
                    safeSetUserBalance(newBal);
                    try { await safeRefreshUser(senderDbId); } catch {}
                    DeviceEventEmitter.emit('user:updated', { userId: senderDbId, newBalance: newBal });
                    return { success: true, message: 'Payment completed but transaction record could not be created (schema mismatch)', newBalance: newBal };
                  }
                } catch (e) { console.warn('[PaymentService] read after tx-insert-failed failed', e); }
              }
            }
            // If no quickpay change or we couldn't read, emit without numeric newBalance
            DeviceEventEmitter.emit('user:updated', { userId: senderDbId, newBalance: undefined });
            return { success: true, message: 'Payment completed but transaction record could not be created (schema mismatch)', newBalance: undefined };
          } catch (e) { console.warn('[PaymentService] emit after failed tx insert failed', e); return { success: true, message: 'Payment completed but transaction record could not be created (schema mismatch)', newBalance: undefined }; }
        }

        // Otherwise rollback and raise
        await rollbackApplied();
        throw new Error('Transaction create failed after balances updated');
      }

      // 4) Success: update local UserModel and emit authoritative balance
      try {
        const userUpdate = appliedUpdates.find(u => u.table === 'users' && u.id === senderDbId);
        if (userUpdate) {
          try {
            const { data: urow } = await supabase.from<UserRow>('users').select('balance').eq('id', senderDbId).maybeSingle();
            const newBal = Number(urow?.balance ?? null);
            if (typeof newBal === 'number') {
              if (!safeSetUserBalance(newBal)) await safeRefreshUser(senderDbId);
              DeviceEventEmitter.emit('user:updated', { userId: senderDbId, newBalance: newBal });
            }
          } catch (e) { try { await safeRefreshUser(senderDbId); } catch {} DeviceEventEmitter.emit('user:updated', { userId: senderDbId, newBalance: undefined }); }
        } else {
          // no quickpay change - still try to refresh
          try { await safeRefreshUser(senderDbId); DeviceEventEmitter.emit('user:updated', { userId: senderDbId, newBalance: undefined }); } catch {}
        }
      } catch (e) { console.warn('[PaymentService] post-success emit failed', e); }

      return { success: true, transactionId: insertedTx.id || insertedTx.transaction_id, message: 'Payment completed (client fallback)', newBalance: undefined };
    } catch (fallbackErr: any) {
      console.error('[PaymentService] client-side fallback error', fallbackErr);
      // ensure we attempted rollback if something failed before final commit
      try { await rollbackApplied(); } catch (rb) { console.error('[PaymentService] rollback after fallback failure also failed', rb); }
      throw new Error(fallbackErr?.message || 'Payment failed');
    }
  }
}

export default PaymentService;