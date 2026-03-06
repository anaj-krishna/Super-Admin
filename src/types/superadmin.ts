// This file contains TypeScript type definitions for the Super Admin dashboard application.
export type ManagedRole = "ADMIN" | "DELIVERY";
export type AccountStatus = "PENDING" | "ACTIVE" | "REJECTED";

export type DiscountType = "PERCENTAGE" | "FLAT";

export type OrderStatus =
  | "PLACED"
  | "READY"
  | "ACCEPTED"
  | "PICKED_UP"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED"
  | "REJECTED";

export type SuperAdmin = {
  _id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN";
  location: string;
  mobileNumber?: string;
  state?: string;
  district?: string;
  taluk?: string;
  localBodyType?: string;
  localBodyName?: string;
  ward?: string;
  addressLine1?: string;
  pincode?: string;
  storekeepers: string[];
  deliveryBoys: string[];
  createdAt: string;
  updatedAt: string;
};

export type ManagedUser = {
  _id: string;
  name: string;
  email: string;
  role: ManagedRole;
  address: string;
  address2?: string;
  mobileNumber?: string;
  serviceablePincodes: string[];
  status: AccountStatus;
  isVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Offer = {
  type: DiscountType;
  value: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
};

export type Product = {
  _id: string;
  storeId: string;
  name: string;
  description?: string;
  images?: string[];
  quantity: number;
  price: string;
  category?: string;
  offers: Offer[];
  createdAt: string;
  updatedAt: string;
};

export type ProductCreateRequest = {
  name: string;
  description?: string;
  images?: string[];
  quantity: number;
  price: string;
  category?: string;
};

export type ProductUpdateRequest = Partial<ProductCreateRequest>;

export type OfferCreateRequest = {
  type: DiscountType;
  value: number;
  startDate?: string;
  endDate?: string;
};

export type StockPatchRequest = { quantity: number };

export type DeliveryAddress = {
  street: string;
  city: string;
  zipCode: string;
  phone: string;
  notes?: string;
};

export type OrderItem = {
  productId: Product | string;
  quantity: number;
  price: number;
};

export type Order = {
  _id: string;
  checkoutId: string;
  status: OrderStatus;
  items: OrderItem[];
  /**
   * Delivery charge values are provided by the backend (do not compute client-side).
   * These fields are optional because older orders/backends may not include them.
   */
  deliveryCharge?: number;
  deliveryChargePincode?: string;
  itemsTotal?: number;
  totalAmount: number;
  pickupAddress: string;
  deliveryAddress: DeliveryAddress;
  userId:
    | { _id: string; name: string; email?: string; phone?: string }
    | string;
  storeId:
    | { _id: string; name?: string; address?: string; phone?: string }
    | string;
  deliveryBoyId:
    | { _id: string; name?: string; phone?: string }
    | string
    | null;
  createdAt: string;
  updatedAt: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  password: string;
  location?: string;
  mobileNumber?: string;
  state?: string;
  district?: string;
  taluk?: string;
  localBodyType?: string;
  localBodyName?: string;
  ward?: string;
  addressLine1?: string;
  pincode?: string;
};

export type SignupResponse = {
  id: string;
  email: string;
  role: "SUPER_ADMIN";
  message: string;
};

export type LoginRequest = { email: string; password: string };

export type LoginResponse = {
  id: string;
  email: string;
  role: "SUPER_ADMIN";
  token: string;
  message: string;
};

export type CreateManagedUserRequest = {
  name: string;
  email: string;
  address: string;
  serviceablePincodes: string[];
  password: string;
  mobileNumber?: string;
  address2?: string;
};

export type CreateManagedUserResponse = {
  id: string;
  email: string;
  role: ManagedRole;
  status: AccountStatus;
  message: string;
};

export type DeliveryChargeRule = {
  _id: string;
  pincode: string;
  charge: number;
  createdAt?: string;
  updatedAt?: string;
};

export type DeliveryChargeUpsertRequest = { charge: number };

export type DeliveryChargeDeleteResponse = { deletedCount: number };
