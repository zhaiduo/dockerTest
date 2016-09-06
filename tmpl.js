
const express = require('express')
const path = require('path')
const app = express()
const config = require('./config.js').setting[app.get('env')];

// Constants
const {
    PORT: PORT,
    HOST: HOST,
    HTTP: HTTP,
    UPLOAD_URL: UPLOAD_URL,
    UPLOAD_DIR: UPLOAD_DIR,
    CORS_DOMAIN: CORS_DOMAIN,
    IMG_PREFIX: IMG_PREFIX,
    SQL_DIR: SQL_DIR
} = config;

const db = require('./db.js')
const Img = db.Img
const User = db.User
const Tag = db.Tag
const ImgTags = db.ImgTags

const lib = require('./lib.js')

const htmlEscape = (str) => {
    if(typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;') // first!
              .replace(/>/g, '&gt;')
              .replace(/</g, '&lt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/`/g, '&#96;');
};

const html = (literalSections, ...substs) => {
    // Use raw literal sections: we don’t want
    // backslashes (\n etc.) to be interpreted
    let raw = literalSections.raw;

    let result = '';

    substs.forEach((subst, i) => {
        // Retrieve the literal section preceding
        // the current substitution
        let lit = raw[i];

        // In the example, map() returns an array:
        // If substitution is an array (and not a string),
        // we turn it into a string
        if (Array.isArray(subst)) {
            subst = subst.join('');
        }

        // If the substitution is preceded by a dollar sign,
        // we escape special characters in it
        if (lit.endsWith('$')) {
            //subst = htmlEscape(subst);
            //subst = subst;
            lit = lit.slice(0, -1);
        }
        result += lit;
        result += subst;
    });
    // Take care of last literal section
    // (Never fails, because an empty template string
    // produces one literal section, an empty string)
    result += raw[raw.length - 1]; // (A)

    return result;
};

const publisDate = name => {
  if(name.match(/([0-9]+)\.png$/i)){
    let dt = lib.getDateObj(parseInt(RegExp.$1, 10))
    return `发布于：${dt.y}年${dt.m}月${dt.d}日 ${dt.h}时:${dt.i}分:${dt.s}秒`;
  }else{
    return name
  }
};

/*const userInclude=(email)=> {
        return [{
            model: User,
            as: 'user',
            where: {
                email: email
            }
        }];
    }*/


exports.indexTmpl = (sum, cp, eachPage, rows, more) => html`
<!DOCTYPE html>
<html class="qp-ui" data-qp-ui="{
  'Futurizr': {
  'hasTouch': 'touch'
  }
  }">
  <head>
    <meta charset="utf-8">
    <!-- <link href="/static/styles.css" rel="stylesheet" /> -->
    <script src="/static/style.js"></script>
    <meta name="viewport" content="initial-scale=1, width=device-width"/>
    <meta name="keywords" content=""/>
    <title>List - Pinbot Image Server</title>
  </head>
  <body class="site-material_ext_publish section-resources noninitial-chapter color-light-blue qp-ui" data-qp-ui="{ 'Mask': {} }">
    <header>
      <div class="header-wrapper">
        <div class="header-title">
        <span class="section-title"><a href="/"><img src="https://www.pinbot.me/static/b_index/img/new_logo.png" border="0" style="width: 120px;margin: 10px 0px 20px 0px;"></a></span>
        <span class="chapter-title"></span>
        <div class="j-layout-guest">
          <a class="f-top-btn f-float-right link-login" href="javascript:void(0);"><i class="material-icons"></i>登录</a>
          <a class="f-top-btn f-float-right link-register" href="javascript:void(0);"><i class="material-icons"></i>注册</a>
        </div>
        <div class="j-layout-member">
          <a class="f-top-btn f-float-right link-logout" href="javascript:void(0);"><i class="material-icons"></i>退出</a>
          <a class="f-top-btn f-float-right link-hello" href="javascript:void(0);"><i class="material-icons"></i><span class="j-user-email"></span></a>
        </div>
      </div>
    </div>
  </header>
  <div id="grid-cont">
    <section class="grid_outer chapter">
      <h1 class="chapter-title">Welcome to Image Server! <a href="$${more.link}">&gt;&gt; 点击这里粘贴上传</a></h1>
      <div class="chapter-content">
        <nav class="chapter-toc">
          <h1>(总共$${sum}张截图，每页显示$${eachPage}张)</h1>
          <ul>
            ${rows.map((row, index) => html`
                <li class="gweb-smoothscroll-control qp-ui">
                    <div class="image">
                        <div class="box"><a href="$${row.dataValues.url}" target="_blank"><span class="center-helper"></span><img src="$${row.dataValues.url}" border="0"></a></div>
                    </div>
                    <div class="info">
                        <ul class="mdl-list j-action-btn">
                          <li><a class="mdl-button mdl-js-button mdl-button--icon j-rename j-rename-$${row.dataValues.id}" data-name="$${row.dataValues.name}" data-id="$${row.dataValues.id}" title="修改文件名" href="javasript:void(0);">&#9998;</a></li>
                          <li><a class="mdl-button mdl-js-button mdl-button--icon j-remark j-remark-$${row.dataValues.id}" data-remark="$${row.dataValues.option}" data-id="$${row.dataValues.id}" href="javasript:void(0);" title="修改备注">&#128456;</a></li>
                          <li><a href="javasript:void(0);" class="mdl-button mdl-js-button mdl-button--icon j-tag j-tag-$${row.dataValues.id}" data-tag="$${row.dataValues.tags}" data-id="$${row.dataValues.id}" title="标签管理">&#9003;</a></li>
                        </ul>
                        $${more.tags['t'+row.dataValues.id] ? '<div class="tags f-size-small">标签：'+more.tags['t'+row.dataValues.id] + '</div>' : ''}
                        $${row.dataValues.option? '<div class="remark f-size-small">备注：'+row.dataValues.option+'</div>':''}

                        <span>【$${index+1}】 $${publisDate(row.dataValues.name)} </span><br>
                        <span id="data_url_$${index+1}">$${row.dataValues.url}</span> <br>
                        <input type="button" name="copy_url_$${index+1}" class="copy-url" id="copy_url_$${index+1}" value="复制链接"><br>
                        <span id="data_md_$${index+1}">![<span title="可编辑" contenteditable="true">$${row.dataValues.category}截图</span>]($${row.dataValues.url} "$${row.dataValues.name}")</span> <br>
                        <input type="button" name="copy_md_$${index+1}" class="copy-md" id="copy_md_$${index+1}" value="复制 Markdown 格式">
                        <br>
                    </div>
                </li>
            `)}
            </ul>
        </nav>
        <div class="article-list">
        </div>
      </section>
    </div>
    <footer>
        <div class="text-center paging">
        <a class="$${parseInt(cp,10) > 1 ? '' : 'hide'}" href="$${parseInt(cp,10) > 1 ? parseInt(cp,10) - 1 : 'javascript:void(0);'}">上一页</a>
        ${Array.from({length: 1+parseInt(sum/eachPage,10)}, (v, k) => k+1).map((n,i)=>html`
            <a class="$${parseInt(n,10) === parseInt(cp,10) ? 'current' : ''}" href="$${parseInt(n,10) === parseInt(cp,10) ? 'javascript:void(0);' : '/'+n}">第$${n}页</a>
        `)}
        <a class="$${1+parseInt(sum/eachPage,10) > parseInt(cp,10) ? '' : 'hide'}" href="$${1+parseInt(sum/eachPage,10) > parseInt(cp,10) ? parseInt(cp,10) + 1 : 'javascript:void(0);'}">下一页</a>
        </div>
    </footer>
    <div class="qp-ui-mask-modal u-model u-model-login">
      <dialog class="u-dialog u-dialog-login">
        <span class="close-modal">
          <button class="mdl-button mdl-js-button mdl-button--icon">X</button>
        </span>
        <h3 class="title">登录</h3>
        <div class="content">
          <form>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
              <input class="mdl-textfield__input" type="text" pattern="^[0-9a-z_\.\-]+@[0-9a-z\-]+\.[0-9a-z\.\-]{2,}$" id="email" value="">
              <label class="mdl-textfield__label" for="email">电子邮箱</label>
              <span class="mdl-textfield__error">请输入输入电子邮箱地址！</span>
              <span class="mdl-textfield__res"></span>
            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
              <input class="mdl-textfield__input" type="password" pattern="^.{6,}$" id="password" value="">
              <label class="mdl-textfield__label" for="password">密码</label>
              <span class="mdl-textfield__error">请输入6位以上密码！</span>
              <span class="mdl-textfield__res"></span>
            </div>
          </form>
        </div>
        <div class="actions">
          <span class="mdl-form__res"></span>
          <div class="mdl-spinner mdl-js-spinner"></div>
          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent j-close">
            取消
          </button>
          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored j-login">
            登录
          </button>
          <p><br><br>还没注册？点击<a href="javascript:void(0);" class=" link-register">加入</a>。</p>

        </div>
      </dialog>
    </div>
    <div class="qp-ui-mask-modal u-model u-model-register">
      <dialog class="u-dialog u-dialog-register">
        <span class="close-modal">
          <button class="mdl-button mdl-js-button mdl-button--icon">X</button>
        </span>
        <h3 class="title">注册 <span>已经注册？点击<a href="javascript:void(0);" class=" link-login">登录</a>。</span></h3>
        <div class="content">
          <form>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
              <input class="mdl-textfield__input" type="text" pattern="^[0-9a-z_\.\-]+@[0-9a-z\-]+\.[0-9a-z\.\-]{2,}$" id="reg_email" value="">
              <label class="mdl-textfield__label" for="reg_email">电子邮箱</label>
              <span class="mdl-textfield__error">请输入输入电子邮箱地址！</span>
              <span class="mdl-textfield__res"></span>
            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
              <input class="mdl-textfield__input" type="password" pattern="^.{6,}$" id="reg_password" value="">
              <label class="mdl-textfield__label" for="reg_password">密码</label>
              <span class="mdl-textfield__error">请输入6位以上密码！</span>
              <span class="mdl-textfield__res"></span>
            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
              <input class="mdl-textfield__input" type="password" pattern="^.{6,}$" id="reg_password2" value="">
              <label class="mdl-textfield__label" for="reg_password2">确认密码</label>
              <span class="mdl-textfield__error">请确认密码正确！</span>
              <span class="mdl-textfield__res"></span>
            </div>
          </form>
        </div>
        <div class="actions">
          <span class="mdl-form__res"></span>
          <div class="mdl-spinner mdl-js-spinner "></div>
          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent j-close">
            取消
          </button>
          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored j-register">
            确定
          </button>


        </div>
      </dialog>
    </div>

    <div class="qp-ui-mask-modal u-model u-model-rename">
      <dialog class="u-dialog u-dialog-rename">
        <span class="close-modal">
          <button class="mdl-button mdl-js-button mdl-button--icon">X</button>
        </span>
        <h3 class="title">修改图片名</h3>
        <div class="content">
          <form>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
              <input class="mdl-textfield__input" type="text" pattern="^[0-9a-z_\.\-]+\.[0-9a-z]{2,}$" id="rename-name" value="">
              <input class="mdl-textfield__input" type="hidden" id="rename-name-id" data-name="" value="">
              <label class="mdl-textfield__label" for="rename-name">图片名</label>
              <span class="mdl-textfield__error">请输入输入图片名！</span>
              <span class="mdl-textfield__res"></span>
            </div>
          </form>
        </div>
        <div class="actions">
          <span class="mdl-form__res"></span>
          <div class="mdl-spinner mdl-js-spinner"></div>
          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent j-close">
            取消
          </button>
          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored j-submit-rename">
            确定修改
          </button>
          <p></p>
        </div>
      </dialog>
    </div>

    <div class="qp-ui-mask-modal u-model u-model-tag">
      <dialog class="u-dialog u-dialog-tag">
        <span class="close-modal">
          <button class="mdl-button mdl-js-button mdl-button--icon">X</button>
        </span>
        <h3 class="title">标签管理<span>(每个图片最多十个标签)</span></h3>
        <div class="content">
          <form>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
              <input class="mdl-textfield__input" type="text" pattern="^.{2,}$" id="tag-name" value="">
              <input class="mdl-textfield__input" type="hidden" id="tag-name-id" data-name=""  value="">
              <label class="mdl-textfield__label" for="tag-name">标签名</label>
              <span class="mdl-textfield__error">请输入标签！(多个标签用空格分割)</span>
              <span class="mdl-textfield__res"></span>
            </div>
            <div class="tags"><ul></ul></div>
          </form>
        </div>
        <div class="actions">
          <span class="mdl-form__res"></span>
          <div class="mdl-spinner mdl-js-spinner"></div>
          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent j-close">
            取消
          </button>
          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored j-submit-tag">
            确定
          </button>
          <p></p>
        </div>
      </dialog>
    </div>

    <div class="qp-ui-mask-modal u-model u-model-remark">
      <dialog class="u-dialog u-dialog-remark">
        <span class="close-modal">
          <button class="mdl-button mdl-js-button mdl-button--icon">X</button>
        </span>
        <h3 class="title">修改备注</h3>
        <div class="content">
          <form>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
              <textarea class="mdl-textfield__textarea" id="remark-name" rows="5" cols="90" pattern="^.{2,}$" ></textarea>
              <input class="mdl-textfield__input" type="hidden" id="remark-name-id" value="">
              <label class="mdl-textfield__label" for="remark-name">备注</label>
              <span class="mdl-textfield__error">请输入备注！</span>
              <span class="mdl-textfield__res"></span>
            </div>
          </form>
        </div>
        <div class="actions">
          <span class="mdl-form__res"></span>
          <div class="mdl-spinner mdl-js-spinner"></div>
          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent j-close">
            取消
          </button>
          <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored j-submit-remark">
            确定
          </button>
          <p></p>
        </div>
      </dialog>
    </div>

    <script src="/static/material.js"></script>
    <script src="/static/index.js"></script>
  </body>
</html>
    `;

/*
console.log(tmpl([
    { first: '<Jane>', last: 'Bond' },
    { first: 'Lars', last: '<Croft>' },
]));
$${addr.first ? addr.first : '(No first name)'}
$${addr.first || '(No first name)'}
 */