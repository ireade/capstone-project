function NotificationsService(serviceWorkerReg) {
    this.serviceWorkerReg = serviceWorkerReg;
    this.sub;
    this.uid;
}
NotificationsService.prototype.subscribe = function() {
    if ( this.isSubscribed ) { return; }
    this.serviceWorkerReg.pushManager
        .subscribe({userVisibleOnly: true})
        .then((pushSubscription) => {
            this.sub = pushSubscription;
            this.isSubscribed = true;
            this._sendUIDToAPI();
        });
};
NotificationsService.prototype.unsubscribe = function() {
    if ( !this.isSubscribed ) { return; }
    this.sub
        .unsubscribe()
        .then((event) => {
            this.isSubscribed = false;
            console.log('Unsubscribed!', event);
        })
        .catch((error) => {
            console.log('Error unsubscribing', error);
        });
};

NotificationsService.prototype._sendUIDToAPI = function() {
    this.uid = this.sub.endpoint.split('gcm/send/')[1];

    const info = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            uid: this.uid
        }
    };

    console.log(info);

    fetch('https://timigod-notify.herokuapp.com/uid', info)
        .then((res) => res.json() )
        .then((res) => {
            console.log(res);
            if ( res.errors ) { return; }
            console.log("Succesfully added uid");
        })
};
