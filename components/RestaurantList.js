import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import {Button, Row, Col, Modal, Image} from 'react-bootstrap';
import common from "../static/common.css";
import Link from 'next/link';
import Router from 'next/router';
import Pagination from "material-ui-flat-pagination";

class RestaurantList extends Component{
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            review: [],
            detailModalShow: false,
            searchModalShow: false,
            no: 0,
            offset: 0,
            parPage: 10
        }
        this.detailModalShow = this.detailModalShow.bind(this);
        this.detailModalClose  = this.detailModalClose.bind(this);
        this.searchModalShow = this.searchModalShow.bind(this);
        this.searchModalClose  = this.searchModalClose.bind(this);
        this.doDelete  = this.doDelete.bind(this);
    }
    
    // 詳細モーダル表示
    detailModalShow(e) {
        this.setState({ 
            no: e.target.getAttribute('data-no'),
            detailModalShow: true,
            photoURL: ''
        })

    }

    // 詳細モーダル非表示
    detailModalClose() {
        this.setState({
            detailModalShow: false,
            photoURL: ''
         });
    }

    // 検索モーダル表示
    searchModalShow(e) {
        this.setState({ 
            searchModalShow: true
        });

    }

    // 検索モーダル非表示
    searchModalClose() {
        this.setState({
            searchModalShow: false
         });
    }

    // ページネーション
    handleClickPagination(offset){
        this.setState({ offset })
    }

    componentDidMount() {
        // 認証
        this.getAuth(this.props.requestId);
        // 表示データ取得
        this.getData();
    }

    // 認証
    getAuth(i){
        if (i != undefined) {
            let db = firebase.database();
            let ref = db.ref('Users/');    
            // キーを元にログインユーザを取得
            ref.orderByKey().equalTo(i).on('value', (snapshot)=>{
                let d = snapshot.val();

                if(d != undefined){
                    let username = d[i]['id'];
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

    // 表示データ取得
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
                    return ( val1.visitDate > val2.visitDate ? 1 : -1);
                });    
            }
            this.setState({
                review: review
            });
        });
    }

    // ヘッダーボタン作成
    createButton(){
        return (
            <div key="contentButton">
                <Button key="search" variant="outline-danger" onClick={this.searchModalShow} className={common.buttonMiddle}>検索</Button>
                <Link href="/restaurant_regist">
                        <Button key="regist" variant="danger" className={common.buttonMiddle}>登録</Button>
                </Link>
                <Link href="/restaurant_interested_list">
                    <Button key="goInterestedList" variant="warning" className={common.buttonLarge + ' ' + common.float_right}>気になるレストラン</Button>
                </Link>
            </div>
        );
    }

    // 一覧作成
    createTable(){
        let content = [];
        let review = this.state.review.slice(this.state.offset, this.state.offset + this.state.parPage);
        if (review == null || review.length == 0) {
            content.push(<div className={common.noData} key="noData">データがありません。</div>);
        } else {
            // 一覧ページネーション部
            content.push(
                <Row key={'tablePagenationTop'}>
                    <Pagination
                        limit={this.state.parPage}
                        offset={this.state.offset}
                        total={this.state.review.length}
                        onClick={(e, offset) => this.handleClickPagination(offset)}
                        className={common.pagenation_right}
                    />
                </Row>
            )
            // 一覧ヘッダー部
            content.push(
                <Row key={'tableHeader'}>
                    <Col sm={2} key='visitDate' className={common.tableHeader}><strong>来店日</strong></Col>
                    <Col sm={3} key='name' className={common.tableHeader}><strong>レストラン名</strong></Col>
                    <Col sm={2} key='category' className={common.tableHeader}><strong>カテゴリ</strong></Col>
                    <Col sm={2} key='price' className={common.tableHeader}><strong>金額</strong></Col>
                    <Col sm={1} key='score' className={common.tableHeader}><strong>点数</strong></Col>
                    <Col sm={1} key='edit' className={common.tableHeader}><strong>編集</strong></Col>
                    <Col sm={1} key='delete' className={common.tableHeader}><strong>削除</strong></Col>
                </Row>
            );
            // 一覧ボディ部
            for (let i in review) {
                content.push(
                    <Row key={'tableBody' + i}>
                        <Col sm={2} key={'visitDate' + i} className={common.tableBody + ' ' + common.text_align_right}>{review[i]['visitDate']}</Col>
                        <Col sm={3} key={'name' + i} className={common.tableBody}>
                            <a key={'a_name' + i} onClick={this.detailModalShow} className={common.cursor_pointer} data-no={i}>{review[i]['name']}</a>
                        </Col>
                        <Col sm={2} key={'category' + i} className={common.tableBody}>{review[i]['category']}</Col>
                        <Col sm={2} key={'price' + i} className={common.tableBody + ' ' + common.text_align_right}>{review[i]['price']}円</Col>
                        <Col sm={1} key={'score' + i} className={common.tableBody + ' ' + common.text_align_right}>{review[i]['score']}点</Col>
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

            // 一覧ページネーション部
            content.push(
                <Row key={'tablePagenationBottom'}>
                    <Pagination
                        limit={this.state.parPage}
                        offset={this.state.offset}
                        total={this.state.review.length}
                        onClick={(e, offset) => this.handleClickPagination(offset)}
                        className={common.pagenation_right}
                    />
                </Row>
            )

            // 詳細モーダル用の画像取得
            if (review[this.state.no]['photo'] != '') {
                let storageRef = firebase.storage().ref('/review_image/' + review[this.state.no]['photo']);
                storageRef.getDownloadURL().then((url) => {
                    this.setState({ photoURL: url + '/170x170' });
                });    
            }
            
            // 詳細モーダル部
            content.push(
                <Modal show={this.state.detailModalShow} onHide={this.detailModalClose} key='detailModal'>
                    <Modal.Header closeButton>
                        <Modal.Title>{review[this.state.no]['name']}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row key={'detailModalBody'} className={common.modalBody}>
                            <Col sm={3} key={'detailModalBodyHeaderStation'} className={common.tableHeader}>最寄り駅</Col>
                            <Col sm={9} key={'detailModalBodyStation'} className={common.tableBody}>{review[this.state.no]['station']}駅</Col>
                            <Col sm={3} key={'detailModalBodyHeaderReview'} className={common.tableHeader}>レビュー</Col>
                            <Col sm={9} key={'detailModalBodyReview'} className={common.tableBody}>{review[this.state.no]['review']}</Col>
                            <Col sm={3} key={'detailModalBodyHeaderPhoto'} className={common.tableHeader}>画像</Col>
                            <Col sm={9} key={'detailModalBodyPhoto'} className={common.tableBody}>
                                {review[this.state.no]['photo'] == '' ? '' : <Image src={this.state.photoURL}/>}
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="dark" onClick={this.detailModalClose}>
                            閉じる
                        </Button>
                    </Modal.Footer>
                </Modal>
            );
        }
        return (
            <div key="contentTable">
                {content}
            </div>
        )
    }

    // 検索モーダル作成
    createSearchModal(){
        let content = [];
        content.push(
            <Modal show={this.state.searchModalShow} onHide={this.searchModalClose} key='searchModal'>
                <Modal.Header closeButton>
                    <Modal.Title>検索</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    メンテナンス中。。。
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={this.searchModalClose}>
                        閉じる
                    </Button>
                </Modal.Footer>
            </Modal>
        );

        return (
            <div key="searchModalDiv">
                {content}
            </div>
        )
    }

    // 削除
    doDelete(e){
        if (confirm("削除します。よろしいですか？")){
            let no = e.target.getAttribute('data-no');
            let username = this.props.username;
            let db = firebase.database();
            db.ref('Reviews/' + username).orderByChild("key").equalTo(this.state.review[no]['name'] + '_' + this.state.review[no]['visitDate']).on('value', (snapshot)=>{
                let target = snapshot.val() || null;
                if (target) {
                    let key = Object.keys(target)[0];
                    let del = db.ref('Reviews/' + username + '/' + key);
                    del.remove();
    
                    // 画像の削除
                    if (this.state.review[no]['photo'] != '') {
                        let delImage = firebase.storage().ref('/review_image/' + this.state.review[no]['photo']);
                        delImage.delete();
                    }
                }
            });

            // 共通メッセージ画面遷移
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
    }

    render(){
        let content = [];
        if (this.props.username == '' || this.state.loading){
            content.push(<div key="load">ロード中です・・・</div>);
        } else {
            content.push(this.createButton());
            content.push(this.createTable());
            content.push(this.createSearchModal());
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