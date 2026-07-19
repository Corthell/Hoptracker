# 🌐 HopTracker

Animowana wizualizacja trasy, jaką pokonuje Twoje żądanie w internecie. Wpisujesz adres
(np. `google.com`), a aplikacja wykonuje **prawdziwy traceroute**, geolokalizuje kolejne
serwery pośrednie i rysuje trasę na ciemnej mapie świata — hop po hopie, świecącą,
animowaną linią po łukach wielkiego koła.

## Jak to działa

1. **Backend (Node.js, bez zależności)** — uruchamia systemowe polecenie `tracert`,
   parsuje jego wyjście na żywo, geolokalizuje publiczne adresy IP przez
   [ip-api.com](http://ip-api.com) i streamuje wyniki do przeglądarki przez
   Server-Sent Events (SSE).
2. **Frontend (Leaflet + vanilla JS)** — odbiera hopy na bieżąco i animuje trasę
   na mapie: świecąca linia, wędrujący „pakiet”, pulsujące markery serwerów
   z tooltipami oraz panel z listą wszystkich przeskoków.

## Uruchomienie

Wymagany **Windows** (backend używa systemowego polecenia `tracert`) oraz
Node.js ≥ 18 (bez `npm install` — zero zależności).

```
npm start
```

Następnie otwórz w przeglądarce: **http://localhost:3000**

## Warto wiedzieć

- Hopy oznaczone `∗ ∗ ∗` to routery, które nie odpowiadają na pakiety ICMP —
  to normalne i nie przerywa śledzenia.
- Gdy sam cel nie odpowiada na ping (np. microsoft.com blokuje ICMP), śledzenie
  kończy się automatycznie po serii niemych przeskoków, zamiast sondować do 30 —
  do pingowalnych celów trasa zawsze biegnie do końca, niezależnie od niemych
  routerów po drodze.
- Adresy prywatne (np. `192.168.x.x`, CGNAT `100.64+.x.x`) to Twoja sieć lokalna /
  sieć operatora — pojawiają się na liście, ale nie na mapie.
- Geolokalizacja IP jest przybliżona (zwykle trafia w miasto/region, nie w budynek).
  Uwaga: adresy dużych firm (np. Google) bywają zarejestrowane na siedzibę główną —
  hop z RTT 14 ms pokazany w Mountain View fizycznie stoi znacznie bliżej Ciebie.
- Darmowy limit ip-api.com to 45 zapytań/min — przy bardzo częstym śledzeniu
  geolokalizacja może chwilowo zwracać „lokalizacja nieznana” (wyniki są cache'owane).
- Trasa może się różnić między uruchomieniami — routing w internecie jest dynamiczny.
- Serwer nasłuchuje domyślnie tylko na `127.0.0.1` (zmienna `HOST` pozwala to nadpisać)
  i obsługuje maksymalnie 3 równoczesne śledzenia.
- Darmowe API ip-api.com działa wyłącznie po HTTP — dane geolokalizacyjne są po stronie
  frontendu escapowane, ale przy publikacji aplikacji warto przejść na dostawcę HTTPS.
