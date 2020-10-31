import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import {Button, Row, Col, Modal} from 'react-bootstrap';
import common from "../static/common.css";
import Link from 'next/link';

class RestaurantList extends Component{
    constructor(props){
        super(props);
        this.state = {
            username: '',
            loading: true,
            review: null,
            show: false,
            no: null,
        }
        this.handleShow = this.handleShow.bind(this);
        this.handleClose  = this.handleClose.bind(this);
    }
    
    handleShow(e) {
        this.setState({ 
            no: e.target.getAttribute('data-no'),
            show: true
        })

    }
    handleClose() {
        this.setState({ show: false })
    }

    componentDidMount() {
        this.getAuth(this.props.requestId);
        this.getData();
    }

    getAuth(i){
        console.log('getAuth');
        if (i != undefined) {
            let db = firebase.database();
            let ref = db.ref('Users/');    
            // キーを元にログインユーザを取得
            ref.orderByKey().equalTo(i).on('value', (snapshot)=>{
                let d = snapshot.val();

                if(d != undefined){
                    let username = d[i]['id'];
                    this.setState({username: username});
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
                    this.getData();
                }
            })
        }
    }

    getData(){
        console.log('getData');
        let name = this.props.username;
        if (name == ''){
            return;
        } else {
            this.setState({loading:false});
        }
        let db = firebase.database();
        let ref = db.ref('Reviews/');    
        // キーを元にログインユーザを取得
        ref.orderByKey().equalTo(name).on('value', (snapshot)=>{
            let review = [];
            let d = snapshot.val()[name];
            for(let i in d){
                review.push(d[i]);
            }
            this.setState({
                review: review
            });
        });
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
        let review = this.state.review;
        if (review == null || review.length == 0) {
            content.push(<div key="noData">データがありません。</div>);
        } else {
            content.push(
                <Row key={'tableHeader'}>
                    <Col sm={2} key='visitDate' className={common.tableHeader}><strong>来店日</strong></Col>
                    <Col sm={3} key='name' className={common.tableHeader}><strong>レストラン名</strong></Col>
                    <Col sm={2} key='category' className={common.tableHeader}><strong>カテゴリ</strong></Col>
                    <Col sm={1} key='score' className={common.tableHeader}><strong>点数</strong></Col>
                    <Col sm={2} key='price' className={common.tableHeader}><strong>金額</strong></Col>
                    <Col sm={1} key='edit' className={common.tableHeader}><strong>編集</strong></Col>
                    <Col sm={1} key='delete' className={common.tableHeader}><strong>削除</strong></Col>
                </Row>
            );
            for (let i in review) {
                content.push(
                    <Row key={'tableBody' + i}>
                        <Col sm={2} key={'visitDate' + i} className={common.tableBody + ' ' + common.text_align_right}>{review[i]['visitDate']}</Col>
                        <Col sm={3} key={'name' + i} className={common.tableBody}>
                            <a key={'a_name' + i} onClick={this.handleShow} className={common.cursor_pointer} data-no={i}>{review[i]['name']}</a>
                        </Col>
                        <Col sm={2} key={'category' + i} className={common.tableBody}>{review[i]['category']}</Col>
                        <Col sm={1} key={'score' + i} className={common.tableBody + ' ' + common.text_align_right}>{review[i]['score']}点</Col>
                        <Col sm={2} key={'price' + i} className={common.tableBody + ' ' + common.text_align_right}>{review[i]['price']}円</Col>
                        <Col sm={1} key={'edit' + i} className={common.tableBody}></Col>
                        <Col sm={1} key={'delete' + i} className={common.tableBody}></Col>
                    </Row>
                );
            }
            content.push(
                <Modal show={this.state.show} onHide={this.handleClose} key='modal'>
                    <Modal.Header closeButton>
                        <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Woohoo, you're reading this text in a modal!
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
              </Modal>
            )
        }
        return (
            <div key="contentTable">
                {content}
            </div>
        )
    }

    render(){
        let content = [];
        if (this.props.username == '' || this.state.loading){
            content.push(<div key="load">ロード中です・・・</div>);
        } else {
            content.push(this.createButton());
            content.push(this.createTable());
        }
        return (
            <div>
                {content}
            </div>
        );
    }
}

RestaurantList = connect((state) => state)(RestaurantList);
export default RestaurantList;