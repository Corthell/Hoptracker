'use strict';

// ── i18n (EN / PL) ───────────────────────────────────────────────────────────
// Cały interfejs i komunikaty mają dwie wersje językowe. `t(klucz, params)`
// zwraca tekst w bieżącym języku (fallback na EN), interpolując {placeholdery}.
// Statyczne napisy w HTML oznaczone są atrybutami data-i18n* i tłumaczone
// w applyLang(); teksty generowane dynamicznie wołają t() w chwili powstania.

const I18N = {
  en: {
    title: "HopTracker — your signal's journey across the world",
    input_placeholder: 'e.g. google.com or https://github.com',
    input_aria: 'Website address to trace',
    clear_aria: 'Clear field',
    sound_toggle_aria: 'Toggle sounds',
    sound_mute: 'Mute sounds',
    sound_enable: 'Enable sounds',
    lang_switch: 'Switch to Polish',
    visitors_title: 'Total visits',
    visitors_label: 'visitors',
    status_hint: 'Enter an address — or tap a yellow server on the map — and watch how your request travels the world.',
    map_aria: 'World map with the packet route',
    hops_title: 'Hops',
    sidebar_aria: 'Route hops list',
    legend_you: 'You',
    legend_hop: 'intermediate server',
    legend_target: 'target',
    trace_start: "Let's hop!",
    trace_stop: 'Stop',
    st_connecting: 'Connecting…',
    st_resolved: '{host} → {ip} · tracing route…',
    st_probing: 'Probing hop {hop}… (waiting for router response)',
    st_hop: 'Hop {hop} · {ip} · {loc}',
    st_stopped: 'Tracing stopped.',
    st_lost: 'Lost connection to the server.',
    st_done_early: '✅ Route reached the target (final segment from geolocation — the last routers stay hidden). {n} located hops{km}',
    st_done_partial: '⚠️ Partial route — target not confirmed (it may not respond to ping). {hops} hops, {located} located{km}',
    st_done_ok: '✅ Route complete — {hops} hops, {located} located{km}',
    km_suffix: ' · path on map ≈ {km} km',
    geo_unknown: 'unknown location',
    hop_private: 'local / ISP network (private address)',
    hop_no_response: 'no response (router stays hidden)',
    hop_routers_silent: 'routers {start}–{end} not responding ({count})',
    target_approx_loc: '{loc} — target position (approximate)',
    tip_start: '📍 Start (You)',
    tip_target: '🎯 Target · {ip}',
    tip_partial: 'partial route — position from IP geolocation',
    ctx_hq: '🏢 Operator HQ on Google Maps',
    ctx_loc: '📍 This location on Google Maps',
    ctx_ping: '📡 Ping — measure response time',
    ping_running: 'Pinging {ip} (4 packets)…',
    ping_no_response: 'No response — host may block ping (ICMP).',
    ping_failed: 'Ping failed.',
    ping_replies: 'replies: <b>{received}/{sent}</b>{loss}',
    ping_loss: ' · {pct}% loss',
    ping_times: 'times: {times} ms',
    ping_stats: 'min <b>{min}</b> · avg <b>{avg}</b> · max <b>{max}</b> ms',
    ping_jitter: 'jitter: {jitter} ms{ttl}',
    ping_ttl: ' · TTL: {ttl}',
    preset_hint: 'click to trace the route',
  },
  pl: {
    title: 'HopTracker — podróż Twojego sygnału przez świat',
    input_placeholder: 'np. google.com lub https://github.com',
    input_aria: 'Adres strony do prześledzenia',
    clear_aria: 'Wyczyść pole',
    sound_toggle_aria: 'Przełącz dźwięk',
    sound_mute: 'Wycisz dźwięk',
    sound_enable: 'Włącz dźwięk',
    lang_switch: 'Przełącz na angielski',
    visitors_title: 'Łączna liczba odwiedzin',
    visitors_label: 'odwiedzających',
    status_hint: 'Wpisz adres — albo kliknij żółty serwer na mapie — i zobacz, jak Twoje żądanie podróżuje przez świat.',
    map_aria: 'Mapa świata z trasą pakietu',
    hops_title: 'Przeskoki',
    sidebar_aria: 'Lista przeskoków trasy',
    legend_you: 'Ty',
    legend_hop: 'serwer pośredni',
    legend_target: 'cel',
    trace_start: 'Ruszamy!',
    trace_stop: 'Stop',
    st_connecting: 'Łączenie…',
    st_resolved: '{host} → {ip} · śledzenie trasy…',
    st_probing: 'Sondowanie przeskoku {hop}… (czekam na odpowiedź routera)',
    st_hop: 'Przeskok {hop} · {ip} · {loc}',
    st_stopped: 'Śledzenie zatrzymane.',
    st_lost: 'Utracono połączenie z serwerem.',
    st_done_early: '✅ Trasa dotarła do celu (ostatni odcinek z geolokalizacji — końcowe routery pozostają ukryte). Zlokalizowane przeskoki: {n}{km}',
    st_done_partial: '⚠️ Trasa częściowa — cel niepotwierdzony (może nie odpowiadać na ping). Przeskoki: {hops}, zlokalizowane: {located}{km}',
    st_done_ok: '✅ Trasa ukończona — przeskoki: {hops}, zlokalizowane: {located}{km}',
    km_suffix: ' · trasa na mapie ≈ {km} km',
    geo_unknown: 'nieznana lokalizacja',
    hop_private: 'sieć lokalna / ISP (adres prywatny)',
    hop_no_response: 'brak odpowiedzi (router pozostaje ukryty)',
    hop_routers_silent: 'routery {start}–{end} nie odpowiadają ({count})',
    target_approx_loc: '{loc} — pozycja celu (przybliżona)',
    tip_start: '📍 Start (Ty)',
    tip_target: '🎯 Cel · {ip}',
    tip_partial: 'trasa częściowa — pozycja z geolokalizacji IP',
    ctx_hq: '🏢 Siedziba operatora w Mapach Google',
    ctx_loc: '📍 Ta lokalizacja w Mapach Google',
    ctx_ping: '📡 Ping — zmierz czas odpowiedzi',
    ping_running: 'Pinguję {ip} (4 pakiety)…',
    ping_no_response: 'Brak odpowiedzi — host może blokować ping (ICMP).',
    ping_failed: 'Ping nie powiódł się.',
    ping_replies: 'odpowiedzi: <b>{received}/{sent}</b>{loss}',
    ping_loss: ' · {pct}% strat',
    ping_times: 'czasy: {times} ms',
    ping_stats: 'min <b>{min}</b> · śr. <b>{avg}</b> · maks. <b>{max}</b> ms',
    ping_jitter: 'jitter: {jitter} ms{ttl}',
    ping_ttl: ' · TTL: {ttl}',
    preset_hint: 'kliknij, aby prześledzić trasę',
  },
};

// Flagi jako inline SVG — emoji flag Windows nie renderuje (pokazuje „PL"/„US")
const FLAG_SVG = {
  pl: '<svg viewBox="0 0 20 13" width="22" height="14" aria-hidden="true">'
    + '<rect width="20" height="6.5" fill="#fff"/><rect y="6.5" width="20" height="6.5" fill="#dc143c"/>'
    + '<rect x="0.5" y="0.5" width="19" height="12" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.7"/></svg>',
  en: '<svg viewBox="0 0 26 14" width="24" height="14" aria-hidden="true">'
    + '<rect width="26" height="14" fill="#b22234"/>'
    + '<g fill="#fff"><rect y="1.08" width="26" height="1.08"/><rect y="3.23" width="26" height="1.08"/>'
    + '<rect y="5.38" width="26" height="1.08"/><rect y="7.54" width="26" height="1.08"/>'
    + '<rect y="9.69" width="26" height="1.08"/><rect y="11.85" width="26" height="1.08"/></g>'
    + '<rect width="10.4" height="7.54" fill="#3c3b6e"/>'
    + '<g fill="#fff">'
    + '<circle cx="1.7" cy="1.4" r="0.5"/><circle cx="4.1" cy="1.4" r="0.5"/><circle cx="6.5" cy="1.4" r="0.5"/><circle cx="8.9" cy="1.4" r="0.5"/>'
    + '<circle cx="2.9" cy="2.9" r="0.5"/><circle cx="5.3" cy="2.9" r="0.5"/><circle cx="7.7" cy="2.9" r="0.5"/>'
    + '<circle cx="1.7" cy="4.4" r="0.5"/><circle cx="4.1" cy="4.4" r="0.5"/><circle cx="6.5" cy="4.4" r="0.5"/><circle cx="8.9" cy="4.4" r="0.5"/>'
    + '<circle cx="2.9" cy="5.9" r="0.5"/><circle cx="5.3" cy="5.9" r="0.5"/><circle cx="7.7" cy="5.9" r="0.5"/>'
    + '</g></svg>',
};

let lang = localStorage.getItem('stm-lang') || 'en';

function t(key, params) {
  let s = I18N[lang] && I18N[lang][key];
  if (s == null) s = I18N.en[key];
  if (s == null) return key;
  if (params) for (const k in params) s = s.split(`{${k}}`).join(params[k]);
  return s;
}

// ── Mapa ─────────────────────────────────────────────────────────────────────

// Jedna kopia świata: mapa się nie powiela (noWrap na kafelkach), a widoku
// nie da się wysunąć poza zakres ±180° — trasy zawsze rysujemy w jego obrębie.
const map = L.map('map', {
  worldCopyJump: false,
  maxBounds: [[-85, -180], [85, 180]],
  maxBoundsViscosity: 1.0,
  zoomSnap: 0, // pozwala na ułamkowy zoom → świat dokładnie wypełnia okno
}).setView([28, 12], 2);

// Świat zawsze wypełnia szerokość okna: minimalny zoom dobieramy tak, by jedna
// kopia globu (256·2^z px) była nie węższa niż okno mapy. Przeliczamy przy
// każdej zmianie rozmiaru, żeby nie było szarych marginesów po bokach.
function fitWorldToViewport() {
  const w = map.getSize().x;
  if (!w) return;
  const minZ = Math.ceil(Math.log2(w / 256) * 100) / 100; // ułamkowy zoom = idealne dopasowanie
  map.setMinZoom(minZ);
  if (map.getZoom() < minZ) map.setView(map.getCenter(), minZ, { animate: false });
}
window.addEventListener('resize', () => {
  map.invalidateSize({ animate: false });
  fitWorldToViewport();
});
map.whenReady(fitWorldToViewport); // po pełnym zmierzeniu kontenera (pierwszy render)
fitWorldToViewport();

// Ciemna baza bez podpisów…
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a> &middot; created by Michał Dudek 2026',
  subdomains: 'abcd',
  maxZoom: 19,
  noWrap: true,
}).addTo(map);

// Wyraźne obrysy państw (pod linią trasy, z=380) + własne etykiety z nazwami
// krajów (zamiast kafelków z podpisami — dzięki temu na mapie nie ma żadnych
// innych napisów, a nazwy miast pokazujemy tylko przy punktach trasy)
map.createPane('borders');
map.getPane('borders').style.zIndex = 380;
map.getPane('borders').style.pointerEvents = 'none';
map.createPane('countryLabels');
map.getPane('countryLabels').style.zIndex = 390;
map.getPane('countryLabels').style.pointerEvents = 'none';

fetch('https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json')
  .then((r) => r.json())
  .then((geojson) => {
    L.geoJSON(geojson, {
      pane: 'borders',
      interactive: false,
      style: { color: '#8b9dc3', weight: 1, opacity: 0.5, fill: false },
    }).addTo(map);
    addCountryLabels(geojson);
  })
  .catch(() => {}); // brak obrysów/etykiet nie blokuje aplikacji

// ── Etykiety państw ──────────────────────────────────────────────────────────

const countryLabels = []; // { marker, west, east, midLat }
const COUNTRY_LABEL_MIN_PX = 70; // kraj węższy na ekranie → etykieta znika

function ringArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return a / 2;
}

// Środek ciężkości największego poligonu (dla wielu części, np. USA z Alaską,
// etykieta ląduje na części głównej, a nie gdzieś pomiędzy)
function largestRing(geometry) {
  if (geometry.type === 'Polygon') return geometry.coordinates[0];
  if (geometry.type === 'MultiPolygon') {
    let best = null;
    let bestArea = -1;
    for (const poly of geometry.coordinates) {
      const area = Math.abs(ringArea(poly[0]));
      if (area > bestArea) { bestArea = area; best = poly[0]; }
    }
    return best;
  }
  return null;
}

function ringCentroid(ring) {
  const a = ringArea(ring);
  if (Math.abs(a) < 1e-9) return null;
  let cx = 0, cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const f = ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    cx += (ring[i][0] + ring[i + 1][0]) * f;
    cy += (ring[i][1] + ring[i + 1][1]) * f;
  }
  return [cy / (6 * a), cx / (6 * a)]; // [lat, lon]
}

function addCountryLabels(geojson) {
  for (const feature of geojson.features) {
    const name = feature.properties && feature.properties.name; // angielskie nazwy z GeoJSON
    if (!name) continue;
    const ring = largestRing(feature.geometry);
    if (!ring || ring.length < 4) continue;
    const center = ringCentroid(ring);
    if (!center) continue;

    let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
    for (const [lon, lat] of ring) {
      if (lon < west) west = lon;
      if (lon > east) east = lon;
      if (lat < south) south = lat;
      if (lat > north) north = lat;
    }

    const icon = L.divIcon({
      className: '',
      html: `<div class="country-label">${esc(name)}</div>`,
      iconSize: [0, 0],
    });
    const marker = L.marker(center, {
      icon, pane: 'countryLabels', interactive: false, keyboard: false,
    }).addTo(map);
    countryLabels.push({ marker, west, east, midLat: (south + north) / 2 });
  }
  updateCountryLabels();
  map.on('zoomend', updateCountryLabels);
}

function updateCountryLabels() {
  for (const label of countryLabels) {
    const px = Math.abs(
      map.latLngToContainerPoint([label.midLat, label.east]).x -
      map.latLngToContainerPoint([label.midLat, label.west]).x
    );
    const el = label.marker.getElement();
    if (el) el.style.display = px >= COUNTRY_LABEL_MIN_PX ? '' : 'none';
  }
}

const traceLayer = L.layerGroup().addTo(map);

// ── Elementy UI ──────────────────────────────────────────────────────────────

const form = document.getElementById('trace-form');
const input = document.getElementById('url-input');
const clearBtn = document.getElementById('clear-btn');
const btn = document.getElementById('trace-btn');
const statusEl = document.getElementById('status');
const hopList = document.getElementById('hop-list');
const hopCount = document.getElementById('hop-count');
const langBtn = document.getElementById('lang-btn');

// ── Stan śledzenia ───────────────────────────────────────────────────────────

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let es = null;            // aktywne EventSource
let tracing = false;
let statusIsHint = true;  // czy w pasku statusu jest podpowiedź startowa (do retłumaczenia)
// Rośnie przy każdym starcie i przerwaniu śledzenia — zadania i animacje
// z poprzedniej sesji rozpoznają po nim, że mają się natychmiast zakończyć.
let traceId = 0;
let lastPoint = null;     // ostatni zlokalizowany punkt [lat, lon]
let lastMarker = null;    // marker w lastPoint (do sklejania hopów z tej samej lokalizacji)
let lastTipLines = [];
let bounds = null;
let packetDot = null;     // "pakiet" wędrujący po linii
let totalKm = 0;
let locatedCount = 0;
let hopsSeen = 0;
let timeoutRun = null;      // bieżąca seria niemych hopów sklejana w jeden wiersz

// Kolejka animacji — segmenty rysują się jeden po drugim, w kolejności hopów
const queue = [];
let queueRunning = false;

function enqueue(task) {
  queue.push({ id: traceId, task });
  runQueue();
}

async function runQueue() {
  if (queueRunning) return;
  queueRunning = true;
  try {
    while (queue.length) {
      const { id, task } = queue.shift();
      if (id !== traceId) continue; // zadanie z przerwanej/poprzedniej sesji
      try {
        await task();
      } catch (err) {
        console.error('Animation task error:', err);
      }
    }
  } finally {
    queueRunning = false; // kolejka nigdy nie może zostać zablokowana na stałe
  }
}

// ── Geometria: łuki wielkiego koła ───────────────────────────────────────────

const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Sprowadza długość geograficzną do zakresu [-180, 180]
// (np. do linków Map Google i wyświetlania współrzędnych)
function normalizeLon(lon) {
  return ((lon + 180) % 360 + 360) % 360 - 180;
}

// Czy krótszy łuk między punktami przecinałby krawędź mapy (antymerydian)?
// Jeśli tak, rysujemy dłuższy łuk tego samego wielkiego koła — sygnał leci
// wtedy przez środek widoku (np. z USA przez Atlantyk do Australii).
function crossesAntimeridian(a, b) {
  return Math.abs(b[1] - a[1]) > 180;
}

const EARTH_CIRCUM_KM = 40030;

// Długość łuku faktycznie rysowanego na mapie
function drawnPathKm(a, b) {
  const short = haversineKm(a, b);
  return crossesAntimeridian(a, b) ? EARTH_CIRCUM_KM - short : short;
}

function greatCircle(a, b, n) {
  const lat1 = toRad(a[0]), lon1 = toRad(a[1]);
  const lat2 = toRad(b[0]), lon2 = toRad(b[1]);
  const v1 = [Math.cos(lat1) * Math.cos(lon1), Math.cos(lat1) * Math.sin(lon1), Math.sin(lat1)];
  const v2 = [Math.cos(lat2) * Math.cos(lon2), Math.cos(lat2) * Math.sin(lon2), Math.sin(lat2)];
  const dot = Math.min(1, Math.max(-1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]));
  const omega = Math.acos(dot);

  const pts = [];
  if (omega < 1e-6) {
    for (let i = 0; i <= n; i++) pts.push([a[0], a[1]]);
    return pts;
  }

  // Kąt do przebycia: dodatni = krótszy łuk, ujemny (dopełnienie do 360°) =
  // dłuższy łuk omijający antymerydian
  const total = crossesAntimeridian(a, b) ? omega - 2 * Math.PI : omega;

  // Oś obrotu — normalna płaszczyzny wielkiego koła obu punktów
  let ax = v1[1] * v2[2] - v1[2] * v2[1];
  let ay = v1[2] * v2[0] - v1[0] * v2[2];
  let az = v1[0] * v2[1] - v1[1] * v2[0];
  let alen = Math.hypot(ax, ay, az);
  if (alen < 1e-9) {
    // Punkty niemal antypodyczne — dowolna oś prostopadła do v1
    ax = -v1[1]; ay = v1[0]; az = 0;
    alen = Math.hypot(ax, ay, az);
    if (alen < 1e-9) { ax = 1; ay = 0; az = 0; alen = 1; } // start na biegunie
  }
  ax /= alen; ay /= alen; az /= alen;

  // Obrót Rodriguesa: v(φ) = v1·cosφ + (oś × v1)·sinφ  (v1 ⊥ oś)
  const wx = ay * v1[2] - az * v1[1];
  const wy = az * v1[0] - ax * v1[2];
  const wz = ax * v1[1] - ay * v1[0];

  for (let i = 0; i <= n; i++) {
    const phi = (total * i) / n;
    const c = Math.cos(phi), s = Math.sin(phi);
    const x = v1[0] * c + wx * s;
    const y = v1[1] * c + wy * s;
    const z = v1[2] * c + wz * s;
    pts.push([toDeg(Math.atan2(z, Math.hypot(x, y))), toDeg(Math.atan2(y, x))]);
  }
  return pts;
}

// Sześcienny ease-in-out: pakiet wyraźnie wolno startuje, rozpędza się
// w połowie łuku i wolno dolatuje do celu
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// ── Rysowanie ────────────────────────────────────────────────────────────────

// Dopasowuje widok mapy do CAŁEJ dotychczasowej trasy (dynamiczne przybliżanie
// na starcie i oddalanie przy dalekich skokach) i rozwiązuje się dopiero PO
// zakończeniu ruchu mapy. Rysowanie linii w trakcie animacji zoomu powoduje,
// że segment renderuje się w przesuniętych współrzędnych i "wskakuje" na
// miejsce — dlatego czekamy na moveend.
const FIT_PADDING = 70;
const FIT_MAX_ZOOM = 7;

function ensureVisible(point) {
  if (!bounds) bounds = L.latLngBounds([point, point]);
  else bounds.extend(point);

  // Zoom, przy którym cała trasa mieści się na ekranie
  const targetZoom = Math.min(
    FIT_MAX_ZOOM,
    map.getBoundsZoom(bounds, false, L.point(FIT_PADDING, FIT_PADDING))
  );

  // Mapy nie ruszamy tylko wtedy, gdy cała trasa jest w kadrze
  // ORAZ nie jesteśmy oddaleni bardziej niż trzeba (np. widok całego świata).
  const wholePathVisible = map.getBounds().pad(-0.08).contains(bounds);
  if (wholePathVisible && map.getZoom() >= targetZoom) return Promise.resolve();

  // Bez animowanego przelotu — dopasowanie widoku od razu
  if (REDUCED_MOTION) {
    map.fitBounds(bounds, {
      padding: [FIT_PADDING, FIT_PADDING],
      maxZoom: FIT_MAX_ZOOM,
      animate: false,
    });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      map.off('moveend', finish);
      clearTimeout(timer);
      resolve();
    };
    // Awaryjnie, gdyby moveend nie nadeszło (np. mapa nie musiała się ruszyć)
    const timer = setTimeout(finish, 1200);
    map.once('moveend', finish);
    map.flyToBounds(bounds, {
      padding: [FIT_PADDING, FIT_PADDING],
      maxZoom: FIT_MAX_ZOOM,
      duration: 0.7,
    });
  });
}

function animateSegment(from, to) {
  return new Promise((resolve) => {
    const id = traceId; // sesja, do której należy ta animacja
    const distKm = drawnPathKm(from, to); // uwzględnia dłuższy łuk przez środek mapy
    const n = Math.max(16, Math.min(160, Math.round(distKm / 40)));
    const pts = greatCircle(from, to, n);
    const duration = 800 + Math.min(2800, distKm * 0.36); // czas „lotu" pakietu po tym odcinku

    // Subtelna etykieta z czasem lotu w połowie narysowanego łuku. Wtapia się
    // mniej więcej w chwili, gdy pakiet dolatuje do środka odcinka (opóźnienie
    // = połowa czasu lotu; przy ograniczonych animacjach pojawia się od razu).
    const labelDelay = REDUCED_MOTION ? 0 : Math.round(duration / 2);
    L.marker(pts[Math.floor(pts.length / 2)], {
      icon: L.divIcon({
        className: '',
        html: `<div class="flight-time" style="animation-delay:${labelDelay}ms">${Math.round(duration)} ms</div>`,
        iconSize: [0, 0],
      }),
      interactive: false,
      keyboard: false,
    }).addTo(traceLayer);

    const glow = L.polyline([pts[0]], {
      color: '#22d3ee', weight: 7, opacity: 0.18, interactive: false,
    }).addTo(traceLayer);
    const line = L.polyline([pts[0]], {
      color: '#67e8f9', weight: 2.5, opacity: 0.95, className: 'trace-line', interactive: false,
    }).addTo(traceLayer);

    // Przy ograniczonych animacjach rysujemy segment od razu w całości
    if (REDUCED_MOTION) {
      line.setLatLngs(pts);
      glow.setLatLngs(pts);
      resolve();
      return;
    }

    if (!packetDot) {
      packetDot = L.circleMarker(pts[0], {
        radius: 5, color: '#fef9c3', fillColor: '#fde047',
        fillOpacity: 1, weight: 2, interactive: false,
      }).addTo(traceLayer);
    }

    playWhoosh(duration);
    const t0 = performance.now();
    (function frame(now) {
      // Sesja przerwana (stop / nowe śledzenie) — warstwy mogły zostać
      // usunięte, kończymy natychmiast zamiast dotykać nieistniejących obiektów.
      if (id !== traceId || !packetDot) {
        resolve();
        return;
      }
      const t = Math.min(1, (now - t0) / duration);
      const k = Math.max(1, Math.round(easeInOut(t) * n));
      const slice = pts.slice(0, k + 1);
      line.setLatLngs(slice);
      glow.setLatLngs(slice);
      packetDot.setLatLng(slice[slice.length - 1]);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    })(performance.now());
  });
}

// ── Dźwięk (Web Audio, syntezowany — cichy i stonowany) ─────────────────────

const soundBtn = document.getElementById('sound-btn');
let soundOn = localStorage.getItem('stm-sound') !== 'off';
let audioCtx = null;
let noiseBuf = null;
let whooshSrc = null;

function ensureAudio() {
  if (!soundOn) return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function getNoiseBuffer(ctx) {
  if (!noiseBuf) {
    const len = ctx.sampleRate; // 1 s szumu w pętli
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

// Cichy "szum lotu" na czas rysowania segmentu — narasta i opada razem z ruchem
function playWhoosh(durationMs) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const dur = durationMs / 1000;

  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  src.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(280, t);
  filter.frequency.linearRampToValueAtTime(850, t + dur / 2); // najszybciej w apex
  filter.frequency.linearRampToValueAtTime(320, t + dur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.02, t + dur * 0.35);
  gain.gain.linearRampToValueAtTime(0.025, t + dur * 0.55);
  gain.gain.linearRampToValueAtTime(0, t + dur);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + dur + 0.05);
  whooshSrc = src;
  src.onended = () => { if (whooshSrc === src) whooshSrc = null; };
}

function stopWhoosh() {
  if (whooshSrc) {
    try { whooshSrc.stop(); } catch { /* już zatrzymany */ }
    whooshSrc = null;
  }
}

// Miękki blip przy lądowaniu na serwerze; ton delikatnie rośnie w głąb trasy
function playHopBlip(hopIndex) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 420 * Math.pow(2, Math.min(hopIndex, 16) / 28);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.045, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.4);
}

// Łagodny dwudźwięk na dotarcie do celu
function playArrivalChime() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  for (const [freq, offset] of [[523.25, 0], [783.99, 0.13]]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t + offset);
    gain.gain.linearRampToValueAtTime(0.05, t + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.75);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.85);
  }
}

function updateSoundBtn() {
  soundBtn.textContent = soundOn ? '🔊' : '🔇';
  soundBtn.title = soundOn ? t('sound_mute') : t('sound_enable');
}

soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  localStorage.setItem('stm-sound', soundOn ? 'on' : 'off');
  if (!soundOn) stopWhoosh();
  updateSoundBtn();
});
updateSoundBtn();

// ── Wybór języka (EN / PL) ──────────────────────────────────────────────────

// Podpowiedź startową trzymamy osobno, żeby applyLang mógł ją przetłumaczyć
// w locie (dynamiczne komunikaty statusu z natury się nie retłumaczą).
function showHint() {
  statusEl.textContent = t('status_hint');
  statusEl.classList.remove('error');
  statusIsHint = true;
}

// Przycisk pokazuje flagę języka DOCELOWEGO (tego, na który przełączy klik)
function updateLangBtn() {
  const target = lang === 'en' ? 'pl' : 'en';
  langBtn.innerHTML = FLAG_SVG[target];
  langBtn.title = t('lang_switch');
  langBtn.setAttribute('aria-label', t('lang_switch'));
}

function applyLang() {
  document.documentElement.lang = lang;
  document.title = t('title');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder)));
  document.querySelectorAll('[data-i18n-title]').forEach((el) => el.setAttribute('title', t(el.dataset.i18nTitle)));
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel)));
  btn.textContent = tracing ? t('trace_stop') : t('trace_start');
  updateSoundBtn();
  updateLangBtn();
  if (statusIsHint) showHint(); // przetłumacz podpowiedź, jeśli wciąż widoczna
}

langBtn.addEventListener('click', () => {
  lang = lang === 'en' ? 'pl' : 'en';
  localStorage.setItem('stm-lang', lang);
  // Presetowe tooltipy budują się z t() — przebudowujemy je w nowym języku
  presetLayer.clearLayers();
  presetsBuilt = false;
  updatePresetsVisibility();
  applyLang();
});

// ── Menu kontekstowe markerów (prawy przycisk myszy) ────────────────────────

const ctxMenu = document.createElement('div');
ctxMenu.id = 'ctx-menu';
ctxMenu.hidden = true;
document.body.appendChild(ctxMenu);

function hideCtxMenu() {
  ctxMenu.hidden = true;
}

document.addEventListener('click', (ev) => {
  // Kliknięcia wewnątrz menu (np. przycisk pinga) nie zamykają go;
  // kliknięcie linku (otwiera nową kartę) — tak.
  if (ctxMenu.contains(ev.target) && !ev.target.closest('a')) return;
  hideCtxMenu();
});
document.addEventListener('contextmenu', (ev) => {
  if (!ctxMenu.contains(ev.target)) hideCtxMenu();
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') hideCtxMenu();
});
map.on('movestart zoomstart', hideCtxMenu);

// titleHtml musi być wcześniej escapowane (dostaje gotowy, bezpieczny HTML)
function showMarkerMenu(e, point, titleHtml, geo, ip) {
  const lat = point[0];
  const lon = normalizeLon(point[1]); // marker może być w "odwiniętej" ramce (lon poza ±180°)
  const mapsUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  // Siedziba operatora: szukamy po nazwie firmy + mieście + kraju
  const org = geo && (geo.org || geo.isp);
  const hqQuery = org
    ? [org, geo.city, geo.country].filter(Boolean).join(', ')
    : null;

  ctxMenu.innerHTML = `
    <div class="ctx-title">${titleHtml}</div>
    <div class="ctx-coords">${esc(ip || '')}${ip ? ' · ' : ''}${lat.toFixed(4)}, ${lon.toFixed(4)}</div>
    ${hqQuery ? `<a class="ctx-item" href="${mapsUrl(hqQuery)}" target="_blank" rel="noopener noreferrer">${t('ctx_hq')}</a>` : ''}
    <a class="ctx-item" href="${mapsUrl(`${lat},${lon}`)}" target="_blank" rel="noopener noreferrer">${t('ctx_loc')}</a>
    ${ip ? `<button class="ctx-item ctx-ping" type="button">${t('ctx_ping')}</button>
    <div class="ctx-ping-result" hidden></div>` : ''}`;

  const pingBtn = ctxMenu.querySelector('.ctx-ping');
  if (pingBtn) pingBtn.addEventListener('click', () => runPing(ip, pingBtn));

  // Przy kursorze, ale bez wychodzenia poza okno
  ctxMenu.hidden = false;
  const { clientX, clientY } = e.originalEvent;
  const rect = ctxMenu.getBoundingClientRect();
  ctxMenu.style.left = `${Math.min(clientX, window.innerWidth - rect.width - 8)}px`;
  ctxMenu.style.top = `${Math.min(clientY, window.innerHeight - rect.height - 8)}px`;
}

async function runPing(ip, btn) {
  const box = ctxMenu.querySelector('.ctx-ping-result');
  if (!box || btn.disabled) return;
  btn.disabled = true;
  box.hidden = false;
  box.textContent = t('ping_running', { ip });
  try {
    const resp = await fetch(`/api/ping?ip=${encodeURIComponent(ip)}`);
    const d = await resp.json();
    if (d.error) {
      box.textContent = d.error;
    } else if (!d.received) {
      box.textContent = t('ping_no_response');
    } else {
      box.innerHTML = [
        t('ping_replies', {
          received: esc(d.received), sent: esc(d.sent),
          loss: d.lostPct ? t('ping_loss', { pct: esc(d.lostPct) }) : '',
        }),
        t('ping_times', { times: d.times.map(esc).join(', ') }),
        t('ping_stats', { min: esc(d.min), avg: esc(d.avg), max: esc(d.max) }),
        t('ping_jitter', {
          jitter: esc(d.jitter),
          ttl: d.ttl != null ? t('ping_ttl', { ttl: esc(d.ttl) }) : '',
        }),
      ].join('<br>');
    }
  } catch {
    box.textContent = t('ping_failed');
  } finally {
    btn.disabled = false;
  }
}

function addMarker(point, tipLines, kind, labelText, geo, ip) {
  const label = labelText ? `<div class="node-label">${esc(labelText)}</div>` : '';
  const icon = L.divIcon({
    className: '',
    html: `<div class="node ${kind}"><span class="ring"></span></div>${label}`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
  const marker = L.marker(point, { icon }).addTo(traceLayer);
  marker.bindTooltip(tipLines.join('<br>'), {
    direction: 'top', offset: [0, -10], opacity: 1, className: 'node-tip',
  });
  marker.on('contextmenu', (e) => {
    // Bez menu przeglądarki i bez zamknięcia przez globalny listener contextmenu
    L.DomEvent.preventDefault(e.originalEvent);
    L.DomEvent.stopPropagation(e.originalEvent);
    showMarkerMenu(e, point, tipLines[0], geo, ip);
  });
  return marker;
}

function samePlace(a, b) {
  return Math.abs(a[0] - b[0]) < 0.02 && Math.abs(a[1] - b[1]) < 0.02;
}

// ── Panel boczny ─────────────────────────────────────────────────────────────

// Dane geolokalizacyjne pochodzą z zewnętrznego API — wszystko, co trafia
// do HTML-a, musi być wcześniej escapowane.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function addHopRow({ num, ip, loc, rtt, cls }) {
  const li = document.createElement('li');
  if (cls) li.className = cls;
  li.innerHTML = `
    <span class="num">${esc(num)}</span>
    <div class="meta">
      <span class="ip">${esc(ip)}</span>
      <span class="loc">${esc(loc)}</span>
    </div>
    <span class="rtt">${esc(rtt)}</span>`;
  hopList.appendChild(li);
  hopList.scrollTop = hopList.scrollHeight;
  return li;
}

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle('error', isError);
  statusIsHint = false; // każdy realny komunikat kasuje stan „podpowiedź startowa"
}

function geoLabel(geo) {
  if (!geo) return t('geo_unknown');
  const place = [geo.city, geo.country].filter(Boolean).join(', ');
  const who = geo.org || geo.isp || '';
  return who ? `${place} · ${who}` : place;
}

// ── Obsługa zdarzeń trasy ────────────────────────────────────────────────────

function handleOrigin({ geo }) {
  const point = [geo.lat, geo.lon];
  enqueue(async () => {
    await ensureVisible(point);
    lastMarker = addMarker(point, [`<b>${t('tip_start')}</b>`, esc(geoLabel(geo))], 'origin',
      geo.city || 'Start', geo, geo.query);
    lastTipLines = null; // startu nie sklejamy z hopami
    lastPoint = point;
  });
}

function handleHop(data) {
  hopsSeen = Math.max(hopsSeen, data.hop);
  hopCount.textContent = `(${hopsSeen})`;

  if (data.timeout) {
    // Kolejne nieme hopy sklejamy w jeden wiersz zamiast zaśmiecać listę
    if (timeoutRun) {
      timeoutRun.end = data.hop;
      timeoutRun.count++;
      timeoutRun.el.querySelector('.loc').textContent = t('hop_routers_silent', {
        start: timeoutRun.start, end: timeoutRun.end, count: timeoutRun.count,
      });
    } else {
      const el = addHopRow({
        num: data.hop, ip: '∗ ∗ ∗',
        loc: t('hop_no_response'), rtt: '—', cls: 'timeout',
      });
      timeoutRun = { el, start: data.hop, end: data.hop, count: 1 };
    }
    return;
  }
  timeoutRun = null;

  const isTarget = data.isTarget;
  const rtt = data.rtt != null ? `${data.rtt} ms` : '—';

  if (data.kind === 'private') {
    addHopRow({ num: data.hop, ip: data.ip, loc: t('hop_private'), rtt });
    return;
  }

  if (!data.geo) {
    addHopRow({ num: data.hop, ip: data.ip, loc: t('geo_unknown'), rtt });
    return;
  }

  addHopRow({
    num: data.hop, ip: data.ip, loc: geoLabel(data.geo), rtt,
    cls: isTarget ? 'target' : '',
  });
  locatedCount++;

  const point = [data.geo.lat, data.geo.lon];
  const tip = [`<b>#${esc(data.hop)} · ${esc(data.ip)}</b>`, esc(geoLabel(data.geo)), `RTT: ${esc(rtt)}`];
  if (isTarget) tip[0] = `<b>${t('tip_target', { ip: esc(data.ip) })}</b>`;

  enqueue(async () => {
    setStatus(t('st_hop', { hop: data.hop, ip: data.ip, loc: geoLabel(data.geo) }));

    // Rysujemy w tej samej "kopii świata" co dotychczasowa trasa
    const drawPoint = point; // mapa się nie powiela — używamy surowych współrzędnych

    // Kolejny hop w tym samym miejscu — doklejamy do istniejącego markera
    if (lastPoint && samePlace(drawPoint, lastPoint)) {
      if (lastTipLines && lastMarker) {
        lastTipLines.push('', ...tip);
        lastMarker.setTooltipContent(lastTipLines.join('<br>'));
        if (isTarget) {
          const el = lastMarker.getElement()?.querySelector('.node');
          if (el) { el.classList.remove('hop'); el.classList.add('target'); }
        }
      }
      return;
    }

    await ensureVisible(drawPoint); // najpierw mapa dolatuje, potem rysujemy
    if (lastPoint) {
      await animateSegment(lastPoint, drawPoint);
      totalKm += drawnPathKm(lastPoint, drawPoint);
    }
    lastMarker = addMarker(drawPoint, tip, isTarget ? 'target' : 'hop',
      data.geo.city || data.geo.country, data.geo, data.ip);
    if (isTarget) playArrivalChime();
    else playHopBlip(data.hop);
    lastTipLines = tip;
    lastPoint = drawPoint;
  });
}

// Cel nie potwierdził trasy, ale znamy jego geolokalizację — dorysowujemy go
// ostatnim odcinkiem, żeby mapa pokazywała pełną podróż.
function handleTargetApprox(data) {
  if (!data.geo) return;
  addHopRow({
    num: '🎯', ip: data.ip,
    loc: t('target_approx_loc', { loc: geoLabel(data.geo) }),
    rtt: '—', cls: 'target',
  });
  const point = [data.geo.lat, data.geo.lon];
  const tip = [
    `<b>${t('tip_target', { ip: esc(data.ip) })}</b>`,
    esc(geoLabel(data.geo)),
    t('tip_partial'),
  ];
  enqueue(async () => {
    const drawPoint = point; // mapa się nie powiela — używamy surowych współrzędnych
    if (lastPoint && samePlace(drawPoint, lastPoint)) return; // cel tam, gdzie ostatni hop
    await ensureVisible(drawPoint);
    if (lastPoint) {
      await animateSegment(lastPoint, drawPoint);
      totalKm += drawnPathKm(lastPoint, drawPoint);
    }
    lastMarker = addMarker(drawPoint, tip, 'target',
      data.geo.city || data.geo.country, data.geo, data.ip);
    playArrivalChime();
    lastTipLines = tip;
    lastPoint = drawPoint;
    locatedCount++;
  });
}

function handleDone(info = {}) {
  // Zamykamy od razu — inaczej EventSource po końcu streamu sam by się
  // połączył ponownie i uruchomił drugi traceroute na serwerze.
  if (es) { es.close(); es = null; }
  enqueue(async () => {
    if (packetDot) { traceLayer.removeLayer(packetDot); packetDot = null; }
    const kmNum = Math.round(totalKm).toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-US');
    const km = totalKm >= 1 ? t('km_suffix', { km: kmNum }) : '';
    if (info.earlyStop) {
      setStatus(t('st_done_early', { n: locatedCount, km }));
    } else if (info.reached === false) {
      setStatus(t('st_done_partial', { hops: hopsSeen, located: locatedCount, km }));
    } else {
      setStatus(t('st_done_ok', { hops: hopsSeen, located: locatedCount, km }));
    }
    stopTracing(true);
  });
}

// ── Start / stop ─────────────────────────────────────────────────────────────

function resetState() {
  traceId++; // unieważnia trwające animacje i zakolejkowane zadania poprzedniej sesji
  hideCtxMenu();
  traceLayer.clearLayers();
  hopList.innerHTML = '';
  hopCount.textContent = '';
  queue.length = 0;
  lastPoint = null;
  lastMarker = null;
  lastTipLines = [];
  bounds = null;
  packetDot = null;
  totalKm = 0;
  locatedCount = 0;
  hopsSeen = 0;
  timeoutRun = null;
}

function startTracing(host) {
  ensureAudio(); // klik "Śledź" to gest użytkownika — przeglądarka pozwala odblokować audio
  hidePresets(); // na czas śledzenia mapa należy do trasy
  resetState();
  tracing = true;
  btn.textContent = t('trace_stop');
  btn.classList.add('tracing');
  setStatus(t('st_connecting'));

  es = new EventSource(`/api/trace?host=${encodeURIComponent(host)}`);

  es.addEventListener('status', (e) => setStatus(JSON.parse(e.data).message));
  es.addEventListener('origin', (e) => handleOrigin(JSON.parse(e.data)));
  es.addEventListener('resolved', (e) => {
    const { host: h, ip } = JSON.parse(e.data);
    setStatus(t('st_resolved', { host: h, ip }));
  });
  es.addEventListener('probing', (e) => {
    const { hop } = JSON.parse(e.data);
    setStatus(t('st_probing', { hop }));
  });
  es.addEventListener('hop', (e) => handleHop(JSON.parse(e.data)));
  es.addEventListener('target', (e) => handleTargetApprox(JSON.parse(e.data)));
  es.addEventListener('done', (e) => handleDone(e.data ? JSON.parse(e.data) : {}));
  es.addEventListener('error', (e) => {
    if (e.data) {
      setStatus(JSON.parse(e.data).message, true);
    } else if (tracing) {
      setStatus(t('st_lost'), true);
    }
    stopTracing(true);
  });
}

function stopTracing(finished = false) {
  if (es) { es.close(); es = null; }
  tracing = false;
  btn.textContent = t('trace_start');
  btn.classList.remove('tracing');
  if (!finished) {
    traceId++; // anuluje trwającą animację segmentu i porzuca resztę kolejki
    queue.length = 0;
    stopWhoosh();
    if (packetDot) { traceLayer.removeLayer(packetDot); packetDot = null; }
    setStatus(t('st_stopped'));
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (tracing) {
    stopTracing();
    return;
  }
  const value = input.value.trim();
  if (value) startTracing(value);
});

// ── Przycisk czyszczenia pola ────────────────────────────────────────────────

function syncClearBtn() {
  clearBtn.hidden = input.value.length === 0;
}
input.addEventListener('input', () => {
  syncClearBtn();
  updatePresetsVisibility(); // wpisanie własnego adresu chowa presetowe serwery
});
// Kliknięcie (lub tab) w pole URL czyści tylko tekst. Celowo NIE ruszamy
// presetów — ich ponowne pojawienie się wyglądałoby jak reset całej aplikacji,
// a użytkownik chce jedynie wyczyścić pole, żeby wpisać nowy adres.
input.addEventListener('focus', () => {
  if (input.value === '') return;
  input.value = '';
  syncClearBtn();
});
clearBtn.addEventListener('click', () => {
  input.value = '';
  syncClearBtn();
  updatePresetsVisibility(); // wyczyszczenie pola → presety znów widoczne
  input.focus();
});
syncClearBtn();

// ── Licznik odwiedzin ────────────────────────────────────────────────────────

(function initVisitors() {
  const el = document.getElementById('visitor-count');
  // Nową wizytę liczymy raz na sesję karty (POST); przy odświeżeniu tylko odczyt (GET)
  const fresh = !sessionStorage.getItem('stm-visited');
  if (fresh) sessionStorage.setItem('stm-visited', '1');
  fetch('/api/visits', { method: fresh ? 'POST' : 'GET' })
    .then((r) => r.json())
    .then((d) => {
      if (Number.isFinite(d.count)) el.textContent = d.count.toLocaleString('pl-PL');
    })
    .catch(() => { el.textContent = '—'; });
})();

// ── Presetowe serwery ────────────────────────────────────────────────────────
// Żółte, klikalne markery rozsiane po kontynentach, widoczne od razu po wejściu
// na stronę. Klik = wpisanie adresu do pola i natychmiastowy start śledzenia.
// Chowają się, gdy użytkownik zacznie wpisywać własny adres albo ruszy trasa.

const PRESET_SERVERS = [
  { host: 'fra.de-cix.net',                   city: 'Frankfurt', country: 'Germany',        lat: 50.11,  lon: 8.68 },
  { host: 'speedtest.waw.pl',                 city: 'Warsaw',    country: 'Poland',         lat: 52.23,  lon: 21.01 },
  { host: 'lon01.ukcore.bt.net',              city: 'London',    country: 'United Kingdom', lat: 51.51,  lon: -0.13 },
  { host: 'ec2.us-east-1.amazonaws.com',      city: 'Virginia',  country: 'USA',            lat: 38.95,  lon: -77.45 },
  { host: 'ec2.us-west-2.amazonaws.com',      city: 'Oregon',    country: 'USA',            lat: 45.87,  lon: -119.69 },
  { host: 'ca-central-1.amazonaws.com',       city: 'Montreal',  country: 'Canada',         lat: 45.50,  lon: -73.57 },
  { host: 'ec2.sa-east-1.amazonaws.com',      city: 'São Paulo', country: 'Brazil',         lat: -23.55, lon: -46.63 },
  { host: 'ec2.ap-northeast-1.amazonaws.com', city: 'Tokyo',     country: 'Japan',          lat: 35.68,  lon: 139.69 },
  { host: 'ec2.ap-southeast-1.amazonaws.com', city: 'Singapore', country: 'Singapore',      lat: 1.35,   lon: 103.82 },
  { host: 'ec2.ap-south-1.amazonaws.com',     city: 'Mumbai',    country: 'India',          lat: 19.08,  lon: 72.88 },
  { host: 'ec2.ap-southeast-2.amazonaws.com', city: 'Sydney',    country: 'Australia',      lat: -33.87, lon: 151.21 },
  { host: 'ec2.af-south-1.amazonaws.com',     city: 'Cape Town', country: 'South Africa',   lat: -33.92, lon: 18.42 },
  { host: 'ec2.me-south-1.amazonaws.com',     city: 'Manama',    country: 'Bahrain',        lat: 26.07,  lon: 50.55 },
];

const presetLayer = L.layerGroup();
let presetsBuilt = false;

function buildPresetMarkers() {
  for (const s of PRESET_SERVERS) {
    const icon = L.divIcon({
      className: 'preset-marker',
      html: `<div class="node preset"><span class="ring"></span></div>`
          + `<div class="node-label preset-label">${esc(s.city)}</div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    const marker = L.marker([s.lat, s.lon], {
      icon, title: `${s.city}, ${s.country} — ${s.host}`,
    });
    marker.bindTooltip(
      `<b>⭐ ${esc(s.city)}, ${esc(s.country)}</b><br>${esc(s.host)}`
        + `<br><span class="preset-hint">${t('preset_hint')}</span>`,
      { direction: 'top', offset: [0, -10], opacity: 1, className: 'node-tip' }
    );
    marker.on('click', () => {
      input.value = s.host;
      syncClearBtn();
      startTracing(s.host); // startTracing samo chowa presety
    });
    marker.addTo(presetLayer);
  }
  presetsBuilt = true;
}

function showPresets() {
  if (!presetsBuilt) buildPresetMarkers();
  if (!map.hasLayer(presetLayer)) presetLayer.addTo(map);
}

function hidePresets() {
  if (map.hasLayer(presetLayer)) map.removeLayer(presetLayer);
}

// Presety widoczne tylko wtedy, gdy nie śledzimy i pole adresu jest puste
function updatePresetsVisibility() {
  if (!tracing && input.value.trim() === '') showPresets();
  else hidePresets();
}

showPresets(); // widoczne od razu na starcie strony

// ── Zastosuj język na starcie (po zbudowaniu całego UI) ──────────────────────
applyLang();
