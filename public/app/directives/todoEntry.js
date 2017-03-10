module.exports = function() {
    return {
        restrict: 'AEC',
        scope: false,
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$validators.todoEntry = function(modelValue, viewValue) {
                console.log(scope.todo.title);
                if (ctrl.$isEmpty(modelValue)) {
                    // consider empty entries to be invalid
                    return false;
                }
                else {
                    return true;
                }
            };
        }
    }
}
