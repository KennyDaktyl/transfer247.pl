export type HomeContent = {
  eyebrow_pl: string;
  eyebrow_en: string;
  eyebrow_de: string;
  headline_pl: string;
  headline_en: string;
  headline_de: string;
  headline_highlight_pl: string;
  headline_highlight_en: string;
  headline_highlight_de: string;
  lead_pl: string;
  lead_en: string;
  lead_de: string;
  footnote_pl: string;
  footnote_en: string;
  footnote_de: string;
  about_pl: string;
  about_en: string;
  about_de: string;
};

/** A price line tied to a real vehicle from the fleet — however many a
 * route/tour has is however many the admin actually priced it for. */
export type VehiclePrice = {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_seats: number;
  vehicle_cover_image: string | null;
  price: string;
  price_eur: string | null;
};

export type FixedRoutePhoto = {
  image: string;
  thumbnail: string;
  caption: string;
  order: number;
};

export type FixedRouteCategory = "LOTNISKO" | "DWORZEC_PKP";

export type FixedRoute = {
  slug: string;
  category: FixedRouteCategory;
  name_pl: string;
  name_en: string;
  name_de: string;
  h1_pl: string;
  h1_en: string;
  h1_de: string;
  duration: string;
  vehicle_prices: VehiclePrice[];
  price_from: string | null;
  price_from_eur: string | null;
  body_pl: string;
  body_en: string;
  body_de: string;
  seo_title_pl: string;
  seo_title_en: string;
  seo_title_de: string;
  seo_description_pl: string;
  seo_description_en: string;
  seo_description_de: string;
  photos: FixedRoutePhoto[];
  order: number;
};

export type TourPhoto = {
  image: string;
  thumbnail: string;
  caption: string;
  order: number;
};

export type Tour = {
  slug: string;
  title_pl: string;
  title_en: string;
  title_de: string;
  h1_pl: string;
  h1_en: string;
  h1_de: string;
  summary_pl: string;
  summary_en: string;
  summary_de: string;
  body_pl: string;
  body_en: string;
  body_de: string;
  duration: string;
  vehicle_prices: VehiclePrice[];
  price_from: string | null;
  price_from_eur: string | null;
  cover_image: string | null;
  seo_title_pl: string;
  seo_title_en: string;
  seo_title_de: string;
  seo_description_pl: string;
  seo_description_en: string;
  seo_description_de: string;
  photos: TourPhoto[];
  order: number;
};

export type ContentPage = {
  slug: string;
  page_type: string;
  title_pl: string;
  title_en: string;
  body_pl: string;
  body_en: string;
  seo_title_pl: string;
  seo_title_en: string;
  seo_description_pl: string;
  seo_description_en: string;
};

export type VehiclePhoto = {
  image: string;
  thumbnail: string;
  caption: string;
  order: number;
};

/** The real operational fleet (apps.fleet.Vehicle) — single source of truth
 * for both brands' public fleet pages, shared with driver assignment. */
export type Vehicle = {
  id: number;
  name: string;
  model: string;
  seats: number;
  description_pl: string;
  description_en: string;
  description_de: string;
  cover_photo: string | null;
  photos: VehiclePhoto[];
};

export type BlogPost = {
  slug: string;
  tag_pl: string;
  tag_en: string;
  tag_de: string;
  title_pl: string;
  title_en: string;
  title_de: string;
  excerpt_pl: string;
  excerpt_en: string;
  excerpt_de: string;
  body_pl: string;
  body_en: string;
  body_de: string;
  cover_image: string | null;
  seo_title_pl: string;
  seo_title_en: string;
  seo_title_de: string;
  seo_description_pl: string;
  seo_description_en: string;
  seo_description_de: string;
  published_at: string;
};

export type Customer = {
  id: number;
  phone: string;
  name: string;
  created_at: string;
};

export type BookingStatus =
  | "NOWA"
  | "POTWIERDZONA"
  | "OPLACONA"
  | "KIEROWCA_W_DRODZE"
  | "W_TRAKCIE"
  | "ZAKONCZONA"
  | "ANULOWANA";

export type Booking = {
  id: number;
  pickup_address: string;
  pickup_lat: string | null;
  pickup_lng: string | null;
  dropoff_address: string;
  dropoff_lat: string | null;
  dropoff_lng: string | null;
  scheduled_at: string;
  status: BookingStatus;
  distance_km: string | null;
  duration_minutes: number | null;
  is_reserved: boolean;
  price: string | null;
  coupon_code: string | null;
  driver_name: string | null;
  driver_vehicle: string | null;
  created_at: string;
  confirmed_at: string | null;
  payment_deadline: string | null;
  deposit_amount: string | null;
  paid_at: string | null;
  remainder_paid_at: string | null;
  remaining_amount: string | null;
  booked_vehicle_id: number | null;
  booked_vehicle_name: string | null;
};

/** Distance/duration/route-line preview for the booking form's map — reuses
 * the shared backend's /api/route-estimate/ endpoint (built for
 * dowieziemycie.pl's map-based flow); the catalog flow only needs the
 * distance/duration/geometry fields, not the tier-based price it also
 * returns. */
export type RouteEstimate = {
  distance_km: number;
  duration_min: number;
  geometry: [number, number][];
};

export type DriverLiveStatus = {
  id: number;
  name: string;
  status: "OFFLINE" | "DOSTEPNY" | "JADACY_PO_KLIENTA" | "W_KURSIE" | "WRACA_DO_BAZY";
  current_lat: string | null;
  current_lng: string | null;
  location_updated_at: string | null;
  vehicle_name: string | null;
  vehicle_plate: string | null;
};
