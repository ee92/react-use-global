import {useState, useEffect} from 'react';

// calls all listeners associated with a path
// e.g. path 'foo.bar' calls all listeners at:
// ['state', 'state.foo', 'state.foo.bar', 'state.foo.bar.baz', ...]
// does NOT call ['state.something', 'state.foo.bubba', ...]
const callListeners = (path, state, listeners) => {
   const pathArr = path.split('.')
   const pathKey = ['state'].concat(pathArr).join('.');
   const keys = Object.keys(listeners);
   for (let i=0; i<keys.length; i++) {
      const hasPrefix = pathKey.startsWith(keys[i]);
      const isPrefix = keys[i].startsWith(pathKey);
      if (!hasPrefix && !isPrefix) continue;
      const id = keys[i];
      if (!listeners[id]) continue;
      for (let j=0; j<listeners[id].length; j++) {
         const newState = pathArr.reduce((prev, curr) => prev[curr], state);
         listeners[id][j](newState);
      }
   }
}

// custom set function returned by useGlobal
// sets the new state at the path to the current state
// calls call associated listeners
const setInnerState = (newState, path, state, listeners) => {
   if (!path) {
      state = newState;
      callListeners(path, state, listeners);
      return;
   }
   const pathArr = path.split('.');
   let update = state;
   for (let i=0; i<pathArr.length-1; i++) {
      update = update[pathArr[i]];
   }
   const key = pathArr[pathArr.length - 1];
   if (update[key] === newState) return;
   update[key] = newState;
   callListeners(path, state, listeners);
}

// creates a local state using the path and the global state
// component subscribes to changes in the state at that path
// those changes set the local state and the component re-renders
// returns [state, setState] like useState()
const useGlobal = (path, state, listeners) => {
   const pathArr = path.split('.');
   const innerState = pathArr.reduce((prev, curr) => prev[curr], state);
   if (innerState === undefined) throw Error(path + ' is undefined');
   const [value, setValue] = useState(innerState);
   useEffect(() => {
      const id = ['state'].concat(pathArr).join('.');
      if (!listeners[id]) {
         listeners[id] = [];
      }
      listeners[id].push(setValue)
      return () => listeners[id].filter(listener => listener !== setValue);
   // eslint-disable-next-line
   }, []);
   return [value, (value) => setInnerState(value, path, state, listeners)];
}

// create closure for state and listeners
// return hook to access them
const useGlobalState = (initialState) => {
   let state = JSON.parse(JSON.stringify(initialState));
   let listeners = {};
   // eslint-disable-next-line
   return (path) => useGlobal(path, state, listeners);
}

export default useGlobalState;