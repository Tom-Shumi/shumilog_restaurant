import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import {Button, Row, Col, Modal, Image} from 'react-bootstrap';
import common from "../static/common.css";
import Link from 'next/link';
import Router from 'next/router';

class RestaurantList extends Component{
    constructor(props){
        super(props);
        this.state = {
            username: '',
            loading: true,
            review: null,
            show: false,
            no: 0,
        }
        this.handleShow = this.handleShow.bind(this);
        this.handleClose  = this.handleClose.bind(this);
        this.doDelete  = this.doDelete.bind(this);
    }
    
    handleShow(e) {
        this.setState({ 
            no: e.target.getAttribute('data-no'),
            show: true,
            photoURL: ''
        })

    }
    handleClose() {
        this.setState({
            show: false,
            photoURL: ''
         });
    }

    componentDidMount() {
        this.getAuth(this.props.requestId);
        this.getData();
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
                    this.setState({username: username});
                    this.props.dispatch({
                        type: 'UPDATE_INFO',
                        value: {
                            login: true,
                            username: username,
                            data: [],
                            actionURL: '',
                            message: '',
                            photoURL: ''
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
        let name = this.props.username;
        if (name == ''){
            return;
        } else {
            this.setState({loading:false});
        }
        let db = firebase.database();
        let ref = db.ref('Reviews/');    
        // キーを元にレビューを取得
        ref.orderByKey().equalTo(name).on('value', (snapshot)=>{
            let review = [];
            if (snapshot.val() != null) {
                let d = snapshot.val()[name];
                for(let i in d){
                    review.push(d[i]);
                }
                review.sort(function(val1,val2){
                    return ( val1.visitDate < val2.visitDate ? 1 : -1);
                });    
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
                        <Col sm={1} key={'edit' + i} className={common.tableBody}>
                            <Link href={"/restaurant_regist?n=" + review[i]['name'] + "&d=" + review[i]['visitDate']}>
                                <Button key={'editButton' + i} variant="danger" className={common.buttonSmall}>編集</Button>
                            </Link>
                        </Col>
                        <Col sm={1} key={'delete' + i} className={common.tableBody}>
                            <Button key={'deleteButton' + i} variant="outline-secondary" onClick={this.doDelete} className={common.buttonSmall} data-no={i} >削除</Button>
                        </Col>
                    </Row>
                );
            }

            if (review[this.state.no]['photo'] != '') {
                let storageRef = firebase.storage().ref('/review_image/' + review[this.state.no]['photo']);
                storageRef.getDownloadURL().then((url) => {
                    this.setState({ photoURL: url + '/170x170' });
                });    
            }

            content.push(
                <Modal show={this.state.show} onHide={this.handleClose} key='modal'>
                    <Modal.Header closeButton>
                        <Modal.Title>{review[this.state.no]['name']}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row key={'modalBody'} className={common.modalBody}>
                            <Col sm={3} key={'modalBodyHeaderReview'} className={common.tableHeader}>レビュー</Col>
                            <Col sm={9} key={'modalBodyReview'} className={common.tableBody}>{review[this.state.no]['review']}</Col>
                            <Col sm={3} key={'modalBodyHeaderPhoto'} className={common.tableHeader}>画像</Col>
                            <Col sm={9} key={'modalBodyPhoto'} className={common.tableBody}>
                                {review[this.state.no]['photo'] == '' ? '' : <Image src={this.state.photoURL}/>}
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="dark" onClick={this.handleClose}>
                            閉じる
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

    doDelete(e){
        let no = e.target.getAttribute('data-no');
        let username = this.props.username;
        let db = firebase.database();
        db.ref('Reviews/' + username).orderByChild("key").equalTo(this.state.review[no]['name'] + '_' + this.state.review[no]['visitDate']).on('value', (snapshot)=>{
            let target = snapshot.val() || null;
            if (target) {
                let key = Object.keys(target)[0];
                let del = db.ref('Reviews/' + username + '/' + key);
                del.remove();  
            }
        });
        this.props.dispatch({
            type: 'UPDATE_INFO',
            value: {
                login: true,
                username: this.props.username,
                data: [],
                actionURL: '/restaurant_list',
                message: '削除が完了しました。'
            }
        });
        Router.push('/restaurant_info');
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