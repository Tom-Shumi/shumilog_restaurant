import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import {Button, Row, Col, Modal, Image} from 'react-bootstrap';
import common from "../static/common.css";
import Link from 'next/link';
import Router from 'next/router';
import Pagination from "material-ui-flat-pagination";

class RestaurantInterestedList extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div>
                
            </div>
        );
    }
}

RestaurantInterestedList = connect((state) => state)(RestaurantInterestedList);
export default RestaurantInterestedList;