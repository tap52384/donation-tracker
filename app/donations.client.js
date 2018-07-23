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
code.log( 'donations.client.js loaded.' );

/**
 * Resets all fields on the form.
 * @return {[type]} [description]
 */
code.clearAllFields = function() {

    // clear the fields
     document.getElementById( 'amount' ).value =
     document.getElementById( 'donor_id' ).value =

     // document.getElementById('firstname').value =
     // document.getElementById('lastname').value =
     // document.getElementById('mi').value =
     // document.getElementById('suffix').value =
     document.getElementById( 'donationtype_id' ).value =
     document.getElementById( 'paymentmethod_id' ).value = '';

     // hide the fields for adding a new donor on the fly
     // document.getElementById('new-donor-info').style.display = 'none';

     // check the "now" date
     document.getElementById( 'date-given-now' ).checked = true;

     // set the default date for the donation to the current state
     code.resetGivenDate();
};

/**
*  set the default date for the donation to the current date
*/
code.resetGivenDate = function() {

     // https://stackoverflow.com/a/19079425/1620794
     // https://stackoverflow.com/questions/12409299/how-to-get-current-formatted-date-dd-mm-yyyy-in-javascript-and-append-it-to-an-i/19079425#comment74271020_19079425
     document.getElementById( 'given_at' ).value =
     new Date().toJSON().slice( 0, 10 ).replace( /-/g, '-' );
     return true;
};

code.addDonorsHtml = function( output ) {

    // add an option for manually entering the name of a new donor on the fly
    // output = '<option value="-1">Add new donor</option>' + output;

    document.getElementById( 'donor_id' ).innerHTML = output;

    // clear the fields first
    code.clearAllFields();

    // stop the spinner
    code.hideSpinner();
};

code.addPaymentMethodsHtml = function( output ) {
    document.getElementById( 'paymentmethod_id' ).innerHTML = output;

    // clear the fields first
    code.clearAllFields();

    // stop the spinner
    code.hideSpinner();
};

code.addDonationTypesHtml = function( output ) {
   document.getElementById( 'donationtype_id' ).innerHTML = output;

   // clear the fields first
    code.clearAllFields();

    // stop the spinner
    code.hideSpinner();
};

/**
* Shows the UI for adding a new donor on the fly if selected.
*/
document.getElementById( 'donor_id' ).onchange = function( event ) {

     // var donorId = event.target.value;

     // var show = event.target.value === '-1';
     // var display = show === true ? 'block' : 'none';
     // document.getElementById('new-donor-info').style.display = display;

     // clear the fields every time the donor is changed
     // document.getElementById('firstname').value =
     // document.getElementById('lastname').value =
     // document.getElementById('mi').value =
     // document.getElementById('suffix').value = '';
};

/**
* Shows the UI for quickly adding a donor that does not exist in the list.
*/
document.getElementById( 'add-donor' ).onclick = function( event ) {

  // opens the window for adding a donor
  // this is called first because once the dialog is closed,
  // google.script is not available. This is called asynchronously so there
  // shouldn't be any API lock. This is equivalent to choosing the item from
  // the "Add-ons" menu.
  google.script.run.manageDonors();

  // closes the dialog window
  // https://developers.google.com/apps-script/guides/html/reference/host
  google.script.host.close();

  // var donor = document.getElementById('donor_id');
  //
  // if (donor === null) {
  //    return false;
  // }
  // donor.value = '-1';
  //
  // // https://stackoverflow.com/a/2856602/1620794
  // if ("createEvent" in document) {
  //   var evt = document.createEvent("HTMLEvents");
  //   evt.initEvent("change", false, true);
  //   donor.dispatchEvent(evt);
  // } else {
  //   donor.fireEvent("onchange");
  // }
};

document.getElementById( 'add-payment-method' ).onclick = function( event ) {

    // opens the window for adding a payment method
    // this is called first because once the dialog is closed,
    // google.script is not available. This is called asynchronously so there
    // shouldn't be any API lock. This is equivalent to choosing the item from
    // the "Add-ons" menu.
    google.script.run.managePaymentMethods();

    // closes the dialog window
    // https://developers.google.com/apps-script/guides/html/reference/host
    google.script.host.close();
};

document.getElementById( 'add-donation-type' ).onclick = function( event ) {

    // opens the window for adding a payment method
    // this is called first because once the dialog is closed,
    // google.script is not available. This is called asynchronously so there
    // shouldn't be any API lock. This is equivalent to choosing the item from
    // the "Add-ons" menu.
    google.script.run.manageDonationTypes();

    // closes the dialog window
    // https://developers.google.com/apps-script/guides/html/reference/host
    google.script.host.close();
};


code.validateInput = function() {
     var error = '';

     var amount = code.getValue( 'amount' );
     var donor = code.getValue( 'donor_id' );

     // var firstname = getValue('firstname');
     // var mi = getValue('mi');
     // var lastname = getValue('lastname');
     // var suffix = getValue('suffix');
     // var fullName = firstname + ' ' + lastname +
     // ' ' + suffix;

     var paymentMethod = code.getValue( 'paymentmethod_id' );
     var donationType = code.getValue( 'donationtype_id' );
     var givenDate = code.getValue( 'given_at' );

     // for duplicate entry detection when adding a new donor
     // var displayInputs = ['firstname', 'lastname', 'suffix'];
     // var possibleDupeIds = exists(displayInputs, 'donor_id');

     // If a new donor is specified (donor === -1), then first and last name are required
     // if ( donor === -1 || donor === '-1' ) {
     //      if ( firstname.trim().length < 2 || lastname.trim().length < 2 ) {
     //        error = 'When adding a new donor, the first and last name are ' +
     //        'required and must be at least 2 characters each.';
     //      }
     // } else
     if ( code.isNullOrEmptySpace( paymentMethod ) === true ) {
        error = 'Please select a payment method.';
     } else if ( code.isNullOrEmptySpace( donationType ) === true ) {
        error = 'Please select a donation type.';
     } else if ( code.isNullOrEmptySpace( amount ) === true ||
     isNaN( amount ) === true || +amount !== +amount ||
     parseFloat( amount ) <= 0 ) {
        error = 'Please enter a donation amount greater than 0.';
     } else if ( code.isValidDate( givenDate ) === false ) {
        error = 'Please enter a valid donation date in the format YYYY-MM-DD.';
     } else if ( code.isNullOrEmptySpace( donor ) === true ) {
        error = 'Please select a donor.';
     }

     code.log( 'validateInput(); error: ' + error );

     // log( 'validateInput(); okToAdd: ' + okToAdd);

     // return true if all required values are given and either the
     // data already exists, is brand new, or the user confirmed adding
     // a duplicate
     if ( code.isNullOrEmptySpace( error ) === true ) {
        return true;
     }

     // show an error if one is generated (not needed for exists since a confirm() is used already)
     if ( code.isNullOrEmptySpace( error ) === false ) {
        alert( error );
     }
     return false;
};

/**
  * . Gets the headers for the "donors" file and saves the data.
  */
  code.prepareSaveData = function( headers ) {
    code.log( 'submit(donations); headers: ' + headers );

    // get all of the data on the page using the headers
    // this does not include the ID of this row and never will since
    // this form is used for creation
    var data = code.collect( headers );

    // every new donation will have a new ID

    code.log( 'submit(donations); data: ' + JSON.stringify( data ) );

      // fix this function before you allow it to work
      // TODO: need to be able to chain the ability to add a new donor
      // along with adding the actual donation
      // then, the donor_id needs to be set to the new donor id that is returned
      // and then the donation needs to be saved correctly
     google.script.run.withSuccessHandler( code.saveResult )
     .withFailureHandler( code.hideSpinner )
     .saveData( 'donations', null, data );
  };

  code.saveResult = function( result ) {
      if ( result === false ) {
        code.log( 'donations(); save failed.', true );

        // stop the spinner
        code.hideSpinner();

        // stop here
        return false;
      }

      // clear all fields
      code.clearAllFields();

      code.log( 'donations(); save worked!' );

      // stop the spinner
      code.hideSpinner();

      // no items have to be reloaded, so it should be pretty fast...
      return true;
  };

/**
* . Handles when the form is submitted.
*/
document.getElementById( 'manage-donations-form' )
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
      .getHeaders( 'donations' );
} );

document.getElementById( 'date-given-now' )
.addEventListener( 'click', function( event ) {
   code.resetGivenDate();
} );

/**
* Handles resetting the form.
*/
document.getElementById( 'reset' ).addEventListener( 'click', function( event ) {

    code.clearAllFields();
} );

/**
* Code run to load the donors
*/
google.script.run.withSuccessHandler( code.addDonorsHtml )
.fillUsersPicker();

google.script.run.withSuccessHandler( code.addPaymentMethodsHtml )
.fillPaymentMethodsPicker();

google.script.run.withSuccessHandler( code.addDonationTypesHtml )
.fillDonationTypesPicker();

// set the current date for the date picker
code.clearAllFields();

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
