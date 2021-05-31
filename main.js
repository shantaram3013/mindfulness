window.onload = init;

function dispatchManager() {
    let timeout = document.querySelector('#interval');
    let text = document.querySelector("#message"); // message to display
    let time = parseInt(timeout.value, 10) * 60; // alarm interval, minutes to seconds conversion
    let msg = text.value;

    // if there's a manager currently running, kill it for safety
    if (window.currentAlertManager) {
        window.currentAlertManager.terminate();
    }
    // instantiate and populate the new manager with data
    let mgr = new AlertWorkerManager("#audio", time, true);
    mgr.setMessage(msg);
    mgr.begin(DEFAULT_INTERVAL); // send a heartbeat/check the time every DEFAULT_INTERVAL seconds
    window.currentAlertManager = mgr;
    // spawn alert to allow stopping the timer.
    createAlert("Running...", "The mindfulness timer is running.", "error", function() {
        mgr.terminate();
        hideAlert();
    }, "Stop it");
}

function testText(elem, elemName, callback) {
    if (elem.value) {
        callback();
    } else {
        createAlert("Error", `Please type in a value for ${elemName}.`, "info");
    }
}

function getRandomChoice(arr) {
    return arr[Math.round(Math.random() * 100) % arr.length];
}

function init() {
    initialiseAlert(); // initialise the alert dialog's settings

    // set the button's click action
    let text = document.querySelector("#message"); // message to display

    let ideas = document.querySelector("#ideas");
    for (let comment of snarkyComments) {
        let opt = document.createElement("option");
        opt.innerHTML = comment;
        opt.value = comment;
        ideas.appendChild(opt);
    }

    ideas.onchange = function() {
        if (ideas.value !== '---') text.value = ideas.value;
    }

    let msg = getRandomChoice(snarkyComments);
    text.value = msg;

    let btn = document.querySelector("#remind-me");
    btn.onclick = function(e) {
        testText(text, "the message", function() {
            dispatchManager();
        });
    }

    let test = document.querySelector("#test-alert");
    let audio = document.querySelector("#audio");
    audio.loop = true;

    test.onclick = function(e) {
        testText(text, "the message", function() {
            audio.play(); // play the alarm
            createAlert("Done!",
                `<div style='font-weight: bold'>${text.value}</div>
                <div>(Press snooze to stop the alarm and start a new one. "Stop it" will stop the alarm permanently.)</div>`, // message
                "completion", // dialog type
                function() { // snooze button callback
                    audio.pause();
                    audio.currentTime = 0; // pause and reset audio
                    hideAlert(); // hide the alert
                    setTimeout(function() {
                        dispatchManager(); // dispatch the next manager
                    }, 1000);
                }, "Snooze" // snooze button label
            );
        });
    }
}