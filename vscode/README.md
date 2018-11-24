# indeni-codequal README

Code quality checker for Indeni .ind scripts

# Credits
## Patrik Jonsson for coming up with the code quality idea in the first place and putting alot of work in the base that i've copy-pasted
## Hawkeye Parker for helping to keep the project alive and up-to-date
## Joakim Hedberg for stealing a great idea putting it into this tool

# Features

## Commands
# Indeni code quality: *
* Perform code quality
Will look over you code and give you visual feedback on the errors
I will also open the view panel where you get an overview of the errors
* Toggle live update
Will toggle the feature to update the error checks as you type. If the overview is opened it will also live-update.
* Set syntax highlight(awk/yaml)
Will set the syntax language based on the code before you
* Clear decorations
Will clear the decorations from your file. If Live update is enabled they will soon reappear again.

# Requirements
File name *.ind

## Extension Settings

This extension contributes the following settings:

* `extension.warningBorderColor`: Border color for warning messages
* `extension.errorBorderColor`: Border color for error messages
* `extension.informationBorderColor`: Border color for information messages

# Release Notes

# 0.0.1

Initial release of Indeni code quality checker plugin

# 0.1.0

Fixed issue #43.
Added feature overview of quality functions

# 0.1.1
Giving credits where credits are due
Readme file cleanup
More work on the function view. Open it by using "Perform code quality". Click an alert item to see the offending lines.
Disabled the CRLF check. CRLF is allowed as well as LF.
Fixed an issue in the yaml whitespace check where CRLF created a false positive.
