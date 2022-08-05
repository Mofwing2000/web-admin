import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HistoryRouter as Router } from 'redux-first-history/rr6';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { history, store } from './store/store';
import './index.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

let persistor = persistStore(store);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <Router history={history}>
                <PersistGate loading={null} persistor={persistor}>
                    <App />
                </PersistGate>
            </Router>
        </Provider>
    </React.StrictMode>,
);
reportWebVitals();
