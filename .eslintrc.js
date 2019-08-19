module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: "eslint:recommended",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {
    "react/jsx-filename-extension": 0,
    "function-paren-newline": 0,
    "react/destructuring-assignment": 0,
    "import/no-named-as-default": 0,
    "react/jsx-wrap-multilines": 0,
    "implicit-arrow-linebreak": 0,
    "import/prefer-default-export": 0,
    "class-methods-use-this": 0
  }
};
