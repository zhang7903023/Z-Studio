export type Category = {
  id: string;
  name: string;
  slug: string;
  parentSlug: string | null;
  sortOrder: number;
  description: string;
  featured: boolean;
};

export type Product = {
  id: string;
  sku: string;
  title: string;
  slug: string;
  mainCategory: string;
  subcategory: string;
  categorySlug: string;
  priceCny: number | null;
  priceText: string | null;
  deliveryTime: string;
  stockStatus: string;
  description: string;
  afterSales: string;
  riskNote: string;
  sourceSheet: string;
  sourceRow: number | null;
  rowType: string;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  contactMethod: string;
  contactValue: string;
  telegram?: string;
  whatsapp?: string;
  createdAt: string;
};

export type OrderStatus =
  | "pending_payment"
  | "pending_review"
  | "processing"
  | "delivered"
  | "after_sales"
  | "cancelled";

export type Order = {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  contactMethod: string;
  contactValue: string;
  productId: string;
  productTitle: string;
  quantity: number;
  totalPriceCny: number | null;
  requirements: string;
  paymentMethod: string;
  paymentScreenshotUrl: string;
  status: OrderStatus;
  adminNote: string;
  deliveryContent: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  orderId: string;
  orderNo: string;
  method: string;
  amount: number | null;
  screenshotUrl: string;
  status: string;
  createdAt: string;
};

export type CatalogBundle = {
  categories: Category[];
  products: Product[];
};

export type RuntimeDb = {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
};
