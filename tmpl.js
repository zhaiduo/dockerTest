
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
            subst = htmlEscape(subst);
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

const getDateObj = (t) => {
    let dt;
    if (t !== undefined) {
        if (typeof t === 'string' || typeof t === 'number') {
            dt = new Date(t);
        } else {
            dt = new Date();
        }
    } else {
        dt = new Date();
    }
    return {
        y: dt.getFullYear(),
        m: dt.getMonth() + 1,
        d: dt.getDate(),
        h: dt.getHours(),
        i: dt.getMinutes(),
        s: dt.getSeconds()
    };
}

const publisDate = name => {
  if(name.match(/([0-9]+)\.png$/i)){
    let dt = getDateObj(parseInt(RegExp.$1, 10))
    return `发布于：${dt.y}年${dt.m}月${dt.d}日 ${dt.h}时:${dt.i}分:${dt.s}秒`;
  }else{
    return name
  }
};

exports.indexTmpl = (sum, cp, eachPage, rows, more) => html`
<!DOCTYPE html>
<html class="qp-ui" data-qp-ui="{
  'Futurizr': {
  'hasTouch': 'touch'
  }
  }">
  <head>
    <meta charset="utf-8">
    <link href="/static/styles.css" rel="stylesheet" />
    <meta name="viewport" content="initial-scale=1, width=device-width"/>
    <meta name="keywords" content=""/>
    <title>Pinbot Image Server</title>
  </head>
  <body class="site-material_ext_publish section-resources noninitial-chapter color-light-blue qp-ui" data-qp-ui="{ 'Mask': {} }">
    <header>
      <div class="header-wrapper">
        <div class="header-title">
        <span class="section-title"><img src="https://www.pinbot.me/static/b_index/img/new_logo.png" border="0" style="width: 120px;margin: 10px 0px 20px 0px;"></span>
        <span class="chapter-title"></span>
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
                        <span>【$${index+1}】 $${publisDate(row.dataValues.name)} </span><br>
                        <span id="data_url_$${index+1}">$${row.dataValues.url}</span> <br>
                        <input type="button" name="copy_url_$${index+1}" class="copy-url" id="copy_url_$${index+1}" value="复制链接"><br>
                        <span id="data_md_$${index+1}">![<span title="可编辑" contenteditable="true">$${row.dataValues.category}截图</span>] ($${row.dataValues.url} "$${row.dataValues.name}")</span> <br>
                        <input type="button" name="copy_md_$${index+1}" class="copy-md" id="copy_md_$${index+1}" value="复制Markdown格式">
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
    <script src="/static/lib.js"></script>
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