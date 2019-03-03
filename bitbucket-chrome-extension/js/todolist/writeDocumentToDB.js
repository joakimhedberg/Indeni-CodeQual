
function writeDocumentToDB(item){

    let id = 'indeni-' + getPullRequestId();

    let data = {};
    data[id] = item;

    return new Promise(function(resolve, reject){
        chrome.storage.sync.set(data, function() {
            resolve('Done');
          });
    })

}
