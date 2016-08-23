module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            0,
            "double"
        ],
        "semi": [
            0,
            "never"
        ],
        "no-unused-vars": [
            1, {
                "vars": "all",
                "args": "after-used"
            }
        ],
        "no-console": [0]
    }
};