import {
    Func as pbFunc
}
from './Func';
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
console.log('reqx', req);
if(req) req.then(result => {
    console.log('thenx', result);
}).catch(result => {
    console.log('catchx', result);
})*/

const evtHandler = (event, cb, ...args) => {
    event.stopPropagation();
    cb(event, args);
};
const copyEvnt = (event) => {
    evtHandler(event, (event, ...args) => {
        pbFunc.copyElemText(event.target);
    }, null)
};

const modalEvent = (event, name) => {
    evtHandler(event, (event, ...args) => {
        //关闭所有弹窗
        pbFunc.elemsAction(document.getElementsByClassName('u-model'), (elem) => {
            pbFunc.toggleModal(elem, false);
        });
        //打开弹窗
        let trg = document.getElementsByClassName('u-model-' + name);
        if (trg && trg[0]) pbFunc.toggleModal(trg[0]);
    }, null)
};
const loginEvnt = (event) => {
    modalEvent(event, 'login');
};

const registerEvnt = (event) => {
    modalEvent(event, 'register');
};

const closeModalEvnt = (event) => {
    evtHandler(event, (event, ...args) => {
        let trg
        if (event.target.getAttribute('class').match(/close\-modal/i)) {
            trg = event.target.parentNode.parentNode;
        } else if (event.target.parentNode.getAttribute('class').match(/close\-modal/i)) {
            trg = event.target.parentNode.parentNode.parentNode;
        } else if (event.target.getAttribute('class').match(/j\-close/i)) {
            for (let closeBtn of Array.from(document.querySelectorAll('.u-model .j-close'))) {
                if (event.target === closeBtn) {
                    trg = closeBtn.parentNode.parentNode.parentNode;
                    break;
                }
            }
        }
        //console.log("closeModalEvnt", event.target, trg)
        if (trg) pbFunc.toggleModal(trg);
    }, null)
};

const submitEvnt = (event, cb, ...args) => {
    evtHandler(event, (event, ...args) => {
        let modalTrg
        if (event.target.parentNode.getAttribute('class').match(/actions/i)) {
            modalTrg = event.target.parentNode.parentNode.parentNode;
            cb(event, modalTrg, args);
        }
    }, null)
};

const loginSubmitEvnt = (event) => {
    submitEvnt(event, (event, ...args) => {
        console.log('loginSubmitEvnt', event, args);
        let email = args[0].querySelector("#email").value;
        let password = args[0].querySelector("#password").value;
        let actionsTrg = args[0].querySelector(".actions")
        //console.log("email", email, password)

        pbFunc.toggleClass(actionsTrg.querySelector(".mdl-spinner"), 'is-active', true);
        //
        pbFunc.toggleClass(actionsTrg.querySelector(".j-login"), 'disabled', true);
        let req = new myFetch('/login', {
            method: 'POST',
            data: {
                //csrfmiddlewaretoken: "oUWaNjDcLuOO5dIhrhYFw1dxHZoWFndb",
                password: pbFunc.MD5(email + password),
                email: email
            }
        });

        if (req) req.then(result => {
            pbFunc.toggleClass(actionsTrg.querySelector(".mdl-spinner"), 'is-active', false);
            pbFunc.toggleClass(actionsTrg.querySelector(".j-login"), 'disabled', false);
            console.log('then', result);
            //if (trg) pbFunc.toggleModal(trg, false);
            if (result.status && result.status === 'ok') {
                pbFunc.toggleClass(actionsTrg, 'is-responsed', false);
                actionsTrg.querySelector(".mdl-form__res").innerText = '';
            } else {
                pbFunc.toggleClass(actionsTrg, 'is-responsed', true);
                actionsTrg.querySelector(".mdl-form__res").innerText = result.msg;
            }

        }).catch(result => {
            pbFunc.toggleClass(actionsTrg.querySelector(".mdl-spinner"), 'is-active', true);
            pbFunc.toggleClass(actionsTrg.querySelector(".j-login"), 'disabled', false);
            pbFunc.toggleClass(actionsTrg, 'is-responsed', true);
            actionsTrg.querySelector(".mdl-form__res").innerText = result.msg;
        })
    }, null)
    /*event.stopPropagation();
    let modalTrg
    if (event.target.parentNode.getAttribute('class').match(/actions/i)) {
        modalTrg = event.target.parentNode.parentNode.parentNode;

    }*/
};

const registerSubmitEvnt = (event) => {
    submitEvnt(event, (event, ...args) => {
        let email = args[0].querySelector("#reg_email").value;
        let password = args[0].querySelector("#reg_password").value;
        let password2 = args[0].querySelector("#reg_password2").value;
        let trg = document.getElementById('reg_password2').parentNode;
        let actionsTrg = args[0].querySelector(".actions")

        if (password !== password2) {
            pbFunc.toggleClass(trg, 'is-responsed', true);
            trg.querySelector(".mdl-textfield__res").innerText = '请确认密码正确！';
            return false;
        } else {
            pbFunc.toggleClass(trg, 'is-responsed', false);
            trg.querySelector(".mdl-textfield__res").innerText = '';
        }

        pbFunc.toggleClass(actionsTrg.querySelector(".mdl-spinner"), 'is-active', true);
        pbFunc.toggleClass(actionsTrg.querySelector(".j-register"), 'disabled', true);
        //console.log("email", email, password)
        let req = new myFetch('/register', {
            method: 'POST',
            data: {
                //csrfmiddlewaretoken: "oUWaNjDcLuOO5dIhrhYFw1dxHZoWFndb",
                password: pbFunc.MD5(email + password),
                email: email
            }
        });
        console.log('req', req);
        if (req) req.then(result => {
            pbFunc.toggleClass(actionsTrg.querySelector(".mdl-spinner"), 'is-active', true);
            pbFunc.toggleClass(actionsTrg.querySelector(".j-register"), 'disabled', false);
            console.log('then', result);
        }).catch(result => {
            pbFunc.toggleClass(actionsTrg.querySelector(".mdl-spinner"), 'is-active', true);
            console.log('catch', result);
            pbFunc.toggleClass(actionsTrg.querySelector(".j-register"), 'disabled', false);
        })
    }, null)
};

export {
    copyEvnt,
    loginEvnt,
    registerEvnt,
    closeModalEvnt,
    loginSubmitEvnt,
    registerSubmitEvnt
}