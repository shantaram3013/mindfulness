onmessage = function(e) {
    let data = e.data;

    if (data.heartbeat) {
        this.heartbeat = true;
    }

    if (data.duration) {
        this.duration = data.duration;
    }

    if (data.begin) {
        this.time = new Date();
        this.interval = setInterval(function() {
            let elapsed = (new Date() - this.time) / 1000;
            if (Math.round(elapsed) >= this.duration) {
                postMessage({
                    done: true
                });

                clearInterval(this.interval);
            }
            if (this.heartbeat) {
                postMessage({
                    isHeartbeat: true,
                    msg: `created ${this.time}, time elapsed = ${elapsed}`
                })
            }
        }, data.interval * 1000);
    }
}