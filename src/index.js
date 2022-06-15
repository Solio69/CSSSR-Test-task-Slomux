import React, { useEffect, useState, useContext, createContext } from "react";
import ReactDOM from "react-dom";
// Slomux - реализация Flux, в которой, как следует из названия, что-то сломано.
// Нужно починить то, что сломано, и подготовить Slomux к использованию на больших проектах, где крайне важна производительность

// ВНИМАНИЕ! Замена slomux на готовое решение не является решением задачи

// будем получать контекст в глобальной видимости
const Context = createContext(null)

const createStore = (reducer, initialState) => {
  let currentState = initialState
  let listeners = []

  const getState = () => currentState
  const dispatch = action => {
    currentState = reducer(currentState, action)
    listeners.forEach(listener => listener())
  }

  const subscribe = listener => listeners.push(listener)

  return { getState, dispatch, subscribe }
}

// для удобства сразу заберем store из Context, в дальнейшем будем использовать этот хук
const useStore = () => {
  const { store } = useContext(Context)
  return store
}

const useSelector = selector => {
  // заберем ф-ии getState, subscribe из стор
  const { getState, subscribe } = useStore()

  // создадим локальный стейт и поместим в него значение стейта из стора
  const [state, setState] = useState(getState())

  useEffect(()=> {
    // подпишимся на изменения стейт
    subscribe(() => {
      return setState(getState())
    })
  }, [subscribe, getState])


  return selector(state)
}

const useDispatch = () => {
  // заберем dispatch из стора 
  const { dispatch } = useStore()

  // и вернем его 
  return dispatch
}


// проп сontext больше не нужен
const Provider = ({ store, children }) => {
  return <Context.Provider value={{ store }}>{children}</Context.Provider>
}

// APP

// actions
const UPDATE_COUNTER = 'UPDATE_COUNTER'
const CHANGE_STEP_SIZE = 'CHANGE_STEP_SIZE'

// action creators
const updateCounter = value => ({
  type: UPDATE_COUNTER,
  payload: value,
})

const changeStepSize = value => ({
  type: CHANGE_STEP_SIZE,
  payload: value,
})


// reducers
const defaultState = {
  counter: 1,
  stepSize: 1,
}

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_COUNTER:
      return {
        ...state, // забираем копию стейта
        counter: state.counter + action.payload * state.stepSize, // изменяем только counter
      };
    case CHANGE_STEP_SIZE:
      return { 
        ...state, 
        stepSize: action.payload // тут меняем только stepSize
      };
    default:
      return state // если не сработал ни один case, то всегда должен вовзращаться state
  }
}

// ВНИМАНИЕ! Использование собственной реализации useSelector и dispatch обязательно
const Counter = () => {
  const counter = useSelector(state => state.counter)
  const dispatch = useDispatch()

  return (
    <div>
      <button onClick={() => dispatch(updateCounter(-1))}>-</button>
      <span> {counter} </span>
      <button onClick={() => dispatch(updateCounter(1))}>+</button>
    </div>
  )
}

const Step = () => {
  const stepSize = useSelector(state => state.stepSize, (current, prev) => current === prev)
  const dispatch = useDispatch()

  return (
    <div>
      <div>Значение счётчика должно увеличиваться или уменьшаться на заданную величину шага</div>
      <div>Текущая величина шага: {stepSize}</div>
      <input
        type="range"
        min="1"
        max="5"
        value={stepSize}
        onChange={({ target }) => dispatch(changeStepSize(target.value))}
      />
    </div>
  )
}

ReactDOM.render(
  <Provider store={createStore(reducer, defaultState)}>
      <Step />
      <Counter />
  </Provider>,
  document.getElementById('app')
)