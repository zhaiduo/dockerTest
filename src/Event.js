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

const homeEvnt = $event => {
    //console.log("homeEvnt", $event)
    let elem = $event.target;
    document.location.href = (document.location.href.toString().match(/img\.pinbot\.me/i)) ? 'http://img.pinbot.me:8088/' : 'http://localhost:8088/';
};

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
            pbFunc.resetForm(elem);
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

const logoutSubmitEvnt = (event) => {
    evtHandler(event, (event, ...args) => {
        pbFunc.toggleUserLayout(false);
        setTimeout(function() {
            document.location.reload();
        }, 1000);
    }, null)
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

const cancelTextfieldAlertEvnt = (event) => {
    evtHandler(event, (event, ...args) => {
        pbFunc.resetFormElem(event.target.parentNode, false, '');
    }, null)
};

const textfieldErrHandler = (id, textfieldTrg, isNotValid, errMsg) => {
    if (isNotValid) {
        pbFunc.resetFormElem(textfieldTrg, true, errMsg);
    } else {
        pbFunc.resetFormElem(textfieldTrg, false, '');
    }
    //on focus: 取消错误提示
    pbFunc.bindElemsByNameArr([
        id
    ], "focus", [
        cancelTextfieldAlertEvnt
    ])
};

const textfieldErrHandlerByRules = (modalTrg, rules) => {
    let isNotValid, textfieldTrg;
    //前端错误处理
    for (let ff of rules) {
        if (ff.required === true) {
            isNotValid = (!modalTrg.querySelector("#" + ff.name).value.match(ff.reg)) ? true : false;
            textfieldTrg = document.getElementById(ff.name).parentNode;
            textfieldErrHandler("#" + ff.name, textfieldTrg, isNotValid, ff.msg);
            if (isNotValid) break;
        }
    }
    return (isNotValid) ? false : true;
};

const formSubmitResHandler = (modalTrg, submitBtnCssName, reqUrl, postData, cbOk, cbErr) => {
    //后端响应处理
    let actionsTrg = modalTrg.querySelector(".actions");
    //console.log("email", email, password)
    pbFunc.toggleClass(actionsTrg.querySelector(".mdl-spinner"), 'is-active', true);
    pbFunc.toggleClass(actionsTrg.querySelector(submitBtnCssName), 'disabled', true);
    let req = new myFetch(reqUrl, {
        method: 'POST',
        data: postData
    });
    if (req) req.then(result => {
        pbFunc.toggleClass(actionsTrg.querySelector(".mdl-spinner"), 'is-active', false);
        pbFunc.toggleClass(actionsTrg.querySelector(submitBtnCssName), 'disabled', false);
        console.log('post then', result);
        if (result.status && result.status === 'ok') {
            pbFunc.resetFormElem(actionsTrg, false, '');
            if (typeof cbOk === 'function') cbOk(result);
        } else {
            pbFunc.resetFormElem(actionsTrg, true, result.msg);
            if (typeof cbOk === 'function') cbErr(result);
        }

    }).catch(result => {
        pbFunc.toggleClass(actionsTrg.querySelector(".mdl-spinner"), 'is-active', true);
        pbFunc.toggleClass(actionsTrg.querySelector(submitBtnCssName), 'disabled', false);
        pbFunc.resetFormElem(actionsTrg, true, result.msg);
        if (typeof cbOk === 'function') cbErr(result);
    })
};

const userLoginCheckArr = [{
    name: 'email',
    required: true,
    reg: new RegExp("^[0-9a-z_\\.\\-]+@[0-9a-z\\-]+\\.[0-9a-z\\.\\-]{2,}$", "i"),
    msg: '无效邮箱地址！'
}, {
    name: 'password',
    required: true,
    reg: new RegExp("^[\\S]{6,}$", "i"),
    msg: '请输入至少6位密码！'
}];

const loginSubmitEvnt = (event) => {
    submitEvnt(event, (event, ...args) => {
        //console.log('loginSubmitEvnt', event, args);

        //前端错误处理
        let formChkOk = textfieldErrHandlerByRules(args[0], userLoginCheckArr);
        if (!formChkOk) return false;

        //后端响应处理
        formSubmitResHandler(args[0], ".j-login", '/login', {
            password: pbFunc.MD5(args[0].querySelector("#email").value + args[0].querySelector("#password").value),
            email: args[0].querySelector("#email").value
        }, (result) => {
            console.log('login ok', result);
            pbFunc.toggleClass(args[0], 'qp-ui-mask-visible', false);
            //获取email

            //刷新界面
            pbFunc.toggleUserLayout(true);

            //展示管理
            //展示标签
            setTimeout(function() {
                document.location.reload();
            }, 1000);
        }, (result) => {
            args[0].querySelector("#password").value = '';
            setTimeout(() => {
                pbFunc.resetForm(args[0]);
            }, 3000);

        });

    }, null);
};

const userRegCheckArr = [{
    name: 'reg_email',
    required: true,
    reg: new RegExp("^[0-9a-z_\\.\\-]+@[0-9a-z\\-]+\\.[0-9a-z\\.\\-]{2,}$", "i"),
    msg: '无效邮箱地址！'
}, {
    name: 'reg_password',
    required: true,
    reg: new RegExp("^[\\S]{6,}$", "i"),
    msg: '请输入至少6位密码！'
}];

const registerSubmitEvnt = (event) => {
    submitEvnt(event, (event, ...args) => {

        //前端错误处理
        let formChkOk = textfieldErrHandlerByRules(args[0], userRegCheckArr);
        if (!formChkOk) return false;

        let password = args[0].querySelector("#reg_password").value;
        let password2 = args[0].querySelector("#reg_password2").value;
        let textfieldTrg = document.getElementById('reg_password2').parentNode;
        let isNotValid = (password !== password2) ? true : false;
        textfieldErrHandler("#reg_password2", textfieldTrg, isNotValid, '请确认密码正确！');
        if (isNotValid) return false;

        //后端响应处理
        formSubmitResHandler(args[0], ".j-register", '/register', {
            password: pbFunc.MD5(args[0].querySelector("#reg_email").value + args[0].querySelector("#reg_password").value),
            email: args[0].querySelector("#reg_email").value
        }, (result) => {
            //console.log('reg ok');
            //显示注册成功消息，自动跳转到登录页面
            pbFunc.resetForm(args[0]);
            pbFunc.resetFormElem(args[0].querySelector('.actions'), true, '恭喜～注册成功!', 'is-success')
            setTimeout(() => {
                pbFunc.resetFormElem(args[0].querySelector('.actions'), false, '', 'is-success')
                pbFunc.toggleClass(args[0], 'qp-ui-mask-visible', false);
                document.querySelector('.header-wrapper .link-login').click();
            }, 3000);
        }, (result) => {
            //console.log('reg failed');
            args[0].querySelector("#reg_password").value = '';
            args[0].querySelector("#reg_password2").value = '';
            setTimeout(() => {
                pbFunc.resetForm(args[0]);
            }, 3000);
        });

    }, null)
};

const modifyEvent = (event, name, attrName, fieldname) => {
    let modalTrg = document.getElementsByClassName('u-model-' + name);
    //从icon attrName获取文件名
    let tmp = event.target.getAttribute(attrName);
    //console.log("attrName", fieldname, modalTrg[0].querySelector(fieldname))
    let id = event.target.getAttribute('data-id');
    if (tmp.match(/^(null|undefined)$/i)) tmp = '';
    if (fieldname.match(/remark/i)) {
        modalTrg[0].querySelector(fieldname).innerText = tmp;
    } else {
        modalTrg[0].querySelector(fieldname).setAttribute('value', tmp);
    }
    if (modalTrg[0].querySelector(fieldname).getAttribute('data-name')) modalTrg[0].querySelector(fieldname).setAttribute('data-name', tmp);

    //console.log('dataname', modalTrg[0].querySelector(fieldname).getAttribute('data-name'))
    modalTrg[0].querySelector(fieldname + '-id').setAttribute('value', id);
    pbFunc.toggleClass(modalTrg[0].querySelector(fieldname).parentNode, 'is-dirty', true);
    setTimeout(function() {
        modalTrg[0].querySelector(fieldname).focus();
    }, 500);
};

const renameEvnt = (event) => {
    modifyEvent(event, 'rename', 'data-name', '#rename-name');
    modalEvent(event, 'rename');
};
const remarkEvnt = (event) => {
    modifyEvent(event, 'remark', 'data-name', '#remark-name');
    modalEvent(event, 'remark');
};
const tagEvnt = (event) => {
    modifyEvent(event, 'tag', 'data-name', '#tag-name');
    modalEvent(event, 'tag');
};
const delEvnt = (event) => {
    modifyEvent(event, 'del', 'data-name', '#del-name');
    modalEvent(event, 'del');
};

const renameCheckArr = [{
    name: 'rename-name',
    required: true,
    reg: new RegExp("^[0-9a-z_\\.\\-]+\\.[0-9a-z]{2,}$", "i"),
    msg: '请输入图片名！'
}];
const renameSubmitEvnt = (event) => {
    console.log('renameSubmitEvnt', event);
    submitEvnt(event, (event, ...args) => {
        console.log('renameSubmitEvnt2', event, args);

        //前端错误处理
        let formChkOk = textfieldErrHandlerByRules(args[0], renameCheckArr);
        if (!formChkOk) return false;

        if (args[0].querySelector("#rename-name").value === args[0].querySelector("#rename-name").getAttribute('data-name')) {
            let actionsTrg = args[0].querySelector(".actions");
            pbFunc.resetFormElem(actionsTrg, true, '请确认修改成不同的图片名！');
            return false;
        }

        //后端响应处理
        formSubmitResHandler(args[0], ".j-submit-rename", '/rename', {
            id: args[0].querySelector("#rename-name-id").value,
            name: args[0].querySelector("#rename-name").value
        }, (result) => {
            pbFunc.resetFormElem(args[0].querySelector('.actions'), true, '修改图片名称成功!', 'is-success')
            setTimeout(() => {
                pbFunc.resetFormElem(args[0].querySelector('.actions'), false, '', 'is-success')
                //关闭弹窗
                pbFunc.toggleClass(args[0], 'qp-ui-mask-visible', false);
            }, 3000);
        }, (result) => {
            //提示错误
            /*args[0].querySelector("#password").value = '';
            setTimeout(() => {
                pbFunc.resetForm(args[0]);
            }, 3000);*/

        });

    }, null);
};

const delCheckArr = [{
    name: 'del-name',
    required: true,
    reg: new RegExp("^[0-9a-z_\\.\\-]+\\.[0-9a-z]{2,}$", "i"),
    msg: '请输入图片名！'
}];
const delSubmitEvnt = (event) => {
    //console.log('delSubmitEvnt', event);
    submitEvnt(event, (event, ...args) => {
        //console.log('delSubmitEvnt2', event, args);

        //前端错误处理
        let formChkOk = textfieldErrHandlerByRules(args[0], delCheckArr);
        if (!formChkOk) return false;

        //后端响应处理
        formSubmitResHandler(args[0], ".j-submit-del", '/del', {
            id: args[0].querySelector("#del-name-id").value,
            name: args[0].querySelector("#del-name").value
        }, (result) => {
            pbFunc.resetFormElem(args[0].querySelector('.actions'), true, '删除图片名称成功!', 'is-success')
            setTimeout(() => {
                pbFunc.resetFormElem(args[0].querySelector('.actions'), false, '', 'is-success')
                //关闭弹窗
                pbFunc.toggleClass(args[0], 'qp-ui-mask-visible', false);
            }, 3000);
        }, (result) => {
            //提示错误
            /*args[0].querySelector("#password").value = '';
            setTimeout(() => {
                pbFunc.resetForm(args[0]);
            }, 3000);*/

        });

    }, null);
};

const remarkCheckArr = [{
    name: 'remark-name',
    required: true,
    reg: new RegExp("^[\\S]{1,250}$", "i"),
    msg: '请输入备注(最多250个字符)！'
}];
const remarkSubmitEvnt = (event) => {
    console.log('remarkSubmitEvnt', event);
    submitEvnt(event, (event, ...args) => {
        console.log('remarkSubmitEvnt2', event, args);

        //前端错误处理
        let formChkOk = textfieldErrHandlerByRules(args[0], remarkCheckArr);
        if (!formChkOk) return false;

        //后端响应处理
        formSubmitResHandler(args[0], ".j-submit-remark", '/remark', {
            id: args[0].querySelector("#remark-name-id").value,
            option: args[0].querySelector("#remark-name").value
        }, (result) => {
            pbFunc.resetFormElem(args[0].querySelector('.actions'), true, '修改备注成功!', 'is-success')
            setTimeout(() => {
                pbFunc.resetFormElem(args[0].querySelector('.actions'), false, '', 'is-success')
                //关闭弹窗
                pbFunc.toggleClass(args[0], 'qp-ui-mask-visible', false);
            }, 3000);
        }, (result) => {
            //提示错误
            /*args[0].querySelector("#password").value = '';
            setTimeout(() => {
                pbFunc.resetForm(args[0]);
            }, 3000);*/

        });

    }, null);
};

const tagCheckArr = [{
    name: 'tag-name',
    required: false,
    reg: new RegExp("^[\\S\\s]{1,250}$", "i"),
    msg: '请输入标签(多个标签用空格分割)！'
}];
const tagSubmitEvnt = (event) => {
    console.log('tagSubmitEvnt', event);
    submitEvnt(event, (event, ...args) => {
        console.log('tagSubmitEvnt2', event, args);

        //前端错误处理
        let formChkOk = textfieldErrHandlerByRules(args[0], tagCheckArr);
        if (!formChkOk) return false;

        //后端响应处理
        formSubmitResHandler(args[0], ".j-submit-tag", '/tagname', {
            id: args[0].querySelector("#tag-name-id").value,
            name: args[0].querySelector("#tag-name").value
        }, (result) => {
            pbFunc.resetFormElem(args[0].querySelector('.actions'), true, '修改标签成功!', 'is-success')
            setTimeout(() => {
                pbFunc.resetFormElem(args[0].querySelector('.actions'), false, '', 'is-success')
                //关闭弹窗
                pbFunc.toggleClass(args[0], 'qp-ui-mask-visible', false);
            }, 3000);
        }, (result) => {
            //提示错误
            /*args[0].querySelector("#password").value = '';
            setTimeout(() => {
                pbFunc.resetForm(args[0]);
            }, 3000);*/

        });

    }, null);
};

export {
    homeEvnt,
    copyEvnt,
    loginEvnt,
    registerEvnt,
    closeModalEvnt,
    loginSubmitEvnt,
    registerSubmitEvnt,
    logoutSubmitEvnt,
    renameEvnt,
    remarkEvnt,
    tagEvnt,
    delEvnt,
    remarkSubmitEvnt,
    tagSubmitEvnt,
    renameSubmitEvnt,
    remarkSubmitEvnt,
    tagSubmitEvnt,
    delSubmitEvnt
}