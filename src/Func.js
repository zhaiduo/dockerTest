class Func {

    constructor() {}

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

    static setCookie(key, value, day) {
        let ckTime = (day !== undefined && typeof day === 'number') ? parseInt(day, 10) * 86400000 : 86400000;
        let expires = new Date();
        expires.setTime(expires.getTime() + ckTime);
        document.cookie = key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;';
    }

    static delCookie(key) {
        let expires = new Date();
        expires.setTime(expires.getTime() - 86400);
        document.cookie = key + '=;expires=' + expires.toUTCString() + ';path=/;';
    }

    static getCookie(key) {
        let keyValue = document.cookie.match('(^|;) ?' + key + '=([^; ]*)(;|$)');
        return (keyValue && keyValue[2]) ? keyValue[2] : null;
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

    static toggleModal(trg) {
        if (trg && trg.getAttribute('class')) {
            var currentClassnames = trg.getAttribute('class');
            if (currentClassnames.match(/^(.*)qp\-ui\-mask\-visible(.*)$/i)) {
                trg.setAttribute('class', RegExp.$1 + ' ' + RegExp.$2);
            } else {
                trg.setAttribute('class', currentClassnames + ' qp-ui-mask-visible');
            }
        }
    }

    static bindElems(elems, eventName, cb) {
        console.log("bindElems", elems.constructor);
        if (elems instanceof HTMLCollection) {
            let i = elems.length;
            while (i--) {
                if (typeof cb === 'function') {
                    elems[i].addEventListener(eventName, cb.bind(this));
                }
            }
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
                console.log("forEach", name, index, trgName, cbs[index])
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
            if (id.match(/^copy_(url|md)_([0-9]+)$/i)) {
                trg = RegExp.$1;
                id = RegExp.$2;
            }
            if (document.getElementById('data_' + trg + '_' + id)) {
                pbFunc.copyToClipboard(document.getElementById('data_' + trg + '_' + id).innerText);
            }
        }
    };
}
export {
    Func
};