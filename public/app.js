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

    function deleteItem(id) {
        $http({
            method: "DELETE",
            url: "/api/todo/" + id;
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
                this.todos.push(todo);
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

    return {
        start: promise,
        reload: reload,
        getStats: getStats
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

    function reload() {
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
                this.todos.push(todo);
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


    // function fetchTodos() {
    //     console.log("starting angular http fetch");
    //     $http({
    //         method: "GET",
    //         url: "/api/todo"
    //     })
    //     .then(status)
    //     .then(data, function failure(response) {
    //         console.log("failed here");
    //         error.textContent = "Failed to get list. Server returned " +
    //           response.status + " - " + response.statusText;
    //     })
    //     .then(function(data) {
    //         console.log("fetched todo list");
    //         this.todos = data;
    //         console.log("the todos fetched are " + data);
    //         console.log("and the length is " + this.todos.length)
    //     })
    //     .catch(function(newError) {
    //         console.log("Request failed " + newError);
    //     });
    // };

    function status(response) {
        console.log("response is " + response.status);
        if (response.status == 200) {
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

app1.controller("ctrl0", ["$scope", "todoService", function($scope, todoService) {

    todoService.start.then(function(data) {
        console.log("first controller received data");
        $scope.todos = data;
        $scope.stats = todoService.getStats();
        console.log("stats left is  " + $scope.stats.numLeft  );
    });
    // $scope.todos = todoService.getTodos();
    console.log("todos in the controller are " + $scope.todos);

    $scope.refreshList = function() {
        todoService.reload();
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

    $scope.deleteItem(todo) {
        var id = todo.id;
        todoService.deleteItem(id);
    }

    $scope.first = 1;
    $scope.second = 1;


    $scope.updateValue = function() {
        $scope.calculation = $scope.first + " + " + $scope.second +
        " = " + ($scope.first + $scope.second);
    };
});
