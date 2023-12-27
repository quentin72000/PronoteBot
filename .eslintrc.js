module.exports = {
    "env": {
        "commonjs": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:n/recommended"
    ],
    plugins: [
        "@stylistic",
        "n"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
        "@stylistic/indent": [
            "error",
            4
        ],
        "@stylistic/linebreak-style": [
            "error",
            "windows"
        ],
        "@stylistic/quotes": [
            "error",
            "double"
        ],
        "@stylistic/semi": [
            "error",
            "always"
        ],
        "@stylistic/semi-style": [
            "error",
            "last"
        ],

        "block-scoped-var": "error",
        "@stylistic/array-bracket-spacing": "error",
        "array-callback-return": "error",
        "block-spacing": "error",
        "callback-return": "error",
        "eqeqeq": "error",
        "@stylistic/max-len": ["error", { "code": 120, "ignoreComments": true }],
        "@stylistic/max-statements-per-line": "error",
        "no-alert": "error",
        "@stylistic/no-confusing-arrow": "error",
        "no-duplicate-imports": "error",
        "no-else-return": "error",
        "no-empty-function": "error",
        "no-eq-null": "error",
        "no-eval": "error",
        "no-implied-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "@stylistic/no-floating-decimal": "error",
        "no-implicit-globals": "error",
        "no-invalid-this": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-lonely-if": "error",
        "no-loop-func": "error",
        "no-loss-of-precision": "error",
        "@stylistic/no-multi-spaces": "error",
        "no-multi-str": "error",
        "no-multiple-empty-lines": "error",
        "no-new": "error",
        "no-new-func": "error",
        "no-object-constructor": "error",
        "no-new-wrappers": "error",
        "no-promise-executor-return": "error",
        "no-self-compare": "error",
        "no-sequences":  "error",
        "no-shadow": "error",
        "@stylistic/function-call-spacing": ["error", "never"],
        "@stylistic/no-tabs": "error",
        "@stylistic/no-trailing-spaces": "error",
        "no-unmodified-loop-condition": "error",
        "no-unneeded-ternary": "error",
        "no-unreachable-loop": "error",
        "no-unused-expressions": "error",
        "no-use-before-define": ["error", "nofunc"],
        "no-useless-computed-key": "error",
        "no-useless-concat": "error",
        "no-useless-constructor": "error",
        "no-useless-rename": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "@stylistic/no-whitespace-before-property": "error",
        "@stylistic/nonblock-statement-body-position": "error",
        "@stylistic/object-curly-spacing": ["error", "always"],
        "@stylistic/one-var-declaration-per-line": "error",
        "operator-assignment": ["error", "always"],
        "operator-linebreak": ["error", "before", { "overrides": { "?": "after" } }],
        "padding-line-between-statements": "error",
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        "prefer-exponentiation-operator": "error",
        "prefer-numeric-literals": "error",
        "prefer-object-spread": "error",
        "prefer-promise-reject-errors": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "@stylistic/space-before-blocks": "error",
        "@stylistic/space-before-function-paren": ["error", "never"],
        "@stylistic/space-in-parens": [
            "error",
            "never"
        ],
        "@stylistic/space-infix-ops": "error",
        "@stylistic/space-unary-ops": "error",
        "@stylistic/spaced-comment": "error",
        "@stylistic/switch-colon-spacing": "error",
        "@stylistic/template-tag-spacing": "error",
        "@stylistic/template-curly-spacing": "error",
        "vars-on-top": "error",
        "@stylistic/wrap-iife": "error",
        "@stylistic/wrap-regex": "error",
        "yoda": "error",
        "keyword-spacing": ["error", { "after": true }],

        "n/exports-style": ["error", "module.exports"],
        "n/file-extension-in-import": ["error", "always"],
        "n/prefer-global/buffer": ["error", "always"],
        "n/prefer-global/console": ["error", "always"],
        "n/prefer-global/process": ["error", "always"],
        "n/prefer-global/url-search-params": ["error", "always"],
        "n/prefer-global/url": ["error", "always"],
        "n/prefer-promises/dns": "error",
        "n/prefer-promises/fs": "error",
        "n/no-unpublished-require": "off",
        "n/no-mixed-requires": "error",
        "no-multi-assign": "error",
        "n/no-new-require": "error",
        "n/no-path-concat": "error",
        "n/no-sync": ["error", { "allowAtRootLevel": true }],
    }
};