// Split data types
export type SplitPerson = {
  name?: string;        // Person's name (optional)
  amount: number;
  isPaid: boolean;
};

export type SplitData = {
  code: string;
  numberOfPeople: number;
  splits: SplitPerson[];
};

// Main transaction type
export type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  logo?: any;
  icon?: string;
  splitData?: SplitData;
};

// Transaction data
export const transactions: Transaction[] = [
  // Transaction 1: Netflix WITH split (2 out of 3 received)
  {
    id: "1",
    title: "NETFLIX.COM,SINGAPORE",
    subtitle: "SOURCE: COMMERCE(-$2.00), BOA(-$1.99)",
    amount: -3.99,
    date: "2025-09-29",
    logo: require("@/assets/images/netflix_logo.png"),
    splitData: {
      code: "AB3XY9",
      numberOfPeople: 3,
      splits: [
        { name: "Andrew Garfield", amount: 1.33, isPaid: true },
        { name: "Tobey Maguire", amount: 1.33, isPaid: true },
        { name: "Tom Holland", amount: 1.33, isPaid: false },
      ],
    },
  },
  // Transaction 2: Income (cannot be split)
  {
    id: "2",
    title: "ACH Deposit DIR DEP STATE OF KANSAS",
    subtitle: "",
    amount: 679.17,
    date: "2025-09-29",
  },
  // Transaction 3: YouTube Premium WITHOUT split
  {
    id: "3",
    title: "GOOGLE *YouTubePremium",
    subtitle: "SOURCE: COMMERCE(-$1.1), BOA(-$1.09)",
    amount: -2.19,
    date: "2025-08-05",
    logo: require("@/assets/images/youtube_premium_logo.png"),
  },
  // Transaction 4: Netflix WITHOUT split
  {
    id: "4",
    title: "NETFLIX.COM,SINGAPORE",
    subtitle: "SOURCE: COMMERCE(-$2.00), BOA(-$1.99)",
    amount: -3.99,
    date: "2025-09-18",
    logo: require("@/assets/images/netflix_logo.png"),
  },
  // Transaction 5: Income (cannot be split)
  {
    id: "5",
    title: "ACH Deposit DIR DEP STATE OF KANSAS",
    subtitle: "",
    amount: 679.17,
    date: "2025-09-15",
  },
];