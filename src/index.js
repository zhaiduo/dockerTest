//console.log('hello there4', 1);
/*if(module.hot) {
    module.hot.accept();
}*/

import {
    Func as pbFunc
}
from './Func';

import * as pbEvt from './Event';

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


pbFunc.bindElemsByNameArr([
    '.copy-url',
    '.copy-md',
    '#link-login',
    '#link-register',
    '.close-modal',
    '.close'
], "click", [
    pbEvt.copyUrlEvnt,
    pbEvt.copyMdEvnt,
    pbEvt.loginEvnt,
    pbEvt.registerEvnt,
    pbEvt.closeModalEvnt,
    pbEvt.closeModalEvnt
])