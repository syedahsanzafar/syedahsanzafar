export interface Item {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  targetSale: number;
}

export interface Customer {
  id: string;
  name: string;
  creditBalance: number;
  phone?: string;
}

export interface Discount {
  customerId: string;
  itemId: string;
  discountPercentage: number;
}

export interface CartItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  itemName: string;
}

export interface Sale {
  id: string;
  customerId: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
}

export interface Purchase {
    id: string;
    itemId: string;
    quantity: number;
    date: string;
}

export interface Payment {
    id: string;
    customerId: string;
    amount: number;
    date: string;
}

export enum View {
  POS = 'POS',
  Reports = 'Reports',
  Stock = 'Stock',
  Manage = 'Manage',
  Purchase = 'Purchase',
}