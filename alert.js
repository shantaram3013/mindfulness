function initialiseAlert() {
    document.getElementById('alert-close').onclick = hideAlert();
}

function createAlert(title, body, mode, callback, callbackLabel) {
    // setting mask's display to flex makes every child visible
    document.getElementById('mask').style.display = 'flex';
    let close = document.getElementById('alert-close')
    // close button is only hidden in case of an error dialog, so we set this to block by default

    close.style.display = 'block';
    if (mode === 'error') {
        close.style.display = 'none'; // no point letting user continue on a broken site
        if (!callback) {
            // if no callback is supplied, this means there's no action and thus no buttons are present.
            // in such a case, we hide the footer
            document.getElementById('alert-footer').style.display = 'none';
        }
    } else if (mode === 'completion') {
        close.innerHTML = 'Stop it';
        close.onclick = function() { // override close button's functionality if this is a completion alert
            let audio = document.querySelector("#audio");
            audio.pause();
            audio.currentTime = 0; // stop and reset the music
            hideAlert();
        }
    } else {
        close.onclick = hideAlert;
    }

    let action = document.getElementById('alert-action');
    if (callback) { // if callback exists, enable the button for it and set the click action
        action.style.display = 'block';
        action.innerHTML = callbackLabel;
        action.onclick = function() {
            callback();
        }
    } else {
        action.style.display = 'none';
    }

    document.getElementById('alert-header').innerHTML = title; // set dialog title
    document.getElementById('alert-body').innerHTML = body; // set dialog body
}

function hideAlert() {
    document.getElementById('mask').style.display = 'none';
}