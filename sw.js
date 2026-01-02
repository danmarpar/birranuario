// sw.js - Service Worker for Birra Dashboard PWA

const CACHE_NAME = 'birra-dashboard-v1';
const REPO_NAME = '/birranuario'; 
const urlsToCache = [
    REPO_NAME,
    REPO_NAME + '/index.html',
    REPO_NAME + '/styles.css',
    REPO_NAME + '/app.js',
    REPO_NAME + '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
