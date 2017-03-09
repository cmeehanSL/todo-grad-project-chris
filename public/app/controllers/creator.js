module.exports = function($scope, todoService) {
    console.log("hi");
    $scope.loaded = false;
    $scope.newTitle = "";
    $scope.stats = todoService.getStats();
    $scope.tabs = todoService.getTabs();

    $scope.removeCompleted = function() {
        todoService.removeCompleted();
    };

    $scope.selectTab = function(option) {
        todoService.selectTab(option);
    };

    todoService.start.then(function(data) {
        $scope.loaded = true;
        $scope.todos = data;
    });

    $scope.createItem = function() {
        // NOTE: prevent default here with event object if form validation fails
        todoService.createItem($scope.newTitle);
        $scope.newTitle = "";
    };
}
