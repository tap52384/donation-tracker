if ( isBrowser() === true ) {

;( function( code, $, window, document, google, moment, undefined ) {

// This allows for javascript that should work pretty consistently across browsers and platforms.
'use strict';

// stop here if window or document are not available;
if ( code.isNullOrEmpty( window ) === true ||
code.isNullOrEmpty( document ) === true ) {
    return;
}

// log that the file has been reached
code.log( 'common.client.js loaded.' );

/**
* . Returns true if the specified variable is null,
* . empty, or undefined.
* . @return boolean
*/
code.isNullOrEmpty = function( x ) {
    return x === undefined || x === '' || x === null;
};

/**
* Returns true if the specified variable is null, empty, or with all spaces
* removed an empty string.
*/
code.isNullOrEmptySpace = function( x ) {
  return code.isNullOrEmpty( x ) || typeof x.trim === 'function' &&
  code.isNullOrEmpty( x.trim().replace( / /g, '' ) );
};

code.getValue = function( id ) {
  var element = document.getElementById( id );

  return element === null || code.isNullOrEmptySpace( element.value ) ?
  '' :
  element.value;
};

code.disable = function( id, value ) {
  var element = document.getElementById( id );

  if ( element === null ) {
    return false;
  }

  element.disable = true;

  return true;
};

code.enable = function( id ) {
  var element = document.getElementById( id );

  if ( element === null ) {
    return false;
  }

  element.disable = false;

  return true;
};

code.showSpinner = function() {
  var element = document.getElementById( 'loading-spinner' );
  var button = document.querySelector( 'button[type="submit"]' );

  if ( element === null || button === null ) {
     return false;
  }

  // show the spinner
  element.style.display = 'inline';
  button.disabled = true;

  // also should disable the submit button
  code.disable( 'submit' );
  code.disable( 'delete' );
};

code.hideSpinner = function() {
  var element = document.getElementById( 'loading-spinner' );
  var button = document.querySelector( 'button[type="submit"]' );

  if ( element === null || button === null ) {
     return false;
  }

  // show the spinner
  element.style.display = 'none';
  button.disabled = false;

  // also should enable the submit button
  code.enable( 'submit' );
};

/**
* . Returns true if the email address is possibly valid.
* . @param  string email
* . @return boolean
*/
code.isValidEmail = function( email ) {
    var re = /\S+@\S+/;
    return re.test( email );
};

/**
 * Returns true if the object is a string.
 * @param  {[type]}  s [description]
 * @return {Boolean}   [description]
 */
code.isValidStringObject = function( s ) {
    return !code.isNullOrEmpty( s ) &&
    Object.prototype.toString.call( s ) === '[object String]';
};

/**
 * Logs the specified text to the console if it is available.
 * @param  {[type]} text  [description]
 * @param  {[type]} error [description]
 * @return {[type]}       [description]
 */
code.log = function( text, error ) {
    if ( code.isNullOrEmpty( text ) ) {
        return;
    }

    // 2015.03.04 - if the parameter is not a string, then break down what it is
    if ( code.isValidStringObject( text ) === false ) {
        text = JSON.stringify( text );
    }

    if ( window.console ) {

        if ( error && window.console.error ) {
          window.console.error( text );
        } else if ( window.console.log ) {
          window.console.log( text );
        }
    } else if ( document.console ) {

        if ( error && document.console.error ) {
          document.console.error( text );
        } else if ( document.console.log ) {
          document.console.log( text );
        }
    }
};

/**
* . Logs what happened when the app fails to retrieve a record.
* . @param  string result
* . @return void
*/
code.getObjectFailed = function( result ) {
    code.log( 'getObjectFailed(); result: ' + JSON.stringify( result ) );
    code.log( 'getObjectFailed(); result: ' + result );

    // hide the spinner
    code.hideSpinner();
};

/**
  * . Once a user is selected, this fills in the fields with the user details.
  */
code.fillDetails = function( object ) {
    var isEmptyObject = true;

    // clear the fields first
    code.clearAllFields();

    // loops through the keys in the object and sets the values
    for ( var key in object ) {
      if ( code.isNullOrEmptySpace( key ) === true ) {
         code.log( 'fillDetails(); the key is null or empty space. skipping...' );
         continue;
      }

      // find the form element
      var element = document.getElementById( key.toLowerCase() );

      if ( element === null ) {
         code.log( 'fillDetails(); the element for key ' + key +
         ' could not be found. skipping...' );
         continue;
      }

      element.value = object[ key ];

      // marks the flag showing that this object is not empty
      isEmptyObject = false;
    }

    code.log( 'fillDetails(); data: ' + JSON.stringify( object ) );

    // enable the delete button
    document.getElementById( 'delete' ).disabled = ( isEmptyObject === true ? true : false );

    // hide the spinner
    code.hideSpinner();
  };

  /**
  * . Universal function for preparing data to be saved
  */
  code.prepareSaveData2 = function( fileName, selectId, headers ) {
    code.log( 'submit(' + fileName + '); headers: ' + headers );

    // get all of the data on the page using the headers
    var data = code.collect( headers );

    // add the id to the data
    var recordId = code.getValue( 'selectId' );
    data.ID = recordId;

    code.log( 'submit(' + fileName + '); data: ' + JSON.stringify( data ) );

    google.script.run.withSuccessHandler( code.saveResult )
    .withFailureHandler( code.hideSpinner )
    .saveData( fileName, recordId, data );
  };

  /**
  * . Using the headers of the spreadsheet managed by this page,
  * . get the values from all inputs with the same id.
  * . @return object
  */
  code.collect = function( headers ) {
    var object = {};

    code.log( 'collect(); headers: ' + JSON.stringify( headers ) );

    for ( var key in headers ) {
      var header = headers[ key ];
      if ( code.isNullOrEmptySpace( key ) === true ||
      code.isNullOrEmptySpace( headers[ key ] ) === true ) {
        code.log( 'collect(); key is null or empty space' );
        continue;
      }

      // retrieves the value for the given input, trimming whitespace from
      // the ends
      var id = header.toLowerCase();
      object[ header ] = code.getValue( id ).trim();

      code.log( 'collect(); header: ' + header );
      code.log( 'collect(); value: ' + object[ header ] );
    }

    code.log( 'collect(); values: ' + JSON.stringify( object ) );

    return object;
  };

  /**
  * . Returns true if the given string represents a valid date.
  * . @param   string  dateString
  * . @returns boolean
  */
  code.isValidDate = function( dateString ) {

     dateString = ( dateString + '' ).trim();
     if ( code.isNullOrEmptySpace( dateString ) === true ||
     dateString.match( /[0-9]{4}-[0-9]{2}-[0-9]{2}/ ) === null ) {
        return false;
     }

     var year = dateString.substr( 0, 4 );
     var month = dateString.substr( 5, 2 );
     var day = dateString.substr( 7 );
     var date = new Date( year, month, day );

     code.log( 'year:  ' + year );
     code.log( 'month: ' + month );
     code.log( 'day:   ' + day );
     code.log( 'date:  ' + date );

     // validate to make sure the date is valid
     // https://stackoverflow.com/a/1353711/1620794
     return isNaN( date ) === false;
  };

  /**
  * . Returns true if the specified input already exists in the menu.
  * . @param   array  inputArray An array of element IDs for the
  inputs that are used to create the text in the <select> element
  * . @param   string select The CSS selector for the <select> element
  * . @returns array Array of IDs the # of matching options in the
  <select> element, excluding the current one if it exists
  */
  code.exists = function( inputArray, select ) {

    // 1. Using the IDs of the elements that specify the name of a unique record,
    // create the text
    var text = '';

    // array of matches
    var matches = [];

    // creates the text that is displayed in the <select> element using
    // the IDs of the elements specified in the inputArray
    for ( var key in inputArray ) {

       // gets the value of the input
       var input = code.getValue( inputArray[ key ] ).trim().toLowerCase();

       code.log( 'exists(); key: ' + key );
       code.log( 'exists(); value id: ' + inputArray[ key ] );
       code.log( 'exists(); value: ' + input );

       // skip if the input is empty
       if ( code.isNullOrEmptySpace( input ) === true ) {
         continue;
       }

       if ( code.isNullOrEmptySpace( text ) === false ) {
         text += ' ';
       }

       text += input;
    }

    code.log( 'exists(); form input: ' + text );

    // if this happens, then the validation prior to calling this function
    // did not catch everything. This should basically never happen
    if ( code.isNullOrEmptySpace( text ) === true ) {
       code.log( 'exists(); the text from the current form is empty. ' +
       'this should almost never happen.' );
       return matches;
    }

    // 2. Loop through each <option> in the <select> and see if the textcontent matches
    var menu = document.getElementById( select );

    if ( menu === null ) {
       code.log( 'exists(); could not find <select> element with ID "' + select +
       '"', true );
       return false;
    }

    var options = menu.options;

    if ( code.isNullOrEmptySpace( menu.options ) === true ||
    menu.options.length === 0 ) {
       code.log( 'exists(); no options in <select> element with ID "' + select + '"' );
       return matches;
    }

    var menuIndex = menu.selectedIndex;

    // a string
    var selectedId = menu.options[ menuIndex ].value;
    var count = menu.options.length;

    code.log( 'exists(); selected index: ' + menuIndex );
    code.log( 'exists(); selected id: ' + selectedId );
    code.log( 'exists(); # of options: ' + count );


    // loop through each <option> within the <select> and get the text
    // compare the strings to see if they are equal
    for ( var i = 0; i < count; i++ ) {
       var option = menu.options[ i ];
       var optionText = ( option.text + '' ).trim().toLowerCase();
       var optionIndex = option.index;

       code.log( 'exists(); option text:  ' + optionText );
       code.log( 'exists(); option index: ' + option.index );
       code.log( 'exists(); text equal: ' + ( optionText === text ) );
       code.log( 'exists(); indexes equal: ' + ( menuIndex === option.index ) );

       // if the text is the same and the current option index equals
       // the index of the selected item (the one currently being edited / created )
       // then do not include it!
       if ( code.isNullOrEmptySpace( menuIndex ) === false &&
       parseInt( menuIndex, 10 ) === option.index &&
       optionText === text ) {
         code.log( 'exists(); editing existing record, no text change...' );
         continue;
       }

       if ( optionText !== text ) {
         continue;
       }

       // text matches
       code.log( 'exists(); current text match: ' + optionText );
       matches.push( option.index );
    }

    code.log( 'exists(); matched ids: ' + JSON.stringify( matches ) );

    // return an array containing any matches
    return matches;
  };

  // handles the close button
  document.getElementById( 'close' ).addEventListener( 'click', function( event ) {

     // closes the dialog window
     // https://developers.google.com/apps-script/guides/html/reference/host
     google.script.host.close();

  } );

  document.getElementById( 'reset' ).addEventListener( 'click', function( event ) {

    // disable the delete button
    var button = document.getElementById( 'delete' );
    if ( button !== null ) {
      button.disabled = true;
    }

    // set the focus to the input to the first <input>
    var inputs = document.getElementsByTagName( 'input' );
    if ( inputs !== null && inputs.lengths > 0 ) {
        inputs[ 0 ].focus();
    }
  } );

  // confirms whether the user is sure if they want to complete the given action
} )( window.code = window.code || {},
    window.jQuery,
    window,
    document,
    window.google,
    window.moment
  );

// Down here is the code the defines the parameters used at the top of this
// self-executing function. undefined is not defined so it is undefined. LOL

} // only execute this code for browsers (client-side code)
