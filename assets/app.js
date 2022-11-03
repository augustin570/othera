import './styles/app.css';

import Map from './scripts/maps.js';
import Address from './scripts/address.js';

window.onload = function () {
    document.querySelectorAll( '.Address' ).forEach( $address => {
        new Address( $address );
    } );
    const map = new Map( 'assets/data/equipement_eau.json' );
    map.init();
};