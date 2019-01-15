# Change Log

## [Upcoming release]
Various bugfixes reported @ github

## [0.1.4]
Some bugfixes. Some tidying up in the code-behind.
New quality check, script name

## [0.1.3]
Fixed the yaml indent check. It had problems with CRLF
Fixed the embedded-awk iterator and made it a little more robust.
Added write*Metric snippets
Made the credits a bit less invasive...
Added buttons in the gui to navigate/scroll to the issue
New function: Mark erroneous section definitions(Verify section marker syntax)

## [0.1.2]
Fixed the variable naming convention. Or atleast improved it.
It will check for variables, matching them with the snake_case convention. Alerts if the match fails.
Also supports embedded awk in yaml sections.

## [0.1.1]
- Giving credits where credits are due
- Readme file cleanup
- More work on the function view. Open it by using "Perform code quality". Click an alert item to see the offending lines.
- Disabled the CRLF check. CRLF is allowed as well as LF.
- Fixed an issue in the yaml whitespace check where CRLF created a false positive.

## [0.1.0]
- Fixed issue #43.
- Added feature overview of quality functions

## [0.0.1]
- Initial release of Indeni code quality checker plugin

