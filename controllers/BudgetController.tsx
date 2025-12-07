/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
/**
 * BudgetController.ts
 * Business logic for budget management
 */

import {
  BudgetCategory,
  TreeBudgetCategory,
  BudgetSummary,
  ValidationResult,
  BudgetValidation,
  DefaultBudgetCategory,
  BudgetTypeConfig,
  BudgetType,
} from '@/models/BudgetModel';

/**
 * Calculate budget summary statistics
 */
export function getBudgetSummary(
  categories: TreeBudgetCategory[],
  totalBalance: number
): BudgetSummary {
  // Filter out banks for calculation
  const nonBankCategories = categories.filter(cat => cat.type !== 'bank');
  
  const totalBudget = nonBankCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = nonBankCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const available = totalBalance - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const categoryCount = nonBankCategories.filter(cat => cat.type === 'category').length;
  
  // Calculate bank statistics
  const banks = categories.filter(cat => cat.type === 'bank');
  const totalBankBalance = banks.reduce((sum, bank) => sum + bank.budget, 0);

  return {
    totalBudget,
    totalSpent,
    available,
    percentageUsed,
    categoryCount,
    bankCount: banks.length,
    totalBankBalance,
  };
}

/**
 * Validate category input
 */
export function validateCategory(name: string, budget: string): ValidationResult {
  // Check if name is provided
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: 'Category name is required',
    };
  }

  // Check name length
  if (name.length < BudgetValidation.MIN_NAME_LENGTH) {
    return {
      valid: false,
      error: `Name must be at least ${BudgetValidation.MIN_NAME_LENGTH} character`,
    };
  }

  if (name.length > BudgetValidation.MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Name must be less than ${BudgetValidation.MAX_NAME_LENGTH} characters`,
    };
  }

  // Check if budget is provided
  if (!budget || budget.trim().length === 0) {
    return {
      valid: false,
      error: 'Budget amount is required',
    };
  }

  // Check if budget is a valid number
  const budgetNumber = parseFloat(budget);
  if (isNaN(budgetNumber)) {
    return {
      valid: false,
      error: 'Budget must be a valid number',
    };
  }

  // Check budget range
  if (budgetNumber < BudgetValidation.MIN_BUDGET) {
    return {
      valid: false,
      error: `Budget must be at least $${BudgetValidation.MIN_BUDGET}`,
    };
  }

  if (budgetNumber > BudgetValidation.MAX_BUDGET) {
    return {
      valid: false,
      error: `Budget cannot exceed $${BudgetValidation.MAX_BUDGET.toLocaleString()}`,
    };
  }

  return { valid: true };
}

/**
 * Create a new budget category
 */
export function createCategory(
  name: string,
  budget: number,
  icon: string = DefaultBudgetCategory.icon!,
  color: string = DefaultBudgetCategory.color!,
  type: BudgetType = 'category'
): BudgetCategory {
  return {
    id: Date.now().toString(),
    name: name.trim(),
    icon,
    color,
    spent: DefaultBudgetCategory.spent!,
    budget,
  };
}

/**
 * Add a category to the list
 */
export function addCategory(
  categories: BudgetCategory[],
  newCategory: BudgetCategory
): BudgetCategory[] {
  return [...categories, newCategory];
}

/**
 * Delete a category and all its descendants
 */
export function deleteCategory(
  categories: TreeBudgetCategory[],
  categoryId: string
): TreeBudgetCategory[] {
  const idsToDelete = new Set([categoryId]);

  // Recursively find all descendants
  function addDescendants(catId: string) {
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      cat.children.forEach(childId => {
        idsToDelete.add(childId);
        addDescendants(childId);
      });
    }
  }

  addDescendants(categoryId);

  // Find parent and remove reference
  const categoryToDelete = categories.find(c => c.id === categoryId);
  
  return categories
    .filter(cat => !idsToDelete.has(cat.id))
    .map(cat => 
      cat.id === categoryToDelete?.parentId
        ? { ...cat, children: cat.children.filter(id => id !== categoryId) }
        : cat
    );
}

/**
 * Update a category's spent amount
 */
export function updateCategorySpent(
  categories: TreeBudgetCategory[],
  categoryId: string,
  newSpent: number
): TreeBudgetCategory[] {
  return categories.map(cat =>
    cat.id === categoryId ? { ...cat, spent: newSpent } : cat
  );
}

/**
 * Get all descendants of a category
 */
export function getCategoryDescendants(
  categories: TreeBudgetCategory[],
  categoryId: string
): TreeBudgetCategory[] {
  const descendants: TreeBudgetCategory[] = [];
  const category = categories.find(c => c.id === categoryId);
  
  if (!category) return descendants;

  function collectDescendants(catId: string) {
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      descendants.push(cat);
      cat.children.forEach(childId => collectDescendants(childId));
    }
  }

  category.children.forEach(childId => collectDescendants(childId));
  
  return descendants;
}

/**
 * Get ancestors of a category (path to root)
 */
export function getCategoryAncestors(
  categories: TreeBudgetCategory[],
  categoryId: string
): TreeBudgetCategory[] {
  const ancestors: TreeBudgetCategory[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const category = categories.find(c => c.id === currentId);
    if (!category) break;
    
    if (category.parentId) {
      const parent = categories.find(c => c.id === category.parentId);
      if (parent) {
        ancestors.unshift(parent);
        currentId = parent.id;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return ancestors;
}

/**
 * Check if category can be deleted
 */
export function canDeleteCategory(category: TreeBudgetCategory): boolean {
  const config = BudgetTypeConfig[category.type];
  return config.canDelete;
}

/**
 * Check if category can have children
 */
export function canAddChildren(category: TreeBudgetCategory): boolean {
  const config = BudgetTypeConfig[category.type];
  return config.canAddChildren;
}

/**
 * Get block size based on type
 */
export function getBlockSize(type: BudgetType): { width: number; height: number } {
  return BudgetTypeConfig[type].size;
}

/**
 * Calculate total budget from banks
 */
export function calculateTotalFromBanks(categories: TreeBudgetCategory[]): number {
  const banks = categories.filter(cat => cat.type === 'bank');
  return banks.reduce((sum, bank) => sum + bank.budget, 0);
}

/**
 * Validate that child budget doesn't exceed parent
 */
export function validateChildBudget(
  categories: TreeBudgetCategory[],
  parentId: string,
  childBudget: number
): ValidationResult {
  const parent = categories.find(c => c.id === parentId);
  
  if (!parent) {
    return { valid: false, error: 'Parent category not found' };
  }

  // Calculate total budget already allocated to children
  const childrenTotal = parent.children.reduce((sum, childId) => {
    const child = categories.find(c => c.id === childId);
    return sum + (child?.budget || 0);
  }, 0);

  const available = parent.budget - childrenTotal;

  if (childBudget > available) {
    return {
      valid: false,
      error: `Only $${available.toFixed(2)} available from parent budget`,
    };
  }

  return { valid: true };
}

/**
 * Add transaction to category
 */
export function addTransaction(
  categories: TreeBudgetCategory[],
  categoryId: string,
  transaction: Omit<import('@/models/BudgetModel').Transaction, 'id' | 'categoryId'>
): TreeBudgetCategory[] {
  return categories.map(cat => {
    if (cat.id === categoryId) {
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        categoryId: categoryId,
      };
      
      const updatedTransactions = [...(cat.transactions || []), newTransaction];
      const newSpent = transaction.type === 'expense' 
        ? cat.spent + transaction.amount 
        : cat.spent - transaction.amount;
      
      return {
        ...cat,
        transactions: updatedTransactions,
        spent: Math.max(0, newSpent),
      };
    }
    return cat;
  });
}

/**
 * Get category transactions sorted by date
 */
export function getCategoryTransactions(
  categories: TreeBudgetCategory[],
  categoryId: string
): import('@/models/BudgetModel').Transaction[] {
  const category = categories.find(c => c.id === categoryId);
  if (!category || !category.transactions) return [];
  
  return [...category.transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Delete transaction from category
 */
export function deleteTransaction(
  categories: TreeBudgetCategory[],
  categoryId: string,
  transactionId: string
): TreeBudgetCategory[] {
  return categories.map(cat => {
    if (cat.id === categoryId && cat.transactions) {
      const transaction = cat.transactions.find(t => t.id === transactionId);
      if (transaction) {
        const newSpent = transaction.type === 'expense'
          ? cat.spent - transaction.amount
          : cat.spent + transaction.amount;
        
        return {
          ...cat,
          transactions: cat.transactions.filter(t => t.id !== transactionId),
          spent: Math.max(0, newSpent),
        };
      }
    }
    return cat;
  });
}
