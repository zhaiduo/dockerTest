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
var copyUrlEvnt = function(event) {
    event.stopPropagation();
    var elem = event.target;
    var id = elem.getAttribute('id');
    if (id.match(/^copy_(url|md)_([0-9]+)$/i)) id = RegExp.$2;
    if (document.getElementById('data_url_' + id)) {
        copyToClipboard(document.getElementById('data_url_' + id).innerText);
    }
};
var copyMdEvnt = function(event) {
    event.stopPropagation();
    var elem = event.target;
    var id = elem.getAttribute('id');
    if (id.match(/^copy_(url|md)_([0-9]+)$/i)) id = RegExp.$2;
    if (document.getElementById('data_md_' + id)) {
        copyToClipboard(document.getElementById('data_md_' + id).innerText);
    }
};

var btns = document.getElementsByClassName('copy-url');
var i = btns.length;
while (i--) btns[i].addEventListener("click", copyUrlEvnt.bind(this));

var btns2 = document.getElementsByClassName('copy-md');
var i2 = btns2.length;
while (i2--) btns2[i2].addEventListener("click", copyMdEvnt.bind(this));