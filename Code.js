/**
* . Code that handles menus and add-on installation.
*
* . Add-on Authorization Lifecyle:
* . https://developers.google.com/apps-script/add-ons/lifecycle
*
* . How to test an add-on
* . https://developers.google.com/apps-script/add-ons/test
*
* . Properties Service
* . https://developers.google.com/apps-script/guides/properties
*
* . Publishing an Add-on
* . https://developers.google.com/apps-script/add-ons/publish
*
* . HTML Service: Best Practices (has include function)
* . https://developers.google.com/apps-script/guides/html/best-practices
*
* . CSS Package for Add-ons
* . https://developers.google.com/apps-script/add-ons/css
*
* . External APIs
* . https://developers.google.com/apps-script/guides/services/external
*
* . Versions
* . https://developers.google.com/apps-script/guides/versions
*/

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  var menu = SpreadsheetApp.getUi().createAddonMenu(); // Or DocumentApp.
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    // Add a normal menu item (works in all authorization modes).
    menu.addItem('Manage donors', 'manageDonors');
  }
    // Add a menu item based on properties (doesn't work in AuthMode.NONE).
    // https://developers.google.com/apps-script/guides/properties
    var properties = PropertiesService.getDocumentProperties();
    var workflowStarted = properties.getProperty('workflowStarted');
    if (workflowStarted) {
      menu.addItem('Check workflow status', 'checkWorkflow');
    } else {
      menu.addItem('Start workflow', 'manageDonors');
    }
  menu.addToUi();

  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.

  // shows one way that a custom menu can be added
  ui.createMenu('Donation Tracker')
      .addItem('Manage members...', 'manageDonors')
      .addToUi();

    // shows a second way that a custom menu can be added
    var spreadsheet = SpreadsheetApp.getActive();
    var menuItems = [
      {name: 'Add donations...', functionName: 'manageDonations'},
      {name: 'Manage donation types...', functionName: 'manageDonationTypes'},
      {name: 'Manage donors...', functionName: 'manageDonors'},
      {name: 'Manage payment methods...', functionName: 'managePaymentMethods'}
    ];
    spreadsheet.addMenu('Donation Tracker', menuItems);
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

function isNullOrEmpty( x ) {
    return x === undefined || x === '' || x === null;
}

/**
* Returns true if the specified variable is null, empty, or with all spaces
* removed an empty string.
*/
function isNullOrEmptySpace( x ) {
  return isNullOrEmpty( x ) || typeof x.trim === 'function' && isNullOrEmpty( x.trim().replace( / /g, '' ) );
}

function manageDonors() {
   // type HtmlOutput
   var html = extends('base', 'donors', 'customcss', 'donors.js');

   // Ui
   SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
   // showModalDialog(HtmlOutput, String)
      .showModalDialog(html, 'Manage donors');
}

function manageDonations() {
  // HtmlOutput
  var html = extends('base', 'donations', 'customcss', 'donations.js');

  // Ui
   SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
   // showModalDialog(HtmlOutput, String)
      .showModalDialog(html, 'Add donations');
}

function manageDonationTypes() {
  // HtmlOutput
  var html = extends('base', 'donation-types', 'customcss', 'donation-types.js');

  // Ui
   SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
   // showModalDialog(HtmlOutput, String)
      .showModalDialog(html, 'Manage donation types');
}

function managePaymentMethods() {
  // HtmlOutput
  var html = extends('base', 'payment-methods', 'customcss', 'payment-methods.js');

  // Ui
   SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
   // showModalDialog(HtmlOutput, String)
      .showModalDialog(html, 'Manage payment methods');
}

/**
 * . Function for allowing you to embed files (css, html, etc.) into HTML.
 * . https://developers.google.com/apps-script/guides/html/best-practices
 * . https://developers.google.com/apps-script/reference/html/html-service#createHtmlOutputFromFile(String)
 * . https://developers.google.com/apps-script/reference/html/html-output#getContent()
 * . @returns String
 */
function include(filename) {
  return isNullOrEmptySpace(filename) ? '' : HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
* . Explains how to push data to HTML; could be useful in reusing templates.
* . https://developers.google.com/apps-script/guides/html/templates#pushing_variables_to_templates
* . This function will be used for deciding what files to include in a template.
* . The point of this is to avoid duplication of HTML as much as possible for a
* . more consistent experience. Depends on the include() function to work.
* . @param layoutFileName  string
* . @param contentFileName string
* . @param cssFileName     string
* . @param jsFileName      string
* . @param bootstrap       boolean
* . @return HtmlOutput
*/
function extends(layoutFileName, contentFileName, cssFileName, jsFileName, bootstrap) {
  // https://developers.google.com/apps-script/reference/html/html-service#createTemplateFromFile(String)
  // returns HtmlTemplate
  var template = HtmlService.createTemplateFromFile(layoutFileName);

  // https://developers.google.com/apps-script/reference/html/html-template#evaluate()
  // Key sentence from the docs:
  // Any properties (like .data) set on this HtmlTemplate object will be in scope when evaluating.
  template.data = {
    content: contentFileName,
    css: cssFileName,
    js: jsFileName,
    useBootstrap: bootstrap === true
  };
  // evaluate() returns HtmlOutput
  return template.evaluate()
  // https://developers.google.com/apps-script/reference/html/html-output#addMetaTag(String,String)
  .addMetaTag('apple-mobile-web-app-capable', 'yes')
    // .addMetaTag('google-site-verification', '')
    .addMetaTag('mobile-web-app-capable', 'yes')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    // https://developers.google.com/apps-script/reference/html/html-output#setWidth(Integer)
    .setWidth(500)
    .setHeight(600);
}

/**
* . Logs the text hopefully to the browser console and Google Apps Script logging.
*/
function log(text, error) {
  Logger.log(text);
  console.log(text);
  if (error === true) {
     SpreadsheetApp.getUi().alert(text);
  }
  return error === true;
}

/**
* . Changes a string to title case.
* . @returns string
* . @link https://gist.github.com/SonyaMoisset/b2606b3a7048cc5303f64a726a39e5fd#file-title-case-a-sentence-with-map-wc-js
*/
function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}
