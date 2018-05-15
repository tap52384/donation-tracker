# donation-tracker

uses google sheets to track donations and generate reports

## Clasp
The Apps Script CLI is a tool that lets you create, edit, and deploy Apps Script
projects locally.

-   [github](https://github.com/google/clasp)
-   [tutorial](https://codelabs.developers.google.com/codelabs/clasp)

-   Although script files are .gs within the online editor, they are cloned with
the `clasp` tool locally as `.js`
-   use `clasp version` just like `git commit -am`

## TODO
-   load payment methods correctly for "add donations" page
-   complete add donations page
- look into creating a report based on the data for selected users within
a specified date range

- add validation that asks if a user already exists if they want to add a duplicate
- fix getColumnLetter() for values >= 27
- create a function for retrieving the data range without the first row
in order to standardize it across the different dialogs; it also
prevents moving the header data in the file upon sorting the data
- only use server-side js for form validation; no need for client side
- create a function where the parameters are
file, header array, and value array to be shared among dialogs to
write data uniformly; either all will work or none at all
- see if you can format the cell types as you write to them (number, date)
- be able to add donations
- add support for setting couples (people whose gifts are linked)
- add support for adding donation types
- make it generic, not church specific before releasing as an addon
- new name: donation-tracker
- add support for creating some sort of report with selectable dates for users,
include couple support so two people can be addressed on the same document
- include some sort of breakdown by month and year
