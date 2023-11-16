INSERT INTO employee_department (department_name)
VALUES  ("Sales"),
        ("Legal"),
        ("Finance"),
        ("HR"),
        ("Shipping"),
        ("Engineering"),
        ("Marketing"),
        ("Operations");

INSERT INTO employee_role (title,salary,department_id)
VALUES  ("Account Manager",60000, 1),
        ("Contracts Counsel",75000, 2),
        ("Financial Analyst",80000, 3),
        ("HR Manager",90000, 4),
        ("Logistics Coordinator",40000, 5),
        ("DevOps Engineer",110000, 6),
        ("Digital Marketing Analyst",85000, 7),
        ("Corporate Analyst",70000, 8);

INSERT INTO employee_names (first_name,last_name,role_id,manager_id)
VALUES  ("John", "Huckle",1,NULL),
        ("Matt", "Townes",2, 22),
        ("Ava", "Grunge",3, 54),
        ("Julie", "Smith",4, 72),
        ("Ganesh", "Jayvareen",5, 17),
        ("Xinwen", "Su",6, 7),
        ("Susan", "Karp",7, 43),
        ("Alex", "Sanchez",8, 60);