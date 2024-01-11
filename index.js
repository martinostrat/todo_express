const express = require('express');
const app = express();
const fs = require('fs');

// Templates for views
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    // Read data from file
    fs.readFile('./tasks', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }

        const tasks = data.split("\n");
        res.render('index', { tasks: tasks });
    })

});

app.listen(3001, () => {
    console.log('Test app...');
})