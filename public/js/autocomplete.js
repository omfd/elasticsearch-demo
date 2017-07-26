$("#auto-1").autocomplete({
    source: "/1/best-match",
    minLength: 2,
    autoFocus: true,
});

$("#auto-2").autocomplete({
    source: "/1/most-match",
    minLength: 2,
    autoFocus: true
});


$("#auto-3").autocomplete({
    source: "/1/edge-ngram",
    minLength: 2,
    autoFocus: true
});


$("#auto-4").autocomplete({
    source: "/1/ngram",
    minLength: 2,
    autoFocus: true
});

$("#auto-5").autocomplete({
    source: "/1/shingle",
    minLength: 2,
    autoFocus: true
});

$("#auto-6").autocomplete({
    source: "/1/example",
    minLength: 2,
    autoFocus: true,
    response: function(event, ui){
        "use strict";

    }
});

$("#auto-7").autocomplete({
    source: "/1/fuzzy",
    minLength: 2,
    autoFocus: true,
    response: function(event, ui){
        "use strict";

    }
});

$("#main-search").autocomplete({
    source: "/autocomplete",
    minLength: 2,
    autoFocus: true
});

// $( "#auto-6" ).on( "autocompleteresponse", function( event, ui ) {
//     "use strict";
//     if(ui)
//         $('#show').html(JSON.stringify(ui));
// } );