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
code.log( 'payment-methods.client.js loaded.' );

code.clearAllFields = function() {

    // clear the fields
    document.getElementById( 'name' ).value = '';
    document.getElementById( 'delete' ).disabled = true;
};

code.addPaymentMethodsHtml = function( output ) {
    code.log( 'addPaymentMethodsHtml(); about to set <select> innerHTML...' );
    document.getElementById( 'payment-methods' ).innerHTML = output;

    // clear the fields first
    code.clearAllFields();

    // stop the spinner
    code.hideSpinner();
};

code.validateInput = function() {
     var error = '';

     var name = code.getValue( 'name' );
     var displayInputs = [ 'name' ];
     var possibleDupeIds = code.exists( displayInputs, 'payment-methods' );

     // name of payment method must be at least two characters
     if ( name.trim().length < 2 ) {
        error = 'The name of the payment method must contain at least two characters.';
     }

     /*
     get the text of the current item
     look through all of the items and return an array of ids for those that match
     pass the current id (if any); if the id of the current id is in the array of ids, leave it out
     if the count of the matches > 0, then present the confirm() dialog and only continue if positive
     */
     var okToAdd = possibleDupeIds.length > 0 ?
     confirm( 'A payment method with the name "' + name + '" already exists; do you still ' +
     'want to add it?' ) :
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

code.saveResult = function( result ) {
    if ( result === false ) {
      code.log( 'payment-methods(); save failed.', true );

      // stop the spinner
      code.hideSpinner();

      // stop here
      return false;
    }

    // clear all fields
    code.clearAllFields();

    code.log( 'payment-methods(); save worked!' );

    // reload the payment-methods menu
    google.script.run.withSuccessHandler( code.addPaymentMethodsHtml )
    .fillPaymentMethodsPicker();

    // document.getElementById('manage-donors-form').reset();
    return true;
};

  /**
  * . Gets the headers for the "donors" file and saves the data.
  */
  code.prepareSaveData = function( headers ) {
    code.log( 'submit(payment-methods); headers: ' + headers );

    // get all of the data on the page using the headers
    var data = code.collect( headers );

    // add the id to the data
    var userId = code.getValue( 'payment-methods' );
    data.ID = userId;

    code.log( 'submit(payment-methods); data: ' + JSON.stringify( data ) );

    google.script.run.withSuccessHandler( code.saveResult )
    .withFailureHandler( code.hideSpinner )
    .saveData( 'payment-methods', userId, data );
};

/**
* . Handles when the form is submitted.
*/
document.getElementById( 'manage-payment-methods-form' )
.addEventListener( 'submit', function( event ) {
      event.preventDefault();

      // validate the form input
      if ( code.validateInput() === false ) {
        return false;
      }

      // show the spinner
      code.showSpinner();

      // get all headers which will also be the IDs of all inputs
      google.script.run.withSuccessHandler( code.prepareSaveData )
      .getHeaders( 'payment-methods' );
  } );

/**
* . Handles when the <select> for payment methods is changed.
*/
document.getElementById( 'payment-methods' ).onchange = function( event ) {
     var userId = event.target.value;

     // show the spinner
     code.showSpinner();

     // clear all fields
     code.clearAllFields();

     code.log( '#payment-methods (change): about to get payment-methods object #' + userId );

     // asynchronously get the user details and fill the <select> menu
     google.script.run.withSuccessHandler( code.fillDetails )
     .withFailureHandler( code.getObjectFailed )
     .getObject( 'payment-methods', userId );
};

document.getElementById( 'delete' ).addEventListener( 'click', function( event ) {

      // get the current user id
      var userId = code.getValue( 'payment-methods' );

      if ( code.isNullOrEmptySpace( userId ) === true ) {
        return false;
      }

      // only proceed once you have confirmation
      if ( confirm( 'Are you sure you want to delete this payment method?' ) === true ) {

        // show the spinner
        code.showSpinner();

        // disable the delete button
        code.disable( 'delete' );

        // delete the data for the current user
        google.script.run.withSuccessHandler( code.saveResult )
        .deleteData( 'payment-methods', userId );
      }
  } );

/**
* . Code that loads on page load
*/
google.script.run.withSuccessHandler( code.addPaymentMethodsHtml )
.fillPaymentMethodsPicker();

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
