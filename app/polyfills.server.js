/* eslint-env node */
/* global SpreadsheetApp, ScriptApp, DriveApp, PropertiesService, Logger, HtmlService */

// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
Array.prototype.indexOf = Array.prototype.indexOf || function( searchElement, fromIndex ) {

    var k;

    // 1. Let o be the result of calling ToObject passing
    //    the this value as the argument.
    if ( this == null ) {
      throw new TypeError( '"this" is null or not defined' );
    }

    var o = Object( this );

    // 2. Let lenValue be the result of calling the Get
    //    internal method of o with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = o.length >>> 0;

    // 4. If len is 0, return -1.
    if ( len === 0 ) {
      return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = fromIndex | 0;

    // 6. If n >= len, return -1.
    if ( n >= len ) {
      return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max( n >= 0 ? n : len - Math.abs( n ), 0 );

    // 9. Repeat, while k < len
    while ( k < len ) {

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the
      //    HasProperty internal method of o with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      //    i.  Let elementK be the result of calling the Get
      //        internal method of o with the argument ToString(k).
      //   ii.  Let same be the result of applying the
      //        Strict Equality Comparison Algorithm to
      //        searchElement and elementK.
      //  iii.  If same is true, return k.
      if ( k in o && o[ k ] === searchElement ) {
        return k;
      }
      k++;
    }
    return -1;
  };

/**
 * Polyfill for Array.isArray
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Polyfill
 * @param  {object} value
 * @return {boolean}
 */
Array.isArray = Array.isArray || function( value ) {
    return Object.prototype.toString.call( value ) === '[object Array]';
};

/**
* . Polyfill for Number.isInteger
* . https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Browser_compatibility
* . @return boolean
*/
Number.isInteger = Number.isInteger || function( value ) {
  return typeof value === 'number' &&
    isFinite( value ) &&
    Math.floor( value ) === value;
};

/**
* . Polyfill for String.prototype.endsWith
* . https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
* . @return boolean
*/
String.prototype.endsWith = String.prototype.endsWith || function( search, thisLen ) {
		if ( thisLen === undefined || thisLen > this.length ) {
			thisLen = this.length;
		}
		return this.substring( thisLen - search.length, thisLen ) === search;
};

/**
 * Returns only the date portion of the ISO-formatted date string
 * formatted at YYYY-MM-DD.
 * @return {string} [description]
 */
Date.prototype.toISODateString =
Date.prototype.toISODateString || function() {
    var string = this.toISOString();
    var format = 'YYYY-MM-DD';
    return string.substring( 0, format.length );
};

/**
 * Adds support for executing a function for each element in an array.
 * @type {void}
 */
Array.prototype.forEach =
Array.prototype.forEach || function( callback/*, thisArg*/ ) {
    var T, k;

    if ( this == null ) {
      throw new TypeError( 'this is null or not defined' );
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object( this );

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ( typeof callback !== 'function' ) {
      throw new TypeError( callback + ' is not a function' );
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if ( arguments.length > 1 ) {
      T = arguments[ 1 ];
    }

    // 6. Let k be 0.
    k = 0;

    // 7. Repeat while k < len.
    while ( k < len ) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator.
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c.
      // c. If kPresent is true, then
      if ( k in O ) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[ k ];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call( T, kValue, k, O );
      }

      // d. Increase k by 1.
      k++;
    }

    // 8. return undefined.
};
