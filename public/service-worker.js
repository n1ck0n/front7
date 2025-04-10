const CACHE_NAME = 'notes-app-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'icon-192.png',  // Убедитесь, что файл существует
  'icon-512.png',  // Убедитесь, что файл существует
  '/static/js/main.js',
  '/static/css/main.css'
];

// Устанавливаем сервис-воркер
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(FILES_TO_CACHE)
          .catch((error) => {
            console.error('Ошибка при добавлении файлов в кэш:', error);
          });
      })
  );
});

// Обновляем сервис-воркер
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Обрабатываем запросы и пытаемся получить их из кэша
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Если ресурс найден в кэше, возвращаем его
        if (cachedResponse) {
          return cachedResponse;
        }

        // Если ресурса нет в кэше, делаем запрос к сети
        return fetch(event.request);
      })
  );
});
