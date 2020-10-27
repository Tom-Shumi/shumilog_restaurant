import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import {Button} from 'react-bootstrap';
import common from "../static/common.css";
import Link from 'next/link';

class RestaurantList extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div className={common.buttonBackDiv}>
                <div className={common.message_frame}>
                    <p>{this.props.message}</p>
                </div>
                <Link href={this.props.actionURL}>
                    <Button variant="dark" className={common.buttonBack}>戻る</Button>
                </Link>
            </div>
        );
    }
}

RestaurantList = connect((state) => state)(RestaurantList);
export default RestaurantList;