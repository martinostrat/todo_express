const { error } = require('console');
const express = require('express');
const app = express();
const fs = require('fs');

// Templates for views
const path = require('path');
const { stringify } = require('querystring');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const readFile = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            const tasks = JSON.parse(data);
            resolve(tasks);
        })
    })
}

const writeFile = (filename, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, 'utf-8', err => {
            if (err) {
                console.error(err);
                return;
            }
            resolve(true);
        })
    })
}

app.get('/', (req, res) => {
    // Read data from file
    readFile('./tasks.json')
        .then(tasks => {
            res.render('index', {
                tasks: tasks,
                error: null,
            })
        })
})

// DELETE SINGLE
app.get('/delete-task/:taskId', (req, res) => {
    let deletedTaskId = parseInt(req.params.taskId);
    readFile('./tasks.json')
        .then(tasks => {
            tasks.forEach((task, index) => {
                if (task.id === deletedTaskId) {
                    tasks.splice(index, 1)
                }
            })
            data = JSON.stringify(tasks, null, 2);
            writeFile('tasks.json', data);
            res.redirect('/');
        })
})

// DELETE ALL
app.get('/delete-tasks', (req, res) => {
    // Read data from file
    readFile('./tasks.json')
        .then(tasks => {
            // Deletes entries from tasks.json
            if (tasks.length > 0) {
                tasks.splice(0, tasks.length);
            }
            // Writes new empty entry to tasks.json
            data = JSON.stringify(tasks, null, 2);
            writeFile('tasks.json', data);
            res.redirect('/');
        })
})

// EDIT
app.get('/edit/:taskId', (req, res) => {
    let selected = parseInt(req.params.taskId);
    readFile('./tasks.json')
        .then(tasks => {
            tasks.forEach(task => {
                if (Object.is(selected, task.id)) {
                    res.render('edit', {
                        tasks: tasks,
                        selectedId: task.id,
                        error: null
                    })
                }
            })
        })
})

app.use(express.urlencoded({ extended: true }));

// SAVE EDIT AND UPDATE "/"
app.post('/update-task/:taskId', (req, res) => {
    let taskId = parseInt(req.params.taskId);
    let newTask = req.body.task;
    let error = null;

    if (req.body.task.trim().length == 0) {
        error = 'Please check your formating';
        readFile('./tasks.json')
            .then(tasks => {
                res.render('edit', {
                    error: error,
                    tasks: tasks,
                    selectedId: taskId
                })
            })

    } else {
        readFile('./tasks.json')
            .then(tasks => {
                // Update matching tasks "task" value
                tasks.forEach(task => {
                    if (task.id === taskId) {
                        task.task = newTask;
                    }
                })

                // Write changes to json file
                data = JSON.stringify(tasks, null, 2);
                writeFile('tasks.json', data);
                res.redirect('/');
            })
    }
})


app.post('/', (req, res) => {
    // Check form data
    let error = null;
    if (req.body.tasks.trim().length == 0) {
        error = 'Please check your formating';
        readFile('./tasks.json')
            .then(tasks => {
                res.render('index', {
                    tasks: tasks,
                    error: error
                })
            })
    } else {
        readFile('./tasks.json')
            .then(tasks => {

                let index;
                if (tasks.length === 0) {
                    index = 0;
                } else {
                    index = tasks[tasks.length - 1].id + 1;
                }

                const newTask = {
                    "id": index,
                    "task": req.body.tasks
                }

                tasks.push(newTask);
                data = JSON.stringify(tasks, null, 2);
                writeFile('tasks.json', data);
                res.redirect('/');
            })
    }
})

app.listen(3001, () => {
    console.log('Test app...');
})