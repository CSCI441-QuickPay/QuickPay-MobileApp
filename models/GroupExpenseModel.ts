// models/GroupExpenseModel.ts
import { supabase } from '@/config/supabaseConfig';

export type SplitType = 'equal' | 'percentage' | 'custom';
export type ExpenseStatus = 'pending' | 'completed' | 'cancelled';

export interface GroupExpenseParticipant {
  id?: string;
  groupExpenseId: string;
  userId: string;
  amountOwed: number;
  amountPaid: number;
  paid: boolean;
  createdAt?: Date;
}

export interface GroupExpense {
  id?: string;
  creatorUserId: string;
  title: string;
  description?: string;
  totalAmount: number;
  splitType: SplitType;
  status: ExpenseStatus;
  participants?: GroupExpenseParticipant[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface DBGroupExpense {
  id: string;
  creator_user_id: string;
  title: string;
  description?: string;
  total_amount: number;
  split_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DBParticipant {
  id: string;
  group_expense_id: string;
  user_id: string;
  amount_owed: number;
  amount_paid: number;
  paid: boolean;
  created_at: string;
}

export default class GroupExpenseModel {
  private static toGroupExpense(dbExpense: DBGroupExpense, participants?: DBParticipant[]): GroupExpense {
    return {
      id: dbExpense.id,
      creatorUserId: dbExpense.creator_user_id,
      title: dbExpense.title,
      description: dbExpense.description,
      totalAmount: Number(dbExpense.total_amount),
      splitType: dbExpense.split_type as SplitType,
      status: dbExpense.status as ExpenseStatus,
      participants: participants?.map(p => ({
        id: p.id,
        groupExpenseId: p.group_expense_id,
        userId: p.user_id,
        amountOwed: Number(p.amount_owed),
        amountPaid: Number(p.amount_paid),
        paid: p.paid,
        createdAt: new Date(p.created_at),
      })),
      createdAt: new Date(dbExpense.created_at),
      updatedAt: new Date(dbExpense.updated_at),
    };
  }

  static async create(expenseData: Omit<GroupExpense, 'id' | 'createdAt' | 'updatedAt'>, participants: Omit<GroupExpenseParticipant, 'id' | 'groupExpenseId' | 'createdAt'>[]): Promise<GroupExpense> {
    try {
      // Create group expense
      const { data: expenseData1, error: expenseError } = await supabase
        .from('group_expenses')
        .insert({
          creator_user_id: expenseData.creatorUserId,
          title: expenseData.title,
          description: expenseData.description,
          total_amount: expenseData.totalAmount,
          split_type: expenseData.splitType,
          status: expenseData.status,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      const expense = expenseData1 as DBGroupExpense;

      // Create participants
      const participantInserts = participants.map(p => ({
        group_expense_id: expense.id,
        user_id: p.userId,
        amount_owed: p.amountOwed,
        amount_paid: p.amountPaid,
        paid: p.paid,
      }));

      const { data: participantData, error: participantError } = await supabase
        .from('group_expense_participants')
        .insert(participantInserts)
        .select();

      if (participantError) throw participantError;

      return this.toGroupExpense(expense, participantData as DBParticipant[]);
    } catch (err) {
      console.error('L Error creating group expense:', err);
      throw err;
    }
  }

  static async get(id: string): Promise<GroupExpense | null> {
    try {
      const { data: expenseData, error: expenseError } = await supabase
        .from('group_expenses')
        .select('*')
        .eq('id', id)
        .single();

      if (expenseError) {
        if (expenseError.code === 'PGRST116') return null;
        throw expenseError;
      }

      const { data: participantData, error: participantError } = await supabase
        .from('group_expense_participants')
        .select('*')
        .eq('group_expense_id', id);

      if (participantError) throw participantError;

      return this.toGroupExpense(expenseData as DBGroupExpense, participantData as DBParticipant[]);
    } catch (err) {
      console.error('L Error fetching group expense:', err);
      throw err;
    }
  }

  static async getByUserId(userId: string): Promise<GroupExpense[]> {
    try {
      // Get expenses where user is creator or participant
      const { data: participantExpenseIds, error: pError } = await supabase
        .from('group_expense_participants')
        .select('group_expense_id')
        .eq('user_id', userId);

      if (pError) throw pError;

      const expenseIds = (participantExpenseIds as { group_expense_id: string }[]).map(p => p.group_expense_id);

      const { data: expenseData, error: expenseError } = await supabase
        .from('group_expenses')
        .select('*')
        .or(`creator_user_id.eq.${userId},id.in.(${expenseIds.join(',')})`)
        .order('created_at', { ascending: false });

      if (expenseError) throw expenseError;

      // Fetch participants for each expense
      const expenses = await Promise.all(
        (expenseData as DBGroupExpense[]).map(async (expense) => {
          const { data: participants } = await supabase
            .from('group_expense_participants')
            .select('*')
            .eq('group_expense_id', expense.id);

          return this.toGroupExpense(expense, participants as DBParticipant[]);
        })
      );

      return expenses;
    } catch (err) {
      console.error('L Error fetching group expenses:', err);
      throw err;
    }
  }

  static async updateStatus(id: string, status: ExpenseStatus): Promise<GroupExpense> {
    try {
      const { data, error } = await supabase
        .from('group_expenses')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { data: participants } = await supabase
        .from('group_expense_participants')
        .select('*')
        .eq('group_expense_id', id);

      return this.toGroupExpense(data as DBGroupExpense, participants as DBParticipant[]);
    } catch (err) {
      console.error('L Error updating expense status:', err);
      throw err;
    }
  }

  static async markParticipantPaid(participantId: string, amountPaid: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('group_expense_participants')
        .update({
          amount_paid: amountPaid,
          paid: true,
        })
        .eq('id', participantId);

      if (error) throw error;
    } catch (err) {
      console.error('L Error marking participant as paid:', err);
      throw err;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      // Cascade delete will handle participants
      const { error } = await supabase
        .from('group_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('L Error deleting group expense:', err);
      throw err;
    }
  }
}
