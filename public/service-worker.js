// Service Worker Toolbox
importScripts('js/lib/sw-toolbox/sw-toolbox.js');

// Offline Google Analytics
importScripts('js/lib/sw-offline-google-analytics.js');
//goog.offlineGoogleAnalytics.initialize();

// Files to precache
const precacheFiles = [
	'./',
	'./index.html',
	'./article.html',
	'./latest.html',
	'./saved.html',

	'./css/main.css',
	'https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',
	'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,300,300italic,700,900,900italic,700italic,400italic',

	'./js/main.js',
	'./js/utils.js',
	'./js/article.js',
	'./js/home.js',
	'./js/latest.js',
	'./js/saved.js',
	'./js/templates.js',
	'./js/lib/lib.js'
];

//toolbox.precache(precacheFiles);

// Install and Activate events
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()) );
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()) );

// Fetch events
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then( (response) => response || fetch(event.request) )
	);
});