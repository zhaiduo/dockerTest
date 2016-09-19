//console.log('hello there4', 1);
/*if(module.hot) {
    module.hot.accept();
}*/

import {
    Func as pbFunc
}
from './Func';

import * as pbEvt from './Event';
const userDefault = 'guest@img.pinbot.me';

window.onload = function(event) {
    //console.log('getCookie', pbFunc.getCookie('email'))
    if (pbFunc.getCookie('email') && pbFunc.getCookie('email') !== userDefault) {
        pbFunc.toggleUserLayout(true);
    } else {
        pbFunc.toggleUserLayout(false);
    }
};

pbFunc.bindElemsByNameArr([
    '#link-logo',
    '.copy-url',
    '.copy-md',
    '.copy-html',
    '.link-login',
    '.link-register',
    '.close-modal',
    '.j-close',
    '.j-login',
    '.j-register',
    '.link-logout',
    '.j-rename',
    '.j-remark',
    '.j-tag',
    '.j-del',
    '.j-submit-rename',
    '.j-submit-remark',
    '.j-submit-tag',
    '.j-submit-del'
], "click", [
    pbEvt.homeEvnt,
    pbEvt.copyEvnt,
    pbEvt.copyEvnt,
    pbEvt.copyEvnt,
    pbEvt.loginEvnt,
    pbEvt.registerEvnt,
    pbEvt.closeModalEvnt,
    pbEvt.closeModalEvnt,
    pbEvt.loginSubmitEvnt,
    pbEvt.registerSubmitEvnt,
    pbEvt.logoutSubmitEvnt,
    pbEvt.renameEvnt,
    pbEvt.remarkEvnt,
    pbEvt.tagEvnt,
    pbEvt.delEvnt,
    pbEvt.renameSubmitEvnt,
    pbEvt.remarkSubmitEvnt,
    pbEvt.tagSubmitEvnt,
    pbEvt.delSubmitEvnt
])