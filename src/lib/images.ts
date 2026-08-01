import { publicApiBaseUrl } from "./api";

/** Django ImageField URLs from the API are relative — prefix with the
 * backend's public base URL so <img>/lightbox can load them directly. */
export function absoluteImageUrl(path: string): string {
  return path.startsWith("http") ? path : `${publicApiBaseUrl()}${path}`;
}
