/* eslint-env jest, es6, node */

// loads the necessary node packages
const jsdom = require( 'jsdom' );
const { JSDOM } = jsdom;
const fs = require( 'fs' );

// __dirname is a Node.js global object
// https://nodejs.org/api/globals.html
const html = fs.readFileSync( __dirname + '/app/donations.html' ).toString();

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
        message: () => `expected ${received} is NOT null, undefined, or empty space`,
        pass: false
      };
    }
  }
} );

// requires my code to be tested
require( './app/common.client.js.html' );
require( './app/donations.client.js.html' );

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

test( 'verifies donations <select> exists', () => {
    expect( document.getElementById( 'donor_id' ) ).not.toBeNull();
} );

test( 'verifies donation-types <select> exists', () => {
    expect( document.getElementById( 'donationtype_id' ) ).not.toBeNull();
} );

test( 'verifies payment-methods <select> exists', () => {
    expect( document.getElementById( 'paymentmethod_id' ) ).not.toBeNull();
} );

test( 'verifies that the delete button does NOT exist', () => {
    expect( document.getElementById( 'delete' ) ).toBeNull();
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

test( 'only numbers are allowed for donation amounts', () => {
    var amount = document.getElementById( 'amount' );
    amount.value = 'a';
    expect( amount.value ).isNullOrEmpty();
    amount.value = '-1b';
    expect( amount.value ).isNullOrEmpty();
    amount.value = '9zujeig';
    expect( amount.value ).isNullOrEmpty();
    amount.value = 1.99;
    expect( amount.value ).toMatch( '1.99' );
} );

test( 'only valid dates are allowed for donation date', () => {
    var givenAt = document.getElementById( 'given_at' );
    expect( givenAt.type ).toMatch( 'date' );
    givenAt.value = 'yyyy-mm-dd';
    expect( givenAt.value ).isNullOrEmpty();
    givenAt.value = '2018-01-01';
    expect( givenAt.value ).not.isNullOrEmpty();
    expect( givenAt.step ).toMatch( '1' );

    // 1. Get the date
    var date = new Date( Date.parse( givenAt.value ) );

    // 2. Add a day to it
    date.setDate( date.getDate() + parseInt( givenAt.step, 10 ) );

    // 3. Set the new date to this date using .toISOString()
    window.code.log( 'new date: ' + date.toISOString() );
    window.code.log( 'new date only: ' + date.toISODateString() );
    givenAt.value = date.toISODateString();

    expect( givenAt.value ).toMatch( '2018-01-02' );
    givenAt.value = '01/01/2018';
    expect( givenAt.value ).isNullOrEmpty();
    givenAt.value = -1.99;
    expect( givenAt.value ).isNullOrEmpty();
} );
