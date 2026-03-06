import api from "./api";
import type {
  CreateManagedUserRequest,
  CreateManagedUserResponse,
  DeliveryChargeDeleteResponse,
  DeliveryChargeRule,
  DeliveryChargeUpsertRequest,
  LoginRequest,
  LoginResponse,
  ManagedUser,
  OfferCreateRequest,
  Order,
  OrderStatus,
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  SignupRequest,
  SignupResponse,
  SuperAdmin,
} from "@/types/superadmin";

const BASE = "/super-admin/auth";

export const superAdminApi = {
  // Auth
  signup: (payload: SignupRequest) =>
    api.post<SignupResponse>(`${BASE}/signup`, payload).then((r) => r.data),

  login: (payload: LoginRequest) =>
    api.post<LoginResponse>(`${BASE}/login`, payload).then((r) => r.data),

  me: () => api.get<SuperAdmin>(`${BASE}/me`).then((r) => r.data),

  // Registry
  listStorekeepers: () =>
    api.get<ManagedUser[]>(`${BASE}/storekeepers`).then((r) => r.data),

  getStorekeeper: (userId: string) =>
    api.get<ManagedUser>(`${BASE}/storekeepers/${userId}`).then((r) => r.data),

  listDeliveryBoys: () =>
    api.get<ManagedUser[]>(`${BASE}/delivery-boys`).then((r) => r.data),

  getDeliveryBoy: (userId: string) =>
    api.get<ManagedUser>(`${BASE}/delivery-boys/${userId}`).then((r) => r.data),

  // Create managed users
  createStorekeeper: (payload: CreateManagedUserRequest) =>
    api
      .post<CreateManagedUserResponse>(`${BASE}/create-storekeeper`, payload)
      .then((r) => r.data),

  createDeliveryBoy: (payload: CreateManagedUserRequest) =>
    api
      .post<CreateManagedUserResponse>(`${BASE}/create-delivery-boy`, payload)
      .then((r) => r.data),

  // Storekeeper workspace - Products
  listProducts: (storeId: string) =>
    api
      .get<Product[]>(`${BASE}/storekeepers/${storeId}/products`)
      .then((r) => r.data),

  createProduct: (storeId: string, payload: ProductCreateRequest) =>
    api
      .post<Product>(`${BASE}/storekeepers/${storeId}/products`, payload)
      .then((r) => r.data),

  getProduct: (storeId: string, id: string) =>
    api
      .get<Product>(`${BASE}/storekeepers/${storeId}/products/${id}`)
      .then((r) => r.data),

  updateProduct: (storeId: string, id: string, payload: ProductUpdateRequest) =>
    api
      .put<Product>(`${BASE}/storekeepers/${storeId}/products/${id}`, payload)
      .then((r) => r.data),

  deleteProduct: (storeId: string, id: string) =>
    api
      .delete<{ message: string }>(`${BASE}/storekeepers/${storeId}/products/${id}`)
      .then((r) => r.data),

  addOffer: (storeId: string, productId: string, payload: OfferCreateRequest) =>
    api
      .post<Product>(`${BASE}/storekeepers/${storeId}/products/${productId}/offer`, payload)
      .then((r) => r.data),

  deleteOffer: (storeId: string, productId: string) =>
    api
      .delete<Product>(`${BASE}/storekeepers/${storeId}/products/${productId}/offer`)
      .then((r) => r.data),

  patchStock: (storeId: string, productId: string, quantity: number) =>
    api
      .patch<Product>(`${BASE}/storekeepers/${storeId}/products/${productId}/stock`, {
        quantity,
      })
      .then((r) => r.data),

  // Storekeeper workspace - Orders
  listOrders: (storeId: string, status?: OrderStatus) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return api
      .get<Order[]>(`${BASE}/storekeepers/${storeId}/orders${qs}`)
      .then((r) => r.data);
  },

  getOrder: (storeId: string, id: string) =>
    api
      .get<Order>(`${BASE}/storekeepers/${storeId}/orders/${id}`)
      .then((r) => r.data),

  markReady: (storeId: string, id: string) =>
    api
      .post<Order>(`${BASE}/storekeepers/${storeId}/orders/${id}/ready`)
      .then((r) => r.data),

  availableDeliveryPlaceholder: (storeId: string, id: string) =>
    api
      .get<{
        orderId: string;
        availableDeliveryBoys: unknown[];
        message: string;
      }>(`${BASE}/storekeepers/${storeId}/orders/${id}/available-delivery`)
      .then((r) => r.data),

  // Delivery partner workspace
  listDeliveryOrders: (deliveryBoyId: string, params?: { mine?: boolean; status?: OrderStatus }) => {
    const query = new URLSearchParams();
    if (params?.mine) query.set("mine", "true");
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();

    return api
      .get<Order[]>(`${BASE}/delivery-boys/${deliveryBoyId}/orders${qs ? `?${qs}` : ""}`)
      .then((r) => r.data);
  },

  myDeliveryOrders: (deliveryBoyId: string) =>
    api
      .get<Order[]>(`${BASE}/delivery-boys/${deliveryBoyId}/orders/me`)
      .then((r) => r.data),

  getDeliveryOrder: (deliveryBoyId: string, id: string) =>
    api
      .get<Order>(`${BASE}/delivery-boys/${deliveryBoyId}/orders/${id}`)
      .then((r) => r.data),

  acceptOrder: (deliveryBoyId: string, id: string) =>
    api
      .post<Order>(`${BASE}/delivery-boys/${deliveryBoyId}/orders/${id}/accept`)
      .then((r) => r.data),

  pickupOrder: (deliveryBoyId: string, id: string) =>
    api
      .post<Order>(`${BASE}/delivery-boys/${deliveryBoyId}/orders/${id}/pickup`)
      .then((r) => r.data),

  deliverOrder: (deliveryBoyId: string, id: string) =>
    api
      .post<Order>(`${BASE}/delivery-boys/${deliveryBoyId}/orders/${id}/deliver`)
      .then((r) => r.data),

  failOrder: (deliveryBoyId: string, id: string) =>
    api
      .post<Order>(`${BASE}/delivery-boys/${deliveryBoyId}/orders/${id}/fail`)
      .then((r) => r.data),

  // Delivery charges (pincode)
  listDeliveryCharges: () =>
    api.get<DeliveryChargeRule[]>(`${BASE}/delivery-charges`).then((r) => r.data),

  upsertDeliveryCharge: (pincode: string, charge: number) =>
    api
      .put<DeliveryChargeRule>(`${BASE}/delivery-charges/${encodeURIComponent(pincode)}`,
        { charge } satisfies DeliveryChargeUpsertRequest)
      .then((r) => r.data),

  deleteDeliveryCharge: (pincode: string) =>
    api
      .delete<DeliveryChargeDeleteResponse>(`${BASE}/delivery-charges/${encodeURIComponent(pincode)}`)
      .then((r) => r.data),
};
