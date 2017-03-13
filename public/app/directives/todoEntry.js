module.exports = function() {
    return {
        restrict: "AEC",
        scope: false,
        require: "ngModel",
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$validators.todoEntry = function(modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }
                else {
                    return true;
                }
            };
        }
    };
};
