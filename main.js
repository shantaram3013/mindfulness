window.onload = init;

function init() {
    initialiseAlert(); // initialise the alert dialog's settings

    // set the button's click action
    let btn = document.querySelector("#remind-me");
    btn.onclick = function(e) {
        e.preventDefault();
        dispatchManager();
    }
}