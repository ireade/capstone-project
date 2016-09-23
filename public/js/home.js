'use strict';

displayNavigationTemplate({ isHome: true });

/* **************

 Local Publish Time

 *************** */
var setTimezoneLink = document.querySelector('.setTimezoneLink');
var localTimeElement = document.querySelector('.localTime');

function getLocalPublishTime(coords) {
    var url = 'http://api.timezonedb.com/v2/get-time-zone?key=7KIGVA90V0ES&format=json&by=position&lat=' + coords.latitude + '&lng=' + coords.longitude;
    return new Promise(function (resolve) {
        return fetch(url).then(function (response) {
            return response.json();
        }).then(function (response) {
            var localTimeOnTuesday = 1474365600 - response.gmtOffset;
            localTimeOnTuesday = moment.unix(localTimeOnTuesday).format('ha');
            localTimeOnTuesday = localTimeOnTuesday + ' ' + (response.nextAbbreviation ? response.nextAbbreviation : 'in ' + response.countryName);
            resolve(localTimeOnTuesday);
        });
    });
}

function addPublishTimeToDatabase(time) {
    var setting = {
        setting: 'publishTime',
        value: time
    };
    Database.add('Settings', setting);
}

function getPublishTimeSetting() {
    return new Promise(function (resolve, reject) {
        Database.search('Settings', false, 'setting', 'publishTime').then(function (publishTimeSetting) {
            return resolve(publishTimeSetting);
        }).catch(function (err) {
            return reject(err);
        });
    });
}

function displayLocalTime(localPublishTime) {
    localTimeElement.innerHTML = 'That\'s ' + localPublishTime + '.';
    setTimezoneLink.innerHTML = 'Reset Local Time';
}

setTimezoneLink.addEventListener('click', function (e) {
    e.preventDefault();
    setTimezoneLink.innerHTML = 'Checking...';
    navigator.geolocation.getCurrentPosition(function (position) {
        getLocalPublishTime(position.coords).then(function (localPublishTime) {
            addPublishTimeToDatabase(localPublishTime);
            displayLocalTime(localPublishTime);
        });
    });
});

getPublishTimeSetting().then(function (publishTimeSetting) {
    if (publishTimeSetting.length === 0) return;
    displayLocalTime(publishTimeSetting[0].value);
});

/* **************

 Push Notifications

 *************** */
var notificationsButton = document.querySelector('.btn-notifications');

function getNotificationsSetting() {
    return new Promise(function (resolve, reject) {
        Database.search('Settings', false, 'setting', 'allowNotifications').then(function (notificationsSetting) {
            return resolve(notificationsSetting);
        }).catch(function (err) {
            return reject(err);
        });
    });
}

function toggleNotificationsSetting() {
    getNotificationsSetting().then(function (notificationsSetting) {
        if (notificationsSetting.length === 0) {
            notificationsSetting = { value: false };
        } else {
            notificationsSetting = notificationsSetting[0];
        }
        var newSetting = {
            setting: 'allowNotifications',
            value: !notificationsSetting.value
        };
        Database.add('Settings', newSetting);
        notificationsButton.classList.toggle('btn-notifications--on');
    });
}

notificationsButton.addEventListener('click', function () {
    toggleNotificationsSetting();
});

getNotificationsSetting().then(function (notificationsSetting) {
    if (notificationsSetting.length === 0) return;
    if (notificationsSetting[0].value === true) {
        notificationsButton.classList.add('btn-notifications--on');
    }
});