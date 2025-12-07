/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { Transaction } from "@/data/transaction";


// Parse a transaction date string ("YYYY-MM-DD") into a Date object.
// Returns null if parsing fails.
 
export function parseDate(dateStr: string): Date | null {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day); // JS months are 0-based
}


// Format a transaction date into a label ("Today", "September 20, 2025", etc.")
 
export function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  if (dateStr === todayStr) {
    return "Today";
  }

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}


// Filter, sort, and group transactions into sections by date label.
// Filtering: by week, last week, last month, or all
// Sorting: newest -> oldest
// Grouping: by "Today", "September 20, 2025", etc

export function filterAndGroupTransactions(
  transactions: Transaction[],
  filter: string
): Record<string, Transaction[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filtering transactions
  const filtered = transactions.filter((tx) => {
    const txDate = parseDate(tx.date);
    if (!txDate) return true;

    const txDay = new Date(
      txDate.getFullYear(),
      txDate.getMonth(),
      txDate.getDate()
    );

    if (filter === "week") {
      // Current week (Sunday -> Saturday)
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return txDay >= start && txDay <= end;
    } else if (filter === "last_week") {
      // Last week (Sunday -> Saturday)
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() - 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return txDay >= start && txDay <= end;
    } else if (filter === "last_month") {
      // Last month (month before current month)
      const lastMonth = today.getMonth() - 1;
      const year = lastMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
      const month = lastMonth < 0 ? 11 : lastMonth;
      return txDay.getMonth() === month && txDay.getFullYear() === year;
    }
    return true; // Default = all
  });

  // Sort transactions by date (descending, newest first)
  const sorted = [...filtered].sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    if (!dateA || !dateB) return 0;
    return dateB.getTime() - dateA.getTime();
  });

  // Group transactions by formatted date label
  return sorted.reduce((acc: Record<string, Transaction[]>, tx) => {
    const label = formatDateLabel(tx.date);
    if (!acc[label]) acc[label] = [];
    acc[label].push(tx);
    return acc;
  }, {});
}
