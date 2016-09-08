class myFetch {

    constructor(url, {
        method = 'GET',
        data = {},
        filelist = null,
        headers = {},
        format = 'json',
        timeout = 10000,
        withCredentials = false
    } = {}) {
        let xhr = new XMLHttpRequest();
        let fd = new FormData();

        if (filelist) {
            for (let i = 0, imax = filelist.length; i < imax; i++) {
                fd.append('file' + i, filelist[i]);
            }
            for (let i in data) {
                if (data.hasOwnProperty(i)) fd.append(i, data[i]);
            }
        } else {
            let newFormData = [];
            for (let i in data) {
                if (data.hasOwnProperty(i)) newFormData.push(i + '=' + myFetch.utf8_to_b64(data[i]));
            }
            fd = newFormData.join('&');
        }

        return new Promise((resolve, reject) => {

            xhr.open(method, url, true);
            xhr.timeout = timeout;
            xhr.responseType = format !== 'text' ? '' : 'text';
            //if cross site (IE10)
            xhr.withCredentials = withCredentials;
            //xhr.setRequestHeader(name,value)
            if (data) {
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }

            if (filelist) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            }
            //console.log('data', data);

            xhr.onloadstart = function() {
                //before request
                //console.log('onloadstart', 1);
            };
            xhr.onloadend = function() {
                //console.log('onloadend', 1);
            };
            xhr.onload = function() {
                //after onreadystatechange
                //console.log('onloaded', xhr.response);
            };
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    let resHeaders = xhr.getAllResponseHeaders();
                    let response = xhr.responseText
                        //console.log(client.getResponseHeader("Content-Type"));
                    if (format === 'json' && resHeaders.match(/\/json/i)) {
                        response = JSON.parse(xhr.responseText)
                    }
                    resolve(response);
                } else {
                    //console.log('xhr.readyState', xhr.readyState);
                }
            };
            xhr.onprogress = function(e) {
                //console.log('onprogress', e);
            };
            xhr.onerror = function(err) {
                //console.log('onerror', err);
                xhr.abort();
                reject(err);
            };
            xhr.ontimeout = function(e) {
                //console.log('ontimeout', e);
                xhr.abort();
                reject(e);
            };
            xhr.onabort = function(e) {
                //console.log('onabort', e);
                reject(e);
            };
            try {
                xhr.send(fd);
            } catch (e) {
                //console.log('send err', e);
            }
        })
    }

    static utf8_to_b64(t) {
        return window.btoa(unescape(encodeURIComponent(t)))
    }
    static b64_to_utf8(str) {
        var str = str.replace(/\s/g, '');
        return decodeURIComponent(escape(window.atob(str)));
    }

}

export {
    myFetch
}