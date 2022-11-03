import { debounce, fetchJson } from './misc.js';


export default class Address {
    constructor ( $element ) {
        if ( ! $element ) return;
        this.$element = $element;

        this._url = this.$element.dataset.url;

        this._onInputField = this._onInputField.bind( this );

        this._init();
    }

    _init () {
        this.$i_field = this.$element.querySelector( '.Address--field' );
        console.log( this.$i_field )

        this.$i_field.addEventListener( 'input', debounce( this._onInputField, 300 ) );
    }

    async _onInputField () {
        const address = this.$i_field.value.trim();
        if ( address === '' ) return false;
        const data = await fetchJson( this._url.replace( '__text__', address) );
        console.log( data );
    }
}