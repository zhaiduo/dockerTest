class Func {

    constructor() {}

    //获取字符串MD5值(建议字符串小于255)
    static MD5(data) {
        var hexcase = 0,
            b64pad = "",
            chrsz = 8;

        function hex_md5(s) {
            return binl2hex(core_md5(str2binl(s), s.length * chrsz))
        }

        function b64_md5(s) {
            return binl2b64(core_md5(str2binl(s), s.length * chrsz))
        }

        function hex_hmac_md5(key, data) {
            return binl2hex(core_hmac_md5(key, data))
        }

        function b64_hmac_md5(key, data) {
            return binl2b64(core_hmac_md5(key, data))
        }

        function calcMD5(s) {
            return binl2hex(core_md5(str2binl(s), s.length * chrsz))
        }

        function md5_vm_test() {
            return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72"
        }

        function core_md5(x, len) {
            x[len >> 5] |= 0x80 << ((len) % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;
            var a = 1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d = 271733878;
            for (var i = 0; i < x.length; i += 16) {
                var olda = a,
                    oldb = b,
                    oldc = c,
                    oldd = d;
                a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
                a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
                a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
                a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd)
            }
            return Array(a, b, c, d)
        }

        function md5_cmn(q, a, b, x, s, t) {
            return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
        }

        function md5_ff(a, b, c, d, x, s, t) {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
        }

        function md5_gg(a, b, c, d, x, s, t) {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
        }

        function md5_hh(a, b, c, d, x, s, t) {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t)
        }

        function md5_ii(a, b, c, d, x, s, t) {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
        }

        function core_hmac_md5(key, data) {
            var bkey = str2binl(key);
            if (bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);
            var ipad = Array(16),
                opad = Array(16);
            for (var i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C
            }
            var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
            return core_md5(opad.concat(hash), 512 + 128)
        }

        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF)
        }

        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt))
        }

        function str2binl(str) {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for (var i = 0; i < str.length * chrsz; i += chrsz) bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
            return bin
        }

        function binl2hex(binarray) {
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF)
            }
            return str
        }

        function binl2b64(binarray) {
            var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var str = "";
            for (var i = 0; i < binarray.length * 4; i += 3) {
                var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
                for (var j = 0; j < 4; j++) {
                    if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
                    else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F)
                }
            }
            return str
        }
        return hex_md5(data + '_img_pinbot')
    }

    static setLocalData(storageKey, storageValue, isPermanent) {
        let _isPermanent = (typeof isPermanent === 'boolean') ? isPermanent : false;
        let windowStorageObj = (_isPermanent) ? window.localStorage : window.sessionStorage;
        //if (pbDebug) console.log('setLocalData', storageKey);
        try {
            windowStorageObj.setItem(storageKey, angular.toJson(storageValue));
            return true;
        } catch (errStorageObj) {
            if (isLoging) throw new Error('Storage数据失败! [' + errStorageObj.toString() + ']');
            return false;
        }
        //return false;
    }

    static getLocalData(storageKey, isPermanent) {
        let _isPermanent = (typeof isPermanent === 'boolean') ? isPermanent : false;
        let windowStorageObj = (_isPermanent) ? window.localStorage : window.sessionStorage;
        //if (pbDebug) console.log('getLocalData', storageKey);
        try {
            if (storageKey in windowStorageObj) {
                return angular.fromJson(windowStorageObj.getItem(storageKey));
            }
        } catch (errStorageObj) {
            if (isLoging) throw new Error('Storage数据失败! [' + errStorageObj.toString() + ']');
            return false;
        }
        //return null;
    }

    static delLocalData(storageKey, cb, isPermanent) {
        let _isPermanent = (typeof isPermanent === 'boolean') ? isPermanent : false;
        let windowStorageObj = (_isPermanent) ? window.localStorage : window.sessionStorage;
        let storageObj = (_isPermanent) ? localStorage : sessionStorage;
        //if (pbDebug) console.log('delLocalData', storageKey);
        try {
            if (storageKey in windowStorageObj) {
                windowStorageObj.removeItem(storageKey);
                if (typeof cb === 'function') {
                    cb();
                }
            } else if (storageKey in storageObj) {
                storageObj.removeItem(storageKey);
                if (typeof cb === 'function') {
                    cb();
                }
            } else {
                storageObj.removeItem(storageKey);
                if (typeof cb === 'function') {
                    cb();
                }
            }
        } catch (errStorageObj) {
            if (isLoging) throw new Error('Storage数据失败! [' + errStorageObj.toString() + ']');
            //return false;
        }
    }

    static utf8_to_b64(t) {
        //console.log('utf8_to_b64', t)
        return new Buffer(t).toString('base64');
    }
    static b64_to_utf8(str) {
        //console.log('b64_to_utf8', str)
        //var str = str.replace(/\s/g, '');
        return new Buffer(str, 'base64').toString();
    }

    static setCookie(key, value, day) {
        let ckTime = (day !== undefined && typeof day === 'number') ? parseInt(day, 10) * 86400000 : 86400000;
        let expires = new Date();
        expires.setTime(expires.getTime() + ckTime);
        document.cookie = key + '=' + Func.utf8_to_b64(value) + ';expires=' + expires.toUTCString() + ';path=/;';
    }

    static delCookie(key) {
        let expires = new Date();
        expires.setTime(expires.getTime() - 86400);
        document.cookie = key + '=;expires=' + expires.toUTCString() + ';path=/;';
    }

    static getCookie(key) {
        let keyValue = document.cookie.match('(^|;) ?' + key + '=([^; ]*)(;|$)');
        return (keyValue && keyValue[2]) ? Func.b64_to_utf8(keyValue[2]) : null;
    }

    static modalAction(modalAlert, btnFunc, $scope, btnCloseFunc, isDisableScroll) {
        let _this = Func;
        let _isDisableScroll = (typeof isDisableScroll === 'boolean') ? isDisableScroll : false;
        let newModal = document.createElement("div");
        newModal.innerHTML = modalAlert;
        //newModal.className = "modal modal-overlay modal-alert";
        newModal.setAttribute('class', "modal modal-overlay modal-alert");
        /*newModal.addEventListener("click", function() {
                    });*/
        document.body.appendChild(newModal);
        //document.body.insertBefore(newModal, null); // 这两种方法均可实现

        //disable scrolling
        let wheelStop = (event) => {
            event.preventDefault();
            event.returnValue = false;
        };
        if (_isDisableScroll) {
            if (window.addEventListener) { //Firefox only
                window.addEventListener("DOMMouseScroll", wheelStop, false);
            }
            window.onmousewheel = document.onmousewheel = wheelStop;
        }

        //同步弹窗位置
        setTimeout(() => {
            let _content = document.getElementsByClassName('modal-dialog');
            let height = _content[0].offsetHeight;
            let wHieght = window.innerHeight;
            _content[0].style.marginTop = (wHieght - height) / 2 + 'px';
        }, 10);

        let _restoreScroll = () => {
            let wheelRestore = (event) => {};
            //restore scrolling
            if (window.addEventListener) { //Firefox only
                window.addEventListener("DOMMouseScroll", wheelRestore, false);
            }
            window.onmousewheel = document.onmousewheel = wheelRestore;
        };

        let closeModal = document.getElementsByClassName('modal-alert-close');
        let _clickHandler = (event) => {
            event.stopPropagation();
            event.preventDefault();
            _this.modalClose();

            //_restoreScroll();

            if (typeof btnCloseFunc === 'function') {
                btnCloseFunc($scope);
            }
        };
        if (closeModal !== null && closeModal.length > 0) {
            for (let i = 0, imax = closeModal.length; i < imax; i++) {
                closeModal[i].addEventListener("click", _clickHandler);
            }
        }
        let closeBtnModal = document.getElementsByClassName('modal-alert-btn');
        if (closeBtnModal !== null && closeBtnModal.length > 0) closeBtnModal[0].addEventListener("click", function(event) {
            event.stopPropagation();
            event.preventDefault();
            _this.modalClose();

            if (_isDisableScroll) _restoreScroll();

            if (typeof btnFunc === 'function') {
                btnFunc($scope);
            }
        });
    }

    static modalClose() {
        document.getElementsByClassName('modal')[0].style.display = 'none';
    }

    static bindClick(eleName, cb, scope) {
        if (eleName !== undefined && typeof eleName === 'string') {
            let ele = (eleName.match(/^#(.+)$/i)) ? document.getElementById(RegExp.$1) : document.getElementsByClassName(eleName);
            if (ele !== null && ele.length > 0) ele[0].addEventListener("click", function(event) {
                event.stopPropagation();
                event.preventDefault();
                if (typeof cb === 'function') {
                    cb(scope);
                }
            });
        }
    }

    static closeModal() {
        let closeModal = document.getElementsByClassName('modal-alert-close');
        closeModal[0].parentNode.parentNode.parentNode.parentNode.style.display = 'none';
    }

    static alertModal($scope, title, annotation, msg, btnTitle, btnFunc, btnStyle, btnCloseFunc) {
        let _this = Func;
        let isModalCz = document.getElementsByClassName('modal-alert');
        let btnCss = (btnStyle !== undefined && btnStyle === 'red') ? 'red' : 'blue';

        let newAlertModal = ($scope, title, msg, btnCss, btnTitle, btnFunc) => {
            let modalAlert = '' +
                '<div class="modal-dialog">' +
                '  <div class="modal-content">' +
                '    <div class="modal-header">' +
                '      <button class="close modal-alert-close"><i class="i-icon i-close-small"></i></button>' +
                '      <h3 class="modal-title modal-alert-title text-center"><i class="i-icon i-question"></i>' + title + '</h3>' +
                '    </div>' +
                '    <div class="modal-body">' +
                '      <p class="text-center pd-bottom-20 modal-alert-content c607d8b f14 ">' + msg + '</p>' +
                '    </div>' +
                '    <div class="modal-footer">' +
                '      <button class="btn btn-' + btnCss + ' btn-click-ok modal-alert-btn">' + btnTitle + '</button>' +
                '    </div>' +
                '  </div>' +
                '</div>' +
                '';
            _this.modalAction(modalAlert, btnFunc, $scope, btnCloseFunc);
        };
        if (isModalCz.length === 0) {
            newAlertModal($scope, title, msg, btnCss, btnTitle, btnFunc);
        } else {
            //必须删除modal，否则回调函数有坑
            let element = document.getElementsByClassName('modal-alert')[0];
            element.parentNode.removeChild(element);
            newAlertModal($scope, title, msg, btnCss, btnTitle, btnFunc);
        }
    }

    static copyToClipboard(text) {
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

    static toggleClass(trg, className, isNotToggle) {
        let _isNotToggle = (typeof isNotToggle === 'boolean') ? isNotToggle : null;
        let currentClassnames = trg.getAttribute('class');
        let _className = className.replace(/([\-])/ig, "\\$1");
        //console.log("toggleClass", _className, currentClassnames)
        let re = new RegExp("^(.*) " + _className + " (.*)$", "i");
        if (_isNotToggle !== null) {
            //console.log("toggleClass", _isNotToggle, _className, currentClassnames)
            if (_isNotToggle === true) {
                //add class
                if (!currentClassnames.match(re)) {
                    trg.setAttribute('class', currentClassnames + ' ' + className + ' ');
                }
            } else {
                //remove class
                if (currentClassnames.match(re)) {
                    trg.setAttribute('class', RegExp.$1 + ' ' + RegExp.$2);
                }
            }
        } else {
            if (currentClassnames.match(re)) {
                trg.setAttribute('class', RegExp.$1 + ' ' + RegExp.$2);
            } else {
                trg.setAttribute('class', currentClassnames + ' ' + className + ' ');
            }
        }
    }

    static toggleModal(trg, isShow) {
        let _show = (typeof isShow === 'boolean') ? isShow : null;
        if (trg && trg.getAttribute('class')) {
            var currentClassnames = trg.getAttribute('class');
            if (_show !== null) {
                if (_show === true) {
                    if (!currentClassnames.match(/^(.*) qp\-ui\-mask\-visible (.*)$/i)) {
                        Func.toggleClass(trg, 'qp-ui-mask-visible', true);
                    }
                } else if (_show === false) {
                    if (currentClassnames.match(/^(.*) qp\-ui\-mask\-visible (.*)$/i)) {
                        Func.toggleClass(trg, 'qp-ui-mask-visible', false);
                    }
                }
            } else {
                Func.toggleClass(trg, 'qp-ui-mask-visible');
            }
        }
    }

    static elemsAction(elems, cb) {
        let i = elems.length;
        while (i--) {
            if (typeof cb === 'function') cb(elems[i])
        }
    }

    static bindElems(elems, eventName, cb) {
        //console.log("bindElems", elems.constructor);
        if (elems instanceof HTMLCollection) {
            Func.elemsAction(elems, (elem) => {
                if (typeof cb === 'function') {
                    elem.addEventListener(eventName, cb.bind(this));
                }
            })
        } else if (elems instanceof HTMLElement) {
            if (typeof cb === 'function') elems.addEventListener(eventName, cb.bind(this));
        }
    }

    static bindElemsByName(name, eventName, cb) {
        if (typeof name === 'string' && name.match(/^(\.|#)([0-9a-z_\-]+)$/i)) {
            let t = RegExp.$1;
            let name = RegExp.$2;
            if (t === '.') {
                Func.bindElems(document.getElementsByClassName(name), eventName, cb)
            } else {
                Func.bindElems(document.getElementById(name), eventName, cb)
            }
        }
    }

    static bindElemsByNameArr(nameArr, eventName, cbs) {
        Array.from(nameArr).forEach(function(name, index) {
            if (typeof name === 'string' && name.match(/^(\.|#)([0-9a-z_\-]+)$/i) && Array.isArray(cbs) && cbs[index] && typeof cbs[index] === 'function') {
                let t = RegExp.$1;
                let trgName = RegExp.$2;
                //console.log("forEach", name, index, trgName, cbs[index])
                if (t === '.') {
                    Func.bindElems(document.getElementsByClassName(trgName), eventName, cbs[index])
                } else {
                    Func.bindElems(document.getElementById(trgName), eventName, cbs[index])
                }
            }
        });
    }

    static copyElemText(elem) {
        if (elem && elem.getAttribute('id')) {
            let id = elem.getAttribute('id');
            let trg = '';
            if (id.match(/^copy_(url|md|html)_([0-9]+)$/i)) {
                trg = RegExp.$1;
                id = RegExp.$2;
            }
            if (document.getElementById('data_' + trg + '_' + id)) {
                Func.copyToClipboard(document.getElementById('data_' + trg + '_' + id).innerText);
            }
        }
    }

    //更新表单元素反馈样式／内容（错误信息、样式等）
    static resetFormElem(elemTrg, isShow, text, cssName) {
        let _cssName = (typeof cssName === 'string') ? cssName : 'is-responsed';
        Func.toggleClass(elemTrg, _cssName, isShow);
        let name = (_cssName === 'is-responsed') ? 'res' : 'error';
        if (_cssName === 'is-success') name = 'res';
        if (name === 'res' && elemTrg.querySelector(".mdl-textfield__" + name)) {
            elemTrg.querySelector(".mdl-textfield__" + name).innerText = text;
        }
        if (name === 'res' && elemTrg.querySelector(".mdl-form__" + name)) {
            elemTrg.querySelector(".mdl-form__" + name).innerText = text;
        }
    }

    //重置form表单状态
    static resetForm(modalTrg) {
        //清空input
        let formTrg = modalTrg.querySelector('form');
        formTrg.reset();
        //取消错误提示
        for (let trg of Array.from(modalTrg.querySelectorAll('.is-responsed'))) {
            Func.resetFormElem(trg, false, '', 'is-responsed');
        }
        for (let trg of Array.from(modalTrg.querySelectorAll('.is-invalid'))) {
            Func.resetFormElem(trg, false, '', 'is-invalid');
        }
    }

    static toggleUserLayout(isShowUserLayout) {
        let _isShowUserLayout = (typeof isShowUserLayout === 'boolean') ? isShowUserLayout : false;
        let btns = document.querySelectorAll('.j-action-btn');
        let i = btns.length;
        if (_isShowUserLayout === true) {
            document.querySelector('.j-user-email').innerText = '您好，' + Func.getCookie('email');
            document.querySelector('.j-layout-guest').style.display = 'none';
            document.querySelector('.j-layout-member').style.display = 'block';
            while (i--) {
                btns[i].style.display = 'block';
            }
        } else {
            Func.delCookie('email');
            document.querySelector('.j-layout-guest').style.display = 'block';
            document.querySelector('.j-layout-member').style.display = 'none';
            while (i--) {
                btns[i].style.display = 'none';
            }
        }
    }
}
export {
    Func
};