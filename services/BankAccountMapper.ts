import { supabase } from '@/config/supabaseConfig';
import type { PlaidAccount } from '@/services/PlaidService';

/**
 * Fetch persisted bank_accounts rows for a given DB user id (uuid).
 */
export async function fetchBankAccountsForUser(userDbId: string) {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('id, user_id, account_name, mask, balance, plaid_account_id, account_type')
    .eq('user_id', userDbId);

  if (error) {
    console.warn('[BankAccountMapper] fetchBankAccountsForUser error', error);
    return [];
  }
  return (data || []) as Array<{
    id: string;
    user_id: string;
    account_name?: string | null;
    mask?: string | null;
    balance?: number | null;
    plaid_account_id?: string | null;
    account_type?: string | null;
  }>;
}

/**
 * Map Plaid accounts to bank_accounts rows (prefer matching by plaid_account_id,
 * then mask or account name). If createIfMissing=true this will insert a new
 * bank_accounts row for the user when no match exists.
 */
export async function mapPlaidAccountsToSources(
  userDbId: string,
  plaidAccounts: PlaidAccount[],
  createIfMissing = false
) {
  const existing = await fetchBankAccountsForUser(userDbId);
  const mapped: Array<any> = [];

  for (const p of plaidAccounts) {
    const match = existing.find((b) =>
      (b.plaid_account_id && p.account_id && b.plaid_account_id === p.account_id) ||
      (b.mask && p.mask && b.mask === p.mask) ||
      (b.account_name && p.name && b.account_name === p.name)
    );

    if (match) {
      mapped.push({
        sourceId: match.id, // UUID required by PaymentService
        type: 'bank',
        name: match.account_name || p.name,
        balance: Number(match.balance ?? p.balances?.current ?? 0),
      });
      continue;
    }

    if (createIfMissing) {
      // Ensure we set account_type because DB enforces it (fixes the not-null error)
      const accountType = (p.subtype || p.type || 'checking') as string;

      const toInsert: any = {
        user_id: userDbId,
        account_name: p.name ?? `Plaid ${p.subtype ?? p.type}`,
        mask: p.mask ?? '',
        balance: p.balances?.current ?? 0,
        account_type: accountType,
      };
      if (p.account_id) toInsert.plaid_account_id = p.account_id;

      const { data: inserted, error } = await supabase
        .from('bank_accounts')
        .insert([toInsert])
        .select()
        .maybeSingle();

      if (!error && inserted) {
        mapped.push({
          sourceId: inserted.id,
          type: 'bank',
          name: inserted.account_name,
          balance: Number(inserted.balance ?? 0),
        });
        existing.push(inserted); // keep cached list updated
        continue;
      } else {
        console.warn('[BankAccountMapper] failed to insert bank_account for user', {
          error,
          toInsert,
        });
      }
    }

    // Fallback: return the Plaid account_id (NOT a UUID) but mark as unmapped.
    mapped.push({
      sourceId: p.account_id,
      type: 'bank',
      name: p.name,
      balance: Number(p.balances?.current ?? 0),
      note: 'unmapped-plaid-account',
    });
  }

  return mapped;
}