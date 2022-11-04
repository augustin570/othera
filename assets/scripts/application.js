import { fetchJson, getParent } from './misc.js';

import Address from './address.js';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'lrm-graphhopper';

// Montreal
const lat = 45.508889;
const lon = -73.554167;

// Repentigny
// const lat = 45.7422200;
// const lon = -73.4500800;

export default class Application {
    constructor ( $element ) {
        if ( ! $element ) return;
        this.$element = $element;

        this._map = null;
        this._drinkingFountains = [];
        this._termometers = [];
        this._drinkingFountainsShown = true;
        this._termometersShown = true;
        this.__addresses = [];
        this._markers = {};
        this._routingControl = null;

        this._drinkingFountainRepentignyPath = this.$element.dataset.drinkingFountainRepentignyPath;
        this._drinkingFountainMontrealPath = this.$element.dataset.drinkingFountainMontrealPath;
        this._termometerIconPath = this.$element.dataset.termometerIconPath;
        this._drinkingFountainIconPath = this.$element.dataset.drinkingFountainIconPath;
        this._drinkingFountainPopup = this.$element.dataset.drinkingFountainPopup;
        this._graphhopperKey = this.$element.dataset.graphhopperKey;
        this._termometerIndexPath = this.$element.dataset.termometerIndexPath;
        this._termometerNewPath = this.$element.dataset.termometerNewPath;

        this._onPopupOpen = this._onPopupOpen.bind( this );
        this._onPopupClose = this._onPopupClose.bind( this );
        this._onClickToggler = this._onClickToggler.bind( this );
        this._onClickTrip = this._onClickTrip.bind( this );
        this._onClickReset = this._onClickReset.bind( this );
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
        this.$b_trip = this.$element.querySelector( '.Application--trip' );
        this.$b_trip.addEventListener( 'click', this._onClickTrip  );
        this.$b_reset = this.$element.querySelector( '.Application--reset' );
        this.$b_reset.addEventListener( 'click', this._onClickReset );

        await this._processDrinkingFountainsRepentigny();
        await this._processDrinkingFountainsMontreal();
        await this._processTermometer();

        this._initTermometerIcon();
        this._initDrinkingFountainIcon();
        this._initMap();
        this._drawDrinkingFountains();
        this._drawThermometers();
    }

    _onClickTrip ( event ) {
        this._setTrip();
    }

    _setTrip () {
        const departurePosition = this._getAddressPosition( 'departure' );
        const arrivalPosition = this._getAddressPosition( 'arrival' );
        this._destroyMarkersByType( 'position' );
        if ( departurePosition !== null && arrivalPosition !== null ) {
            this._removeTrip();
            this._routingControl = L.routing.control( {
                // serviceUrl: 'http://127.0.0.1:8283/route/v1',
                waypoints: [
                    L.latLng( departurePosition[ 0 ], departurePosition[ 1 ] ),
                    L.latLng( arrivalPosition[ 0 ], arrivalPosition[ 1 ] )
                ],
                router: new L.Routing.GraphHopper( this._graphhopperKey , {
                    urlParameters: {
                      vehicle: 'foot'
                    }
                })
            } ).addTo( this._map );
        } else if ( departurePosition !== null ) {
            this._map.setView( [ departurePosition[ 0 ], departurePosition[ 1 ] ], 15 );
            this._addMarker( 'position', departurePosition[ 0 ], departurePosition[ 1 ] );
        } else {
            alert( 'Vous devez indiquer des positions départ et d\'arrivée valides.');
        }
    }

    _onClickReset ( event ) {
        this._removeTrip();
        for ( let address of this.__addresses ) {
            address.set( '', '', '' );
        }
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

    _removeTrip () {
        if ( ! this._routingControl ) return;
        this._map.removeControl( this._routingControl );
    }

    _getAddressPosition ( type ) {
        for ( let address of this.__addresses ) {
            if ( address.getType() !== type ) continue;
            return address.getPosition();
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

    async _processTermometer () {
        const data = await fetchJson( this._termometerIndexPath );
        for ( let line of data.termometers ) {
            this._termometers.push( {
                latitude: line.latitude,
                longitude: line.longitude,
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
        this._map.on( 'click', this._addMarkerTermometer.bind( this ) );
        this._map.on( 'popupopen', this._onPopupOpen );
        this._map.on( 'popupclose', this._onPopupClose );
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
        const latitude = popup._latlng.lat;
        const longitude = popup._latlng.lng;
        for ( let address of this.__addresses ) {
            if ( address.getType() !== 'arrival' ) continue;
            address.set( latitude + ', ' + longitude, latitude, longitude );
        }
        this._map.closePopup();
        setTimeout( this._setTrip.bind( this ), 100 );
    }

    _drawDrinkingFountains () {
        for ( let drinkingFountain of this._drinkingFountains ) {
            this._addMarker( 'drinking-fountain', drinkingFountain.latitude, drinkingFountain.longitude, { icon: this._drinkingFountainIcon }, drinkingFountain.text );
        }
    }

    _drawThermometers () {
        for ( let termometer of this._termometers ) {
            this._addMarker( 'termometer', termometer.latitude, termometer.longitude, { icon: this._termometerIcon }, '' );
        }
    }

    _addMarkerTermometer ( e ) {
        if ( ! confirm( 'Voulez-vous ajouter une prévention ici ?' ) ) return false;
        const latitude =  e.latlng.lat;
        const longitude =  e.latlng.lng;
        this._addMarker( 'termometer', latitude, longitude, { icon: this._termometerIcon }, 'Fait chaud ici' );
        const data = new FormData();
        data.append('termometer[latitude]', latitude);
        data.append('termometer[longitude]', longitude);
        fetchJson( this._termometerNewPath, { method: 'post', body: data } );
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

    _destroyMarkersByType ( type ) {
        if ( ! ( type in this._markers ) ) return false;
        for ( let marker of this._markers[ type ] ) {
            this._map.removeLayer( marker );
        }
        delete this._markers[ type ]
    }
}