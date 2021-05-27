window.onload = init;

function init() {
    let btn = document.querySelector("#remind-me");
    btn.onclick = function(e) {
        e.preventDefault();
        // TODO: request notification permission and sound permissions
        btn.blur();
    }

    window.focused = true;

    window.onblur = function() {
        window.focused = false;
    }
    window.onfocus = function() {
        window.focused = true;
    }
}

class AlertWorkerManager {
    /*
     * @param duration: a length of time in seconds
     */
    constructor(duration, heartbeat) {
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
                console.log("Time's up!");
                that.worker.terminate();
                // TODO: Play sound and send notif
            } else if (data.isHeartbeat) {
                console.log("Heartbeat from worker: ", data.msg)
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
}