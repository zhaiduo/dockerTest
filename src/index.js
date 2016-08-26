//console.log('hello there4', 1);
/*if(module.hot) {
    module.hot.accept();
}*/

import {
    Func as pbFunc
}
from './Func';

import * as pbEvt from './Event';


pbFunc.bindElemsByNameArr([
    '.copy-url',
    '.copy-md',
    '.link-login',
    '.link-register',
    '.close-modal',
    '.j-close',
    '.j-login',
    '.j-register'
], "click", [
    pbEvt.copyEvnt,
    pbEvt.copyEvnt,
    pbEvt.loginEvnt,
    pbEvt.registerEvnt,
    pbEvt.closeModalEvnt,
    pbEvt.closeModalEvnt,
    pbEvt.loginSubmitEvnt,
    pbEvt.registerSubmitEvnt
])