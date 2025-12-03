/**
 * BudgetModel.ts
 * Data models for budget management with hierarchical structure
 */

export type BudgetType = 'bank' | 'budget' | 'category';

/**
 * Transaction interface for category spending
 */
export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
  type: 'expense' | 'income';
  merchant?: string;
  icon?: string;
}

/**
 * Base Budget Category interface
 */
export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  budget: number;
}

/**
 * Extended Budget Category with tree structure and type
 */
export interface TreeBudgetCategory extends BudgetCategory {
  amount: any;
  parentId: string | null;
  children: string[];
  position: { x: number; y: number };
  type: BudgetType;
  transactions?: Transaction[];
  isMock?: boolean; // Flag to identify mock banks in Demo Mode
}

/**
 * Bank account interface
 */
export interface Bank {
  id: string;
  name: string;
  amount: number;
  budget?: number; // For mock data compatibility
  color: string;
  icon: string;
}

/**
 * Budget summary statistics
 */
export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  available: number;
  percentageUsed: number;
  categoryCount: number;
  bankCount?: number;
  totalBankBalance?: number;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Budget validation rules
 */
export const BudgetValidation = {
  MIN_BUDGET: 0,
  MAX_BUDGET: 1000000,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 50,
  REQUIRED_FIELDS: ['name', 'budget'],
};

/**
 * Default budget category values
 */
export const DefaultBudgetCategory: Partial<BudgetCategory> = {
  spent: 0,
  icon: 'wallet',
  color: '#3B82F6',
};

/**
 * Budget type configurations
 */
export const BudgetTypeConfig = {
  bank: {
    size: { width: 140, height: 110 },
    canDelete: false,
    canAddChildren: true,
    showMiniButtons: false,
  },
  budget: {
    size: { width: 150, height: 130 },
    canDelete: false,
    canAddChildren: true,
    showMiniButtons: true,
  },
  category: {
    size: { width: 130, height: 120 },
    canDelete: true,
    canAddChildren: true,
    showMiniButtons: true,
  },
};