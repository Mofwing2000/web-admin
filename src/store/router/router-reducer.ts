import { createBrowserHistory } from 'history';
import { createReduxHistoryContext } from 'redux-first-history';

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({
    history: createBrowserHistory(),
});

export default routerReducer;
export { createReduxHistory, routerMiddleware };
