import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import {Button} from 'react-bootstrap';
import common from "../static/common.css";
import Link from 'next/link';

class RestaurantList extends Component{
    constructor(props){
        super(props);
        this.state = {
            username: ''
        }
    }

    componentDidMount() {
        this.getAuth(this.props.requestId);
      }

    getAuth(i){
        if (i != undefined) {
            let db = firebase.database();
            let ref = db.ref('Users/');    
            // キーを元にログインユーザを取得
            ref.orderByKey().equalTo(i).on('value', (snapshot)=>{
                let d = snapshot.val();

                if(d != undefined){
                    let username = d[i]['id'];
                    this.setState({
                        username: username
                    });
                    this.props.dispatch({
                        type: 'UPDATE_INFO',
                        value: {
                            login: true,
                            username: username,
                            data: [],
                            actionURL: '',
                            message: ''
                        }
                    });
                    // ログインユーザ取得後、リクエスト情報削除
                    let ref_delete = db.ref('Users/' + i);
                    ref_delete.remove();
                }
            })
        }
    }

    createButton(){
        return (
            <div key="contentButton">
                <Button key="search" variant="outline-danger" className={common.buttonMiddle}>レビュー検索</Button>
                <Link href="/restaurant_regist">
                        <Button key="regist" variant="danger" className={common.buttonMiddle}>レビュー登録</Button>
                </Link>
                <Button key="goInterestedList" variant="warning" className={common.buttonLarge + ' ' + common.float_right}>気になるレストラン一覧</Button>
            </div>
        );
    }

    createTable(){
        let content = [];
        if (this.props.data == undefined || this.props.data.length == 0) {
            content.push(<div key="noData">データがありません。</div>);
        }

        return (
            <div key="contentTable">
                {content}
            </div>
        )
    }

    render(){
        let content = [];
        if (this.props.username == ''){
            content.push(<div key="load">ロード中です・・・</div>);
        } else {
            content.push(this.createButton());
            content.push(this.createTable());
        }
        console.log(content);
        return (
            <div>
                {content}
            </div>
        );
    }
}

RestaurantList = connect((state) => state)(RestaurantList);
export default RestaurantList;