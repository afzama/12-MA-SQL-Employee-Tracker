const inquirer = require('inquirer');
const mysql = require('mysql2');
const express = require('express');

const PORT = process.env.PORT || 4000;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Chak443r!',
    database: 'employee_db'
});

// Initial function to start the application
const startApp = () => {
    console.log("Welcome to the Employee Tracker!");
    init(); // Start the inquirer prompts
};

// Function to handle inquirer prompts
const init = () => {
    inquirer.prompt([
        {
            type: "list",
            choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Exit"],
            message: "What would you like to do?",
            name: "task"
        }
    ]).then(ans => {
        if (ans.task === "View all departments") {
            // Function to Query database and display departments
            db.query(`SELECT * FROM employee_department`, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.table(result);
                }
                // Continue with other prompts
                init();
            });
        } else if (ans.task === "View all roles") {
            db.query('SELECT * FROM employee_role', (err, results) => {
                console.log(err);
                console.table(results);
                init()
            });
        } else if (ans.task === "View all employees") {
            db.query('SELECT * FROM employee_names', (err, results) => {
                console.log(err);
                console.table(results);
                // After displaying the role data, initiate the inquirer prompts again
                init();
            });
        } else if (ans.task === "Add a department") {
            inquirer.prompt([
                {
                    type: "input",
                    message: "Enter the name of the department:",
                    name: "departmentName"
                }
            ]).then(departmentAnswer => {
                // Add the new department to the database
                db.query('INSERT INTO employee_department (department_name) VALUES (?)', [departmentAnswer.departmentName], (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`Department ${departmentAnswer.departmentName} added successfully!`);
                    }
                    // Continue with other prompts
                    init();
                });
            });
        } else if (ans.task === "Add a role") {
            addRole();
        } else if (ans.task === "Exit") {
            console.log("Exiting...");
            process.exit();
        } else {
            console.log("Option not implemented yet.");
            // Continue with other prompts
            init();
        }
    });
};

// Function to add a role to the database
const addRole = async (roleName, roleSalary, departmentName) => {
    try {
        // Fetch the department ID based on the selected department name
        const departmentId = await getDepartmentId(departmentName);
        // Add the new role to the database
        await insertRole(roleName, roleSalary, departmentId);
        console.log(`Role ${roleName} added successfully!`);
    } catch (error) {
        console.log(error);
    } finally {
        // Initiate the inquirer prompts again
        init();
    }
};


// Start the application
startApp();

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
