function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}
injectScript(chrome.runtime.getURL('web_accessible_resources.js'), 'body');

let JWT = '';

window.addEventListener("message", (event) => {
    if(event.data.JWT) {
        JWT = event.data.JWT;
    }

    setInterval(() => {
        let data = {host: window.location.origin, JWT: JWT};
        chrome.runtime.sendMessage(data);
    }, 1000)




}, false);