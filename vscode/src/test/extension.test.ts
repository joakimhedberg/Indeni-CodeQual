//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import path = require('path');
import fs = require('fs');
import { get_sections } from "../code-quality/sections";
import { CodeValidations } from '../code-quality/code-validation';
import { MarkerCollection } from '../code-quality/code-quality-base/MarkerResult';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {
    let base_path = path.join(__dirname, '../../resources/testing');

  
    /*
        Simple unit tests to compare before and after
        If a unit test fails you should look into why and fix accordingly
        If you are right and the test is wrong, correct the test

        All test scripts should be placed in resources/testing. 
        To access a test script, join the filename with the base_path variable
    */

    test("Test 1 - 6 warnings, 92 errors", function() {
        // Create an instance of the quality functions
        const quality_functions : CodeValidations = new CodeValidations();
        // Get the filename to your test data
        let script_data_path = path.join(base_path, "var_name_90_comma_4_undoc_2_space_before_2.ind");
        // Read the data as a string from the file
        let data = fs.readFileSync(script_data_path, 'utf-8');

        // Create a sections object with the script data
        let sections = get_sections(data);

        // Apply the quality check on the sections
        quality_functions.apply(sections);

        // Create new collections for the markers. Since we do not need to mark then we can leave the decoration type as undefined
        let error_collection : MarkerCollection = new MarkerCollection(undefined);
        let warning_collection : MarkerCollection = new MarkerCollection(undefined);
        let information_collection : MarkerCollection = new MarkerCollection(undefined);

        // Add the markers to the collections, seems redundant but the MarkerCollection filters out duplicates
        for (let warning of quality_functions.warning_markers) {
            warning_collection.append(warning);
        }
        for (let error of quality_functions.error_markers) {
            error_collection.append(error);
        }

        for (let info of quality_functions.information_markers) {
            information_collection.append(info);
        }

        // In the test script, we got 6 errors and 92 warnings, check if this is still the case
        assert.equal(error_collection.markers.size, 6);
        assert.equal(warning_collection.markers.size, 92);
    });
});