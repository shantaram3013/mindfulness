const NOTIF_TITLE = "Mindfulness Reminder"; // default notification title.

function requestNotificationPermission() {
    let flag; // final value to return. (Either true or false)
    if (!("Notification" in window)) {
        createAlert("Error", "This browser does not support desktop notifications", 'error');
    }
    // check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        flag = true;
    } else if (Notification.permission !== "denied") {
        // try asking for permissions
        Notification.requestPermission().then(permission => {
            flag = !(permission === 'denied');
            if (permission === 'denied') {
                // :(
                // "error"-type dialogs aren't closeable and block the site, so you can't continue using it without notif permissions
                createAlert('Error', 'Cannot continue without notification permissions.', 'error');
            }
        }).catch(err => {
            createAlert("Error", err, "error");
        })
    }
    return flag;
}
// send the notification
function sendMindfulnessNotification(body) {
    requestNotificationPermission(); // technically only need to do this once at load or whatever, but it's for safety
    let notifOptions = {
        requireInteraction: true, // set the notification to not disappear until user clicks it.
        body: body,
        actions: []
    }
    let notification = new Notification(NOTIF_TITLE, notifOptions); // spawn the notification
    // store it in case we want to add something later, i guess
}