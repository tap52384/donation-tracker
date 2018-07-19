/**
 * Resets all fields on the form.
 * @return {[type]} [description]
 */
function clearAllFields() {

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
     resetGivenDate();
}

/**
*  set the default date for the donation to the current date
*/
function resetGivenDate() {

     // https://stackoverflow.com/a/19079425/1620794
     // https://stackoverflow.com/questions/12409299/how-to-get-current-formatted-date-dd-mm-yyyy-in-javascript-and-append-it-to-an-i/19079425#comment74271020_19079425
     document.getElementById( 'given_at' ).value =
     new Date().toJSON().slice( 0, 10 ).replace( /-/g, '-' );
     return true;
}

function addDonorsHtml( output ) {

    // add an option for manually entering the name of a new donor on the fly
    // output = '<option value="-1">Add new donor</option>' + output;

    document.getElementById( 'donor_id' ).innerHTML = output;

    // clear the fields first
    clearAllFields();

    // stop the spinner
    hideSpinner();
}

function addPaymentMethodsHtml( output ) {
    document.getElementById( 'paymentmethod_id' ).innerHTML = output;

    // clear the fields first
    clearAllFields();

    // stop the spinner
    hideSpinner();
}

function addDonationTypesHtml( output ) {
   document.getElementById( 'donationtype_id' ).innerHTML = output;

   // clear the fields first
    clearAllFields();

    // stop the spinner
    hideSpinner();
}

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


function validateInput() {
     var error = '';

     var amount = getValue( 'amount' );
     var donor = getValue( 'donor_id' );

     // var firstname = getValue('firstname');
     // var mi = getValue('mi');
     // var lastname = getValue('lastname');
     // var suffix = getValue('suffix');
     // var fullName = firstname + ' ' + lastname +
     // ' ' + suffix;

     var paymentMethod = getValue( 'paymentmethod_id' );
     var donationType = getValue( 'donationtype_id' );
     var givenDate = getValue( 'given_at' );

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
     if ( isNullOrEmptySpace( paymentMethod ) === true ) {
        error = 'Please select a payment method.';
     } else if ( isNullOrEmptySpace( donationType ) === true ) {
        error = 'Please select a donation type.';
     } else if ( isNullOrEmptySpace( amount ) === true ||
     isNaN( amount ) === true || +amount !== +amount ||
     parseFloat( amount ) <= 0 ) {
        error = 'Please enter a donation amount greater than 0.';
     } else if ( isValidDate( givenDate ) === false ) {
        error = 'Please enter a valid donation date in the format YYYY-MM-DD.';
     } else if ( isNullOrEmptySpace( donor ) === true ) {
        error = 'Please select a donor.';
     }

     /*
     get the text of the current item
     look through all of the items and return an array of ids for those that match
     pass the current id (if any); if the id of the current id is in the array of ids, leave it out
     if the count of the matches > 0, then present the confirm() dialog and only continue if positive
     */
     // var okToAdd = ( donor === -1 || donor === '-1' ) &&
     // possibleDupeIds.length > 0 ?
     // window.confirm('A donor with the name "' + fullName + '" already exists;' +
     // ' do you still want to add it?') :
     // true;

     log( 'validateInput(); error: ' + error );

     // log( 'validateInput(); okToAdd: ' + okToAdd);

     // return true if all required values are given and either the
     // data already exists, is brand new, or the user confirmed adding
     // a duplicate
     if ( isNullOrEmptySpace( error ) === true ) {
        return true;
     }

     // show an error if one is generated (not needed for exists since a confirm() is used already)
     if ( isNullOrEmptySpace( error ) === false ) {
        alert( error );
     }
     return false;
}

/**
  * . Gets the headers for the "donors" file and saves the data.
  */
  function prepareSaveData( headers ) {
    log( 'submit(donations); headers: ' + headers );

    // get all of the data on the page using the headers
    // this does not include the ID of this row and never will since
    // this form is used for creation
    var data = collect( headers );

    // every new donation will have a new ID

    log( 'submit(donations); data: ' + JSON.stringify( data ) );

      // fix this function before you allow it to work
      // TODO: need to be able to chain the ability to add a new donor
      // along with adding the actual donation
      // then, the donor_id needs to be set to the new donor id that is returned
      // and then the donation needs to be saved correctly
     google.script.run.withSuccessHandler( saveResult )
     .withFailureHandler( hideSpinner )
     .saveData( 'donations', null, data );
  }

  function saveResult( result ) {
      if ( result === false ) {
        log( 'donations(); save failed.', true );

        // stop the spinner
        hideSpinner();

        // stop here
        return false;
      }

      // clear all fields
      clearAllFields();

      log( 'donations(); save worked!' );

      // stop the spinner
      hideSpinner();

      // no items have to be reloaded, so it should be pretty fast...
      return true;
  }

/**
* . Handles when the form is submitted.
*/
document.getElementById( 'manage-donations-form' )
.addEventListener( 'submit', function( event ) {
      event.preventDefault();

      // validate the form input
      if ( validateInput() === false ) {
        return false;
      }

      // show the spinner
      showSpinner();

      // get all headers which will also be the IDs of all inputs
      google.script.run.withSuccessHandler( prepareSaveData )
      .getHeaders( 'donations' );
} );

document.getElementById( 'date-given-now' )
.addEventListener( 'click', function( event ) {
   resetGivenDate();
} );

/**
* Handles resetting the form.
*/
document.getElementById( 'reset' ).addEventListener( 'click', function( event ) {

    clearAllFields();
} );

/**
* Code run to load the donors
*/
google.script.run.withSuccessHandler( addDonorsHtml )
.fillUsersPicker();

google.script.run.withSuccessHandler( addPaymentMethodsHtml )
.fillPaymentMethodsPicker();

google.script.run.withSuccessHandler( addDonationTypesHtml )
.fillDonationTypesPicker();

// set the current date for the date picker
clearAllFields();
