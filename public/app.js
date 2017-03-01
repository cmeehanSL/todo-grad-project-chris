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
// Start of angular content
var app1 = angular.module("app1", []);

//TODO Set up a common to do service that fetches the todo list from the
// the server and shares this data among other controllers for the remaining count
// and the actual list display etc

app1.service("todoService", function($http) {
    var todos = [];
    var numLeft = 0;
    var stats = {
      total: 0,
      numLeft: 0,
      numComplete: 0
    };

    var all = true;
    var active = false;
    var complete = false;

    function selectTab(option) {
        all = active = complete = false;
        if (option == 0) {
            all = true;
        }
        else if (option == 1) {
            active = true;
        }
        else if (option == 2) {
            complete = true;
        }
        else {
            all = true;
        }
        reloadList();
    }
    // fetchTodos();

    var promise = $http({
        method: "GET",
        url: "/api/todo"
    })
    .then(status)
    .then(data, function failure(response) {
        console.log("failed here");
        error.textContent = "Failed to get list. Server returned " +
          response.status + " - " + response.statusText;
    })
    .then(function(data) {
        console.log("fetched todo list");
        this.todos = data;
        console.log("the todos fetched are " + data);
        console.log("and the length is " + this.todos.length)
        calculateStats();
        console.log("num total in statss is " + stats.total);
        console.log("num complete in stats is " + stats.numComplete);
        console.log("num remaining in stats is " + stats.numLeft);
        return data;
    })
    .catch(function(newError) {
        console.log("Request failed " + newError);
    });

    // return {
    //     getTodos: getTodos
    // };

    function createItem(title) {
        $http({
            method: "POST",
            url: "/api/todo",
            headers: {
                "Content-type": "application/json"
            },
            data: {
                title: title
            }
        })
        .then(status)
        .then(function() {
            reloadList();
        }, function failure(reponse) {
            console.log("failed here");
            error.textContent = "Failed to delete item. Server returned " +
              response.status + " - " + response.statusText
        })
        .catch(function(newError) {
            console.log("Request failed " + newError);
        });
    }


    function deleteItem(todo, reload) {
        $http({
            method: "DELETE",
            url: "/api/todo/" + todo.id
        })
        .then(status)
        .then(function() {
          if (reload) {
              reloadList();
          }
        }, function failure(response) {
            console.log("failed here");
            error.textContent = "Failed to delete item. Server returned " +
              response.status + " - " + response.statusText;
        })
        .catch(function(newError) {
            console.log("Request failed " + newError);
        });

    }

    function modifyItem(todo) {
      $http({
          method: "PUT",
          url: "/api/todo/" + todo.id,
          headers: {
            "Content-type": "application/json"
          },
          data: todo
      })
      .then(status)
      .then(function() {
          reloadList();
      }, function failure(response) {
          console.log("failed here");
          error.textContent = "Failed to edit item. Server returned " +
            response.status + " - " + response.statusText;
      })
      .catch(function(newError) {
          console.log("Request failed " + newError);
      });

    }

    // NOTE: may not actually need to return reloadList

    return {
        start: promise,
        reloadList: reloadList,
        getStats: getStats,
        deleteItem: deleteItem,
        modifyItem: modifyItem,
        createItem: createItem,
        selectTab: selectTab
    }

    function getStats() {
        return stats;
    }

    function calculateStats() {
      stats.numLeft = stats.total = stats.numComplete = 0;
      console.log("num left is " + numLeft);
        this.todos.forEach(function(todo) {
          console.log(todo.title);
          console.log(todo.done);
            if(todo.done == false) {
              console.log("adding");
                stats.numLeft += 1;
            }
            console.log("finished adding and num remaining is " + stats.numLeft);
        });
        stats.total = this.todos.length;
        stats.numComplete = stats.total - stats.numLeft;
    }

    function reloadList() {
        $http({
            method: "GET",
            url: "/api/todo"
        })
        .then(status)
        .then(data, function failure(response) {
            console.log("failed here");
            error.textContent = "Failed to get list. Server returned " +
              response.status + " - " + response.statusText;
        })
        .then(function(data) {
            console.log("fetched todo list and now going to update it");
            // this.todos = data;
            this.todos.length = 0;
            data.forEach(function(todo) {
                if(active && !todo.done) {
                    this.todos.push(todo);
                }
                else if (complete && todo.done) {
                    this.todos.push(todo);
                }
                else if(all) {
                    this.todos.push(todo);
                }
            })
            console.log("the todos been updated and are now " + this.todos);
            console.log("and the length is " + this.todos.length)
            calculateStats();
            return data;
        })
        .catch(function(newError) {
            console.log("Request failed " + newError);
        });
    }


    function repopulateTodos(data) {
      this.todos.length = 0;
      data.forEach(function(todo) {
          this.todos.push(todo);
      })
      console.log("the todos been updated and are now " + this.todos);
      console.log("and the length is " + this.todos.length)
    }


    function status(response) {
        console.log("response is " + response.status);
        if (response.status >= 200 && response.status < 300) {
            console.log("returning resolved promise");
            return Promise.resolve(response);
        }
        else {
            // error.textContent = "Failed to " + currentMessage + ". Server returned " +
            //   response.status + " - " + response.statusText;
            console.log("returning rejected promise");
            return Promise.reject(response);
        }
    }

    function data(response) {
        return response.data;
    }

});

app1.controller("creator", ["$scope", "todoService", function($scope, todoService) {

    $scope.loaded = false;

    $scope.selectTab = function(option) {
        todoService.selectTab(option);
    }

    todoService.start.then(function(data) {
        $scope.loaded = true;
        console.log("first controller received data");
        $scope.todos = data;
        $scope.stats = todoService.getStats();
        console.log("stats left is  " + $scope.stats.numLeft  );
    });
    // $scope.todos = todoService.getTodos();
    console.log("todos in the controller are " + $scope.todos);
    $scope.newTitle = "";

    $scope.refreshList = function() {
        todoService.reloadList();
    }
    $scope.createItem = function() {
        // NOTE: prevent default here with event object if form validation fails
        console.log("submitted with angular");
        todoService.createItem($scope.newTitle);
        $scope.newTitle = "";
    }
    // $scope.addFake = function() {
    //     $scope.todos.push({fake: "yep"});
    // }
    // console.log("todos.length is " + $scope.todos.length);
}]);

app1.controller("listView", function($scope, todoService) {
    todoService.start.then(function(data) {
        $scope.todos = data;
        console.log("list view controllier list length is " + $scope.todos.length);
    })

    $scope.deleteItem = function(todo) {
        todoService.deleteItem(todo, true);
    }

    // $scope.moddedTitle = "";

    $scope.editable = false;

    $scope.modifyItem = function(repeatScope) {
        console.log("modifying");
        console.log("new scope title is " + repeatScope.moddedTitle);
        repeatScope.todo.title = repeatScope.moddedTitle;
        todoService.modifyItem(repeatScope.todo);
    }

    $scope.changeEditable = function(repeatScope) {
        repeatScope.editable = true;
        console.log(repeatScope.$index);
        var editableItem = document.getElementsByClassName('itemEntry')[repeatScope.$index];
        editableItem.disabled = false;
        editableItem.focus();
    }

    $scope.fireClick = function($event) {
        $event.preventDefault();
    }

    $scope.removeEditable = function(repeatScope) {
        console.log("disabling");
        repeatScope.editable = false;
        var editableItem = document.getElementsByClassName('itemEntry')[repeatScope.$index];
        editableItem.disabled = true;
    }


    $scope.completeItem = function(todo) {
        todo.done = !todo.done;
        todoService.modifyItem(todo);
    }
});
