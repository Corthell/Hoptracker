'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1'; // aplikacja lokalna — nie wystawiamy się na sieć
const PUBLIC_DIR = path.join(__dirname, 'public');

const MAX_CONCURRENT_TRACES = 3;
const TRACE_HARD_TIMEOUT_MS = 120000; // awaryjne ubicie zawieszonego tracert
let activeTraces = 0;

const MAX_CONCURRENT_PINGS = 4;
const PING_HARD_TIMEOUT_MS = 15000;
let activePings = 0;

// Licznik odwiedzin — trwale w pliku JSON (bez bazy danych)
const DATA_DIR = path.join(__dirname, 'data');
const VISITS_FILE = path.join(DATA_DIR, 'visits.json');
let visitCount = 0;

function loadVisits() {
  try {
    const n = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8')).count;
    if (Number.isFinite(n)) visitCount = n;
  } catch { /* brak pliku = zaczynamy od zera */ }
}

function persistVisits() {
  fs.mkdir(DATA_DIR, { recursive: true }, () => {
    fs.writeFile(VISITS_FILE, JSON.stringify({ count: visitCount }), () => {});
  });
}

// Wczesne kończenie martwego ogona trasy — dwa progi kolejnych niemych hopów:
// - cel nie odpowiada na ping → reszta trasy na pewno milczy, ucinamy szybko;
// - cel pingowalny, ale jego zapora blokuje traceroute (niskie TTL) → dłuższy
//   margines, żeby nie uciąć trasy z niemym odcinkiem w środku (np. google.com
//   miewa 6 niemych hopów przed celem).
const EARLY_STOP_UNREACHABLE = 4;
const EARLY_STOP_REACHABLE = 8;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ── Geolokalizacja IP (ip-api.com, darmowy limit 45 zapytań/min) ──────────────

// ip -> { promise, expires }. Trzymamy promise, nie wynik — dzięki temu
// równoległe zapytania o ten sam adres nie odpytują API podwójnie.
const geoCache = new Map();
const GEO_TTL_MS = 24 * 60 * 60 * 1000;
const GEO_CACHE_MAX = 500;

function geolocate(ip) {
  const key = ip || '__self__';
  const cached = geoCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.promise;

  const promise = fetchGeo(ip).then((geo) => {
    if (!geo) geoCache.delete(key); // porażek nie cache'ujemy — kolejna próba może się udać
    return geo;
  });
  geoCache.set(key, { promise, expires: Date.now() + GEO_TTL_MS });
  if (geoCache.size > GEO_CACHE_MAX) {
    geoCache.delete(geoCache.keys().next().value); // usuwamy najstarszy wpis
  }
  return promise;
}

function fetchGeo(ip) {
  return new Promise((resolve) => {
    const url = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,lat,lon,isp,org,as,query`;
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // Odrzucamy "sukcesy" bez danych (np. adresy specjalne geolokalizowane na 0,0)
          const empty = !json.country || (Math.abs(json.lat) < 1e-6 && Math.abs(json.lon) < 1e-6);
          if (json.status === 'success' && !empty) {
            resolve(json);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });
    req.on('timeout', () => req.destroy());
    req.on('error', () => resolve(null));
  });
}

function isPrivateIp(ip) {
  if (/^(10|127)\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^192\.0\.0\./.test(ip)) return true; // zakres specjalny IANA (m.in. DS-Lite u operatorów)
  if (/^169\.254\./.test(ip)) return true;
  const m172 = ip.match(/^172\.(\d+)\./);
  if (m172 && +m172[1] >= 16 && +m172[1] <= 31) return true;
  const cgnat = ip.match(/^100\.(\d+)\./); // CGNAT 100.64.0.0/10
  if (cgnat && +cgnat[1] >= 64 && +cgnat[1] <= 127) return true;
  return false;
}

// ── Parsowanie wyjścia tracert ────────────────────────────────────────────────

// Linia hopa wygląda tak (niezależnie od języka systemu):
//   "  4    12 ms    11 ms    12 ms  84.116.253.109"
// albo przy braku odpowiedzi:
//   "  3     *        *        *     Upłynął limit czasu żądania."
function parseHopLine(line) {
  const m = line.match(/^\s*(\d+)\s+(.*)$/);
  if (!m) return null;
  const rest = m[2];
  if (!/ms|\*/.test(rest)) return null;

  const n = parseInt(m[1], 10);
  const ipMatch = rest.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
  if (!ipMatch) return { n, timeout: true };

  const rtts = [...rest.matchAll(/<?\s*(\d+)\s*ms/g)].map((x) => parseInt(x[1], 10));
  return { n, ip: ipMatch[1], rtt: rtts.length ? Math.min(...rtts) : null };
}

// Szybka sonda: czy host w ogóle odpowiada na ICMP (2 pakiety, po 800 ms)
function probeReachable(ip) {
  return new Promise((resolve) => {
    const probe = spawn('ping', ['-n', '2', '-w', '800', ip], { windowsHide: true });
    const timer = setTimeout(() => probe.kill(), 5000);
    let out = '';
    probe.stdout.on('data', (chunk) => (out += chunk.toString('latin1')));
    probe.on('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
    probe.on('close', () => {
      clearTimeout(timer);
      resolve(/ttl=/i.test(out)); // linie odpowiedzi zawierają "TTL="
    });
  });
}

function sanitizeHost(raw) {
  let h = String(raw).trim();
  h = h.replace(/^[a-z][a-z0-9+.-]*:\/\//i, ''); // protokół
  h = h.split('/')[0].split('?')[0].split('#')[0];
  h = h.replace(/^.*@/, ''); // userinfo
  h = h.replace(/:\d+$/, ''); // port
  if (!h || h.length > 253) return null;
  if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(h)) return null;
  return h.toLowerCase();
}

// ── Endpoint SSE: /api/trace?host=… ──────────────────────────────────────────

async function handleTrace(req, res, params) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const host = sanitizeHost(params.get('host') || '');
  if (!host) {
    send('error', { message: 'Invalid address. Try e.g. google.com' });
    res.end();
    return;
  }

  if (activeTraces >= MAX_CONCURRENT_TRACES) {
    send('error', { message: 'Too many concurrent traces — try again in a moment.' });
    res.end();
    return;
  }
  activeTraces++;

  let closed = false;
  let child = null;
  let killTimer = null;
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    activeTraces--;
    clearTimeout(killTimer);
  };

  res.on('error', () => {}); // zapis po zerwaniu połączenia nie może ubić serwera
  // 'close' na odpowiedzi = klient się rozłączył (albo strumień się skończył)
  res.on('close', () => {
    closed = true;
    release();
    if (child) child.kill();
  });

  // 1. Skąd startujemy — lokalizacja publicznego IP użytkownika
  send('status', { message: 'Determining your location…' });
  const origin = await geolocate('');
  if (closed) return;
  if (origin) send('origin', { geo: origin });

  // 2. DNS
  send('status', { message: `Resolving ${host}…` });
  let targetIp;
  try {
    ({ address: targetIp } = await dns.lookup(host, { family: 4 }));
  } catch {
    send('error', { message: `Could not resolve "${host}". Check the address.` });
    res.end();
    return;
  }
  if (closed) return;
  send('resolved', { host, ip: targetIp });
  send('status', { message: `Tracing route to ${host} [${targetIp}]…` });

  // Równolegle sprawdzamy, czy cel w ogóle odpowiada na ping — od tego zależy,
  // czy wolno nam wcześniej zakończyć martwy ogon trasy.
  const targetReachable = probeReachable(targetIp);

  // 3. tracert — hopy lecą do klienta na żywo, w kolejności
  child = spawn('tracert', ['-d', '-4', '-w', '600', '-h', '30', targetIp], {
    windowsHide: true,
  });
  killTimer = setTimeout(() => {
    if (child) child.kill();
  }, TRACE_HARD_TIMEOUT_MS);

  let buffer = '';
  let pipeline = Promise.resolve();
  let hopsSent = 0;
  let sawTarget = false;
  let consecutiveTimeouts = 0;
  let earlyStopped = false;
  let lastProbing = 0;

  const processLine = async (line) => {
    if (closed) return;
    const hop = parseHopLine(line);
    if (!hop) return;

    if (hop.timeout) {
      hopsSent++;
      consecutiveTimeouts++;
      send('hop', { hop: hop.n, timeout: true });
      if (!earlyStopped && consecutiveTimeouts >= EARLY_STOP_UNREACHABLE) {
        const limit = (await targetReachable) ? EARLY_STOP_REACHABLE : EARLY_STOP_UNREACHABLE;
        if (consecutiveTimeouts >= limit) {
          earlyStopped = true;
          child.kill();
        }
      }
      return;
    }

    consecutiveTimeouts = 0;
    const priv = isPrivateIp(hop.ip);
    const geo = priv ? null : await geolocate(hop.ip);
    if (closed) return;
    const isTarget = hop.ip === targetIp;
    if (isTarget) sawTarget = true;
    hopsSent++;
    send('hop', {
      hop: hop.n,
      ip: hop.ip,
      rtt: hop.rtt,
      kind: priv ? 'private' : 'public',
      geo,
      isTarget,
    });
  };

  child.stdout.on('data', (chunk) => {
    buffer += chunk.toString('latin1'); // parsujemy tylko znaki ASCII (cyfry, IP, "ms")
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trimEnd(); // tracert kończy linie CRLF
      buffer = buffer.slice(idx + 1);
      pipeline = pipeline
        .then(() => processLine(line))
        .catch((err) => console.error('Hop processing error:', err));
    }
    // Niedokończona linia = tracert właśnie sonduje kolejny przeskok.
    // Informujemy frontend na bieżąco, żeby UI nigdy nie stał w miejscu.
    const partial = buffer.match(/^\s*(\d+)\s/);
    if (partial && !closed) {
      const probingHop = parseInt(partial[1], 10);
      if (probingHop !== lastProbing) {
        lastProbing = probingHop;
        send('probing', { hop: probingHop });
      }
    }
  });

  child.on('error', () => {
    if (!closed) {
      send('error', { message: 'Could not run the tracert command.' });
      res.end();
    }
  });

  child.on('close', (code) => {
    pipeline = pipeline
      .then(async () => {
        if (closed) return;
        if (code !== 0 && hopsSent === 0 && !earlyStopped) {
          // tracert nie dał żadnego przeskoku i zakończył się błędem
          send('error', { message: `tracert exited with an error (code ${code}).` });
          res.end();
          return;
        }
        // Trasa nie doszła do celu — dorysujmy chociaż jego położenie,
        // żeby mapa zawsze pokazywała pełną podróż (odcinek będzie przerywany)
        if (!sawTarget && hopsSent > 0 && !isPrivateIp(targetIp)) {
          const geo = await geolocate(targetIp);
          if (geo && !closed) send('target', { ip: targetIp, geo });
        }
        if (closed) return;
        // reached=false: trasa częściowa — cel nie potwierdził (np. nie odpowiada na ICMP)
        // earlyStop=true: ucięte po serii niemych przeskoków
        send('done', {
          reached: sawTarget,
          hops: hopsSent,
          code,
          earlyStop: earlyStopped,
          targetPingable: await targetReachable,
        });
        res.end();
      })
      .catch((err) => {
        console.error('Route finalization error:', err);
        if (!closed) res.end();
      });
  });
}

// ── Endpoint: /api/ping?ip=… ─────────────────────────────────────────────────

function handlePing(req, res, params) {
  let finished = false;
  const respond = (code, obj) => {
    if (finished) return;
    finished = true;
    res.writeHead(code, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(JSON.stringify(obj));
  };

  const ip = String(params.get('ip') || '');
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) {
    return respond(400, { error: 'Invalid IP address.' });
  }
  if (activePings >= MAX_CONCURRENT_PINGS) {
    return respond(429, { error: 'Too many concurrent pings — try again in a moment.' });
  }

  activePings++;
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    activePings--;
    clearTimeout(killTimer);
  };

  const child = spawn('ping', ['-n', '4', '-w', '1500', ip], { windowsHide: true });
  const killTimer = setTimeout(() => child.kill(), PING_HARD_TIMEOUT_MS);

  res.on('error', () => {});
  res.on('close', () => {
    release();
    child.kill();
  });

  let out = '';
  child.stdout.on('data', (chunk) => {
    out += chunk.toString('latin1'); // parsujemy tylko ASCII (cyfry, "ms", "TTL")
  });

  child.on('error', () => {
    release();
    respond(500, { error: 'Could not run the ping command.' });
  });

  child.on('close', () => {
    release();
    // Czasy bierzemy wyłącznie z linii odpowiedzi (zawierają "TTL="),
    // bo podsumowanie ping też zawiera wartości "= Nms" i by je zdublowało
    const times = out
      .split(/\r?\n/)
      .filter((line) => /ttl=/i.test(line))
      .map((line) => {
        const m = line.match(/[=<](\d+)\s*ms/i);
        return m ? parseInt(m[1], 10) : null;
      })
      .filter((t) => t !== null);

    const sent = 4;
    const received = times.length;
    if (received === 0) {
      return respond(200, { ip, sent, received: 0, times: [] });
    }

    const min = Math.min(...times);
    const max = Math.max(...times);
    const avg = Math.round((times.reduce((a, b) => a + b, 0) / received) * 10) / 10;
    const ttlMatch = out.match(/ttl=(\d+)/i);
    respond(200, {
      ip,
      sent,
      received,
      lostPct: Math.round(((sent - received) / sent) * 100),
      times,
      min,
      avg,
      max,
      jitter: max - min,
      ttl: ttlMatch ? parseInt(ttlMatch[1], 10) : null,
    });
  });
}

// ── Pliki statyczne ───────────────────────────────────────────────────────────

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://unpkg.com",
  "style-src 'self' https://unpkg.com https://fonts.googleapis.com 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://*.basemaps.cartocdn.com https://unpkg.com",
  "connect-src 'self' https://cdn.jsdelivr.net",
].join('; ');

// GET zwraca aktualny licznik; POST zwiększa go (nowa wizyta) i zapisuje na dysk
function handleVisits(req, res) {
  if (req.method === 'POST') {
    visitCount++;
    persistVisits();
  }
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  res.end(JSON.stringify({ count: visitCount }));
}

function serveStatic(pathname, res) {
  const rel = pathname === '/' ? 'index.html' : pathname.slice(1);
  const file = path.join(PUBLIC_DIR, path.normalize(rel));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(file).toLowerCase();
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    };
    if (ext === '.html') headers['Content-Security-Policy'] = CSP;
    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname === '/api/trace') {
    handleTrace(req, res, url.searchParams);
  } else if (url.pathname === '/api/ping') {
    handlePing(req, res, url.searchParams);
  } else if (url.pathname === '/api/visits') {
    handleVisits(req, res);
  } else {
    serveStatic(url.pathname, res);
  }
});

loadVisits();
server.listen(PORT, HOST, () => {
  console.log(`HopTracker running at  http://${HOST}:${PORT}`);
});
