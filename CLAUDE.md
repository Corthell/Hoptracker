# HopTracker — kontekst projektu

Animowana wizualizacja webowa pokazująca, jak żądanie użytkownika wędruje przez
internet do wybranego adresu (np. `google.com`). Aplikacja wykonuje **prawdziwy
traceroute**, geolokalizuje kolejne serwery pośrednie i rysuje trasę na ciemnej
mapie świata — hop po hopie, animowaną świecącą linią po łukach wielkiego koła.
Cel: efektowna, przyjazna wizualizacja (nie narzędzie do analizy sieciowej).

## Stack i uruchomienie

- **Backend**: Node.js ≥ 18, czysty `http` (zero zależności npm, brak `npm install`).
- **Frontend**: vanilla JS + Leaflet 1.9.4 (z CDN), bez build-stepu.
- **Platforma**: tylko **Windows** — backend woła systemowe `tracert` i `ping`
  (`package.json` ma `"os": ["win32"]`).
- **Start**: `npm start` (albo `node server.js`) → http://localhost:3000
- Serwer nasłuchuje domyślnie na `127.0.0.1` (zmienna `HOST` nadpisuje; `PORT` też).
- Podczas developmentu serwer trzeba restartować po zmianach w `server.js`; pliki
  z `public/` są serwowane z dysku z `Cache-Control: no-cache`, więc wystarczy
  odświeżyć przeglądarkę (restart niepotrzebny).

## Struktura plików

- `server.js` — HTTP server: statyki + 3 endpointy API (opis niżej).
- `public/index.html` — layout: nagłówek (logo SVG, wordmark, input, licznik), mapa, panel boczny, legenda.
- `public/app.js` — cała logika frontu (mapa, geometria łuków, animacja, dźwięk, menu kontekstowe, licznik).
- `public/style.css` — ciemny motyw, zmienne CSS w `:root`.
- `data/visits.json` — trwały licznik odwiedzin (tworzony automatycznie; `{ "count": N }`).
- `README.md` — opis dla użytkownika (po polsku).

## API (backend)

Wszystkie komunikaty do użytkownika są po angielsku.

- **`GET /api/trace?host=<adres>`** — Server-Sent Events (SSE). Sanityzuje host,
  robi DNS lookup, uruchamia `tracert -d -4 -w 600 -h 30`, parsuje wyjście na żywo,
  geolokalizuje publiczne IP (ip-api.com po HTTP) i streamuje zdarzenia:
  - `status` `{message}` — komunikaty postępu
  - `origin` `{geo}` — lokalizacja publicznego IP użytkownika (punkt startu)
  - `resolved` `{host, ip}` — wynik DNS
  - `probing` `{hop}` — tracert właśnie sonduje dany przeskok (UI nigdy nie stoi w ciszy)
  - `hop` `{hop, ip, rtt, kind, geo, isTarget}` lub `{hop, timeout:true}`
  - `target` `{ip, geo}` — gdy trasa nie potwierdziła celu, ale znamy jego geolokalizację (dorysowanie na mapie)
  - `done` `{reached, hops, code, earlyStop, targetPingable}`
  - `error` `{message}`
- **`GET /api/ping?ip=<ip>`** — JSON. `ping -n 4`. Zwraca `{ip, sent, received, lostPct, times[], min, avg, max, jitter, ttl}`.
- **`GET|POST /api/visits`** — licznik odwiedzin. GET zwraca `{count}`, POST inkrementuje + zapisuje do `data/visits.json`.

Limity/zabezpieczenia: max 3 równoległe traceroute i 4 pingi, twarde timeouty
(120 s trace, 15 s ping), ścisła walidacja hosta/IP, procesy ubijane przy
rozłączeniu klienta. CSP + `X-Content-Type-Options: nosniff`, Leaflet z SRI.

## Kluczowe decyzje i „trudne” miejsca (żeby ich nie zepsuć)

1. **Ucinanie martwego ogona trasy** (`server.js`): dwa progi kolejnych niemych
   hopów. Cel **niepingowalny** → ucinamy po `EARLY_STOP_UNREACHABLE = 4`. Cel
   **pingowalny, ale blokuje traceroute** → dłuższy margines `EARLY_STOP_REACHABLE = 8`
   (bo np. google.com miewa ~6 niemych hopów w środku i NIE wolno go uciąć).
   O pingowalności celu decyduje równoległa sonda `probeReachable`. Ważne: nieme
   routery w środku trasy do żywego celu nigdy nie przerywają śledzenia.
2. **Długi łuk przez antymerydian** (`app.js`, `greatCircle` na obrocie Rodriguesa):
   gdy krótszy łuk przeciąłby krawędź mapy (Pacyfik), rysujemy DŁUŻSZY łuk tego
   samego wielkiego koła — sygnał z USA leci na wschód przez Atlantyk/Afrykę do
   Australii, przez środek widoku. `drawnPathKm` liczy realnie rysowaną długość.
   Punkty zostają w surowych współrzędnych [-180,180] (bez „unwrap” — usunięte).
3. **Mapa się nie powiela + dynamiczny zoom** (`app.js`): kafelki `noWrap`,
   `maxBounds`, `zoomSnap: 0` i `fitWorldToViewport()` dobierający minimalny zoom
   tak, by jedna kopia globu wypełniała szerokość okna (przeliczane przy `resize`).
4. **Animacja i przerwania** (`app.js`): globalny `traceId` rośnie przy każdym
   starcie/stopie — trwające animacje i zakolejkowane zadania rozpoznają po nim
   nieaktualną sesję i kończą się natychmiast (bez tego był deadlock kolejki).
   Kolejka `runQueue` ma `try/finally`. Easing sześcienny (wolny start → szybko →
   wolne dolatywanie). Ruch mapy (`ensureVisible`) czeka na `moveend` PRZED
   rysowaniem segmentu — inaczej linia „wskakuje” przy zoomie.
5. **Dźwięk** (`app.js`, Web Audio, syntezowany — zero plików): szum lotu podążający
   za pakietem, blip na każdym hopie (ton rośnie w głąb trasy), akord na cel.
   Przełącznik 🔊/🔇 zapisywany w `localStorage`. Audio odblokowywane gestem
   (klik „Trace route”). Szanuje `prefers-reduced-motion`.
6. **Menu kontekstowe markera** (prawy klik): „Operator HQ on Google Maps” (szuka
   siedziby firmy po nazwie operatora + miasto/kraj), „This location on Google Maps”
   (współrzędne), „Ping” (wynik in-line). `normalizeLon` do linków (marker bywa
   w odwiniętej ramce).
7. **Nazwy państw** rysowane własnymi etykietami z GeoJSON (`addCountryLabels`),
   po **angielsku** (natywnie w danych). Widoczne tylko gdy kraj > `COUNTRY_LABEL_MIN_PX`.
   Nazwy miast pokazują się tylko przy markerach hopów. (Słownik PL usunięty.)
8. **XSS**: wszystkie dane z API geolokalizacji przechodzą przez `esc()` przed
   wstawieniem do HTML/tooltipów.

## Konwencje

- **Interfejs**: po angielsku (nazwa aplikacji: **HopTracker**).
- **Komentarze w kodzie**: po polsku (dokumentacja wewnętrzna) — zachować ten styl.
- **Rozmowy z użytkownikiem**: po polsku.
- Zewnętrzne zależności (przez CSP): Leaflet (unpkg), kafelki CARTO dark_nolabels,
  granice GeoJSON (jsdelivr: `johan/world.geo.json`), Google Fonts (Space Grotesk),
  geolokalizacja ip-api.com. Utrzymywać CSP w `server.js` zsynchronizowane z tym.

## Znane ograniczenia

- Geolokalizacja IP jest przybliżona; adresy dużych firm (Google, Microsoft) bywają
  zarejestrowane na siedzibę główną — hop z niskim RTT potrafi „wylądować” w USA.
- ip-api.com działa tylko po HTTP i ma limit 45 zapytań/min (wyniki są cache’owane
  w pamięci: TTL 24 h, max 500 wpisów, deduplikacja równoległych zapytań).
- Trasa bywa różna między uruchomieniami (routing w internecie jest dynamiczny).
- `data/visits.json` = prosty licznik plikowy; przy hostingu wieloinstancyjnym
  trzeba go zastąpić bazą (podmiana `loadVisits`/`persistVisits` w `server.js`).

## Możliwe dalsze kroki (jeśli padnie temat)

- Testy jednostkowe: `sanitizeHost`, `isPrivateIp`, parser `tracert`, geometria łuków.
- Wsparcie Linux/macOS (inny traceroute/ping) — obecnie tylko Windows.
- Self-hosting fontu Space Grotesk (zamiast Google Fonts) dla zera zewnętrznych zależności.
- Przejście na mapę wektorową (MapLibre GL) dla pełnej kontroli typografii.
