var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite();
            helpers.getTitleText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("get", "/api/todo");
            helpers.navigateToSite();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getInputText().then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("post", "/api/todo");
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("Another new todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("on delete item", function() {
        testing.it("removes the element from the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("First todo item");
            helpers.addTodo("Second todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
            helpers.deleteTodo(2);
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("can remove multiple elements from list", function () {
            helpers.navigateToSite();
            helpers.addTodo("First todo item");
            helpers.addTodo("Second todo item");
            helpers.addTodo("Third todo item");
            helpers.addTodo("Fourth todo item");
            helpers.deleteTodo(1);
            helpers.deleteTodo(1);
            helpers.deleteTodo(1);
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
    });
    testing.describe("on modify item", function() {
        testing.it("Doesn't change the size of the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("First todo item");
            helpers.addTodo("Second todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
            helpers.editTodo(1, "First Modified todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
        testing.it("Changes the title successfully", function() {
            helpers.navigateToSite();
            helpers.addTodo("First todo item");
            helpers.addTodo("Second todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
            helpers.editTodo(2, "Modified");
            helpers.getTodoText(2).then(function(text) {
                assert.equal(text, "Modified");
            });
        });
    });
    testing.describe("on completing an item", function() {
        testing.it("displays the remove completed button", function() {
            helpers.navigateToSite();
            helpers.addTodo("First todo item");
            helpers.completeTodo(1);
            helpers.getRemoveButtonVisibility().then(function(display) {
                assert.isTrue(display);
            });
        });
        testing.it("removes completed items on remove button click", function() {
            helpers.navigateToSite();
            helpers.addTodo("First");
            helpers.addTodo("Second");
            helpers.completeTodo(2);
            helpers.removeCompleted();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays correct item count in each sub-list", function() {
            helpers.navigateToSite();
            helpers.addTodo("First todo");
            helpers.addTodo("Second todo");
            helpers.addTodo("Third todo");
            helpers.completeTodo(2);
            helpers.navigateToTab(3);
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
            helpers.getBadgeCount(3).then(function(text) {
                assert.equal(text, "1");
            });
            helpers.navigateToTab(2);
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
            helpers.getBadgeCount(2).then(function(text) {
                assert.equal(text, "2");
            });
        });
        testing.it("displays the correct completion percentage", function() {
            helpers.navigateToSite();
            helpers.addTodo("First todo");
            helpers.addTodo("Second todo");
            helpers.addTodo("Third todo");
            helpers.addTodo("Fourth todo");
            helpers.completeTodo(2);
            helpers.completeTodo(3);
            helpers.getCompletion().then(function(text) {
                assert.equal(text, "50%");
            });
            helpers.completeTodo(4);
            helpers.getCompletion().then(function(text) {
                assert.equal(text, "75%");
            });
        });
    });
});
