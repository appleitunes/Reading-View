/*************************************************************
 * Listen for icons
 *************************************************************/
chrome.browserAction.onClicked.addListener(() => { 
    chrome.tabs.getSelected(null, (tab) => {
        chrome.tabs.sendMessage(tab.id, {"action": "icon"});
    });
});

/*************************************************************
 * Read data from extension and send it to content
 *************************************************************/
function getData(location, varName) {
    readFile(location)
    .then((result) => {
        let message = {
            "action": varName,
            "content": result
        };
        chrome.tabs.getSelected(null, (tab) => {
            chrome.tabs.sendMessage(tab.id, message);
        });
    });
}

/*************************************************************
 * Read data from extension and send it to content
 *************************************************************/
function getJSData(location, varName) {
    readFile(location)
    .then((result) => {
        getVars()
        .then((variables) => {
            let newResult = result;
            newResult = newResult.replace("$fontSize", variables["fontSize"]);
            newResult = newResult.replace("$width", variables["width"]);
            newResult = newResult.replace("$dark", variables["dark"]);

            let message = {
                "action": varName,
                "content": newResult
            };
            chrome.tabs.getSelected(null, (tab) => {
                chrome.tabs.sendMessage(tab.id, message);
            });
        });
    });
}

// getVars()
// .then((variables) => {
//     let newResult = result;
//     newResult = newResult.replace("$fontSize", variables["fontSize"]);
//     newResult = newResult.replace("$width", variables["width"]);
//     newResult = newResult.replace("$dark", variables["dark"]);
// });

/*************************************************************
 * Listen for content messages
 *************************************************************/
chrome.runtime.onMessage.addListener((message) => {
    switch (message["action"]) {
        case "template":
            getData("template/template.html", "htmlTemplate");
            getData("template/template.css", "cssTemplate");
            break;
        case "javascript":
            getJSData("template/template.js", "jsTemplate");
            break;
        case "setVar":
            let data = message["var"];
            setVar(data[0], data[1]);
            break;
    }
});

/*************************************************************
 * Read a file inside the chrome extension
 *************************************************************/
function readFile(fileName) {
    return new Promise((resolve) => {
        fetch(fileName)
        .then((response) => {
            resolve(response.text());
        });
    });
}

/*************************************************************
 * Set variables
 *************************************************************/
function setVar(variable, value) {
    chrome.storage.sync.set({[variable]: value}, null);
}

/*************************************************************
 * Get variables
 *************************************************************/
function getVars() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(["fontSize", "width", "dark"], (items) => {
            let defaults = {
                "fontSize": 1.5,
                "width": 600,
                "dark": false
            };
            
            for (i in defaults) {
                if (!items[i]) {
                    items[i] = defaults[i];
                }
            }

            resolve(items);
        });
    });
}