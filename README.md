# donation-tracker

uses google sheets to track donations and generate reports

## Clasp
The Apps Script CLI is a tool that lets you create, edit, and deploy Apps Script
projects locally.

-   [Github](https://github.com/google/clasp)
-   [Getting Started with Clasp](https://developers.google.com/apps-script/guides/clasp)
-   [tutorial](https://codelabs.developers.google.com/codelabs/clasp)

-   Although script files are .gs within the online editor, they are cloned with
the `clasp` tool locally as `.js`
-   use `clasp version` just like `git commit -am` to commit code to google apps
script; essentially, versions are equivalent to git commits



## TODO
-   for "simple" object types (everything but actual donations), there is no
need to retrieve the value from the spreadsheet. You can add an attribute with
the case-sensitive value in it to load when selected; this will make the UI
work a bit faster. This should be done once everything is working properly
-   When clicking "Save" to add a donation, the performance is entirely too slow;
this must be optimized if it is to be used in production
-   Change workflow to commit to git before syncing to Google
-   Add tests that prevent committing non-working/invalid code
-   Try Jest for Javascript testing
-   Change the root folder where data is stored to "add-ons" from "apps"
-   Make sure the file for saving donations exists and if not, create it upon
saving a donation
-   Add ability to view/delete a user’s donations for a time range
-   Add ability to summarize all donations by any number of users for a given
time range; the ability to select multiple users will cover couples giving
-   Make sure installation works as Google extension
-   load payment methods correctly for "add donations" page
-   complete add donations page
-   look into creating a report based on the data for selected users within
a specified date range

-   add validation that asks if a user already exists if they want to add a duplicate
-   fix getColumnLetter() for values >= 27
-   create a function for retrieving the data range without the first row
in order to standardize it across the different dialogs; it also
prevents moving the header data in the file upon sorting the data
-   only use server-side js for form validation; no need for client side
-   create a function where the parameters are
file, header array, and value array to be shared among dialogs to
write data uniformly; either all will work or none at all
-   see if you can format the cell types as you write to them (number, date)
-   be able to add donations
-   add support for setting couples (people whose gifts are linked)
-   add support for adding donation types
-   make it generic, not church specific before releasing as an add-on
-   new name: donation-tracker
-   add support for creating some sort of report with selectable dates for users,
include couple support so two people can be addressed on the same document
-   include some sort of breakdown by month and year
