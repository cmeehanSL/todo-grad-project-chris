//app.js
// var angular = require("angular");
// Requuired angular components
var todoService = require("./services/todoService");
var creator = require("./controllers/creator");
var listController = require("./controllers/listController");

// Start of angular content
var app1 = angular.module("app1", []);
angular.module("app1").service("todoService", todoService);
angular.module("app1").controller("creator", ["$scope", "todoService", creator]);
angular.module("app1").controller("listController", ["$scope", "todoService", listController]);
