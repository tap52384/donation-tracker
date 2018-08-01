/* eslint-env jest, es6 */

// loads the necessary node packages
const jsdom = require( 'jsdom' );
const { JSDOM } = jsdom;

// HTML to be imported as DOM
const html = './app/donation-types.html';
var dom = null;

test( 'sees if window is available before loading DOM...', () => {
    expect( window !== undefined ).toBe( true );
} );

test( 'verifies document is available before loading DOM...', () => {
    expect( document !== undefined && document !== null ).toBe( true );
} );

test( 'loads the DOM ', () => {
    return JSDOM.fromFile( html ).then( result => {
        dom = result;
        document = result.window.document;

        // requires my code to be tested
        require( './app/common.client.js.html' );
        require( './app/donation-types.client.js.html' );


        // console.log( dom.serialize() );
    } ).catch( e => expect( e ).toMatch( 'error' ) );
} );


JSDOM.fromFile( html ).then( function( result ) {

  // sets the document variable to the one created by JSDOM
  document = result.window.document;
  window.document = result.window.document;

  // // requires my code to be tested
  // require( './app/common.client.js.html' );
  // require( './app/donation-types.client.js.html' );

  // prints out the imported HTML
  // console.log( result.serialize() );
  return true;

} )
.then( function() {


    test( 'verifies that the DOM is not null', () => {
        expect( dom ).not.toBe( null );
    } );

    test( 'verifies that the form exists for testing', () => {
        expect( window.code.isNullOrEmpty( window.code.mainForm ) ).toBe( false );
    } );
} )
.catch( function( error ) {
  console.log( error.message );
} );
