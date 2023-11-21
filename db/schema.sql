DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE employee_department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(30) NOT NULL
);

CREATE TABLE employee_role (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10,2), 
    department_id INT,
    FOREIGN KEY (department_id)
    REFERENCES employee_department(id)
    ON DELETE SET NULL
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    is_manager BOOLEAN,
    employee_role_id VARCHAR(30) NOT NULL,
    manager_id INT,
    FOREIGN KEY (employee_role_id)
    REFERENCES employee_role(id)
    ON DELETE CASCADE
);