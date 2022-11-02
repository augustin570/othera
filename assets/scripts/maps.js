// Montreal
// const lat = 45.508889;
// const lon = -73.554167;

// Repentigny
const lat = 45.7422200;
const lon = -73.4500800;

async function fetchJson ( url ) {
    return fetch( url )
    .then( ( response ) => response.json() )
    .then( ( data ) => { return data } );
}

const flameIcon = new L.Icon({
    iconUrl: 'assets/images/flameIcon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

class Map {
    constructor ( equipmentWaterPath ) {
        this._equipmentWaterPath = equipmentWaterPath;

        this._map = null;
        this._drinkingFountains = [];
    }

    async init () {
        this.drinkingFountains = await this._processDrinkingFountains();

        this._initMap();
        this._drawDrinkingFountains();
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
        return ( isOpened ? 'Ouvert' : 'Fermé' ) + '<br>' + data.LOCALISAT
    }

    _initMap () {
        this._map = L.map( 'map' ).setView( [ lat, lon ], 11 );
        L.tileLayer( 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
            minZoom: 1,
            maxZoom: 20
        } ).addTo( this._map );
        this._map.on('click', this._addMarkerFire.bind( this ) );
    }

    _drawDrinkingFountains () {
        for ( let drinkingFountain of this._drinkingFountains ) {
            this._addMarker( drinkingFountain.latitude, drinkingFountain.longitude, {}, drinkingFountain.text );
        }
    }

    _addMarkerFire ( e ) {
        if ( ! confirm( 'Voulez-vous ajouter une prévention ici ?' ) ) return false;
        this._addMarker( e.latlng.lat, e.latlng.lng, { icon: flameIcon }, 'Fait chaud ici' )
    }

    _addMarker ( latitude, longitude, options = {}, text = null ) {
        let marker = new L.marker( [ latitude, longitude ], options );
        marker.addTo( this._map );
        if ( text ) marker.bindPopup( text );
    }
}



window.onload = function () {
        const map = new Map(
        'assets/data/equipement_eau.json'
    );
    map.init()
};