import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import firebase from "firebase";

var config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STRAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
}

var fireapp;
try {
    fireapp = firebase.initializeApp(config);
} catch(error){
    console.log(error.message);
}

export default fireapp;

const initial = {
    login: false,
    username: '',
    actionURL: '',
    message: ''
}

function fireReducer(state = initial, action){
    switch(action.type){
        case 'UPDATE_INFO':
            return action.value;
        default:
            return state;
    }
}

export function initStore(state = initial) {
    return createStore(fireReducer, state,
            applyMiddleware(thunkMiddleware))
}