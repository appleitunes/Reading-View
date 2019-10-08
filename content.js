var display = false, frame, content;

/*************************************************************
 * Send messages from iFrame to the background
 *************************************************************/
window.addEventListener("message", (message) => {
    let data = message.data;
    if (!data["id"] || data["id"] !== "rc3no78gwieyroc") {
        return;
    }
    else {
        chrome.runtime.sendMessage(data["data"]);
    }
}, false);

/*************************************************************
 * Decides what to do when a message is received from the background
 *************************************************************/
chrome.runtime.onMessage.addListener((message) => {
    switch (message["action"]) {
        case "icon":
            toggleDisplay();
            break;
        case "htmlTemplate":
            content.documentElement.innerHTML = message["content"];
            getContent()
            .then((result) => {
                content.getElementById("content").innerHTML = result;
                chrome.runtime.sendMessage({"action": "javascript"});
            });
            break;
        case "cssTemplate":
            content.head.innerHTML += `<style>${message["content"]}</style>`;
            break;
        case "jsTemplate":
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.text = message["content"];
            content.head.appendChild(script);
            break;
    }
});

/*************************************************************
 * Turn the display on or off
 *************************************************************/
function toggleDisplay() {
    display = !display;

    if (!frame) {
        createFrame();
    }

    toggleScrolling(display);

    if (display) {
        frame.style.display = "block";
    }
    else {
        frame.style.display = "none";
    }
}

/*************************************************************
 * Turn scrolling on or off
 *************************************************************/
function toggleScrolling(scrollingOff) {
    if (scrollingOff) {
        document.body.style.height = "100%";
        document.body.style.overflow = "hidden";
    }
    else {
        document.body.style.height = "auto";
        document.body.style.overflow = "scroll";
    }
}

/*************************************************************
 * Create an iFrame
 *************************************************************/
function createFrame() {
    let div = document.createElement("iframe");
    div.style.display = "none";
    div.style.position = "fixed";
    div.style.zIndex = "2147483647";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.left = 0;
    div.style.top = 0;
    div.style.border = "none";
    document.body.appendChild(div);

    frame = div;
    content = frame.contentWindow.document;

    chrome.runtime.sendMessage({"action": "template"});
}

/*************************************************************
 * If an element is hidden or has a display value of 'none'
 *************************************************************/
function isHidden(element) {
    let style = window.getComputedStyle(element);
    return ((style.display === "none") || (style.visibility === "hidden"))
}

/*************************************************************
 * Find the index of an item in a list
 *************************************************************/
function findIndex(item, list) {
    if (!item || !list) {
        return 0;
    }

    for (i in list) {
        let value = list[i];
        if (value && value === item) {
            return i;
        }
    }
    return 0;
}

/*************************************************************
 * Ensure all children are <a> tags
 *************************************************************/
function ifLinkTag(children, ceiling=5) {
    if (ceiling < children.length) {
        return false;
    }

    for (i in children) {
        let child = children[i];
        if (child && child.tagName && 
            (!{"A":true,"I":true,"STRONG":true}[child.tagName])) {
            return false;
        }
    }

    return true;
}

/*************************************************************
 * Get all relevant elements from page
 *************************************************************/
function getContent() {
    return new Promise((resolve) => {
        let section = document.getElementsByTagName("article");
        if (section[0] && 1024 < section[0].innerHTML.length) { section = section[0]; } else { section = document; }

        let items = section.querySelectorAll("p, h1, h2, h3, h4, h5, h6, img, li, div");
        let first = findIndex(section.getElementsByTagName("h1")[0], items);
        let last = items.length;

        let completeDoc = "";
        if (first === 0) {
            let head = document.getElementsByTagName("h1");
            if (head[0]) {
                completeDoc += `<h1>${document.getElementsByTagName("h1")[0].innerText}</h1>`; 
            }
        }

        for (let i = first; i < last; i++) {
            let value = items[i];
            if (value && !isHidden(value)) {
                let tag = value.tagName;
                switch (tag) {
                    case "IMG":
                        if (100 < value.clientWidth && 100 < value.clientHeight) {
                            completeDoc += `<br><img src="${value.src}"<br>`;
                        }
                        break;
                    case "LI":
                        if (value.innerText && 5 < value.innerText.length && 
                            (value.children.length === 0 || ifLinkTag(value.getElementsByTagName("*")))) {
                            completeDoc += `<li>${value.innerHTML}</li>`;
                        }
                        break;
                    case "P":
                        if (value.innerText && 20 < value.innerText.length) {
                            if (value.parentNode && value.parentNode.tagName &&
                                value.parentNode.tagName === "BLOCKQUOTE") {
                                completeDoc += `<blockquote><p>${value.innerHTML}</p></blockquote>`;
                            }
                            else {
                                completeDoc += `<p>${value.innerHTML}</p>`;
                            }
                        }
                        break;
                    case "DIV":
                        if (value.innerText && 20 < value.innerText.length && 
                            (value.children.length === 0 || ifLinkTag(value.getElementsByTagName("*")))) {
                            completeDoc += `<p>${value.innerHTML}</p>`;
                        }
                        break;
                    case "H1":
                    case "H2":
                        if (value.innerText) {
                            completeDoc += `<${tag}>${value.innerText}</${tag}>`;
                        }
                        break;
                    default:
                        if (value.innerText && 
                            (value.children.length === 0 || ifLinkTag(value.getElementsByTagName("*")))) {
                            completeDoc += `<${tag}>${value.innerText}</${tag}>`;
                        }
                }
            }
        }
        resolve(completeDoc);
    });
}