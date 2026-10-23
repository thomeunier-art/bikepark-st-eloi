// Service worker du jeu « Bikepark St Éloi » : garde le jeu sur l'iPhone pour qu'il se lance
// vite et fonctionne hors connexion. VERSION est remplacée à chaque publication (publier.sh) :
// une nouvelle version crée un nouveau cache et supprime l'ancien.
const VERSION = "2026-10-23-1906";
const CACHE = "bikepark-st-eloi-" + VERSION;
const FICHIERS = [
  "./",
  "index.html",
  "index.js?v=" + VERSION,
  "index.wasm?v=" + VERSION,
  "index.pck?v=" + VERSION,
  "index.audio.worklet.js",
  "index.audio.position.worklet.js",
  "app.webmanifest",
  "logo-st-eloi.png",
  "logo-st-eloi-128.png",
  "logo-st-eloi-apple.png",
  "logo-st-eloi-144.png",
  "logo-st-eloi-180.png",
  "logo-st-eloi-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k.startsWith("bikepark-st-eloi-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Page d'accueil : réseau d'abord (pour recevoir les mises à jour), copie locale hors connexion.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((rep) => { const copie = rep.clone(); caches.open(CACHE).then((c) => c.put("index.html", copie)); return rep; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  // Fichiers du jeu (adresses numérotées par version) : copie locale d'abord, réseau sinon.
  e.respondWith(
    caches.match(req).then((trouve) => trouve || fetch(req).then((rep) => {
      if (rep.ok && new URL(req.url).origin === location.origin) {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(req, copie));
      }
      return rep;
    }))
  );
});
