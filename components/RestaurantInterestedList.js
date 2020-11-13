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
        this.state = {
            loading: false,
            offset: 0,
            parPage: 10
        }
    }

     // ヘッダーボタン作成
    createButton(){
        return (
            <div key="contentButton">
                <Button key="search" variant="outline-danger" onClick={this.searchModalShow} className={common.buttonMiddle}>検索</Button>
                <Link href="/restaurant_interested_regist">
                        <Button key="regist" variant="danger" className={common.buttonMiddle}>登録</Button>
                </Link>
            </div>
        );
    }

    render(){
        let content = [];
        if (this.props.username == '' || this.state.loading){
            content.push(<div key="load">ロード中です・・・</div>);
        } else {
            content.push(this.createButton());
        }
        return (
            <div>
                {content}
            </div>
        );
    }
}

RestaurantInterestedList = connect((state) => state)(RestaurantInterestedList);
export default RestaurantInterestedList;