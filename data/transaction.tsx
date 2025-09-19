export type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  logo?: any;
};

export const transactions: Transaction[] = [
  {
    id: "1",
    title: "NETFLIX.COM,SINGAPORE",
    subtitle: "SOURCE: COMMERCE(-$2.00), BOA(-$1.99)",
    amount: -3.99,
    date: "Today",
    logo: require("@/assets/images/netflix_logo.png"),
  },
  {
    id: "2",
    title: "ACH Deposit DIR DEP STATE OF KANSAS",
    subtitle: "",
    amount: 679.17,
    date: "Today",
  },
  {
    id: "3",
    title: "GOOGLE *YouTubePremium",
    subtitle: "SOURCE: COMMERCE(-$1.1), BOA(-$1.09)",
    amount: -2.19,
    date: "Today",
    logo: require("@/assets/images/youtube_premium_logo.png"),
  },
  {
    id: "4",
    title: "NETFLIX.COM,SINGAPORE",
    subtitle: "SOURCE: COMMERCE(-$2.00), BOA(-$1.99)",
    amount: -3.99,
    date: "October 4, 2025",
    logo: require("@/assets/images/netflix_logo.png"),
  },
  {
    id: "5",
    title: "ACH Deposit DIR DEP STATE OF KANSAS",
    subtitle: "",
    amount: 679.17,
    date: "October 4, 2025",
  },
];
