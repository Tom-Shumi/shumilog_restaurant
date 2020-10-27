import { Component } from 'react';
import { initStore } from '../store';

const isServer = typeof window === 'undefined';
const _NRS_ = '__NEXT_REDUX_STORE__';

function getOrCreateStore(initialState) {
    if (isServer) {
        return initStore(initialState)
    }

    if (!window[_NRS_]){
        window[_NRS_] = initStore(initialState)
    }
    return window[_NRS_]
}

const reduxStore = (App) => {
    return class AppWithRedux extends Component {
        static async getInitialProps (appContext) {
            const reduxStore = getOrCreateStore();
            appContext.ctx.reduxStore = reduxStore;
            let appProps = {};
            if (typeof App.getInitialProps === 'function') {
                appProps = await App.getInitialProps(appContext)
            }
            return {
                ...appProps,
                initialState: reduxStore.getState()
            }
        }
        constructor(props){
            super(props);
            this.reduxStore = getOrCreateStore(props.initialReduxStore);
        }
        render () {
            return <App {...this.props} reduxStore={this.reduxStore} />
        }
    }
}

export default reduxStore;