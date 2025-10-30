/**
 * budget.tsx
 * Static data and configuration for budget system
 * SYNCED with transaction data - Total Balance: $1,348.17
 */

import { TreeBudgetCategory, Bank } from '@/models/BudgetModel';

/**
 * Default bank accounts
 * Total: $1,348.17 (matches transaction total)
 * NOTE: Use 'budget' property to match budgetCategories structure
 */
export const banks: Bank[] = [
  {
    id: 'bank1',
    name: 'Chase',
    budget: 550.00,
    color: '#3B82F6',
    icon: 'card',
  },
  {
    id: 'bank2',
    name: 'Wells Fargo',
    budget: 450.00,
    color: '#10B981',
    icon: 'business',
  },
  {
    id: 'bank3',
    name: 'Bank of America',
    budget: 200.17,
    color: '#F59E0B',
    icon: 'card-outline',
  },
  {
    id: 'bank4',
    name: 'Citi',
    budget: 148.00,
    color: '#8B5CF6',
    icon: 'wallet-outline',
  },
];

/**
 * Default budget categories with tree structure
 * Total Balance: $1,348.17 (synced with transactions)
 */
export const budgetCategories: TreeBudgetCategory[] = [
  // Banks (money sources) - Updated to match total balance
  {
    id: 'bank1',
    name: 'Chase',
    icon: 'card',
    color: '#3B82F6',
    spent: 0,
    budget: 550.00,
    parentId: null,
    children: ['total'],
    position: { x: 60, y: 30 },
    type: 'bank',
  },
  {
    id: 'bank2',
    name: 'Wells Fargo',
    icon: 'business',
    color: '#10B981',
    spent: 0,
    budget: 450.00,
    parentId: null,
    children: ['total'],
    position: { x: 260, y: 30 },
    type: 'bank',
  },
  {
    id: 'bank3',
    name: 'BofA',
    icon: 'card-outline',
    color: '#F59E0B',
    spent: 0,
    budget: 200.17,
    parentId: null,
    children: ['total'],
    position: { x: 460, y: 30 },
    type: 'bank',
  },
  {
    id: 'bank4',
    name: 'Citi',
    icon: 'wallet-outline',
    color: '#8B5CF6',
    spent: 0,
    budget: 148.00,
    parentId: null,
    children: ['total'],
    position: { x: 660, y: 30 },
    type: 'bank',
  },
  
  // Total Budget (pools from banks) - Matches total balance
  {
    id: 'total',
    name: 'Current Budget',
    icon: 'cash',
    color: '#1F2937',
    spent: 0, // Container block - spending tracked in categories below
    budget: 1348.17, // Updated to match transaction total
    parentId: null,
    children: ['cat1', 'cat2', 'cat3'],
    position: { x: 360, y: 240 },
    type: 'budget',
  },
  
  // Main categories - Adjusted to total $1,200 allocated (leaving $148.17 unallocated)
  {
    id: 'cat1',
    name: 'Rent',
    icon: 'home',
    color: '#EF4444',
    spent: 1000,
    budget: 1000, // Reduced from 1200 to 1000
    parentId: 'total',
    children: [],
    position: { x: 60, y: 450 },
    type: 'category',
    transactions: [
      {
        id: 't1',
        categoryId: 'cat1',
        amount: 1000,
        description: 'Monthly Rent Payment',
        date: new Date('2025-10-01'),
        type: 'expense',
        merchant: 'Property Management Inc',
        icon: 'home',
      },
    ],
  },
  {
    id: 'cat2',
    name: 'Utilities',
    icon: 'water',
    color: '#3B82F6',
    spent: 0,
    budget: 100, // Reduced from 150 to 100
    parentId: 'total',
    children: [],
    position: { x: 360, y: 450 },
    type: 'category',
    transactions: [],
  },
  {
    id: 'cat3',
    name: 'Living',
    icon: 'cart',
    color: '#84CC16',
    spent: 0,
    budget: 100, // Reduced from 660 to 100
    parentId: 'total',
    children: ['sub1', 'sub2', 'sub3'],
    position: { x: 660, y: 450 },
    type: 'category',
    transactions: [],
  },
  
  // Sub-categories - Adjusted to total $100 within Living budget
  {
    id: 'sub1',
    name: 'Groceries',
    icon: 'restaurant',
    color: '#10B981',
    spent: 0,
    budget: 50, // Reduced from 500 to 50
    parentId: 'cat3',
    children: [],
    position: { x: 460, y: 660 },
    type: 'category',
    transactions: [],
  },
  {
    id: 'sub2',
    name: 'Skincare',
    icon: 'flask',
    color: '#A78BFA',
    spent: 0,
    budget: 30, // Reduced from 80 to 30
    parentId: 'cat3',
    children: [],
    position: { x: 660, y: 660 },
    type: 'category',
    transactions: [],
  },
  {
    id: 'sub3',
    name: 'Clothes',
    icon: 'shirt',
    color: '#F97316',
    spent: 0,
    budget: 20, // Reduced from 80 to 20
    parentId: 'cat3',
    children: [],
    position: { x: 860, y: 660 },
    type: 'category',
    transactions: [],
  },
];

/**
 * Available icons for budget categories
 */
export const availableIcons = [
  // Finance
  'wallet',
  'cash',
  'card',
  'trending-up',
  'trending-down',
  
  // Daily life
  'home',
  'restaurant',
  'cafe',
  'cart',
  'bag',
  
  // Transportation
  'car',
  'bus',
  'bicycle',
  'airplane',
  'train',
  
  // Health & Fitness
  'fitness',
  'medical',
  'heart',
  'pulse',
  
  // Entertainment
  'game-controller',
  'musical-notes',
  'headset',
  'film',
  'tv',
  
  // Education
  'school',
  'book',
  'library',
  'pencil',
  
  // Shopping
  'shirt',
  'gift',
  'diamond',
  'watch',
  
  // Utilities
  'water',
  'flash',
  'leaf',
  'bulb',
  
  // Personal care
  'flask',
  'brush',
  'cut',
  
  // Pets
  'paw',
  
  // Other
  'briefcase',
  'construct',
  'hammer',
  'build',
];

/**
 * Available colors for budget categories
 */
export const availableColors = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#84CC16', // Lime
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A78BFA', // Purple Light
  '#EC4899', // Pink
  '#F43F5E', // Rose
];

/**
 * Budget category templates for quick setup
 */
export const budgetTemplates = {
  essentials: [
    { name: 'Rent', icon: 'home', color: '#EF4444', budget: 1500 },
    { name: 'Utilities', icon: 'flash', color: '#F59E0B', budget: 200 },
    { name: 'Groceries', icon: 'cart', color: '#10B981', budget: 500 },
    { name: 'Transportation', icon: 'car', color: '#3B82F6', budget: 300 },
  ],
  lifestyle: [
    { name: 'Dining Out', icon: 'restaurant', color: '#F97316', budget: 300 },
    { name: 'Entertainment', icon: 'game-controller', color: '#8B5CF6', budget: 200 },
    { name: 'Shopping', icon: 'bag', color: '#EC4899', budget: 250 },
    { name: 'Fitness', icon: 'fitness', color: '#84CC16', budget: 100 },
  ],
  financial: [
    { name: 'Savings', icon: 'trending-up', color: '#10B981', budget: 500 },
    { name: 'Investments', icon: 'briefcase', color: '#3B82F6', budget: 300 },
    { name: 'Emergency Fund', icon: 'shield', color: '#EF4444', budget: 200 },
    { name: 'Debt Payment', icon: 'card', color: '#F59E0B', budget: 400 },
  ],
};

/**
 * Currency symbols and formats
 */
export const currencyConfig = {
  symbol: '$',
  locale: 'en-US',
  format: (amount: number) => `$${amount.toFixed(2)}`,
  formatShort: (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  },
};

/**
 * Chart colors for visualizations
 */
export const chartColors = {
  spent: '#EF4444',
  remaining: '#10B981',
  budget: '#3B82F6',
  warning: '#F59E0B',
  danger: '#DC2626',
};

/**
 * Budget thresholds for warnings
 */
export const budgetThresholds = {
  warning: 0.75, // 75% spent
  danger: 0.9,   // 90% spent
  exceeded: 1.0, // 100% spent
};