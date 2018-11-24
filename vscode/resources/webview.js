function show_summary(id) {
    var summaries = document.getElementById('summary_parent').childNodes;
    for (var i = 0; i < summaries.length; i++) {
        summaries[i].style.display = 'none';
    }
    document.getElementById('summary_' + id).style.display = 'block';
}
