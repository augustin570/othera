import './styles/app.css';

import Application from './scripts/application.js';

window.onload = function () {
    const application = new Application( document.querySelector( '.Application' ) );
    application.init();
};