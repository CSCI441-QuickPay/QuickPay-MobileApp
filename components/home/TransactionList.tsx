import TransactionActions from '@/components/home/TransactionActions';
import { supabase } from '@/config/supabaseConfig';
import PaymentService from '@/services/PaymentService';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Transaction = {
  id: string;
  title?: string;
  amount: number;
  date: string;
  subtitle?: string;
  category?: string;
  logo?: any;
  logo_url?: string;
  splitData?: any;
  bank?: string;
  // any additional fields from your transactions table
};

type Props = {
  filters: {
    timeFilter: string;
    bankFilter: string;
    sortType: string;
  };
  transactions?: Transaction[];
};

/*
  Combined TransactionList:
  - If `transactions` prop is provided (mock data / parent-managed), use it and apply filters.
  - If no `transactions` prop is provided, load from Supabase and merge with demo transactions saved
    by PaymentService.getDemoTransactions(), then apply filters and render.
  - Reloads when screen gains focus.
*/

function parseTransactionDate(dateStr: string): Date {
  // Try to parse ISO or YYYY-MM-DD safely.
  if (!dateStr) return new Date(0);
  const iso = Date.parse(dateStr);
  if (!isNaN(iso)) return new Date(iso);

  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function filterByTime(transactions: Transaction[], timeFilter: string): Transaction[] {
  const now = getStartOfDay(new Date());

  const currentDayOfWeek = now.getDay(); // 0 = Sunday
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - currentDayOfWeek);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(now.getDate() - 30);

  return transactions.filter((tx) => {
    const txDate = parseTransactionDate(tx.date);

    switch (timeFilter) {
      case 'week':
        return txDate >= thisWeekStart && txDate <= now;
      case 'last_week':
        return txDate >= lastWeekStart && txDate < thisWeekStart;
      case 'last_month':
        return txDate >= oneMonthAgo && txDate <= now;
      case 'all':
      default:
        return true;
    }
  });
}

function filterByBank(transactions: Transaction[], bankFilter: string): Transaction[] {
  if (!bankFilter || bankFilter === 'all') return transactions;

  const bankName = bankFilter
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return transactions.filter((tx) => {
    const txBank = (tx.bank || tx.subtitle || '').toString();
    return txBank.toLowerCase().includes(bankName.toLowerCase());
  });
}

function sortTransactions(transactions: Transaction[], sortType: string): Transaction[] {
  const sorted = [...transactions];
  switch (sortType) {
    case 'date_asc':
      return sorted.sort((a, b) => parseTransactionDate(a.date).getTime() - parseTransactionDate(b.date).getTime());
    case 'date_desc':
      return sorted.sort((a, b) => parseTransactionDate(b.date).getTime() - parseTransactionDate(a.date).getTime());
    case 'amount_asc':
      return sorted.sort((a, b) => a.amount - b.amount);
    case 'amount_desc':
      return sorted.sort((a, b) => b.amount - a.amount);
    default:
      return sorted;
  }
}

function groupTransactionsByDate(transactions: Transaction[]): { [key: string]: Transaction[] } {
  const groups: { [key: string]: Transaction[] } = {};
  const today = getStartOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  transactions.forEach((tx) => {
    const date = parseTransactionDate(tx.date);

    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(tx);
  });

  return groups;
}

export default function TransactionList({ filters, transactions: transactionsProp }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [serverTransactions, setServerTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  // Load server + demo transactions only if transactionsProp is not provided
  const loadServerAndDemo = useCallback(
    async (userId?: string) => {
      setLoading(true);
      try {
        // Attempt to load from server (supabase). If user identification is different in your app,
        // adapt the query to match the field you use (e.g., account_number or user_id).
        // Here we try to read transactions for the current authenticated user via supabase.auth, but
        // if your app passes userId, you can change this.
        console.log('[TX LIST] loading server transactions');

        // NOTE: If you have RLS and supabase auth, supabase client will use current session.
        // If your app stores userId elsewhere, change the where clause accordingly.
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) {
          console.warn('[TX LIST] supabase error', error);
          setServerTransactions([]);
        } else {
          const mapped = (data || []).map((r: any) => ({
            id: r.id,
            title: r.title || r.description || r.merchant,
            amount: r.amount,
            date: r.created_at || r.date || new Date().toISOString(),
            subtitle: r.subtitle || r.description,
            category: r.category,
            logo: r.logo,
            logo_url: r.logo_url,
            splitData: r.split_data || r.splitData,
            bank: r.bank || r.subtitle,
          })) as Transaction[];
          setServerTransactions(mapped);
        }
      } catch (err) {
        console.error('[TX LIST] server fetch err', err);
        setServerTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!transactionsProp && isFocused) {
      loadServerAndDemo();
    }
  }, [isFocused, transactionsProp, loadServerAndDemo]);

  // If there is no transactionsProp, also merge demo transactions from PaymentService
  const mergedTransactions = useMemo(() => {
    if (transactionsProp && transactionsProp.length > 0) {
      // Parent provided transactions (mock data or managed list) -> use it directly
      return transactionsProp;
    }

    // Otherwise merge demo and server transactions
    // Demo txs come from AsyncStorage via PaymentService.getDemoTransactions()
    const demoTxsRaw: any[] = [];
    // we cannot await in useMemo - PaymentService.getDemoTransactions is async; in practice,
    // load demo transactions in an effect and store them in state. For simplicity, we synchronously
    // return serverTransactions here and let the demo merging happen in an effect below.
    return serverTransactions;
  }, [transactionsProp, serverTransactions]);

  // Demo transactions state and loader
  const [demoTransactions, setDemoTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    let mounted = true;
    async function loadDemo() {
      try {
        const dt = await PaymentService.getDemoTransactions();
        const mapped = (dt || []).map((t: any) => ({
          id: t.id,
          title: t.title || t.description || t.merchant,
          amount: t.amount,
          date: t.date || t.created_at || new Date().toISOString(),
          subtitle: t.subtitle || t.description,
          category: t.category,
          logo: undefined,
          logo_url: undefined,
          splitData: undefined,
          bank: undefined,
        })) as Transaction[];
        if (mounted) setDemoTransactions(mapped);
      } catch (err) {
        console.warn('[TX LIST] demo load failed', err);
      }
    }
    if (!transactionsProp && isFocused) loadDemo();
    return () => {
      mounted = false;
    };
  }, [transactionsProp, isFocused]);

  // Final transactions list used for filtering / grouping
  const finalTransactions = useMemo(() => {
    if (transactionsProp && transactionsProp.length > 0) return transactionsProp;

    // merge demo first so new demo txs appear at top
    const merged = [...demoTransactions, ...serverTransactions];
    const seen = new Set<string>();
    const deduped = merged.filter((t) => {
      if (!t?.id) return false;
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    // ensure dates are present
    return deduped.sort((a, b) => parseTransactionDate(b.date).getTime() - parseTransactionDate(a.date).getTime());
  }, [transactionsProp, demoTransactions, serverTransactions]);

  // Apply filters from props (time, bank, sort)
  const filteredAndSorted = useMemo(() => {
    let list = finalTransactions;
    list = filterByTime(list, filters?.timeFilter || 'all');
    list = filterByBank(list, filters?.bankFilter || 'all');
    list = sortTransactions(list, filters?.sortType || 'date_desc');
    return list;
  }, [finalTransactions, filters]);

  const grouped = useMemo(() => groupTransactionsByDate(filteredAndSorted), [filteredAndSorted]);

  // If parent supplied transactionsProp, we don't show loading indicator for server loads
  if (loading && !transactionsProp) return <ActivityIndicator style={{ marginTop: 24 }} />;

  if (Object.keys(grouped).length === 0) {
    return (
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
      >
        <View className="items-center justify-center py-20">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 text-lg font-bold text-center mb-2">
            No transactions found
          </Text>
          <Text className="text-gray-500 text-base text-center px-8">
            Try adjusting your filters
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
    >
      {Object.keys(grouped).map((date) => (
        <View key={date} className="mb-4">
          <Text className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
            {date}
          </Text>

          <View className="gap-2">
            {grouped[date].map((tx) => {
              const splitCount = tx.splitData?.splits?.length ?? 0;
              const isSplit = splitCount > 0;
              const isExpanded = expandedId === tx.id;
              const isIncome = tx.amount > 0;

              return (
                <View
                  key={tx.id}
                  className="bg-white rounded-2xl overflow-hidden border-2 border-gray-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <TouchableOpacity
                    className="flex-row items-center p-4"
                    onPress={() => setExpandedId(isExpanded ? null : tx.id)}
                    activeOpacity={0.7}
                  >
                    {(tx.logo || tx.logo_url) ? (
                      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3 overflow-hidden">
                        <Image source={tx.logo || { uri: tx.logo_url }} className="w-full h-full" resizeMode="contain" />
                      </View>
                    ) : (
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                          isIncome ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <Ionicons name={isIncome ? 'arrow-down' : 'arrow-up'} size={20} color={isIncome ? '#10B981' : '#EF4444'} />
                      </View>
                    )}

                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-base font-bold text-gray-900 flex-1" numberOfLines={1}>
                          {tx.title}
                        </Text>

                        {isSplit && (
                          <View className="ml-2 bg-green-50 rounded-full px-2 py-1 flex-row items-center border border-green-200">
                            <Ionicons name="people" size={12} color="#10B981" />
                            <Text className="text-xs font-bold text-green-600 ml-1">{splitCount}</Text>
                          </View>
                        )}
                      </View>

                      <View className="flex-row items-center gap-1">
                        {tx.category && tx.category !== 'Other' && (
                          <>
                            <View className="bg-blue-50 px-2 py-0.5 rounded">
                              <Text className="text-xs text-blue-700 font-semibold">{tx.category}</Text>
                            </View>
                            {tx.subtitle && <Text className="text-xs text-gray-400">•</Text>}
                          </>
                        )}
                        {tx.subtitle && <Text className="text-xs text-gray-500 font-medium flex-1" numberOfLines={1}>{tx.subtitle}</Text>}
                      </View>
                    </View>

                    <View className="items-end ml-3">
                      <Text className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </Text>

                      {isSplit && tx.splitData && (
                        <View className="bg-amber-50 px-2 py-0.5 rounded mt-1">
                          <Text className="text-xs text-amber-700 font-semibold">
                            {tx.splitData.splits.filter((s: any) => s.isPaid).length}/{splitCount} paid
                          </Text>
                        </View>
                      )}
                    </View>

                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>

                  <TransactionActions visible={isExpanded} transaction={tx} />
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}