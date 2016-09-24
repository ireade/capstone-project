function NotificationsService(serviceWorkerReg) {
    this.serviceWorkerReg = serviceWorkerReg;
}
NotificationsService.prototype.subscribe = function() {
    return new Promise((resolve, reject) => {
        this.serviceWorkerReg.pushManager
            .subscribe({userVisibleOnly: true})
            .then((sub) => this._sendSubscriptionToDatabase('POST', sub))
            .then(() => resolve())
            .catch(() => reject())
    })
};
NotificationsService.prototype.unsubscribe = function() {
    return new Promise((resolve, reject) => {
        this.serviceWorkerReg.pushManager.getSubscription()
            .then((sub) => {
                sub.unsubscribe()
                    .then(() => this._sendSubscriptionToDatabase('DELETE', sub))
                    .then(() => resolve())
                    .catch(() => reject());
            })
    })
};

NotificationsService.prototype._sendSubscriptionToDatabase = function(method, sub) {
    const uid = sub.endpoint.split('gcm/send/')[1];
    const info = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            uid: uid
        }
    };
    return new Promise((resolve, reject) => {
        fetch('https://timigod-notify.herokuapp.com/uid', info)
            .then((res) => res.json() )
            .then((res) => {
                if ( res.errors ) { reject(); }
                resolve();
            })
    });
};