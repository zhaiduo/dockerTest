
import {
    Func as pbFunc
}
from './Func';

const copyUrlEvnt = (event) => {
    event.stopPropagation();
    pbFunc.copyElemText(event.target);
};
const copyMdEvnt = (event) => {
    event.stopPropagation();
    pbFunc.copyElemText(event.target);
};

const loginEvnt = (event) => {
    event.stopPropagation();
    let trg = document.getElementsByClassName('u-model-login');
    if (trg && trg[0]) pbFunc.toggleModal(trg[0]);
};

const registerEvnt = (event) => {
    event.stopPropagation();
    let trg = document.getElementsByClassName('u-model-register');
    if (trg && trg[0]) pbFunc.toggleModal(trg[0]);
};

const closeModalEvnt = (event) => {
    event.stopPropagation();
    let trg = event.target.parentNode.parentNode.parentNode;
    console.log("closeModalEvnt", event.target, trg)
    if (trg) pbFunc.toggleModal(trg);
};

export {
    copyUrlEvnt,
    copyMdEvnt,
    loginEvnt,
    registerEvnt,
    closeModalEvnt
}