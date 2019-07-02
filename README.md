# react-use-global
React hook for using global state without unnecessary renders.

### Concept:
- Create an global state object with initial value.
- Subscribe a component to any part of that object.
- The component will *only re-render if that part of the state changes*.

### Install:
```
npm install react-use-global --save
```

### Use:

| API | usage | description |
| ------------ | ------------ |
|  function createGlobal |  (any initialState) =>  function useGlobal | Imported from 'react-use-global'. Takes initial state value, returns useGlobal function.  |
|  function useGlobal |  (string path) => [any state, function setState]  | Takes a path (e.g. 'user.settings.nightMode'), returns the value and a function to set that value. |


### Example:
```js
import React from 'react'
import createGlobal from 'react-use-global'

const initialState = {
   count: 42,
   input: "wow this is cool",
   show: {
      count: false,
      input: true
   }
}
const useGlobal = createGlobal(initialState)

const Toggles = () => {
   const [showCount, setShowCount] = useGlobal('show.count')
   const [showInput, setShowInput] = useGlobal('show.input')
   return (
      <div>
        <input
            type="checkbox"
            checked={showCount}
            onChange={() => setShowCount(!showCount)}
        />
        <label>show count</label>
        <input
            type="checkbox"
            checked={showInput}
            onChange={() => setShowInput(!showInput)}
        />
        <label>show input</label>
      </div>
   )
}

const Count = () => {
   const [count, setCount] = useGlobal('count')
   const [showCount] = useGlobal('show.count')
   if (!showCount) return null
   return (
      <div>
         <span>{count}</span>
         <button onClick={() => setCount(count + 1)}>+</button>
         <button onClick={() => setCount(count - 1)}>-</button>
      </div>
   )
}

const Input = () => {
   const [input, setInput] = useGlobal('input')
   const [showInput] = useGlobal('show.input')
   if (!showInput) return null
   return (
      <div>
         <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
         />
      </div>
   )
}

const App = () => {
   return (
      <div>
         <Toggles/>
         <Count/>
         <Input/>
      </div>
   );
}

export default App;
```


### License
MIT

