import { fetchJson, getParent } from './misc.js';

import Address from './address.js';
import L from 'leaflet';

// Montreal
// const lat = 45.508889;
// const lon = -73.554167;

// Repentigny
const lat = 45.7422200;
const lon = -73.4500800;

export default class Application {
    constructor ( $element ) {
        if ( ! $element ) return;
        this.$element = $element;

        this._map = null;
        this._drinkingFountains = [];
        this._drinkingFountainsShown = true;
        this._termometersShown = true;
        this.__addresses = [];
        this._markers = {};

        this._drinkingFountainRepentignyPath = this.$element.dataset.drinkingFountainRepentignyPath;
        this._drinkingFountainMontrealPath = this.$element.dataset.drinkingFountainMontrealPath;
        this._termometerIconPath = this.$element.dataset.termometerIconPath;
        this._drinkingFountainIconPath = this.$element.dataset.drinkingFountainIconPath;
        this._drinkingFountainPopup = this.$element.dataset.drinkingFountainPopup;

        this._onPopupOpen = this._onPopupOpen.bind( this );
        this._onPopupClose = this._onPopupClose.bind( this );
        this._onClickToggler = this._onClickToggler.bind( this );
    }

    async init () {
        this.$element.querySelectorAll( '.Address' ).forEach( $address => {
            this.__addresses.push( new Address( $address ) );
        } );
        this.$d_canvas = this.$element.querySelector( '.Application--canvas' );
        this.$b_togglers = this.$element.querySelectorAll( '.Application--toggler' );
        this.$b_togglers.forEach( $toggler => {
            $toggler.addEventListener( 'click', this._onClickToggler );
        } );

        await this._processDrinkingFountainsRepentigny();
        await this._processDrinkingFountainsMontreal();

        this._initTermometerIcon();
        this._initDrinkingFountainIcon();
        this._initMap();
        this._drawDrinkingFountains();
    }

    _onClickToggler ( event ) {
        event.preventDefault();
        const $toggler = getParent( event.target, 'Application--toggler' );
        if ( ! $toggler ) return false;
        const type = $toggler.dataset.type;
        switch ( type ) {
            case 'drinking-fountain':
                this._drinkingFountainsShown = this._toggleMarkersByType( type, this._drinkingFountainsShown );
                break;
            case 'termometer':
                this._termometersShown = this._toggleMarkersByType( type, this._termometersShown );;
                break;
            default:
                break;
        }
    }

    _initTermometerIcon () {
        this._termometerIcon = new L.Icon( {
            iconUrl: this._termometerIconPath,
            iconSize: [ 32, 32 ],
            iconAnchor: [ 16, 32 ],
            popupAnchor: [ 1, -34 ],
            shadowSize: [ 41, 41 ]
        } );
    }

    _initDrinkingFountainIcon () {
        this._drinkingFountainIcon = new L.Icon( {
            iconUrl: this._drinkingFountainIconPath,
            iconSize: [ 32, 32 ],
            iconAnchor: [ 16, 32 ],
            popupAnchor: [ 1, -34 ],
            shadowSize: [ 41, 41 ]
        } );
    }

    async _processDrinkingFountainsRepentigny () {
        const data = await fetchJson( this._drinkingFountainRepentignyPath );
        for ( let line of data ) {
            if ( line.TYPE !== 'Fontaine à boire' ) continue;
            this._drinkingFountains.push( {
                latitude: line.LATITUDE,
                text: this._processDrinkingFountainsRepentignyText( line ),
                longitude: line.LONGITUDE,
            } );
        }
    }

    async _processDrinkingFountainsMontreal () {
        const data = await fetchJson( this._drinkingFountainMontrealPath );
        for ( let line of data ) {
            this._drinkingFountains.push( {
                latitude: line.Latitude,
                text: this._processDrinkingFountainsMontrealText( line ),
                longitude: line.Longitude,
            } );
        }
    }

    _processDrinkingFountainsRepentignyText ( data ) {
        const isOpened = false;
        const today = new Date();
        const todayConverted = ( '0' + ( today.getMonth() + 1 ) ).slice( -2 ) + '-' + ( '0' + today.getDate() ).slice( -2 );
        if ( todayConverted >= '06-01' && todayConverted < '10-15' ) isOpened = true;
        return this._drinkingFountainPopup
            .replace( '__state__', ( isOpened ? 'Ouvert' : 'Fermé' ) + '<br>' )
            .replace( '__localisation__', data.LOCALISAT )
        ;
    }

    _processDrinkingFountainsMontrealText ( data ) {
        return this._drinkingFountainPopup
            .replace( '__state__', '' )
            .replace( '__localisation__', '' )
        ;
    }

    _initMap () {
        this._map = L.map( this.$d_canvas ).setView( [ lat, lon ], 11 );
        L.tileLayer( 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
            minZoom: 1,
            maxZoom: 20
        } ).addTo( this._map );
        this._map.on( 'click', this._addMarkerFire.bind( this ) );
        this._map.on( 'popupopen', this._onPopupOpen );
        this._map.on( 'popupclose', this._onPopupClose );

        // Routing.control({
        //     waypoints: [
        //       L.latLng(57.74, 11.94),
        //       L.latLng(57.6792, 11.949)
        //     ]
        //   }).addTo(this._map);
    }

    _onPopupOpen ( event ) {
        document.querySelectorAll( '.Application--drinking-water' ).forEach( $popup => {
            $popup.addEventListener( 'click', this._onClickCursor.bind( this, event.popup ), { once: true } );
        } );
    }

    _onPopupClose ( event ) {
        document.querySelectorAll( '.Application--drinking-water' ).forEach( $popup => {
            $popup.removeEventListener( 'click', this._onClickCursor.bind( this, event.popup ) );
        } );
    }

    _onClickCursor ( popup, event ) {
        event.preventDefault();
        this._map.closePopup();
    }

    _drawDrinkingFountains () {
        for ( let drinkingFountain of this._drinkingFountains ) {
            this._addMarker( 'drinking-fountain', drinkingFountain.latitude, drinkingFountain.longitude, { icon: this._drinkingFountainIcon }, drinkingFountain.text );
        }
    }

    _addMarkerFire ( e ) {
        if ( ! confirm( 'Voulez-vous ajouter une prévention ici ?' ) ) return false;
        this._addMarker( 'termometer', e.latlng.lat, e.latlng.lng, { icon: this._termometerIcon }, 'Fait chaud ici' )
    }

    _addMarker ( type, latitude, longitude, options = {}, text = null ) {
        let marker = new L.marker( [ latitude, longitude ], options );
        // marker.addTo( this._map );
        this._map.addLayer( marker );
        if ( text ) marker.bindPopup( text );

        if ( ! ( type in this._markers ) ) this._markers[ type ] = [];
        this._markers[ type ].push( marker );
    }

    _toggleMarkersByType ( type, status ) {
        if ( ! ( type in this._markers ) ) return status;
        status = ! status;
        for ( let marker of this._markers[ type ] ) {
            if ( status ) {
                this._map.addLayer( marker );
            } else {
                this._map.removeLayer( marker );
            }
        }
        return status;
    }
}