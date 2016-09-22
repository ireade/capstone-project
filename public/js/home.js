'use strict';

/* **************************
    
    Home
  
************************** */

/* **************
    Key Elements
*************** */

var navHTML = MyApp.templates.nav({ isHome: true });
document.querySelector('.site-nav').innerHTML = navHTML;

/* **************
    Database
*************** */

//const offlineFXDatabase = new IDB();


/* **************
    Service Worker

*************** */

// if ( !('serviceWorker' in navigator) ) {
//
//     new Toast('error', "Your browser doesn't support some great features to really take advantage of this application. Why not try using Chrome instead?");
//
// } else {
//
//     myFX.init();
//
//     navigator.serviceWorker
//     .register('./service-worker.js')
//     .then(function(reg) {
//         console.log('Service Worker Registered', reg);
//     })
//     .catch(function(err) {
//         console.log('Service Worker Failed to Register', err);
//     });
//
// }