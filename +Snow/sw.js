{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const CACHE_NAME = "skiwx-v1";\
const APP_SHELL = [\
  "./",\
  "./index.html",\
  "./manifest.webmanifest",\
  "./sw.js",\
  "./icon-192.png",\
  "./icon-512.png"\
];\
\
self.addEventListener("install", (event) => \{\
  event.waitUntil(\
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))\
  );\
  self.skipWaiting();\
\});\
\
self.addEventListener("activate", (event) => \{\
  event.waitUntil(\
    caches.keys().then((keys) =>\
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))\
    )\
  );\
  self.clients.claim();\
\});\
\
// Network-first for Open-Meteo; cache fallback\
self.addEventListener("fetch", (event) => \{\
  const req = event.request;\
  const url = new URL(req.url);\
\
  // Only handle GET\
  if (req.method !== "GET") return;\
\
  // For API calls: network-first, fallback to cache\
  if (url.hostname.includes("open-meteo.com")) \{\
    event.respondWith(\
      fetch(req)\
        .then((res) => \{\
          const copy = res.clone();\
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));\
          return res;\
        \})\
        .catch(() => caches.match(req))\
    );\
    return;\
  \}\
\
  // For app shell: cache-first\
  event.respondWith(\
    caches.match(req).then((cached) => cached || fetch(req))\
  );\
\});}