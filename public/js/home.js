'use strict';

/* **************************

    Home

************************** */

/* **************
    Key Elements
*************** */

displayNavigationTemplate({ isHome: true });

var setTimezoneLink = document.querySelector('.setTimezoneLink');
setTimezoneLink.addEventListener('click', function (e) {

    e.preventDefault();

    console.log("clicked");

    navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position.coords);
        getLocalPublishTime(position.coords);
    });

    // return false;
});

function getLocalPublishTime(coords) {

    var timestamp = 1331161200;
    timestamp = Date.now();

    var url = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + coords.latitude + ',' + coords.longitude + '&timestamp=' + timestamp + '&key=AIzaSyA2ICxItvQqMWEXFvH0Lh_FgarsfeosshY';

    fetch(url).then(function (response) {
        return response.json();
    }).then(function (response) {

        console.log(response);

        var localTimestamp = timestamp + response.dstOffset + response.rawOffset;

        var m = moment(localTimestamp).calendar();

        console.log(m);
    });
}

getLocalPublishTime({
    latitude: 6.4308871,
    longitude: 3.4388647999999997
});

function addPublishTimeToDatabase() {
    var setting = {
        setting: 'publishTime',
        value: 'stuff'
    };
    Database.add('Settings', setting);
}

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