import {useState, useEffect} from 'react';

// calls all listeners associated with a path
// upstream and downstream
const callListeners = (path, state, listeners) => {
   const pathArr = path ? path.split('.') : [];
   const pathKey = ['state'].concat(pathArr).join('.');
   const keys = Object.keys(listeners);
   keys.forEach(key => {
      const hasPrefix = pathKey.startsWith(key);
      const isPrefix = key.startsWith(pathKey);
      if (!hasPrefix && !isPrefix) return;
      if (!listeners[key]) return;
      const keyArr = key.split('.').slice(1);
      let newState = keyArr.reduce((prev, curr) => prev[curr], state);
      newState = JSON.parse(JSON.stringify(newState));
      listeners[key].forEach(listener => listener(newState));
   })
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
   const pathArr = path ? path.split('.') : [];
   const innerState = pathArr.reduce((prev, curr) => prev[curr], state);
   if (innerState === undefined) throw Error(path + ' is undefined');
   const [value, setValue] = useState(innerState);
   useEffect(() => {
      const id = ['state'].concat(pathArr).join('.');
      if (!listeners[id]) {
         listeners[id] = [];
      }
      listeners[id].push(setValue);
      return () => {
			listeners[id] = listeners[id].filter(x => x !== setValue);
		}
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