const CACHE_NAME = "esmarthome-cache-v2"; // غيّر الرقم عند أي تحديث
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json"
];

// 📌 تثبيت Service Worker وتخزين الملفات الأساسية
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // يخلي النسخة الجديدة تشتغل فورًا
});

// 📌 تفعيل Service Worker وحذف الكاش القديم
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // يسيطر على كل التابات المفتوحة
});

// 📌 استراتيجية الجلب: Network First مع fallback للكاش
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // نخزن نسخة جديدة في الكاش
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // fallback للكاش لو مافيش نت
  );
});
