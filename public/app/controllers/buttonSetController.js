module.exports = function buttonSetController($scope, todoService) {
    $scope.makeEditable = function() {
        var editableItem = document.getElementsByClassName("itemEntry")[$scope.index];
        editableItem.disabled = false;
        editableItem.focus();
    };

    $scope.deleteItem = function(todo) {
        todoService.deleteItem(todo, true);
    };

    $scope.completeItem = function(todo) {
        todo.done = !todo.done;
        todoService.modifyItem(todo);
    };
};
