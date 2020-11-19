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
            list: [],
            loading: true,
            detailModalShow: false,
            searchModalShow: false,
            no: 0,
            offset: 0,
            parPage: 10
        }
        this.detailModalShow = this.detailModalShow.bind(this);
        this.detailModalClose = this.detailModalClose.bind(this);
        this.searchModalShow = this.searchModalShow.bind(this);
        this.searchModalClose  = this.searchModalClose.bind(this);
        this.doDelete  = this.doDelete.bind(this);
    }
    componentDidMount() {
        // 表示データ取得
        this.getData();
    }

    // 詳細モーダル表示
    detailModalShow(e) {
        this.setState({ 
            no: e.target.getAttribute('data-no'),
            detailModalShow: true,
        })

    }

    // 詳細モーダル非表示
    detailModalClose() {
        this.setState({
            detailModalShow: false,
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

    // 表示データ取得
    getData(){
        let name = this.props.username;
        if (name == ''){
            return;
        } else {
            this.setState({loading:false});
        }
        let db = firebase.database();
        let ref = db.ref('Interested/');    
        // キーを元にレビューを取得
        ref.orderByKey().equalTo(name).on('value', (snapshot)=>{
            let list = [];
            if (snapshot.val() != null) {
                let d = snapshot.val()[name];
                for(let i in d){
                    list.push(d[i]);
                }
                list.sort(function(val1,val2){
                    return ( val1.score < val2.score ? 1 : -1);
                });    
            }
            this.setState({
                list: list
            });
        });
    }

    // 削除
    doDelete(e){
        if (confirm("削除します。よろしいですか？")){
            let no = e.target.getAttribute('data-no');
            let username = this.props.username;
            let db = firebase.database();
            db.ref('Interested/' + username).orderByChild('name').equalTo(this.state.list[no]['name']).on('value', (snapshot)=>{
                let target = snapshot.val() || null;
                if (target) {
                    let key = Object.keys(target)[0];
                    let del = db.ref('Interested/' + username + '/' + key);
                    del.remove();
                }
            });

            // 共通メッセージ画面遷移
            this.props.dispatch({
                type: 'UPDATE_INFO',
                value: {
                    login: true,
                    username: this.props.username,
                    actionURL: '/restaurant_interested_list',
                    message: '削除が完了しました。'
                }
            });
            Router.push('/restaurant_info');
        }
    }

     // ヘッダーボタン作成
    createButton(){
        return (
            <div key="contentButton">
                <Row>
                    <Col sm={2} xs={6}>
                        <Button key="search" variant="outline-danger" onClick={this.searchModalShow} className={common.buttonMiddle}>検索</Button>
                    </Col>
                    <Col sm={2} xs={6}>
                        <Link href="/restaurant_interested_regist">
                            <Button key="regist" variant="danger" className={common.buttonMiddle}>登録</Button>
                        </Link>
                    </Col>
                </Row>
            </div>
        );
    }

    // 一覧作成
    createTable(){
        let content = [];
        let list = this.state.list.slice(this.state.offset, this.state.offset + this.state.parPage);
        if (list == null || list.length == 0) {
            content.push(<div className={common.noData} key="noData">データがありません。</div>);
        } else {
            // 一覧ページネーション部
            content.push(
                <Row key={'tablePagenationTop'} className={common.pagination}>
                    <Pagination
                        limit={this.state.parPage}
                        offset={this.state.offset}
                        total={this.state.list.length}
                        onClick={(e, offset) => this.handleClickPagination(offset)}
                    />
                </Row>
            )
            // 一覧ヘッダー部
            content.push(
                <Row key={'tableHeader'}>
                    <Col sm={2} xs={4} key='createDate' className={common.tableHeader}><strong>登録日</strong></Col>
                    <Col sm={3} xs={8} key='name' className={common.tableHeader}><strong>レストラン名</strong></Col>
                    <Col sm={2} key='category' className={common.tableHeader + ' ' + common.display_none_sm}><strong>カテゴリ</strong></Col>
                    <Col sm={2} key='station' className={common.tableHeader + ' ' + common.display_none_sm}><strong>最寄り駅</strong></Col>
                    <Col sm={1} xs={4} key='review' className={common.tableHeader}><strong>レビュー</strong></Col>
                    <Col sm={1} xs={4} key='edit' className={common.tableHeader}><strong>編集</strong></Col>
                    <Col sm={1} xs={4} key='delete' className={common.tableHeader}><strong>削除</strong></Col>
                </Row>
            );
            // 一覧ボディ部
            for (let i in list) {
                content.push(
                    <Row key={'tableBody' + i}>
                        <Col sm={2} xs={4} key={'createDate' + i} className={common.tableBody + ' ' + common.text_align_right}>{list[i]['createDate']}</Col>
                        <Col sm={3} xs={8} key={'name' + i} className={common.tableBody}>
                            <a key={'a_name' + i} onClick={this.detailModalShow} className={common.cursor_pointer} data-no={i}>{list[i]['name']}</a>
                        </Col>
                        <Col sm={2} key={'category' + i} className={common.tableBody + ' ' + common.display_none_sm}>{list[i]['category']}</Col>
                        <Col sm={2} key={'station' + i} className={common.tableBody + ' ' + common.display_none_sm}>{list[i]['station']}駅</Col>
                        <Col sm={1} xs={4} key={'review' + i} className={common.tableBody + ' ' + common.text_align_center}>
                            <Link href={"/restaurant_regist?t=2&n=" + list[i]['name'] + "&c=" + list[i]['category'] + "&s=" + list[i]['station']}>
                                <Button key={'reviewButton' + i} variant="warning" className={common.buttonSmall}>登録</Button>
                            </Link>
                        </Col>
                        <Col sm={1} xs={4} key={'edit' + i} className={common.tableBody + ' ' + common.text_align_center}>
                            <Link href={"/restaurant_interested_regist?n=" + list[i]['name']}>
                                <Button key={'editButton' + i} variant="danger" className={common.buttonSmall}>編集</Button>
                            </Link>
                        </Col>
                        <Col sm={1} xs={4} key={'delete' + i} className={common.tableBody + ' ' + common.text_align_center}>
                            <Button key={'deleteButton' + i} variant="outline-secondary" onClick={this.doDelete} className={common.buttonSmall} data-no={i} >削除</Button>
                        </Col>
                    </Row>
                );
            }

            // 一覧ページネーション部
            content.push(
                <Row key={'tablePagenationBottom'} className={common.pagination}>
                    <Pagination
                        limit={this.state.parPage}
                        offset={this.state.offset}
                        total={this.state.list.length}
                        onClick={(e, offset) => this.handleClickPagination(offset)}
                    />
                </Row>
            );

            // 詳細モーダル部
            content.push(
                <Modal show={this.state.detailModalShow} onHide={this.detailModalClose} key='detailModal'>
                    <Modal.Header closeButton>
                        <Modal.Title>{list[this.state.no]['name']}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row key={'detailModalBody'} className={common.modalBody}>
                            <Col sm={3} key={'detailModalBodyHeaderCategory'} className={common.tableHeader}>カテゴリ</Col>
                            <Col sm={9} key={'detailModalBodyCategory'} className={common.tableBody}>{list[this.state.no]['category']}</Col>
                            <Col sm={3} key={'detailModalBodyHeaderStation'} className={common.tableHeader}>最寄り駅</Col>
                            <Col sm={9} key={'detailModalBodyStation'} className={common.tableBody}>{list[this.state.no]['station']}駅</Col>
                            <Col sm={3} key={'detailModalBodyHeaderPrice'} className={common.tableHeader}>金額</Col>
                            <Col sm={9} key={'detailModalBodyPrice'} className={common.tableBody}>{list[this.state.no]['price']}円</Col>
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

RestaurantInterestedList = connect((state) => state)(RestaurantInterestedList);
export default RestaurantInterestedList;