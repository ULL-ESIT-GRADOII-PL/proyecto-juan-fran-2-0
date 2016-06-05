"use strict";

const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const PEG = require('./models/pl0.js');
/*const semantic = require('./models/semantic.js');*/

app.set('port', (process.env.PORT || 5000));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(express.static(__dirname + '/public'));

/*const calculate = require('./models/calculate');*/

app.get('/', (request, response) => {
  response.render('index', { title: 'Analizador PL0' });
});
/*
app.get('/pl0', (request, response) => {
  response.send({ "rows": calculate(request.query.input) });
});*/

app.get('/pl0', (request, response) => {
    var tree;
    try {
        tree = PEG.parse(request.query.input);
        /*semantic(tree);*/
        if (tree.errors)
            tree = tree.errors;
    } catch (e) {
        console.log("ERROR: " + e);
        tree = "Syntax Error: " + e.message.substring(0, e.message.length - 1) + " in line " + e.location.start.line;
    }
    response.send({
        "tree": tree
    });
});

app.listen(app.get('port'), () => {
    console.log(`Node app is running at localhost: ${app.get('port')}` );
});
