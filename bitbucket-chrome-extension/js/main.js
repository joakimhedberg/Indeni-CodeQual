readDocumentFromDB()
    .then(function(toDoList){
        
        if (toDoList === undefined){
            toDoList = newToDoList();
        }

        sanitizeTodoList(toDoList);

        $('div.detail-summary--panel').append(generateContent(toDoList));
        $('div.detail-summary--panel').css('width', '1000px');
        $('input.indeniToDoCheckbox').on('change', function(){
            writeDocumentToDB(generateDBDocument());
        })
        
    })

waitFor('a.view-file', 1000, 20)
    .then(generateTestDirectoryShortCuts)
    .catch(function(err){
        console.error(err);
    })