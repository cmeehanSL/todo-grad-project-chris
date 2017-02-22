var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    // console.log(JSON.stringify({
    //     title: title
    // }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function deleteItem(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + id);
    createRequest.onload = function() {
        if (this.status === 200) {
            console.log("item deleted");
            callback();
        } else {
            console.log("Unable to delete as not found");
            callback();
            // error.textContent = "Failed to delete item. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList() {
    var currentText;
    var tempText;
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            var row = document.createElement("div");
            row.className = "row";
            listItem.appendChild(row);

            var itemCell = document.createElement("div");
            itemCell.className = "itemCell col-lg-8 col-md-8 col-sm-8 col-xs-8";

            var buttonsCell = document.createElement("div");
            buttonsCell.className = "buttonsCell col-lg-4 col-md-4 col-sm-4 col-xs-4";

            row.appendChild(itemCell);
            row.appendChild(buttonsCell);
            var buttonSet = document.createElement("div");
            buttonSet.className = "btn-group btn-group-lg";
            buttonSet.setAttribute("role", "group");
            var deleteButton = document.createElement("button");

            var trashSpan = document.createElement("span");
            trashSpan.className = "glyphicon glyphicon-remove-circle";

            deleteButton.appendChild(trashSpan);
            deleteButton.setAttribute("type", "button");
            deleteButton.className = "itemBtn deleteBtn btn-primary btn-outline btn-lg";

            var editButton = document.createElement("button");
            deleteButton.setAttribute("type", "button");
            editButton.className = "itemBtn editBtn btn-primary btn-outline btn-lg";
            var editSpan = document.createElement("span");
            editSpan.className = "glyphicon glyphicon-pencil";

            editButton.appendChild(editSpan);

            buttonSet.appendChild(editButton);
            buttonSet.appendChild(deleteButton);
            buttonsCell.appendChild(buttonSet);

            var inputGroup = document.createElement("div");
            inputGroup.className = "input-group input-group-lg";

            var intemEntry = document.createElement("input");
            inputGroup.innerHTML = "<input type='text' class='form-control itemEntry'" +
              "disabled='disabled' value=" + todo.title + ">";
            var itemEntry = inputGroup.firstChild;
            var confirmEditButton = document.createElement("span");
            confirmEditButton.className = "input-group-btn";
            confirmEditButton.innerHTML = "<button class='btn btn-default confirmEditButton'>Confirm</button>";

            inputGroup.appendChild(confirmEditButton);

            itemCell.appendChild(inputGroup);
            var currentID = todo.id;
            //Add the delete button listener
            deleteButton.addEventListener("click", function() {
                // console.log("deleting item with id " + currentID);
                deleteItem(currentID, reloadTodoList);
            });
            editButton.addEventListener("click", function() {
                confirmEditButton.firstChild.style.visibility = "visible";
                itemEntry.disabled = false;
                itemEntry.selectionStart = itemEntry.selectionEnd = itemEntry.value.length;
                itemEntry.focus();
                currentText = itemEntry.value;
            });

            itemEntry.addEventListener("blur", function() {
                itemEntry.disabled = true;
                confirmEditButton.firstChild.style.visibility = "hidden";
                itemEntry.value = currentText;
            });
            confirmEditButton.firstChild.addEventListener("mousedown", function(event) {
                event.preventDefault();
                this.addEventListener("click", function() {
                    tempText = itemEntry.value;
                    console.log("about to set to " + tempText);
                    confirmEdit(itemEntry, currentID, tempText);
                    currentText = itemEntry.value;
                    itemEntry.blur();
                });

            });
            itemEntry.addEventListener("keyup", function(event) {
                event.preventDefault();
                tempText = itemEntry.value;
                if (event.keyCode === 13) {
                    console.log("pressed enter");
                    itemEntry.blur();
                    confirmEdit(itemEntry, currentID, tempText);
                }
            });
            todoList.appendChild(listItem);
        });
    });
}

function confirmEdit(itemEntry, id, tempText) {
    itemEntry.value = tempText;
    console.log("value changed to " + itemEntry.value);
    editItem(itemEntry, id, reloadTodoList);

    // TODO:  validate on the client side and then send request
}

function editItem(itemEntry, id, callback) {
    console.log("attempting to update with id: " + id);
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/" + id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: itemEntry.value
    }));
    createRequest.onload = function() {
        if (this.status === 200) {
            console.log("item been edited");
            callback();
        } else {
            console.log("Unable to edit as not found");
            callback();
            // error.textContent = "Failed to delete item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

reloadTodoList();
