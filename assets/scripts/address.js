import { debounce, fetchJson, getParent } from './misc.js';


export default class Address {
    constructor ( $element ) {
        if ( ! $element ) return;
        this.$element = $element;

        this._url = this.$element.dataset.url;

        this._onInputField = this._onInputField.bind( this );
        this._onClickDocument = this._onClickDocument.bind( this );
        this._onClickAddress = this._onClickAddress.bind( this );
        this._onClickField = this._onClickField.bind( this );

        this._init();
    }

    _init () {
        this.$i_field = this.$element.querySelector( '.Address--field' );
        this.$d_container = this.$element.querySelector( '.Address--container' );
        this.$u_list = this.$element.querySelector( '.Address--list' );
        this.$d_noResults = this.$element.querySelector( '.Address--no-results' );
        this.$d_loader = this.$element.querySelector( '.Address--loader' );

        this.$i_field.addEventListener( 'input', debounce( this._onInputField, 300 ) );
        this.$i_field.addEventListener( 'click', this._onClickField );
    }

    async _onInputField () {
        const address = this.$i_field.value.trim();
        this._showContainer();
        if ( address === '' ) {
            this._hideAll();
            return false;
        }
        this._hideNoResults();
        this._showLoader();
        this._destroyList();
        const data = await fetchJson( this._url.replace( '__text__', address) );
        this._hideLoader();
        this._processAddresses( data.results );
    }

    _onClickField ( event ) {
        event.preventDefault();
        event.stopPropagation();
        if ( this.$u_list.querySelectorAll( 'li' ).length <= 0 ) return false;
        this._showContainer();
    }

    _onClickAddress ( event ) {
        const $address = getParent( event.target, 'Address--element' );
        if ( ! $address ) return false;
        this.$i_field.value = $address.textContent;
    }

    _onClickDocument ( event ) {
        this._hideAll();
    }

    _hideAll () {
        this._hideContainer();
        this._hideNoResults();
        this._hideLoader();
    }

    _destroyList () {
        this.$u_list.querySelectorAll( 'li' ).forEach( $address => {
            $address.removeEventListener( 'click', this._onClickAddress );
        } );
        this.$u_list.innerHTML = '';
    }

    _processAddresses ( addresses ) {
        if ( addresses.length <= 0 ) {
            this._showNoResults();
            return false;
        }

        this._showList();
        for( let address of addresses ) {
            this._addAddress( address.address_line2 );
        }
    }

    _addAddress( text ) {
        const $address = document.createElement( 'li' );
        $address.classList.add( 'Address--element' );
        $address.classList.add( 'cursor-pointer' );
        $address.addEventListener( 'click', this._onClickAddress );
        const $text = document.createTextNode( text );
        $address.appendChild( $text );
        this.$u_list.appendChild( $address );
    }

    _showLoader () {
        this.$d_loader.classList.remove( 'hidden' );
    }

    _hideLoader () {
        this.$d_loader.classList.add( 'hidden' );
    }

    _showContainer () {
        document.addEventListener( 'click', this._onClickDocument, { once: true } );
        this.$d_container.classList.remove( 'hidden' );
    }

    _hideContainer () {
        this.$d_container.classList.add( 'hidden' );
    }

    _showList () {
        this.$u_list.classList.remove( 'hidden' );
    }

    _hideList () {
        this.$u_list.classList.add( 'hidden' );
    }

    _showNoResults  () {
        this.$d_noResults .classList.remove( 'hidden' );
    }

    _hideNoResults  () {
        this.$d_noResults .classList.add( 'hidden' );
    }
}