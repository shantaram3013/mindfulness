onmessage = function(e) {
    let data = e.data;

    if (data.heartbeat) { // if the data contains an attribute called heartbeat, enable the heartbeat functionality
        this.heartbeat = true;
    }

    if (data.duration) {
        this.duration = data.duration; // if the data contains a duration attribute modify the duration
        // TODO: make it impossible to change duration while we've begun?
    }

    if (data.begin) { // if the data contains a "begin" attribute, start checking the time every data.interval seconds.
        this.time = new Date();
        this.interval = setInterval(function() {
            let elapsed = (new Date() - this.time) / 1000; // millis to seconds
            if (Math.round(elapsed) >= this.duration) {
                postMessage({
                    done: true
                }); // send the "done" message to the main script
                clearInterval(this.interval); // stop the interval so we don't continue checking the time and stuff
            }
            if (this.heartbeat) { // if heartbeat is enabled, send a simple message back to the main thread containing some info about the worker every few seconds.
                postMessage({
                    isHeartbeat: true,
                    msg: `created ${this.time}, time elapsed = ${elapsed}`
                })
            }
        }, data.interval * 1000);
    }
}