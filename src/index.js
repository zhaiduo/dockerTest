//console.log('hello there4', 1);
/*if(module.hot) {
    module.hot.accept();
}*/

import {
    Func as pbFunc
}
from './Func';

import {
    myFetch
}
from './myFetch'

import * as pbEvt from './Event';
const userDefault = 'guest@img.pinbot.me';

window.onload = function(event) {
    //验证jwt token

    //
    let req = new myFetch('/jwt/is_valid', {
        method: 'POST',
        data: {
            email: pbFunc.getCookie('email')
        }
    });
    if (req) req.then(result => {
        console.log('is_valid', result)
    }).catch(result => {
        console.log('is_valid err', result)
    })

    /*if(pbFunc.getCookie('email')){
        let req = new myFetch('/jwt/refresh', {
            method: 'POST',
            data: {
                email: pbFunc.getCookie('email')
            }
        });
        if (req) req.then(result => {
            console.log('is_valid', result)
        }).catch(result => {
            console.log('is_valid err', result)
        })
    }*/


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