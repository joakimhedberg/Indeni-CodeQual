"use strict";

// Get the PR id
function getPullRequestId(){
    try {
        return(parseInt(document.location.href.split('/')[6]));
    } catch(err){
        console.err(err);
        return false;
    }
}