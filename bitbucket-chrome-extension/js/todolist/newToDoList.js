/**
 * Called when no item has been found in the database
 *
  * @return {object} A new to do list
 *
 * @example
 *
 *     newToDoList()
 */

function newToDoList(){
    
    let item = {};
    let toDos = settings.toDos;

    for(key in toDos){
        item[key] = false;
    }

    return item;
}

// Workaround to enable tests with mocha chai
if(typeof(module) === 'object'){
    module.exports = newToDoList;
}