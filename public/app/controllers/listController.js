module.exports = function($scope, todoService) {
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
            repeatScope.editable = true;
            var editableItem = document.getElementsByClassName("itemEntry")[repeatScope.$index];
            editableItem.disabled = false;
            editableItem.focus();
        };

        $scope.fireClick = function($event) {
            $event.preventDefault();
        };

        $scope.removeEditable = function(repeatScope) {
            repeatScope.editable = false;
            var editableItem = document.getElementsByClassName("itemEntry")[repeatScope.$index];
            editableItem.disabled = true;
        };

        $scope.completeItem = function(todo) {
            todo.done = !todo.done;
            todoService.modifyItem(todo);
        };
}
