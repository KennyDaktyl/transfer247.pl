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
};

/** A price line tied to a real vehicle from the fleet — however many a
 * route/tour has is however many the admin actually priced it for. */
export type VehiclePrice = {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_seats: number;
  price: string;
  price_eur: string | null;
};

export type FixedRoutePhoto = {
  image: string;
  thumbnail: string;
  caption: string;
  order: number;
};

export type FixedRoute = {
  slug: string;
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
