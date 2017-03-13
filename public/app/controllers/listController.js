module.exports = function($scope, todoService) {
    todoService.start.then(function(data) {
        $scope.todos = data;
    });

    $scope.modifyItem = function(repeatScope) {
        todoService.modifyItem(repeatScope.todo);
    };

    $scope.setTemp = function(repeatScope) {
        repeatScope.tempValue = repeatScope.todo.title;
    };

    $scope.fireClick = function($event) {
        $event.preventDefault();
    };

    $scope.removeEditable = function(repeatScope) {
        var editableItem = document.getElementsByClassName("itemEntry")[repeatScope.$index];
        editableItem.disabled = true;
        repeatScope.todo.title = repeatScope.tempValue;
    };
};
