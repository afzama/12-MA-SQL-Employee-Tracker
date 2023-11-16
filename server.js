const inquirer = require('inquirer');
const mysql = require('mysql2');
const express = require('express');

const PORT = process.env.PORT || 3000;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: 'Chak443r!',
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
);

// Query database
let deletedRow = 2;

db.query(`DELETE FROM employee_department WHERE id = ?`, [2], (err, result) => {
    if (err) {
        console.log(err);
    }
    console.log(result);
});

db.query('SELECT * FROM employee', function (err, results) {
    console.log(results);
});

const init = () => {
    inquirer.prompt([{
        type: "list",
        choices: ["View all departments", "View all roles", "View all employees", "Add a deparment", "Add a role", "Add an employee", "Update an employee role"],
        Message: "What would you like to do?",
        Name: "task"
    }]).then(ans => {
        if (ans.task === "View all departments") {
            Connection.query('SELECT * FROM employee_department', (err, results) => {
                console.log(err);
                console.table(results);
                init()
            })
        }
    });
}

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
