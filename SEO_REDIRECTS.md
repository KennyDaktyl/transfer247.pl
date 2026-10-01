# Mapa przekierowań — transfer247.pl

Stan po gałęzi `seo/technical-fixes` (2026-10). Wszystkie przekierowania są
stałe: **301** (nginx) lub **308** (Next.js — Google traktuje 308 tak samo jak
301). Każdy stary adres trafia do celu **jednym skokiem** (wyjątek: wariant z
końcowym `/` — patrz niżej).

Kanoniczna postać adresu: `https://transfer247.pl/{pl|en|de}/…`, bez `www`,
bez końcowego `/`.

## Reguły ogólne

| Stary adres | Nowy adres | Kod | Gdzie |
|---|---|---|---|
| `http://transfer247.pl/*` | `https://transfer247.pl/*` | 301 | nginx |
| `http(s)://www.transfer247.pl/*` | `https://transfer247.pl/*` | 301 | nginx |
| `/` | `/pl` | 308 | `src/proxy.ts` |
| `/{ścieżka}` (bez prefiksu języka) | `/pl/{ścieżka}` | 308 | `src/proxy.ts` |
| `/{lang}/transfery/{slug-trasy-lotniskowej}` | `/{lang}/transfery-lotniskowe/{slug}` | 308 | `src/proxy.ts` |
| `/{lang}/transfery-lotniskowe/{slug-trasy-nielotniskowej}` | `/{lang}/transfery/{slug}` | 308 | `src/proxy.ts` |
| `/{…}/` (końcowy ukośnik) | `/{…}` | 308 | Next.js (wbudowane) |

Brak prefiksu języka i zła sekcja trasy są rozwiązywane razem (np.
`/transfery/balice-krakow` → `/pl/transfery-lotniskowe/balice-krakow`
bezpośrednio, a nie przez `/pl/transfery/balice-krakow`). Proxy bierze
przypisanie slug → sekcja z `/api/fixed-routes/` (cache 60 s), więc nowa trasa
dodana w Django Admin działa bez zmian w kodzie.

Wybór języka **nie** zależy od `Accept-Language` ani IP
(`localeDetection: false`) — Googlebot widzi każdą wersję pod jej własnym
adresem.

Nieistniejące adresy zwracają prawdziwy **404** (także pod nieznanym slugiem
trasy, wycieczki lub wpisu).

## Trasy (stan na 2026-10-01)

Trasy lotniskowe (`category = LOTNISKO`) → `/transfery-lotniskowe/{slug}`:

| Stary adres (dla `pl`, `en`, `de`) | Nowy adres |
|---|---|
| `/{lang}/transfery/balice-krakow` | `/{lang}/transfery-lotniskowe/balice-krakow` |
| `/{lang}/transfery/katowice-krakow` | `/{lang}/transfery-lotniskowe/katowice-krakow` |
| `/{lang}/transfery/balice-zakopane` | `/{lang}/transfery-lotniskowe/balice-zakopane` |
| `/{lang}/transfery/balice-katowice` | `/{lang}/transfery-lotniskowe/balice-katowice` |
| `/{lang}/transfery/transfer-na-lotnisko-balice` | `/{lang}/transfery-lotniskowe/transfer-na-lotnisko-balice` |

Pozostałe trasy (`category = TRANSFER`) → `/transfery/{slug}`:

| Stary adres (dla `pl`, `en`, `de`) | Nowy adres |
|---|---|
| `/{lang}/transfery-lotniskowe/dworzec-balice` | `/{lang}/transfery/dworzec-balice` |
| `/{lang}/transfery-lotniskowe/krakow-energylandia` | `/{lang}/transfery/krakow-energylandia` |
| `/{lang}/transfery-lotniskowe/krakow-zakopane` | `/{lang}/transfery/krakow-zakopane` |

`/{lang}/transfery-lotniskowe` (bez sluga) to osobna strona kategorii
(lista tras lotniskowych) — nie jest przekierowywana.

## Adresy zgłoszone w Google Search Console

| Stary adres | Cel |
|---|---|
| `/` | `/pl` |
| `/transfery` | `/pl/transfery` |
| `/transfery/dworzec-balice` | `/pl/transfery/dworzec-balice` |
| `/transfery/balice-krakow` | `/pl/transfery-lotniskowe/balice-krakow` |
| `/transfery-lotniskowe/balice-krakow` | `/pl/transfery-lotniskowe/balice-krakow` |
| `/wycieczki` | `/pl/wycieczki` |
| `/wycieczki/{slug}` | `/pl/wycieczki/{slug}` |
| `/flota` | `/pl/flota` |
| `/blog` | `/pl/blog` |
| `/logowanie` | `/pl/logowanie` (noindex) |
| `/pl/transfery/katowice-krakow` | `/pl/transfery-lotniskowe/katowice-krakow` |
| `/pl/transfery/balice-krakow` | `/pl/transfery-lotniskowe/balice-krakow` |
| `/pl/transfery/balice-zakopane` | `/pl/transfery-lotniskowe/balice-zakopane` |
| `/en/transfery/…`, `/de/transfery/…` (te same slugi) | `/en/…`, `/de/transfery-lotniskowe/…` |

## Strony bez przekierowania, ale wyłączone z indeksu

`noindex, follow` (nie są blokowane w robots.txt, żeby Google zobaczył tag):

- `/{lang}/logowanie`, `/{lang}/panel`, `/{lang}/panel/kurs/{id}`, `/{lang}/sledz`
- `/{lang}/blog?q=…` (wyniki wyszukiwania)
- wersje EN/DE treści bez tłumaczenia (strona pokazuje wtedy polski tekst) —
  automatycznie, gdy pole `body_en`/`body_de` (i tytuł) w CMS jest puste. Po
  uzupełnieniu tłumaczenia strona sama wraca do indeksu, sitemap i hreflang.
- `/pay/{token}` — `noindex` i `Disallow` w robots.txt (link z SMS z tokenem)

Parametry UTM i inne parametry zapytania nie są przekierowywane — każda
strona ma `<link rel="canonical">` bez parametrów.

## Czego tu nie ma (świadomie)

- **Przetłumaczone slugi EN/DE** (np. `/en/tours/…`, `/de/blog/flughafen-…`) —
  wymagają pól `slug_en`/`slug_de` w modelach Django i przebudowy routingu w obu
  repozytoriach. Po ich wprowadzeniu trzeba dopisać tu mapę stary → nowy.
- **`/pl/blog/closest-airport-to-auschwitz` → polski slug** — slug jest jeden dla
  wszystkich języków, więc zmiana przeniosłaby też wersje EN/DE. Ten sam
  powód co wyżej.
