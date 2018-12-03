# indeni-codequal README

Code quality checker for Indeni .ind scripts

# Credits
* Patrik Jonsson
    * For coming up with the code quality idea in the first place and putting alot of work in the base that i've copy-pasted
* Hawkeye Parker
    * For helping to keep the project alive and up-to-date
* Joakim Hedberg
    * For stealing a great idea putting it into this tool

# Features

## Commands
# Indeni code quality: *
* Perform code quality
    * Will look over you code and give you visual feedback on the errors, it will also open the view panel where you get an overview of the errors
* Toggle live update
    * Will toggle the feature to update the error checks as you type. If the overview is opened it will also live-update.
* Set syntax highlight(awk/yaml)
    * Will set the syntax language based on the code before you
* Clear decorations
    * Will clear the decorations from your file. If Live update is enabled they will soon reappear again.

# Requirements
File name *.ind

## Extension Settings

This extension contributes the following settings:

* `extension.warningBorderColor`: Border color for warning messages
* `extension.errorBorderColor`: Border color for error messages
* `extension.informationBorderColor`: Border color for information messages
