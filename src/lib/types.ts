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

export type FixedRoute = {
  slug: string;
  name_pl: string;
  name_en: string;
  name_de: string;
  duration: string;
  price_from: string;
  price_large_vehicle: string | null;
  body_pl: string;
  body_en: string;
  body_de: string;
  seo_title_pl: string;
  seo_title_en: string;
  seo_title_de: string;
  seo_description_pl: string;
  seo_description_en: string;
  seo_description_de: string;
  order: number;
};

export type TourPhoto = {
  image: string;
  caption: string;
  order: number;
};

export type Tour = {
  slug: string;
  title_pl: string;
  title_en: string;
  title_de: string;
  summary_pl: string;
  summary_en: string;
  summary_de: string;
  body_pl: string;
  body_en: string;
  body_de: string;
  duration: string;
  price_from: string;
  price_large_vehicle: string | null;
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
