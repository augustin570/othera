import './styles/app.css';

import Carte from './scripts/maps.js';
import Address from './scripts/address.js';

window.onload = function () {
    document.querySelectorAll( '.Address' ).forEach( $address => {
        new Address( $address );
    } );
    const map = new Carte( document.querySelector( '.Carte' ) );
    map.init();
};