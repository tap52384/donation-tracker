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

        // saves the JSDOM object made from the imported HTML for later use
        dom = result;

        // sets the document variable to the one created by JSDOM
        document = dom.window.document;

        // prints out the imported HTML
        // console.log( dom.serialize() );
    } ).catch( e => expect( e ).toMatch( 'error' ) );
} );

// requires my code to be tested
require( './app/common.client.js.html' );
require( './app/donation-types.client.js.html' );

// tests
test( 'verifies jest tests are working', () => {
    expect( true ).toBe( true );
} );

test( 'verifies that the DOM is not null', () => {
    expect( dom ).not.toBe( null );
} );

test( 'verifies that the form exists from jsdom', () => {
    expect( dom.window.document.getElementById( 'manage-donation-types-form' ) ).not.toBe( null );
} );
