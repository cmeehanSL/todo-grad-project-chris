
// Start of angular content
var app1 = angular.module("app1", []);

app1.service("todoService", function($http) {
    var todos = [];
    var numLeft = 0;
    var stats = {
        total: 0,
        numLeft: 0,
        numComplete: 0,
        progress: 0
    };

    var tabs = {
        all: true,
        active: false,
        complete: false
    };

    function getTabs() {
        return tabs;
    }

    function removeCompleted() {
        todos.forEach(function(todo) {
            if (todo.done) {
                deleteItem(todo, true);
            }
        });
        reloadList();
    }

    function selectTab(option) {
        tabs.all = tabs.active = tabs.complete = false;
        if (option === 0) {
            tabs.all = true;
        }
        else if (option == 1) {
            tabs.active = true;
        }
        else if (option == 2) {
            tabs.complete = true;
        }
        else {
            tabs.all = true;
        }
        reloadList();
    }

    var promise = $http({
        method: "GET",
        url: "/api/todo"
    })
    .then(status)
    .then(data, function failure(response) {
        console.log("fail");
        console.log("error text is " + error.textContent);
        error.textContent = "Failed to get list. Server returned " +
          response.status + " - " + response.statusText;
    })
    .then(function(data) {
        todos = data;
        calculateStats(data);
        return data;
    })
    .catch(function(newError) {
        console.log("Request failed " + newError);
    });

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
        }, function failure(response) {
            console.log("caught error");
            error.textContent = "Failed to create item. Server returned " +
              response.status + " - " + response.statusText;
            console.log("changed");

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
            error.textContent = "Failed to edit item. Server returned " +
            response.status + " - " + response.statusText;
        })
        .catch(function(newError) {
            console.log("Request failed " + newError);
        });
    }

    // NOTE: may not actually need to return reloadList

    function getStats() {
        return stats;
    }

    function calculateStats(data) {
        stats.numLeft = stats.total = stats.numComplete = 0;
        data.forEach(function(todo) {
            if (todo.done === false) {
                stats.numLeft += 1;
            }
        });
        stats.total = data.length;
        stats.numComplete = stats.total - stats.numLeft;

        stats.progress = Math.floor(100 * stats.numComplete / (stats.numLeft + stats.numComplete));
        if (stats.numLeft === 0 && stats.numComplete === 0) {
            stats.progress = 0;
        }
    }

    function reloadList() {
        $http({
            method: "GET",
            url: "/api/todo"
        })
        .then(status)
        .then(data, function failure(response) {
            error.textContent = "Failed to get list. Server returned " +
            response.status + " - " + response.statusText;
        })
        .then(function(data) {
            todos.length = 0;
            calculateStats(data);
            data.forEach(function(todo) {
                if (tabs.active && !todo.done) {
                    todos.push(todo);
                }
                else if (tabs.complete && todo.done) {
                    todos.push(todo);
                }
                else if (tabs.all) {
                    todos.push(todo);
                }
            });
            return data;
        })
        .catch(function(newError) {
            console.log("Request failed " + newError);
        });
    }

    function repopulateTodos(data) {
        todos.length = 0;
        data.forEach(function(todo) {
            todos.push(todo);
        });
    }

    function status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response);
        }
        else {
            return Promise.reject(response);
        }
    }

    function data(response) {
        return response.data;
    }

    return {
        start: promise,
        reloadList: reloadList,
        getStats: getStats,
        deleteItem: deleteItem,
        modifyItem: modifyItem,
        createItem: createItem,
        selectTab: selectTab,
        getTabs: getTabs,
        removeCompleted: removeCompleted
    };
});

app1.controller("creator", ["$scope", "todoService", function($scope, todoService) {

    $scope.loaded = false;
    $scope.newTitle = "";

    $scope.removeCompleted = function() {
        todoService.removeCompleted();
    };

    $scope.selectTab = function(option) {
        todoService.selectTab(option);
    };

    todoService.start.then(function(data) {
        $scope.loaded = true;
        $scope.todos = data;
        $scope.stats = todoService.getStats();
        $scope.tabs = todoService.getTabs();
    });

    $scope.createItem = function() {
        // NOTE: prevent default here with event object if form validation fails
        todoService.createItem($scope.newTitle);
        $scope.newTitle = "";
    };
}]);

app1.controller("listController", function($scope, todoService) {
    todoService.start.then(function(data) {
        $scope.todos = data;
    });

    $scope.deleteItem = function(todo) {
        todoService.deleteItem(todo, true);
    };

    $scope.modifyItem = function(repeatScope) {
        repeatScope.todo.title = repeatScope.moddedTitle;
        todoService.modifyItem(repeatScope.todo);
    };

    $scope.changeEditable = function(repeatScope) {
        var editableItem = document.getElementsByClassName("itemEntry")[repeatScope.$index];
        editableItem.disabled = false;
        editableItem.focus();
    };

    $scope.fireClick = function($event) {
        $event.preventDefault();
    };

    $scope.removeEditable = function(repeatScope) {
        var editableItem = document.getElementsByClassName("itemEntry")[repeatScope.$index];
        editableItem.disabled = true;
    };

    $scope.completeItem = function(todo) {
        todo.done = !todo.done;
        todoService.modifyItem(todo);
    };
});
