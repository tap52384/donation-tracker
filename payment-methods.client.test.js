/* eslint-env jest, es6, node */

// loads the necessary node packages
const jsdom = require( 'jsdom' );
const { JSDOM } = jsdom;
const fs = require( 'fs' );

// __dirname is a Node.js global object
// https://nodejs.org/api/globals.html
const html = fs.readFileSync( __dirname + '/app/payment-methods.html' ).toString();

// HTML to be imported as DOM
// const html = './app/donation-types.html';
var dom = new JSDOM( html );

// set the global window and document objects using JSDOM
// global is a node.js global object
if ( typeof global !== 'undefined' ) {
    global.window = dom.window;
    global.document = dom.window.document;
}

// establish a custom matcher that checks whether a variable is null or empty
// or undefined
expect.extend( {
  isNullOrEmpty( received ) {
    const pass = ( received === undefined || received === '' ||
    received === null || typeof received.trim === 'function' &&
    received.trim().replace( / /g, '' ) === '' );
    if ( pass ) {
      return {
        message: () =>
          `expected ${received} is null, undefined, or empty space`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} is NOT null, undefined, or ` +
        'empty space',
        pass: false
      };
    }
  }
} );

// requires my code to be tested
require( './app/common.client.js.html' );
require( './app/payment-methods.client.js.html' );

test( 'sees if window is available before loading DOM...', () => {
    expect( window !== undefined ).toBe( true );
} );

test( 'verifies document is available before loading DOM...', () => {
    expect( document !== undefined && document !== null ).toBe( true );
} );


test( 'verifies that the DOM is not null', () => {
    expect( dom ).not.toBe( null );
} );

test( 'verifies that the window.code is not null', () => {
    expect( window.code ).not.toBe( null );
} );

test( 'verifies that the form exists for testing', () => {
    expect( window.code.isNullOrEmpty( window.code.mainForm ) ).toBe( false );
} );

test( 'verifies payment-methods <select> exists', () => {
    expect( document.getElementById( 'payment-methods' ) ).not.toBeNull();
} );

test( 'verifies that the delete button exists', () => {
    expect( document.getElementById( 'delete' ) ).not.toBeNull();
} );

test( 'collect() function exists', () => {
    expect( typeof window.code.collect ).toMatch( 'function' );
} );

test( 'disable() function exists', () => {
    expect( typeof window.code.disable ).toMatch( 'function' );
} );

test( 'getValue() function exists', () => {
    expect( typeof window.code.getValue ).toMatch( 'function' );
} );

test( 'prepareSaveData() function exists', () => {
    expect( typeof window.code.prepareSaveData ).toMatch( 'function' );
} );

test( 'saveResult() function exists', () => {
    expect( typeof window.code.saveResult ).toMatch( 'function' );
} );

test( 'showSpinner() function exists', () => {
    expect( typeof window.code.showSpinner ).toMatch( 'function' );
} );
