
// http://stackoverflow.com/questions/20100245/how-can-i-execute-array-of-promises-in-sequential-order
/*

If you have an array of promise returning functions:

var tasks = [fn1, fn2, fn3...];

tasks.reduce(function(cur, next) {
    return cur.then(next);
}, RSVP.resolve()).then(function() {
    //all executed
});
Or values:

var idsToDelete = [1,2,3];

idsToDelete.reduce(function(cur, next) {
    return cur.then(function() {
        return http.post("/delete.php?id=" + next);
    });
}, RSVP.resolve()).then(function() {
    //all executed
});

*/

export function defaultToPromiseFunc(_, value) {
  return Promise.resolve(value);
}

export function toSeqPromise(inArray, toPrmiseFunc = defaultToPromiseFunc) {
  return inArray.reduce((prev, curr, index, array) =>
    prev.then(() => toPrmiseFunc(prev, curr, index, array)), Promise.resolve());
}

export function promiseWait(waitMillisec) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, waitMillisec);
  });
}

export class PromiseStack {
  constructor() {
    this.promise = Promise.resolve(this);
  }

  push(promiseFunc) {
    return (this.promise = this.promise
      .then(() => (this.promise = promiseFunc())));
  }
}

const defaultCallbackPromise = ({ result, error }) => {
  if (error) {
    return Promise.reject(error);
  }
  return Promise.resolve(result);
};

// https://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
const getClass = {}.toString;
function isFunction(object) {
  return object && getClass.call(object) == '[object Function]';
}

const toCamel = str => str.replace(/_([a-z])/g, g => g[1].toUpperCase());
const toUnderscore = str => str.replace(/([A-Z])/g, g => `_${g.toLowerCase()}`);
const capitalizeFirstLetter = str => (str.charAt(0).toUpperCase() + str.slice(1));

export {
  toCamel,
  toUnderscore,
  capitalizeFirstLetter,
  defaultCallbackPromise,
  isFunction,
};

export function handleValueArrayForMethod(self, method, input, parent = null) {
  // Should not use
  if (Array.isArray(input)) {
    return Promise.all(input.map(_input => method.call(self, _input, parent)));
  }
  if (input.values) {
    const values = input.values;
    const newArgs = { ...input };
    delete newArgs.values;
    return Promise.all(values.map((_value) => {
      newArgs.value = _value;
      return method.call(self, newArgs, parent);
    }));
  }
  return undefined;
}

export function handlePromiseCallback(promise, parent, callbackPromise) {
  let result = null;
  return promise
    .then((_result) => {
      result = _result;
      return Promise.resolve(callbackPromise({ result, parent, error: null }))
        .then(() => result)
        .catch((error) => {
          console.log('failureInCallback');
          error.failureInCallback = true; // eslint-disable-line no-param-reassign
          return Promise.reject(error);
        });
    })
    .catch((error) => {
      console.log('error :', error);
      return Promise.resolve(callbackPromise({ result, parent, error }))
        .then(() => result);
    });
}

/*
toSeqPromise([1, 2, 3, 4, 5, 6, 7], (_, value) => {
  console.log('value :', value);
  if(value != 5){
    return Promise.resolve(value);
  }
  return Promise.reject(value);
});
*/
