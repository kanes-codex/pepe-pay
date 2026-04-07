export type Item = {
  id: number;
  name: string;
  price: number;
};

interface Reminder {
  id: number;
  amount: number;
  to: {
    id: number;
    name: string;
  };
  createdAt: string;
}