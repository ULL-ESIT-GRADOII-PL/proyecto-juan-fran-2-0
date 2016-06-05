// See http://en.wikipedia.org/wiki/Comma-separated_values
(() => {
"use strict"; // Use ECMAScript 5 strict mode in browsers that support it

var aceditor;

$(document).ready(() => {
        aceditor = ace.edit("original");
        aceditor.setTheme("ace/theme/twilight");
        aceditor.getSession().setMode("ace/mode/javascript");
        aceditor.setShowPrintMargin(false);
        aceditor.session.setUseWorker(false);
    })


 /* Volcar la tabla con el resultado en el HTML */
    const fillTable = (data) => {
        $("#finaltable").get(0).className = "output";
        $("#finaltable").html(JSON.stringify(data.tree, null, 3));
    };

/* Volcar en la textarea de entrada 
 * #original el contenido del fichero fileName */
const dump = (fileName) => {
  $.get(fileName, function (data) {
      aceditor.setValue(data);
  });
};
 
const handleFileSelect = (evt) => {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.target.files;

  var reader = new FileReader();
  reader.onload = (e) => {

     aceditor.setValue(e.target.result);
  };
  reader.readAsText(files[0])
}

/* Drag and drop: el fichero arrastrado se vuelca en la textarea de entrada */
const handleDragFileSelect = (evt) => {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.

  var reader = new FileReader();
  reader.onload = (e) => {

        aceditor.setValue(e.target.result);
        evt.target.style.background = "white";
  };
  reader.readAsText(files[0])
}

const handleDragOver = (evt) => {
  evt.stopPropagation();
  evt.preventDefault();
  evt.target.style.background = "yellow";
}

$(document).ready(() => {
    let original = document.getElementById("original");  
    if (window.localStorage && localStorage.original) {
      aceditor.setValue(localStorage.original);
    }

    /* Request AJAX para que se calcule la tabla */
    $("#parse").click(() => {
            if (window.localStorage) localStorage.original = aceditor.getValue();
            $.get("/pl0", /* Request AJAX para que se calcule la tabla */ {
                    input: aceditor.getValue()
                },
                fillTable,
                'json'
            );
        });
   /* botones para rellenar el textarea */
   $('button.example').each( (_,y) => {
     $(y).click( () => { dump(`${$(y).text()}.txt`); });
   });

    // Setup the drag and drop listeners.
    //var dropZone = document.getElementsByClassName('drop_zone')[0];
    let dropZone = $('.drop_zone')[0];
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleDragFileSelect, false);
    let inputFile = $('.inputfile')[0];
    inputFile.addEventListener('change', handleFileSelect, false);
 });
})();
