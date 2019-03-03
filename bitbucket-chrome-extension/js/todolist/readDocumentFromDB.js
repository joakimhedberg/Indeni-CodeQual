/**
 * Called when no item has been found in the database
 *
  * @return {object} An object containing saved data related to the PR, if any exists. Otherwise returns an empty document.
 *
 * @example
 *
 *     readDocumentFromDB()
 */

// Read database
function readDocumentFromDB(){

    let id = 'indeni-' + getPullRequestId();

    return new Promise(function(resolve, reject){
        chrome.storage.sync.get([id], function(items) {
            resolve(items[id]);
        });
    })

}
