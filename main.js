window.onload = init;

const NOTIF_TITLE = "Mindfulness Reminder";
const DEFAULT_INTERVAL = 5;

function requestNotificationPermission() {
    let flag; // final value to return. (Either true or false)
    if (!("Notification" in window)) {
        createAlert("Error", "This browser does not support desktop notifications", 'error');
    }
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        flag = true;
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            flag = !(permission === 'denied');
            if (permission === 'denied') {
                createAlert('Error', 'Cannot continue without notification permissions.', 'error');
            }
        }).catch(err => {
            createAlert("Error", err, "error");
        })
    }
    return flag;
}

function sendMindfulnessNotification(body) {
    requestNotificationPermission();
    let notifOptions = {
        requireInteraction: true, // set the notification to not disappear until user clicks it.
        body: body,
        actions: []
    }
    let notification = new Notification(NOTIF_TITLE, notifOptions);
}

function dispatchManager() {
    let timeout = document.querySelector('#interval');
    let text = document.querySelector("#message");
    let time = parseInt(timeout.value, 10) * 60;
    let msg = text.value;

    if (window.currentAlertManager) {
        window.currentAlertManager.terminate();
    }
    let mgr = new AlertWorkerManager("#audio", time, true);
    mgr.setMessage(msg);
    mgr.begin(DEFAULT_INTERVAL);
    window.currentAlertManager = mgr;
    createAlert("Running...", "The mindfulness timer is running.", "info", function() {
        mgr.terminate();
        hideAlert();
    }, "Stop it")
}

function init() {
    initialiseAlert();
    let btn = document.querySelector("#remind-me");
    btn.onclick = function(e) {
        e.preventDefault();
        dispatchManager();
    }
    window.focused = true;

    window.onblur = function() {
        window.focused = false;
    }
    window.onfocus = function() {
        window.focused = true;
    }
}

function initialiseAlert() {
    document.getElementById('alert-close').onclick = hideAlert();
}

function createAlert(title, body, mode, callback, callbackLabel) {
    document.getElementById('mask').style.display = 'flex';
    let close = document.getElementById('alert-close')
    close.style.display = 'block';
    if (mode === 'error') {
        close.style.display = 'none';
        if (!callback) {
            document.getElementById('alert-footer').style.display = 'none';
        }
    } else if (mode === 'completion') {
        close.onclick = function() {
            let audio = document.querySelector("#audio");
            audio.pause();
            audio.currentTime = 0;
            hideAlert();
        }
    } else {
        close.onclick = hideAlert;
    }

    if (callback) {
        let action = document.getElementById('alert-action');
        action.style.display = 'block';
        action.innerHTML = callbackLabel;
        action.onclick = function() {
            callback();
        }
    }

    document.getElementById('alert-header').innerHTML = title;
    document.getElementById('alert-body').innerHTML = body;
}

function hideAlert() {
    document.getElementById('mask').style.display = 'none';
}

class AlertWorkerManager {
    /*
     * @param duration: a length of time in seconds
     */

    constructor(audio, duration, heartbeat) {
        this.msg = '';
        this.audio = document.querySelector(audio);

        if (this.audio) {
            this.audio.loop = true;
        } else {
            throw new Error("Invalid audio selector specified");
        }

        if (!window.Worker) {
            throw new Error("Web Workers don't seem to be supported in your browser!");
        }

        this.begun = false;
        this.worker = new Worker('worker.js');

        if (heartbeat) {
            this.worker.postMessage({
                heartbeat: heartbeat
            })
        }

        this.worker.postMessage({
            duration: duration
        });

        let that = this;
        this.worker.onmessage = function(e) {
            let data = e.data;
            if (data.done) {
                that.worker.terminate();
                that.audio.play();
                sendMindfulnessNotification(that.msg);
                that.alertDone();
            } else if (data.isHeartbeat) {
                console.log("Heartbeat from worker:", data.msg)
                window.focus();
            }
        }
    }

    begin(interval) {
        this.begun = true;
        this.worker.postMessage({
            begin: true,
            interval: interval || 15 /* seconds */
        })
    }

    terminate() {
        if (!this.begun) return;
        this.worker.terminate();
    }

    setMessage(str) {
        this.msg = str;
    }

    alertDone() {
        let that = this;
        createAlert("Done!",
            `<div>${that.msg}</div>
            <div>Press snooze to stop the alarm and start a new one. Simply close the tab to stop the timer :P</div>
        `, "completion",
            function() {
                that.audio.pause();
                that.audio.currentTime = 0;
                hideAlert();
                setTimeout(function() {
                    dispatchManager();
                }, 1000);
            }, "Snooze"
        );
    }
}