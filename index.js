const { prompt } = require("inquirer");
const logo = require("asciiart-logo");
const db = require("./db");
const connection = require("./db/connection");
require("console.table");

init();

function init() {
    const logoText = logo({ name: "Employee Tracker" }).render();

    console.log(logoText);

    loadMainPrompts();
}

function loadMainPrompts() {
    prompt({
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: [
            {
                name: "View All Employees",
                value: "VIEW_EMPLOYEES"
            },
            {
                name: "View All Employees By Department",
                value: "VIEW_EMPLOYEES_BY_DEPARTMENT"
            },
            {
                name: "View All Employees By Manager",
                value: "VIEW_EMPLOYEES_BY_MANAGER"
            },
            {
                name: "Add Employee",
                value: "ADD_EMPLOYEE"
            },
            {
                name: "Remove Employee",
                value: "REMOVE_EMPLOYEE"
            },
            {
                name: "Update Employee Role",
                value: "UPDATE_EMPLOYEE_ROLE"
            },
            {
                name: "Update Employee Manager",
                value: "UPDATE_EMPLOYEE_MANAGER"
            },
            {
                name: "View All Roles",
                value: "VIEW_ROLES"
            },
            {
                name: "Add Role",
                value: "ADD_ROLE"
            },
            {
                name: "View All Departments",
                value: "VIEW_DEPARTMENTS"
            },
            {
                name: "Add Department",
                value: "ADD_DEPARTMENT"
            },
            {
                name: "Remove Department",
                value: "REMOVE_DEPARTMENT"
            },
            {
                name: "Remove Role",
                value: "REMOVE_ROLE"
            },
            {
                Name: "Quit",
                value: "QUIT"
            }
        ]
    }).then(res => {
        let choice = res.choice;
        switch (choice) {
            case "VIEW_EMPLOYEES":
                viewEmployees();
                break;
            case "VIEW_EMPLOYEES_BY_DEPARTMENT":
                viewEmployeesByDepartment();
                break;
            case "VIEW_EMPLOYEES_BY_MANAGER":
                viewEmployeesByManager();
                break;
            case "ADD_EMPLOYEE":
                addEmployee();
                break;
            case "REMOVE_EMPLOYEE":
                removeEmployee();
                break;
            case "UPDATE_EMPLOYEE_ROLE":
                updateEmployeeRole();
                break;
            case "UPDATE_EMPLOYEE_MANAGER":
                updateEmployeeManager();
                break;
            case "VIEW_DEPARTMENTS":
                viewDepartments();
                break;
            case "ADD_DEPARTMENT":
                addDepartment();
                break;
            case "REMOVE_DEPARTMENT":
                removeDepartment();
                break;
            case "VIEW_ROLES":
                viewRoles();
                break;
            case "ADD_ROLE":
                addRole();
                break;
            case "REMOVE_ROLE":
                removeRole();
                break;
            default:
                quit();
        }
    })
}

// VIEW ALL DEPTS/ROLES/EES FUNCTIONS

function viewEmployees() {
    db.findAllEmployees()
        .then(([rows]) => {
            let employees = rows;
            console.log("\n");
            console.table(employees);
        })
        .then(() => loadMainPrompts());
}

function viewDepartments() {
    db.findAllDepartments()
        .then(([rows]) => {
            let departments = rows;
            console.log("\n");
            console.table(departments);
        })
        .then(() => loadMainPrompts());
}

function viewRoles() {
    db.findAllRoles()
        .then(([rows]) => {
            let roles = rows;
            console.log("\n");
            console.table(roles);
        })
        .then(() => loadMainPrompts());
}

// VIEW BY FUNCTIONS

function viewEmployeesByDepartment() {
    db.findAllDepartments()
        .then(([rows]) => {
            let departments = rows;
            const departmentChoices = departments.map(({ id, name }) => ({
                name: name,
                value: id
            }));

            prompt([
                {
                    type: "list",
                    name: "departmentId",
                    message: "What department would you like to see the employees for?",
                    choices: departmentChoices
                }
            ])
                .then(res => db.findAllEmployeesByDepartment(res.departmentId))
                .then(([rows]) => {
                    let employees = rows;
                    console.log("\n");
                    console.table(employees);
                })
                .then(() => loadMainPrompts())
        });
}

function viewEmployeesByManager() {
    db.findAllEmployees()
        .then(([rows]) => {
            let managers = rows;
            const managerChoices = managers.map(({ id, first_name, last_name, }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

            prompt([
                {
                    type: "list",
                    name: "managerId",
                    message: "Which employee would you like to see direct recports for?",
                    choices: managerChoices
                }
            ])
                .then(res => db.findAllEmployeesByManager(res.managerId))
                .then(([rows]) => {
                    let employees = rows;
                    console.log("\n");
                    if (employees.length === 0) {
                        console.log("This employee has no direct reports");
                    } else {
                        console.table(employees);
                    }
                })
                .then(() => loadMainPrompts())
        });
}

// UPDATE FUNCTIONS

function updateEmployeeRole() {
    db.findAllEmployees()
        .then(([rows]) => {
            let employees = rows;
            const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

            prompt([
                {
                    type: "list",
                    name: "employeeId",
                    message: "Which employee's role would you like to update?",
                    choices: employeeChoices
                }
            ])
                .then(res => {
                    let employeeId = res.employeeId;
                    db.findAllRoles()
                        .then(([rows]) => {
                            let roles = rows;
                            const roleChoices = roles.map(({ id, title }) => ({
                                name: title,
                                value: id
                            }));

                            prompt([
                                {
                                    type: "list",
                                    name: "roleId",
                                    message: "What role would you like to give the selected employee?",
                                    choices: roleChoices
                                }
                            ])
                                .then(res => db.updateEmployeeRole(employeeId, res.roleId))
                                .then(() => console.log("Employee's role updated"))
                                .then(() => loadMainPrompts())
                        });
                });
        });
}

function updateEmployeeManager() {
    db.findAllEmployees()
        .then(([rows]) => {
            let employees = rows;
            const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

            prompt([
                {
                    type: "list",
                    name: "employeeId",
                    message: "Which employee's manager would you like to update?",
                    choices: employeeChoices
                }
            ])
                .then(res => {
                    let employeeId = res.employeeId
                    db.findAllPossibleManagers(employeeId)
                        .then(([rows]) => {
                            let managers = rows;
                            const managerChoices = managers.map(({ id, first_name, last_name, }) => ({
                                name: `${first_name} ${last_name}`,
                                value: id
                            }));

                            prompt([
                                {
                                    type: "list",
                                    name: "managerId",
                                    message: "Which manager would you like to assign the selected employee?",
                                    choices: managerChoices
                                }
                            ])
                                .then(res => db.updateEmployeeManager(employeeId, managerId))
                                .then(() => console.log("Employee's manager updated"))
                                .then(() => loadMainPrompts())
                        });
                });
        });
}

// ADD DEPT/ROLE/EE FUNCTIONS 

function addEmployee() {
    inquirer.prompt([{
        name: "newEmployeeFirst",
        type: "input",
        message: "Enter new employee's first name:",
        validate: (input) => {
            if (input) {
                return true;
            } else {
                console.log("Honey, you gotta give me a name:");
            }
        }
    },
    {
        name: "newEmployeeLast",
        type: "input",
        message: "Enter new employee last name:",
        validate: (input) => {
            if (input) {
                return true;
            } else {
                console.log("We need a last name, girl:");
            }
        }
    },
    {
        name: "newEmployeeRole",
        type: "input",
        message: "Enter Employee Role:",
        validate: (input) => {
            if (input) {
                return true;
        } else {
            console.log("That role, honey. Give it up:");
        }
    }}
    ]).then(function(userInput) {
        connection.query(
            "INSERT INTO employee SET ?", {
                first_name: userInput.newEmployeeFirst,
                last_name: userInput.newEmployeeLast,
                role_id: userInput.newEmployeeRole,
                manager_id: null
            },
            function (err, userInput) {
                if (err) {
                    throw err;
                }
                console.table(userInput);
            }
        );
        init();
    });
}

function addDepartment() {
    inquirer.prompt([{
        name: "newDepartment",
        type: "input",
        message: "Enter name of new department:",
        validate: (input) => {
            if (input) {
                return true;
            } else {
                console.log("You better enter that department name:");
            }
        }
    }]).then(function(userInput) {
        connection.query(
            "INSERT INTO department SET ?", {
                name: userInput.newDepartment,
            },
            function(err, userInput) {
                if (err) {
                    throw err;
                }
                console.log(`Added new department: ${userInput.newDepartment}`);
                viewAllDep();
            }
        );

        init();

    });
}

function addRole() {
    inquirer.prompt([{
            name: "newRoleTitle",
            type: "input",
            message: "Enter name of new role:",
            validate: (input) => {
                if (input) {
                    return true;
                } else {
                    console.log("Please enter new role name:");
                }
            }
        },
        {
            name: "salary",
            type: "input",
            message: "Enter salary of new role (Use integers i.e. 100000)",
            validate: (input) => {
                if (input) {
                    return true;
                } else {
                    console.log("The coins, girl:");
                }
            }
        },
        {
            name: "roleDepID",
            type: "input",
            message: "Enter the new role's department ID:",
            validate: (input) => {
                if (input) {
                    return true;
                } else {
                    console.log("Please enter the new role's department ID:");
                }
            }
        }
    ]).then(function(userInput) {
        connection.query(
            "INSERT INTO role SET ?", {
                title: userInput.newRoleTitle,
                salary: userInput.salary,
                dep_id: userInput.roleDepID,
            },
            function(err, userInput) {
                if (err) {
                    throw err;
                }
                console.log(`Added new role: ${userInput.newRoleTitle}`);
                viewAllRoles();
            }
        );

        init();

    });
}

// DELETE DEPT/ROLE/EE FUNCTIONS 

function removeEmployee() {
    db.findAllEmployees()
        .then(([rows]) => {
            let employees = rows;
            const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

            prompt([
                {
                    type: "list",
                    name: "employeeId",
                    message: "Which employee would you like to remove?",
                    choices: employeeChoices
                }
            ])
                .then(res => db.removeEmployee(res.employeeId))
                .then(() => console.log("Removed employee from the database"))
                .then(() => loadMainPrompts())
        });
}

function removeDepartment() {
    db.findAllDepartments()
        .then(([rows]) => {
            let departments = rows;
            const departmentChoices = departments.map(({ id, name }) => ({
                name: name,
                value: id
            }));

            prompt([
                {
                    type: "list",
                    name: "departmentId",
                    message: "Which department would you like to remove?",
                    choices: departmentChoices
                }
            ])
                .then(res => db.removeDepartment(res.departmentId))
                .then(() => console.log("Removed department from the database"))
                .then(() => loadMainPrompts())
        });
}

function removeRole() {
    db.findAllRoles()
        .then(([rows]) => {
            let roles = rows;
            const roleChoices = roles.map(({ id, title }) => ({
                name: title,
                value: id
            }));

            prompt([
                {
                    type: "list",
                    name: "roleId",
                    message: "Which role would you like to remove?",
                    choices: roleChoices
                }
            ])
                .then(res => db.removeRole(res.roleId))
                .then(() => console.log("Removed role from the database"))
                .then(() => loadMainPrompts())
        });
}
