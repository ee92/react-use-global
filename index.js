"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = require("react");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// calls all listeners associated with a path
// upstream and downstream
var callListeners = function callListeners(path, state, listeners) {
  var pathArr = path ? path.split('.') : [];
  var pathKey = ['state'].concat(pathArr).join('.');
  var keys = Object.keys(listeners);
  keys.forEach(function (key) {
    var hasPrefix = pathKey.startsWith(key);
    var isPrefix = key.startsWith(pathKey);
    if (!hasPrefix && !isPrefix) return;
    if (!listeners[key]) return;
    var keyArr = key.split('.').slice(1);
    var newState = keyArr.reduce(function (prev, curr) {
      return prev[curr];
    }, state);
    newState = JSON.parse(JSON.stringify(newState));
    listeners[key].forEach(function (listener) {
      return listener(newState);
    });
  });
}; // custom set function returned by useGlobal
// sets the new state at the path to the current state
// calls call associated listeners


var setInnerState = function setInnerState(newState, path, state, listeners) {
  if (!path) {
    state = newState;
    callListeners(path, state, listeners);
    return;
  }

  var pathArr = path.split('.');
  var update = state;

  for (var i = 0; i < pathArr.length - 1; i++) {
    update = update[pathArr[i]];
  }

  var key = pathArr[pathArr.length - 1];
  if (update[key] === newState) return;
  update[key] = newState;
  callListeners(path, state, listeners);
}; // creates a local state using the path and the global state
// component subscribes to changes in the state at that path
// those changes set the local state and the component re-renders
// returns [state, setState] like useState()


var useGlobal = function useGlobal(path, state, listeners) {
  var pathArr = path ? path.split('.') : [];
  var innerState = pathArr.reduce(function (prev, curr) {
    return prev[curr];
  }, state);
  if (innerState === undefined) throw Error(path + ' is undefined');

  var _useState = (0, _react.useState)(innerState),
      _useState2 = _slicedToArray(_useState, 2),
      value = _useState2[0],
      setValue = _useState2[1];

  (0, _react.useEffect)(function () {
    var id = ['state'].concat(pathArr).join('.');

    if (!listeners[id]) {
      listeners[id] = [];
    }

    listeners[id].push(setValue);
    return function () {
      listeners[id] = listeners[id].filter(function (x) {
        return x !== setValue;
      });
    }; // eslint-disable-next-line
  }, []);
  return [value, function (value) {
    return setInnerState(value, path, state, listeners);
  }];
}; // create closure for state and listeners
// return hook to access them


var useGlobalState = function useGlobalState(initialState) {
  var state = JSON.parse(JSON.stringify(initialState));
  var listeners = {}; // eslint-disable-next-line

  return function (path) {
    return useGlobal(path, state, listeners);
  };
};

var _default = useGlobalState;
exports["default"] = _default;
