var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");
var removeButton = document.getElementById("removeBtn");
var allTab = document.getElementById("allTab");
var remainingTab = document.getElementById("remainingTab");
var completeTab = document.getElementById("completeTab");
var progress = document.getElementById("progress");
var displayActive = true;
var displayComplete = true;
var globalNumRemaining = 0;
var globalNumComplete = 0;
var pollInterval = 20000;
var currentTimerID = 0;

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};
//
removeButton.addEventListener("click", function() {
    clearList();
});

function setPollTimer() {
    clearTimeout(currentTimerID);
    currentTimerID = setTimeout(pollServer, pollInterval);
}

function pollServer() {
    reloadTodoList();
}

// function to return a promise object that has been resolved if the response
// is OK and rejected if not
function status(response) {
    if (response.ok) {
        return Promise.resolve(response);
    }
    else {
        // error.textContent = "Failed to " + currentMessage + ". Server returned " +
        //   response.status + " - " + response.statusText;
        return Promise.reject(response);
    }
}

// function to return a promise object that when resolved will return
// the json object
function json(response) {
    return response.json();
}

allTab.firstChild.addEventListener("click", function() {
    allTab.className = "active";
    remainingTab.className = completeTab.className = "";
    displayActive = true;
    displayComplete = true;
    reloadTodoList();
    progress.style.visibility = "visible";
});

remainingTab.firstChild.addEventListener("click", function() {
    remainingTab.className = "active";
    allTab.className = completeTab.className = "";
    displayActive = true;
    displayComplete = false;
    reloadTodoList();
    progress.style.visibility = "hidden";
});

completeTab.firstChild.addEventListener("click", function() {
    completeTab.className = "active";
    allTab.className = remainingTab.className = "";
    displayActive = false;
    displayComplete = true;
    reloadTodoList();
    progress.style.visibility = "hidden";
});

function createTodo(title, callback) {
    currentMessage = "create item";

    fetch("/api/todo", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({
            title: title
        })
    })
    .then(status)
    .then(function() {
        callback();
    }, function(response) {
        error.textContent = "Failed to create item. Server returned " +
          response.status + " - " + response.statusText;

    })
    .catch(function(newError) {
        console.log("Request failed " + newError);
    });

    //
    //
    // var createRequest = new XMLHttpRequest();
    // createRequest.open("POST", "/api/todo");
    // createRequest.setRequestHeader("Content-type", "application/json");
    // createRequest.send(JSON.stringify({
    //     title: title
    // }));
    // createRequest.onload = function() {
    //     if (this.status === 201) {
    //         callback();
    //     } else {
    //         error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
    //     }
    // };
}

function getTodoList(callback) {
    currentMessage = "get list";

    fetch("/api/todo", {
        method: "GET"
    })
    .then(status)
    .then(json, function(response) {
        error.textContent = "Failed to get list. Server returned " +
          response.status + " - " + response.statusText;
    })
    .then(function(data) {
        callback(data);
    })
    .catch(function(newError) {
        console.log("Request failed " + newError);
    });

    //   if(response.ok) {
    //     response.json().then(function(data){
    //       callback(data);
    //     });
    //   }
    //   else {
    //     error.textContnt = "Failed to get list. Server returned " + response.status + " - " + response.text();
    //   }
    // }, function(errorReturned) {
    //   error.textContnt = "There has been a problem with the fetch operation";
    // })

}

function deleteItem(id, callback) {

    fetch("/api/todo/" + id, {
        method: "DELETE"
    })
    .then(status)
    .then(function() {
        if (typeof callback === "function") {
            callback();
        }
    }, function(response) {
        error.textContent = "Failed to delete item. Server returned " + response.status + " - " + response.statusText;
    })
    .catch(function(newError) {
        console.log("Request failed " + newError);
    });

    // var createRequest = new XMLHttpRequest();
    // createRequest.open("DELETE", "/api/todo/" + id);
    // createRequest.onload = function() {
    //     if (this.status === 200) {
    //         console.log("item deleted");
    //     } else {
    //         console.log("Unable to delete as not found");
    //     }
    //     if (typeof callback === "function") {
    //         callback();
    //     }
    // };
    // createRequest.send();
}

function reloadTodoList() {
    var currentText;
    var tempText;
    var isComplete = false;
    var numRemaining = 0;
    var numComplete = 0;
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    document.getElementById("removeCompleted").style.visibility = "hidden";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            if (!todo.done) {
                numRemaining++;
            }
            else {
                numComplete++;
            }
            if (!displayActive && todo.done === false) {
                return;
            }
            if (!displayComplete && todo.done) {
                return;
            }
            isComplete = todo.done;
            var listItem = document.createElement("li");
            var row = document.createElement("div");
            row.className = "row";
            listItem.appendChild(row);

            var itemCell = document.createElement("div");
            itemCell.className = "itemCell col-lg-7 col-md-7 col-sm-7 col-xs-7";

            var buttonsCell = document.createElement("div");
            buttonsCell.className = "buttonsCell col-lg-5 col-md-5 col-sm-5 col-xs-5";

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

            var doneButton = document.createElement("button");
            doneButton.setAttribute("type", "button");
            doneButton.className = "itemBtn doneBtn btn-primary btn-lg";
            var doneSpan = document.createElement("span");
            doneSpan.className = "glyphicon glyphicon-ok";

            doneButton.appendChild(doneSpan);

            buttonSet.appendChild(editButton);
            buttonSet.appendChild(deleteButton);
            buttonSet.appendChild(doneButton);

            buttonsCell.appendChild(buttonSet);

            var inputGroup = document.createElement("div");
            inputGroup.className = "input-group input-group-lg";

            var intemEntry = document.createElement("input");
            inputGroup.innerHTML = "<input type='text' class='form-control itemEntry'" +
              "disabled='disabled'>";
            var itemEntry = inputGroup.firstChild;
            itemEntry.setAttribute("value", todo.title);
            var confirmEditButton = document.createElement("span");
            confirmEditButton.className = "input-group-btn";
            confirmEditButton.innerHTML = "<button class='btn btn-default confirmEditButton'>Confirm</button>";

            inputGroup.appendChild(confirmEditButton);

            itemCell.appendChild(inputGroup);
            var currentID = todo.id;
            //Add the delete button listener
            todoList.appendChild(listItem);

            if (!todo.done) {
                doneButton.className += " btn-outline";
            }
            else {
                itemEntry.className += " completedItem";
            }

            // LISTENERS will be done in angular eventually
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
                    confirmEdit(itemEntry, currentID, tempText);
                    currentText = itemEntry.value;
                    itemEntry.blur();
                });

            });
            itemEntry.addEventListener("keyup", function(event) {
                event.preventDefault();
                tempText = itemEntry.value;
                if (event.keyCode === 13) {
                    itemEntry.blur();
                    confirmEdit(itemEntry, currentID, tempText);
                }
            });
            doneButton.addEventListener("click", function(event) {
                tempText = itemEntry.value;
                isComplete = !todo.done;
                confirmEdit(itemEntry, currentID, tempText, isComplete);
            });
        });
        countLabel.textContent = "Number of Items remaining: " + numRemaining;
        if (numComplete > 0) {
            document.getElementById("removeCompleted").style.visibility = "visible";
        }
        allTab.getElementsByClassName("badge")[0].textContent = numRemaining + numComplete;
        remainingTab.getElementsByClassName("badge")[0].textContent = numRemaining;
        completeTab.getElementsByClassName("badge")[0].textContent = numComplete;

        globalNumComplete = numComplete;
        globalNumRemaining = numRemaining;
        if (displayActive && displayComplete) {
            refreshBar();
        }
        setPollTimer();
    });
}

function clearList() {
    getTodoList(function(todos) {
        todos.forEach(function(todo) {
            if (todo.done) {
                deleteItem(todo.id);
            }
        });
        reloadTodoList();
    });
}

function confirmEdit(itemEntry, id, tempText, isComplete) {
    itemEntry.value = tempText;
    console.log("value changed to " + itemEntry.value);
    editItem(itemEntry, id, reloadTodoList, isComplete);
}

function editItem(itemEntry, id, callback, isComplete) {
    console.log("attempting to update with id: " + id);

    fetch("/api/todo/" + id, {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        // TODO loop through like before to get each parameter
        body: JSON.stringify({
            title: itemEntry.value,
            done: isComplete
        })
    })
    .then(status)
    .then(function() {
        callback();
    }, function() {
        error.textContent = "Failed to edit item. Server returned " + response.status + " - " + response.statusText;
    }).catch(function(newError) {
        console.log("Request failed " + newError);
    });
}

function refreshBar() {
    var progressBar = progress.getElementsByClassName("progress-bar")[0];
    var percentage = Math.floor(100 * globalNumComplete / (globalNumRemaining + globalNumComplete));
    if (globalNumRemaining === 0) {
        percentage = 0;
    }

    progressBar.style.width = percentage.toString() + "%";
    progressBar.textContent = percentage.toString() + "%";
}

reloadTodoList();
