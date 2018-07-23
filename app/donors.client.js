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
code.log( 'donors.client.js loaded.' );

/**
  *  Add the years to the select menu.
  */
  code.addStateHtml = function( output ) {
    document.getElementById( 'state' ).innerHTML = output;
  };

  code.addUsersHtml = function( output ) {
    document.getElementById( 'users' ).innerHTML = output;

    // clear the fields first
    code.clearAllFields();

    // stop the spinner
    code.hideSpinner();
  };

  // code.printResult = function() {
  //   code.log( 'header for 800th column: ' + output );
  // };

  code.saveResult = function( result ) {
    if ( result === false ) {
      code.log( 'donors(); save failed.', true );

      // stop the spinner
      code.hideSpinner();

      return false;
    }

    // clear all fields
    code.clearAllFields();

    code.log( 'donors(); save worked!' );

    // reload the users menu
    google.script.run.withSuccessHandler( code.addUsersHtml )
    .fillUsersPicker();

    // document.getElementById('manage-donors-form').reset();
    return true;
  };

  /**
  * . Gets the headers for the "donors" file and saves the data.
  */
  code.prepareSaveData = function( headers ) {
    code.log( 'submit(donors); headers: ' + headers );

    // get all of the data on the page using the headers
    var data = code.collect( headers );

    // add the id to the data
    var userId = code.getValue( 'users' );
    data.ID = userId;

    // remove all non-numeric characters from the phone number
    // https://stackoverflow.com/a/1098955/1620794
    if ( 'phone' in data ) {
      data.phone = data.phone.replace( /\D/g, '' );
    }

    code.log( 'submit(donors); data: ' + JSON.stringify( data ) );

    google.script.run.withSuccessHandler( code.saveResult )
    .withFailureHandler( code.hideSpinner )
    .saveData( 'donors', userId, data );
  };

  code.clearAllFields = function() {

    // clear the fields
     document.getElementById( 'firstname' ).value =
     document.getElementById( 'mi' ).value =
     document.getElementById( 'lastname' ).value =
     document.getElementById( 'phone' ).value =
     document.getElementById( 'email' ).value =
     document.getElementById( 'address1' ).value =
     document.getElementById( 'address2' ).value =
     document.getElementById( 'city' ).value =
     document.getElementById( 'state' ).value =
     document.getElementById( 'zip' ).value =
     document.getElementById( 'dob_at' ).value =
     document.getElementById( 'suffix' ).value =
     '';

     document.getElementById( 'delete' ).disabled = true;
  };

  code.validateInput = function() {
     var error = '';

     // strips all non-numeric characters
     // https://stackoverflow.com/a/1862219/1620794
     var phone = code.getValue( 'phone' ).replace( /\D/g, '' );
     var email = code.getValue( 'email' );
     var dob = code.getValue( 'dob_at' );
     var fullName = code.getValue( 'firstname' ) + ' ' + code.getValue( 'lastname' );
     var dobMoment = typeof moment === 'function' &&
     code.isNullOrEmptySpace( dob ) === false ? moment( dob, 'YYYY-MM-DD' ) : null;

     // for duplicate entry detection
     var displayInputs = [ 'firstname', 'lastname', 'suffix' ];
     var possibleDupeIds = code.exists( displayInputs, 'users' );

     // first name must be at least two characters
     if ( code.getValue( 'firstname' ).trim().length < 2 ) {
       error = 'First name must contain at least two characters.';
     } else if ( code.getValue( 'lastname' ).trim().length < 2 ) {
       error = 'Last name must contain at least two characters.';
     } else if ( code.isNullOrEmptySpace( phone ) === false && phone.trim().length < 10 ) {
       error = 'Phone number must be at least 10 digits, including area code.';
     } else if ( code.isNullOrEmptySpace( email ) === false &&
     code.isValidEmail( email ) === false ) {
       error = 'Please enter a valid email address.';
     } else if ( dobMoment !== null && dobMoment.isValid() === false ) {
       error = 'Please enter a valid date (YYYY-MM-DD).';
     }

     /*
     get the text of the current item
     look through all of the items and return an array of ids for those that match
     pass the current id (if any); if the id of the current id is in the array of ids, leave it out
     if the count of the matches > 0, then present the confirm() dialog and only continue if positive
     */
     var okToAdd = possibleDupeIds.length > 0 ?
     confirm( 'A donor with the name "' + fullName + '" already exists; do you still ' +
     'want to add them?' ) :
     true;

     code.log( 'validateInput(); error: ' + error );
     code.log( 'validateInput(); okToAdd: ' + okToAdd );

     // return true if all required values are given and either the
     // data already exists, is brand new, or the user confirmed adding
     // a duplicate
     if ( code.isNullOrEmptySpace( error ) === true && okToAdd === true ) {
       return true;
     }

     // show an error if one is generated (not needed for exists since a confirm() is used already)
     if ( code.isNullOrEmptySpace( error ) === false ) {
       alert( error );
     }
     return false;
  };


  document.getElementById( 'users' ).onchange = function( event ) {
     var userId = event.target.value;

     // show the spinner
     code.showSpinner();

     // clear all fields
     code.clearAllFields();

     code.log( '#users (change): about to get donor object #' + userId );

     // asynchronously get the user details and fill the <select> menu
     google.script.run.withSuccessHandler( code.fillDetails )
     .withFailureHandler( code.getObjectFailed )
     .getObject( 'donors', userId );
  };

  document.getElementById( 'manage-donors-form' ).addEventListener( 'submit', function( event ) {
      event.preventDefault();

      // validate the form input
      if ( code.validateInput() === false ) {
        code.log( 'submit(); validate input failed.' );
        return false;
      }

      // show the spinner
      code.showSpinner();

      // get all headers which will also be the IDs of all inputs
      google.script.run.withSuccessHandler( code.prepareSaveData )
      .getHeaders( 'donors' );
  } );

  document.getElementById( 'delete' ).addEventListener( 'click', function( event ) {

      // get the current user id
      var userId = code.getValue( 'users' );

      if ( code.isNullOrEmptySpace( userId ) === true ) {
        return false;
      }

      // only proceed once you have confirmation
      if ( confirm( 'Are you sure you want to delete this donor?' ) === true ) {

        // show the spinner
        code.showSpinner();

        // disable the delete button
        code.disable( 'delete' );

        // delete the data for the current user
        google.script.run.withSuccessHandler( code.saveResult )
        .deleteData( 'donors', userId );
      }
  } );

  // https://developers.google.com/apps-script/guides/html/communication#success_handlers
  // fills in the select menu that allows the user to choose the year
  // it defaults to the current year
  google.script.run.withSuccessHandler( code.addStateHtml )
  .fillStatePicker();

  google.script.run.withSuccessHandler( code.addUsersHtml )
  .fillUsersPicker();

code.log( 'donors code completed.' );

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

}
