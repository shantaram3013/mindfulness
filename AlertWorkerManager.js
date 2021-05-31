const DEFAULT_INTERVAL = 5;

class AlertWorkerManager {
    /*
     * @param duration: a length of time in seconds
     */

    constructor(audio, duration, heartbeat) {
        this.msg = ''; // message to send on completion. is blank by default, meant to be set with setMessage() before begin() is called
        this.audio = document.querySelector(audio); // get the audio element so we can play and pause it

        if (!this.audio) {
            throw new Error("Invalid audio selector specified"); // this is probably the error if audio is null
        }

        if (!window.Worker) {
            throw new Error("Web Workers don't seem to be supported in your browser!"); // F
        }

        this.begun = false;
        this.worker = new Worker('worker.js');

        if (heartbeat) { // if heartbeat option was supplied, enable heartbeat functionality of web worker
            this.worker.postMessage({
                heartbeat: heartbeat
            })
        }

        this.worker.postMessage({ // set duration after which alarm is to ring
            duration: duration
        });

        let that = this; // function() changes the scope of `this`
        this.worker.onmessage = function(e) {
            let data = e.data;
            if (data.done) {
                that.worker.terminate(); // terminate the worker so it doesn't keep sending heartbeats and checking the time
                that.audio.play(); // play the alarm
                sendMindfulnessNotification(that.msg); // send notification
                that.alertDone();
            } else if (data.isHeartbeat) {
                console.log("Heartbeat from worker:", data.msg)
                window.focus();
            }
        }
    }

    /*
        Begin the alarm script.
        @param interval - number of seconds to wait between checking the time
    */
    begin(interval) {
        this.begun = true;
        this.worker.postMessage({
            begin: true, // sending a message with a defined attribute called "begin" starts the worker.
            interval: interval || 15 /* seconds */
        })
    }

    /*
        terminate the web worker
    */
    terminate() {
        if (!this.begun) return;
        this.worker.terminate();
    }

    setMessage(str) {
        this.msg = str;
    }

    alertDone() {
        let that = this; // function() changes the scope of `this` and I'm scared to use arrow functions
        createAlert("Done!",
            `<div style='font-weight: bold'>${that.msg}</div>
            <div>(Press snooze to stop the alarm and start a new one. "Stop it" will stop the alarm permanently.)</div>`, // message
            "completion", // dialog type
            function() { // snooze button callback
                that.audio.pause();
                that.audio.currentTime = 0; // pause and reset audio
                hideAlert(); // hide the alert
                setTimeout(function() {
                    dispatchManager(); // dispatch the next manager
                }, 1000);
            }, "Snooze" // snooze button label
        );
    }
}