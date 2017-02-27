let firstPromise = function() {
  return new Promise(function(resolve, reject) {
    resolve('first promise finished');
  });
};

let secondPromise = function() {
  return new Promise(function(resolve, reject) {
    resolve('second promise finished');
  });
};


let thirdPromise = function() {
  return new Promise(function(resolve, reject) {
    resolve('third promise finished');
  });
};


firstPromise().then(function(fromResolve) {
  return secondPromise();
}).then(function(fromResolve) {
  return thirdPromise();
}).then(function(fromResolve) {
  console.log(fromResolve);
  console.log("finished");
});
