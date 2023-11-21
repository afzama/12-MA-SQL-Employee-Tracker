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
            db.query('SELECT * FROM employee', (err, results) => {
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
            // Modify init function to include "Add an employee" option
        } else if (ans.task === "Add an employee") {
            addEmployee();
            // Modify init function to include "Update an employee role" option
        } else if (ans.task === "Update an employee role") {
            updateEmployeeRole();
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
//get department ID based on name
const getDepartmentId = async (departmentName) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id FROM employee_department WHERE department_name = ?', [departmentName], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0].id);
            }
        });
    });
};

// Function to add a role to the database
const addRole = async () => {
    try {
        const roleAnswer = await inquirer.prompt([
            {
                type: "input",
                message: "What is the name of the role?",
                name: "roleName",
            },
            {
                type: "input",
                message: "What is the salary of the role?",
                name: "roleSalary",
            },
            {
                type: "list",
                message: "Which department does the role belong to?",
                name: "roleDepartment",
                choices: await getDepartmentChoices(), // Fetch department choices
            },
        ]);

        if (roleAnswer.roleDepartment === "Add new department") {
            const newDepartmentAnswer = await inquirer.prompt([
                {
                    type: "input",
                    message: "Enter the name of the new department:",
                    name: "newDepartmentName",
                },
            ]);

            // Add the new department to the database
            const departmentId = await insertDepartment(newDepartmentAnswer.newDepartmentName);

            // Add the new role to the database
            await insertRole(roleAnswer.roleName, roleAnswer.roleSalary, departmentId);
        } else {
            // Use existing department
            const departmentId = await getDepartmentId(roleAnswer.roleDepartment);

            // Add the new role to the database
            await insertRole(roleAnswer.roleName, roleAnswer.roleSalary, departmentId);
        }

        console.log(`Role ${roleAnswer.roleName} added successfully!`);
    } catch (error) {
        console.log(error);
    } finally {
        // Initiate the inquirer prompts again
        init();
    }
};

// Function to insert a new department and return its ID
const insertDepartment = async (departmentName) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO employee_department (department_name) VALUES (?)', [departmentName], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
};

// Function to insert a new role
const insertRole = async (roleName, roleSalary, departmentId) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO employee_role (title, salary, department_id) VALUES (?, ?, ?)', [roleName, roleSalary, departmentId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Function to get department choices for inquirer prompt
const getDepartmentChoices = async () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT department_name FROM employee_department', (err, departments) => {
            if (err) {
                reject(err);
            } else {
                resolve(departments.map(department => department.department_name).concat("Add new department"));
            }
        });
    });
};

// Function to add an employee to the database
const addEmployee = async () => {
    try {
        const employeeAnswer = await inquirer.prompt([
            {
                type: "input",
                message: "Enter the employee's first name:",
                name: "firstName",
            },
            {
                type: "input",
                message: "Enter the employee's last name:",
                name: "lastName",
            },
            {
                type: "list",
                message: "Select the employee's role:",
                name: "role",
                choices: await getRoleChoices(), // Fetch role choices
            },
        ]);

        // Use the information to insert a new employee record
        await insertEmployee(employeeAnswer.firstName, employeeAnswer.lastName, employeeAnswer.role);

        console.log(`Employee ${employeeAnswer.firstName} ${employeeAnswer.lastName} added successfully!`);
    } catch (error) {
        console.log(error);
    } finally {
        // Initiate the inquirer prompts again
        init();
    }
};

// Function to insert a new employee
const insertEmployee = async (firstName, lastName, roleName) => {
    try {
        const roleId = await getRoleId(roleName);
        const result = await new Promise((resolve, reject) => {
            db.query('INSERT INTO employee (first_name, last_name, employee_role_id) VALUES (?, ?, ?)', [firstName, lastName, roleId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        return result;
    } catch (error) {
        throw error;
    }
};

// Function to get role ID based on role name
const getRoleId = async (roleName) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id FROM employee_role WHERE title = ?', [roleName], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0].id);
            }
        });
    });
};

// Function to update an employee's role in the database
const updateEmployeeRole = async () => {
    try {
        const employeeUpdateAnswer = await inquirer.prompt([
            {
                type: "input",
                message: "Enter the ID of the employee you want to update:",
                name: "employeeId",
            },
            {
                type: "list",
                message: "Select the employee's new role:",
                name: "newRole",
                choices: await getRoleChoices(), // Fetch role choices
            },
        ]);

        // Use the information to update the employee's role
        await updateEmployee(employeeUpdateAnswer.employeeId, employeeUpdateAnswer.newRole);

        console.log(`Employee role updated successfully!`);
    } catch (error) {
        console.log(error);
    } finally {
        // Initiate the inquirer prompts again
        init();
    }
};

// Function to update an employee's role
const updateEmployee = async (employeeId, roleId) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE employee SET employee_role_id = ? WHERE id = ?', [roleId, employeeId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Function to get role choices for inquirer prompt
const getRoleChoices = async () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT title FROM employee_role', (err, roles) => {
            if (err) {
                reject(err);
            } else {
                resolve(roles.map(role => role.title));
            }
        });
    });
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
