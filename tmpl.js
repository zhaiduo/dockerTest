
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

exports.indexTmpl = rows => html`
        <h1>Welcome to Image Server! </h1>
        <ul>
        ${rows.map((row, index) => html`
            <li>
                $${index+1}. $${row.dataValues.category}<br>
                <img src="$${row.dataValues.url}" border="0"><br>
                ![] ($${row.dataValues.url} "$${row.dataValues.name}")
                <br>
            </li>
        `)}
        </ul>
    `;

/*
console.log(tmpl([
    { first: '<Jane>', last: 'Bond' },
    { first: 'Lars', last: '<Croft>' },
]));
$${addr.first ? addr.first : '(No first name)'}
$${addr.first || '(No first name)'}
 */