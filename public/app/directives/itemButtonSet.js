var buttonSetController = require("../controllers/buttonSetController");

module.exports = function() {
    return {
        restrict: "E",
        templateUrl: "app/templates/button-set.html",
        scope: {
            todo: "=",
            index: "="
        },
        controller: ["$scope", "todoService", buttonSetController]
    };
};
