const API_URL = 'https://functions.poehali.dev/c23681a8-18e1-4ae9-9923-084e38190a88';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export interface Product { id: number; name: string; product_code: string; unit: string; danger_class: string; un_number: string; }
export interface Driver { id: number; full_name: string; license_number: string; phone: string; is_active: boolean; }
export interface Worker { id: number; full_name: string; position: string; is_active: boolean; }
export interface Responsible { id: number; full_name: string; position: string; is_active: boolean; }
export interface Vehicle { id: number; reg_number: string; brand: string; vehicle_type: string; is_active: boolean; }
export interface Trailer { id: number; reg_number: string; brand: string; capacity_liters: number | null; is_active: boolean; }
export interface Certificate { id: number; cert_number: string; cert_type: string; issued_by: string; issued_date: string; expires_date: string; notes: string; is_active: boolean; product_name: string; product_id: number; }

export interface Shipment {
  id: number;
  shipment_number: string;
  shipment_date: string;
  quantity: number;
  status: string;
  product_name: string;
  unit: string;
  vehicle_reg: string;
  trailer_reg: string;
  driver_name: string;
  worker_name: string;
  responsible_name: string;
  sender_org: string;
  receiver_org: string;
}

export interface ShipmentDetail extends Shipment {
  product_id: number;
  vehicle_id: number;
  trailer_id: number;
  driver_id: number;
  worker_id: number;
  responsible_id: number;
  certificate_id: number;
  loading_point: string;
  unloading_point: string;
  cargo_description: string;
  special_conditions: string;
  notes: string;
  danger_class: string;
  un_number: string;
  vehicle_brand: string;
  trailer_brand: string;
  license_number: string;
  cert_number: string;
  cert_type: string;
}

export interface Stats {
  by_product: { product: string; total_quantity: number; count: number; unit: string }[];
  by_date: { date: string; product: string; quantity: number }[];
  total_shipments: number;
}
