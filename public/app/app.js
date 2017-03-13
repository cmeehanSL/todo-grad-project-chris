//app.js
// Requuired angular components
var todoService = require("./services/todoService");
var creator = require("./controllers/creator");
var listController = require("./controllers/listController");
var todoEntry = require("./directives/todoEntry");
var itemButtonSet = require("./directives/itemButtonSet");

// Start of angular content
var app1 = angular.module("app1", []);
app1.service("todoService", todoService);
app1.directive("todoEntry", todoEntry);
app1.directive("itemButtonSet", itemButtonSet);
app1.controller("creator", ["$scope", "todoService", creator]);
app1.controller("listController", ["$scope", "todoService", listController]);
