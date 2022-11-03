import { fetchJson } from './misc.js';
import L from "leaflet";

// import { Icon } from 'leaflet';
// import { LatLng } from 'leaflet';
// import { Map } from 'leaflet';
// import { Marker } from 'leaflet';
// import { TileLayer } from 'leaflet';
// import { Routing } from 'leaflet-routing-machine';

// Montreal
// const lat = 45.508889;
// const lon = -73.554167;

// Repentigny
const lat = 45.7422200;
const lon = -73.4500800;

export default class Carte {
    constructor ( $element ) {
        if ( ! $element ) return;
        this.$element = $element;

        this._equipmentWaterPath = this.$element.dataset.url;
        this._flameIconPath = this.$element.dataset.flameIconPath;

        this._onPopupOpen = this._onPopupOpen.bind( this );
        this._onPopupClose = this._onPopupClose.bind( this );

        this._map = null;
        this._drinkingFountains = [];
    }

    async init () {
        this.drinkingFountains = await this._processDrinkingFountains();

        this._initFlameIcon();
        this._initMap();
        this._drawDrinkingFountains();
    }

    _initFlameIcon () {
        this._flameIcon = new L.Icon( {
            iconUrl: this._flameIconPath,
            iconSize: [ 25, 41 ],
            iconAnchor: [ 12, 41 ],
            popupAnchor: [ 1, -34 ],
            shadowSize: [ 41, 41 ]
        } );
    }

    async _processDrinkingFountains () {
        const data = await fetchJson( this._equipmentWaterPath );
        for ( let line of data ) {
            if ( line.TYPE !== 'Fontaine à boire' ) continue;
            this._drinkingFountains.push( {
                latitude: line.LATITUDE,
                text: this._processDrinkingFountainsText( line ),
                longitude: line.LONGITUDE,
            } );
        }
    }

    _processDrinkingFountainsText ( data ) {
        const isOpened = false;
        const today = new Date();
        const todayConverted = ( '0' + ( today.getMonth() + 1 ) ).slice( -2 ) + '-' + ( '0' + today.getDate() ).slice( -2 );
        if ( todayConverted >= '06-01' && todayConverted < '10-15' ) isOpened = true;
        return ( isOpened ? 'Ouvert' : 'Fermé' ) + '<button class="test">click me</button><br>' + data.LOCALISAT
    }

    _initMap () {
        this._map = L.map( this.$element ).setView( [ lat, lon ], 11 );
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
        document.querySelectorAll( '.test' ).forEach( $popup => {
            $popup.addEventListener( 'click', this._onClickCursor.bind( this, event.popup ), { once: true } );
        } );
    }

    _onPopupClose ( event ) {
        document.querySelectorAll( '.test' ).forEach( $popup => {
            $popup.removeEventListener( 'click', this._onClickCursor.bind( this, event.popup ) );
        } );
    }

    _onClickCursor ( popup, event ) {
        event.preventDefault();
        this._map.closePopup();
    }

    _drawDrinkingFountains () {
        for ( let drinkingFountain of this._drinkingFountains ) {
            this._addMarker( drinkingFountain.latitude, drinkingFountain.longitude, {}, drinkingFountain.text );
        }
    }

    _addMarkerFire ( e ) {
        if ( ! confirm( 'Voulez-vous ajouter une prévention ici ?' ) ) return false;
        this._addMarker( e.latlng.lat, e.latlng.lng, { icon: this._flameIcon }, 'Fait chaud ici' )
    }

    _addMarker ( latitude, longitude, options = {}, text = null ) {
        let marker = new L.marker( [ latitude, longitude ], options );
        marker.addTo( this._map );
        if ( text ) marker.bindPopup( text );
    }
}