
/**
 * Generates the div containing the check list on the Bitbucket page
 * @param {object} toDoList The state of each todo item
 * @return {string} An HTML div
 *
 * @example
 *     generateContent(toDoList)
 */


function generateContent(toDoList){

    let linkIcon = chrome.runtime.getURL('images/link.png');
    let content = `
    <div class="indeni-todo-div">
        <h5>Check list for script and rule writers</h5>
    `;

    // Looping through an object does not return the keys in a specific order. 
    // Thus using alphabetical order here.

    let sortedKeys = Object.keys(toDoList).sort();

    for(i in sortedKeys){
        let key = sortedKeys[i];
        let itemMetaData = settings.toDos[key];
        let state = toDoList[key] ? 'CHECKED': '';
        content += `    <input class="indeniToDoCheckbox" type="checkbox" ${state} value="${key}"></input> ${itemMetaData.description} <span class="responsible">${itemMetaData.appliesTo.join(", ")}</span> <a href="${itemMetaData.externalLink}"><img src="${linkIcon}"></a><br>`;
    }

    return content + '</div>'
    
}
