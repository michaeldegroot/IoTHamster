# reactron-boilerplate

![](https://i.imgur.com/EWE2UUU.png)

[![HitCount](http://hits.dwyl.io/michaeldegroot/reactron-boilerplate.svg)](http://hits.dwyl.io/michaeldegroot/reactron-boilerplate) [![Node version](https://img.shields.io/node/v/cipher-chain.svg)](https://www.npmjs.com/package/cipher-chain) [![Licensing](https://img.shields.io/github/license/michaeldegroot/reactron-boilerplate.svg)](https://raw.githubusercontent.com/michaeldegroot/reactron-boilerplate/master/LICENSE) [![Help us and star this project](https://img.shields.io/github/stars/michaeldegroot/reactron-boilerplate.svg?style=social)](https://github.com/michaeldegroot/reactron-boilerplate)

![break]

`reactron-boilerplate` is a `Create React App` based boilerplate, simple to use, simple to understand, non ejected `react` desktop app run on `electron` with loads of library goodies.

This boilerplate is meant to be expanded on by the git cloner, gives you the bare basics to make awesome stuff quick.

- [x] _Easy customization_
- [x] _Hot reload and auto restarts_
- [x] _Cross platform distribution_
- [x] _Database handling, migrations_
- [x] _Integration testing_
- [x] _Splash window_
- [x] _React dev tools_
- [x] _Internal routing_
- [x] _IPC (Inter Process Communication)_
- [x] _JSX file support_
- [x] _SASS_
- [ ] _MobX (to be implemented)_

**Please note:**
_This boilerplate will be changing a lot at it's life cycle start, it is currently in it's infancy, a lot of things are subject to change. If you want to experiment right now it is recommended to fork the repository (or use version tagging/lock) so you can work on frozen version of the code where you can update on your own leisure_

### Tech Stack

###### Desktop Application

- ![](https://i.imgur.com/qf8vXHi.png) [Electron](https://electronjs.org/)

###### User Interface

- ![](https://i.imgur.com/zcJJSVm.png) [React](https://reactjs.org/)
- [Bootstrap](https://getbootstrap.com/)
- [React Icons](https://react-icons.netlify.com/#/)

###### State Management

- ![](https://i.imgur.com/XTJZPJ6.png) [MobX](https://mobx.js.org/)
- [react-router](https://reacttraining.com/react-router/web/guides/quick-start)

###### Testing Suite

- [Spectron](https://electronjs.org/spectron)
- ![](https://i.imgur.com/wqzzLXl.png) [Mocha](https://mochajs.org/)

###### Continiuous Integration

- [Travis CI](https://travis-ci.org/)

###### Data Storage (Database)

- ![](https://i.imgur.com/ETYR7Uo.png) [Objection.js](https://vincit.github.io/objection.js/)
- [Knex.js](http://knexjs.org/)

###### Compiler

- [Babel](https://babeljs.io/)

###### Linting & Config

- [ESLint](https://eslint.org/)
- [EditorConfig](https://editorconfig.org/)

###### Distribution

- [electron-builder](https://github.com/electron-userland/electron-builder)

###### Other Library's

- [electron-devtools-installer](https://github.com/MarshallOfSound/electron-devtools-installer)
- [custom-electron-titlebar](https://github.com/AlexTorresSk/custom-electron-titlebar)
- [electron-util](https://github.com/sindresorhus/electron-util)
- [electron-window-state](https://github.com/mawie81/electron-window-state)

## Project Overview

```js
app
├── knexfile.js          // Database configuration
├── travis.yml           // Travis CI build file
├── .eslintrc            // ESLint config
├── .editorconfig        // EditorConfig config
├── build                // react build output
├── dist                 // electron-builder output folder
├── main-process         // Ipc main events
├── migrations           // Knex migrations
├── text                 // Integration test folder
├── model                // Objection model files
└── public
    ├── modules
        └── db.js        // Knex/objection integration
    ├── assets           // Include assets like images, sounds etc
    ├── index.html       // Template index
    ├── splash.html      // Splash index
    ├── electron.js      // Main entry file
└── src                  // Renderer process (jsx, js, css)
    ├── setupTests.js    // jest-dom adds custom jest matchers for asserting on DOM nodes. This file allows this
    ├── serviceWorker.js // A service worker script that the renderer runs in the background separate from the process.
    ├── index.css
    ├── index.jsx        // Renderer entry file
    └── components       // JSX components
        └── App          // Test JSX Component App
```

## Install

```bash
git clone git@github.com:michaeldegroot/reactron-boilerplate.git
cd reactron-boilerplate
npm install
```

## Development

###### Testing

```bash
npm run test
```

Tests are located in `src/components/App/App.test.js` for example

###### Developing

_Development and auto reload/restart scripts are activated by the following command_

```bash
npm run dev
```

this will activate a watch script for changes and auto boot the electron window, unless there was a error (will show in console)

## Production

###### Building

```bash
npm run build
```

###### Distribution

_You can create distribution files (installation/exe) but you will need to sign them yourself_

```bash
npm run dist
```

checkout [package.json](https://github.com/michaeldegroot/reactron-boilerplate/blob/master/package.json) and [electron-builder](https://github.com/electron-userland/electron-builder) for more info

## License

Copyright (c) 2020 by [GiveMeAllYourCats](https://github.com/michaeldegroot). Some rights reserved.<br>
[reactron-boilerplate](https://github.com/michaeldegroot/reactron-boilerplate) is licensed under the MIT License as stated in the [LICENSE file](https://github.com/michaeldegroot/reactron-boilerplate/blob/master/LICENSE).
