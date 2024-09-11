const hosts = [
    {
        url: 'https://office.sales-2.bexio-dev.gcp.bexio.com/',
        api: 'https://office.sales-2.bexio-dev.gcp.bexio.com/',
        name: 'Sales 2'
    }
]

window.addEventListener('DOMContentLoaded', function () {
    const hostsList = document.querySelector('#hostsList');
    hosts.forEach(host => {
        const hostElement = document.createElement('li');
        hostElement.innerText = host.name;
        hostsList.appendChild(hostElement);
    });
});