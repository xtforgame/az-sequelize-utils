'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.defaultToPromiseFunc = defaultToPromiseFunc;
exports.toSeqPromise = toSeqPromise;
exports.promiseWait = promiseWait;
exports.handleValueArrayForMethod = handleValueArrayForMethod;
exports.handlePromiseCallback = handlePromiseCallback;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function defaultToPromiseFunc(_, value) {
  return Promise.resolve(value);
}

function toSeqPromise(inArray) {
  var toPrmiseFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultToPromiseFunc;

  return inArray.reduce(function (prev, curr, index, array) {
    return prev.then(function () {
      return toPrmiseFunc(prev, curr, index, array);
    });
  }, Promise.resolve());
}

function promiseWait(waitMillisec) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, waitMillisec);
  });
}

var PromiseStack = exports.PromiseStack = function () {
  function PromiseStack() {
    _classCallCheck(this, PromiseStack);

    this.promise = Promise.resolve(this);
  }

  _createClass(PromiseStack, [{
    key: 'push',
    value: function push(promiseFunc) {
      var _this = this;

      return this.promise = this.promise.then(function () {
        return _this.promise = promiseFunc();
      });
    }
  }]);

  return PromiseStack;
}();

var defaultCallbackPromise = function defaultCallbackPromise(_ref) {
  var result = _ref.result,
      error = _ref.error;

  if (error) {
    return Promise.reject(error);
  }
  return Promise.resolve(result);
};

var getClass = {}.toString;
function isFunction(object) {
  return object && getClass.call(object) == '[object Function]';
}

var toCamel = function toCamel(str) {
  return str.replace(/_([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
};
var toUnderscore = function toUnderscore(str) {
  return str.replace(/([A-Z])/g, function (g) {
    return '_' + g.toLowerCase();
  });
};
var capitalizeFirstLetter = function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

exports.toCamel = toCamel;
exports.toUnderscore = toUnderscore;
exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.defaultCallbackPromise = defaultCallbackPromise;
exports.isFunction = isFunction;
function handleValueArrayForMethod(self, method, input) {
  var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  if (Array.isArray(input)) {
    return Promise.all(input.map(function (_input) {
      return method.call(self, _input, parent);
    }));
  }
  if (input.values) {
    var values = input.values;
    var newArgs = _extends({}, input);
    delete newArgs.values;
    return Promise.all(values.map(function (_value) {
      newArgs.value = _value;
      return method.call(self, newArgs, parent);
    }));
  }
  return undefined;
}

function handlePromiseCallback(promise, parent, callbackPromise) {
  var result = null;
  return promise.then(function (_result) {
    result = _result;
    return Promise.resolve(callbackPromise({ result: result, parent: parent, error: null })).then(function () {
      return result;
    }).catch(function (error) {
      console.log('failureInCallback');
      error.failureInCallback = true;
      return Promise.reject(error);
    });
  }).catch(function (error) {
    console.log('error :', error);
    return Promise.resolve(callbackPromise({ result: result, parent: parent, error: error })).then(function () {
      return result;
    });
  });
}