//console.log('hello there4', 1);
/*if(module.hot) {
    module.hot.accept();
}*/

import {
    myFetch
}
from './myFetch'

/*let req = new myFetch('http://localhost:8080/', {
    method: 'POST',
    data: {
        csrfmiddlewaretoken: "oUWaNjDcLuOO5dIhrhYFw1dxHZoWFndb",
        password: "",
        rememberme: "on",
        username: "likaiguo.happy@163.coms"
    }
});
console.log('req', req);
if(req) req.then(result => {
    console.log('then', result);
}).catch(result => {
    console.log('catch', result);
})*/

function copyToClipboard(text) {
    console.log('copyToClipboard', text);
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy"); // Security exception may be thrown by some browsers.
            console.info("Successfully copy to clipboard failed.");
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}
let copyUrlEvnt = function(event) {
    event.stopPropagation();
    let elem = event.target;
    let id = elem.getAttribute('id');
    if (id.match(/^copy_(url|md)_([0-9]+)$/i)) id = RegExp.$2;
    if (document.getElementById('data_url_' + id)) {
        copyToClipboard(document.getElementById('data_url_' + id).innerText);
    }
};
let copyMdEvnt = function(event) {
    event.stopPropagation();
    let elem = event.target;
    let id = elem.getAttribute('id');
    if (id.match(/^copy_(url|md)_([0-9]+)$/i)) id = RegExp.$2;
    if (document.getElementById('data_md_' + id)) {
        copyToClipboard(document.getElementById('data_md_' + id).innerText);
    }
};

let btns = document.getElementsByClassName('copy-url');
let i = btns.length;
while (i--) btns[i].addEventListener("click", copyUrlEvnt.bind(this));

let btns2 = document.getElementsByClassName('copy-md');
let i2 = btns2.length;
while (i2--) btns2[i2].addEventListener("click", copyMdEvnt.bind(this));