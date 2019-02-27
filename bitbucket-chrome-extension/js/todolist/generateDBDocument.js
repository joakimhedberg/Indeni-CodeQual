/**
 * Called when no item has been found in the database
 * @return {object} A new database document based on the state of the check boxes
 *
 * @example
 *     generateDBDocument()
 */

function generateDBDocument(){

    let items = {};
    
    $('input.indeniToDoCheckbox').each(function(){
        items[this.value] = this.checked;
    })

    return items;

}