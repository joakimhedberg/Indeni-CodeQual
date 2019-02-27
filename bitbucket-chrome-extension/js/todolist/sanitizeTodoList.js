/**
 * Need to add new keys and remove old ones from a Todo list. If a change has been detected it will also update the document in the localStorage.
 *
 * @param {object} toDoList Contains the list that should be sanitized
 * @return {object} An object containing saved data related to the PR, if any exists. Otherwise returns an empty document.
 *
 * @example
 *
 *     sanitizeTodoList(toDoList)
 */

// Read database
function sanitizeTodoList(toDoList){
    
    var changeDetected = false;

    for(key in settings.toDos){

        // Detecting new keys
        if(toDoList[key] === undefined){
            changeDetected = true;
            toDoList[key] = false;
        }

    }

    // Remove keys that has been deleted from the extension
    for(key in toDoList){

        if(settings.toDos[key] === undefined){
            changeDetected = true;
            delete toDoList[key];
        }

    }

    if(changeDetected){
        writeDocumentToDB(toDoList);
    }

    return toDoList;

}
