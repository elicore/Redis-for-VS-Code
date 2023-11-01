import { createBrowserHistory } from 'history'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import keysReducer from 'uiSrc/modules/keys-tree/slice/keys.slice'
import userSettingsReducer from 'uiSrc/slices/user/user-settings.slice'
import appInfoReducer from 'uiSrc/slices/app/info/info.slice'
import instancesReducer from 'uiSrc/slices/connections/instances/instances.slice'
import appContextReducer from 'uiSrc/slices/app/context/context.slice'

export const history = createBrowserHistory()

export const rootReducers = {
  app: combineReducers({
    info: appInfoReducer,
    context: appContextReducer,
  }),
  connections: combineReducers({
    instances: instancesReducer,
  }),
  browser: combineReducers({
    keys: keysReducer,
  }),
  user: combineReducers({
    settings: userSettingsReducer,
  }),
}

export const rootReducer = combineReducers(rootReducers)

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  devTools: process.env.NODE_ENV !== 'production',
})

export default store
export { store }

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
