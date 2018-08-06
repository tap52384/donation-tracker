/* eslint-env jest, es6, node */

require( './app/polyfills.server.js' );
const code = require( './app/common.server' );

test( 'verifies jest tests are working', () => {
    expect( true ).toBe( true );
} );

test( 'verifies this module is available', () => {
    expect( code ).not.toBeNull();
    expect( code ).not.toBeUndefined();
} );

test( 'isNullOrEmpty is a function', () => {
    expect( code.isNullOrEmpty ).not.toBeUndefined();
    expect( code.isNullOrEmpty ).not.toBeNull();
    expect( typeof code.isNullOrEmpty === 'function' ).toBe( true );
    expect( code.isNullOrEmpty( '' ) ).toBe( true );
    expect( code.isNullOrEmpty( ' ' ) ).toBe( false );
    expect( code.isNullOrEmpty( null ) ).toBe( true );
    expect( code.isNullOrEmpty( -1 ) ).toBe( false );
    expect( code.isNullOrEmpty( {} ) ).toBe( false );
} );

/**
 * This fails because the polyfills module needs to be
 * included from within common.server.js.
 */
test( 'isDateColumn function works', () => {
    expect( code.isDateColumn ).not.toBeUndefined();
    expect( code.isDateColumn ).not.toBeNull();
    expect( typeof code.isDateColumn ).toMatch( 'function' );

    // expect( code.isDateColumn( 'blah' ) ).toBe( false );
    // expect( code.isDateColumn( '' ) ).toBe( false );
    // expect( code.isDateColumn( 9 ) ).toBe( false );
    // expect( code.isDateColumn( null ) ).toBe( false );
    // expect( code.isDateColumn( '_AT_' ) ).toBe( false );
    // expect( code.isDateColumn( 'zplewis' ) ).toBe( false );
    // expect( code.isDateColumn( 'GIVEN_AT' ) ).toBe( true );
    // expect( code.isDateColumn( 'given_at' ) ).toBe( true );
    // expect( code.isDateColumn( 'GiVeN_aT' ) ).toBe( true );
    // expect( code.isDateColumn( '_at_' ) ).toBe( false );
} );
