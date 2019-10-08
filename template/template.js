var fontSize = $fontSize;
var width = $width;
var dark = !$dark;

/*************************************************************
 * Send messages to the content script
 *************************************************************/
function sendMessage(message) {
    let newMessage = {
        "id": "rc3no78gwieyroc",
        "data": message
    };
    parent.postMessage(newMessage, "*");
}

/*************************************************************
 * Increase font size
 *************************************************************/
function setAll() {
    document.getElementById("content").style.fontSize = fontSize + "em";
    document.getElementById("content").style.width = width + "px";

    setTimeout(() => {
        document.getElementById("content").style.transition = "0.15s";
    }, 150);

    toggleDarkMode();
}

/*************************************************************
 * Toggle dark mode
 *************************************************************/
function toggleDarkMode() {
    dark = !dark;

    if (dark) {
        document.body.style.backgroundColor = "black";
        document.body.style.color = "rgb(240, 240, 240)";

        let links = document.getElementsByTagName("a");
        for (i in links) {
            if (links[i].href) {
                links[i].style.color = "lightblue";  
            }
        }  
    }
    else {
        document.body.style.backgroundColor = "rgb(240, 240, 240)";
        document.body.style.color = "black";

        let links = document.getElementsByTagName("a");
        for (i in links) {
            if (links[i].href) {
                links[i].style.color = "blue";  
            }
        }  
    }

    let message = {
        "action": "setVar",
        "var": ["dark", dark]
    };
    sendMessage(message);
}

/*************************************************************
 * Increase or decrease font size
 *************************************************************/
function incrementFontSize(inc, set=false) {
    if (set) {
        fontSize = inc;
    }
    else {
        fontSize += inc;
    }

    if (4 < fontSize) {
        fontSize = 4;
        return;
    }
    else if (fontSize < 0.4) {
        fontSize = 0.4;
        return;
    }

    document.getElementById("content").style.fontSize = fontSize + "em";

    let message = {
        "action": "setVar",
        "var": ["fontSize", fontSize]
    };
    sendMessage(message);
}

/*************************************************************
 * Increase or decrease width
 *************************************************************/
function incrementWidth(inc, set=false) {
    if (set) {
        width = inc;
    }
    else {
        width += inc;
    }

    if (800 < width) {
        width = 800;
        return;
    }
    else if (width < 200) {
        width = 200;
        return;
    }

    document.getElementById("content").style.width = width + "px";

    let message = {
        "action": "setVar",
        "var": ["width", width]
    };
    sendMessage(message);
}

/*************************************************************
 * Set to default
 *************************************************************/
function setDefault() {
    incrementFontSize(1.5, true);
    incrementWidth(600, true);
}

/*************************************************************
 * Code to execute on load
 *************************************************************/
setAll();