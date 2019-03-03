/**
 * Waits for the dom to contain a specific selector
 * @return {void}
 * @example
 *     generateTestDirectoryShortCuts()
 */

function generateTestDirectoryShortCuts() {
    $('a.view-file').each(function(){
        let fileButton = $(this);
        let fileLink = fileButton.attr("href");

        if(/\.ind$/.test(fileLink)){
            let testDirectory = fileLink.replace(/[^\/]+\.ind$/,'').replace(/\/parsers\/src\//, '/parsers/test/');
            fileButton.after(`<a class="view-test-directory aui-button aui-button-light" href="${testDirectory}" data-module="components/tooltip" original-title="View the test directory for this script" resolved="">View test directory</a>`);
        }
    })
}