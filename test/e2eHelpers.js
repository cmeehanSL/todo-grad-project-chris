var express = require("express");
var createServer = require("../server/server");
var webdriver = require("selenium-webdriver");
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

var driver;
var router;
var server;

module.exports.setupDriver = function() {
    driver = new webdriver.Builder().forBrowser("chrome").build();
};

module.exports.setupServer = function(done) {
    router = express.Router();
    if (gatheringCoverage) {
        router.get("/build/bundle.js", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", "build/bundle.js");
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/build/bundle.js", "utf8"), absPath));
        });
    }
    server = createServer(testPort, router, done);
};

module.exports.teardownServer = function(done) {
    server.close(done);
};

module.exports.teardownDriver = function() {
    if (gatheringCoverage) {
        driver.executeScript("return __coverage__;").then(function (coverage) {
            collector.add(coverage);
        });
    }
    driver.quit();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function() {
    driver.get(baseUrl);
};

module.exports.getTitleText = function() {
    return driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function() {
    return driver.findElement(webdriver.By.id("new-todo")).getAttribute("value");
};

module.exports.getErrorText = function() {
    var errorElement = driver.findElement(webdriver.By.id("error"));
    driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 5000);
    return errorElement.getText();
};

module.exports.getTodoList = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    return driver.findElements(webdriver.By.css("#todo-list li"));
};

module.exports.addTodo = function(text) {
    driver.findElement(webdriver.By.id("new-todo")).sendKeys(text);
    driver.findElement(webdriver.By.id("submit-todo")).click();
};

module.exports.getTodoText = function(child) {
    var inputField;
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.css("#todo-list li:nth-child(" +
        child + ") .itemEntry"));
    }, 5000);
    inputField = driver.findElement(webdriver.By.css("#todo-list li:nth-child(" +
      child + ") .itemEntry"));

    return inputField.getAttribute("value");
};

module.exports.deleteTodo = function(child) {
    var targetCSS = "#todo-list li:nth-child(" + child + ") .deleteBtn";
    var deleteButton;

    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.css(targetCSS));
    }, 5000);
    deleteButton = driver.findElement(webdriver.By.css(targetCSS));
    deleteButton.click();
};

module.exports.editTodo = function(child, text) {
    var targetCSS = "#todo-list li:nth-child(" + child + ") .editBtn";
    var inputTargetCSS = "#todo-list li:nth-child(" + child + ") .itemEntry";
    var editButton;
    var confirmButton;
    var inputField;

    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.css(targetCSS));
    }, 5000);

    editButton = driver.findElement(webdriver.By.css(targetCSS));
    editButton.click();

    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.css(inputTargetCSS));
    }, 5000);

    inputField = driver.findElement(webdriver.By.css(inputTargetCSS));

    inputField.clear();
    inputField.sendKeys(text);
    inputField.submit();
};

module.exports.completeTodo = function(child) {
    var targetCSS = "#todo-list li:nth-child(" + child + ") .completeBtn";
    var completeButton;

    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.css(targetCSS));
    }, 5000);
    completeButton = driver.findElement(webdriver.By.css(targetCSS));
    completeButton.click();
};

module.exports.getRemoveButtonVisibility = function() {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("removeCompleted"));
    }, 5000);

    return driver.findElement(webdriver.By.id("removeCompleted")).isDisplayed();
};

module.exports.navigateToTab = function(child) {
    var tab = driver.findElement(webdriver.By.css(".tabs li:nth-child(" + child + ") a"));
    tab.click();
};

module.exports.getBadgeCount = function(child) {
    return driver.findElement(webdriver.By.css(".tabs li:nth-child(" + child + ") .badge")).getText();
};

module.exports.removeCompleted = function() {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("removeCompleted"));
    }, 5000);

    driver.findElement(webdriver.By.id("removeCompleted")).click();
};

module.exports.getCompletion = function() {
    return driver.findElement(webdriver.By.css(".progress-bar")).getText();
};

module.exports.setupErrorRoute = function(action, route) {
    if (action === "get") {
        router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
};
