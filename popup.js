const isLocalHost = /^(http|https):\/\/localhost(:[0-9]+)?(\/[^\s]*)?$/;
let domains = new Map();

function navigateToHostList() {
    window.location.href = 'screens/hostsList/hostsList.html';
}

function executeScript(tabId, func) {
    return new Promise(resolve => {
        chrome.scripting.executeScript({ target: { tabId }, func }, resolve)
    });
}

async function filterBexioTabs(windows) {
    const tasks = windows.flatMap(window => window.tabs.map(tab => isBexioTab(tab)));
    const results = await Promise.all(tasks);
    return results.filter(Boolean); // removes null and undefined values
}

async function handleWindows(windows) {
    const localHostTabs = await filterBexioTabs(windows);
    if(localHostTabs.length === 0) {
        document.getElementById('content').innerHTML = 'No active tabs';
        return
    }
    const list = createListFromTabs(localHostTabs);
    document.getElementById('content').appendChild(list);
}

async function isBexioTab(tab) {
    const isBexioApp = await executeScript(tab.id, () => typeof ENV !== 'undefined');
    return isLocalHost.test(tab.url) && isBexioApp ? tab : null;
}

function createDomainListItem(domainHost, JWT, tab) {
    const listItem = document.createElement('li');
    listItem.textContent = domainHost;

    listItem.onclick = function () {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (domainHost, JWT) => {
                localStorage.setItem("JWT", JWT.replace(/"/g, ''));
                localStorage.setItem("apiBaseUrl", domainHost.replace(/"/g, '') + '/');
                window.location.reload();
            },
            args: [domainHost, JWT] // pass any parameters to function
        });
    };
    return listItem;
}

function createDomainList(tab) {
    const list = document.createElement('ul');
    for (let [domainHost, JWT] of domains) {
        console.log(domainHost)
        list.appendChild(createDomainListItem(domainHost, JWT, tab));
    }

    return list;
}

function createListItem(tab) {
    const listItem = document.createElement('li');
    listItem.textContent = tab.title;
    const domainList = createDomainList(tab);
    listItem.appendChild(domainList);
    return listItem;
}

function createListFromTabs(tabs) {
    let template;
    if (tabs) {
        template = document.createElement('ul');
        tabs.forEach(tab => template.appendChild(createListItem(tab)));
    } else {
        template = document.createElement('div');
        template.innerHTML = 'No active tabs';
    }

    return template;
}

window.addEventListener('DOMContentLoaded', (event) => {
    if(domains.size === 0) {
        document.getElementById('content').innerHTML = 'No hosts';
    }
});

chrome.runtime.onMessage.addListener(data => {
    if(data.JWT && !domains.get(data.host) || domains.get(data.host) !== data.JWT) {
        document.getElementById('content').innerHTML = '';
        domains.set(data.host, data.JWT);
        chrome.windows.getAll({ populate: true }, handleWindows);
    }
});