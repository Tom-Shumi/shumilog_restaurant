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
            offset: 0,
            parPage: 10
        }
        this.doDelete  = this.doDelete.bind(this);
    }
    componentDidMount() {
        // 表示データ取得
        this.getData();
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
                    return ( val1.score > val2.score ? 1 : -1);
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
                    data: [],
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
                <Button key="search" variant="outline-danger" onClick={this.searchModalShow} className={common.buttonMiddle}>検索</Button>
                <Link href="/restaurant_interested_regist">
                        <Button key="regist" variant="danger" className={common.buttonMiddle}>登録</Button>
                </Link>
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
                    <Col sm={3} key='name' className={common.tableHeader}><strong>レストラン名</strong></Col>
                    <Col sm={2} key='category' className={common.tableHeader}><strong>カテゴリ</strong></Col>
                    <Col sm={2} key='station' className={common.tableHeader}><strong>最寄り駅</strong></Col>
                    <Col sm={2} key='price' className={common.tableHeader}><strong>金額</strong></Col>
                    <Col sm={1} key='score' className={common.tableHeader}><strong>点数</strong></Col>
                    <Col sm={1} key='edit' className={common.tableHeader}><strong>編集</strong></Col>
                    <Col sm={1} key='delete' className={common.tableHeader}><strong>削除</strong></Col>
                </Row>
            );
            // 一覧ボディ部
            for (let i in list) {
                content.push(
                    <Row key={'tableBody' + i}>
                        <Col sm={3} key={'name' + i} className={common.tableBody}>{list[i]['name']}</Col>
                        <Col sm={2} key={'category' + i} className={common.tableBody}>{list[i]['category']}</Col>
                        <Col sm={2} key={'station' + i} className={common.tableBody}>{list[i]['station']}駅</Col>
                        <Col sm={2} key={'price' + i} className={common.tableBody + ' ' + common.text_align_right}>{list[i]['price']}円</Col>
                        <Col sm={1} key={'score' + i} className={common.tableBody + ' ' + common.text_align_right}>{list[i]['score']}点</Col>
                        <Col sm={1} key={'edit' + i} className={common.tableBody + ' ' + common.text_align_center}>
                            <Link href={"/restaurant_interested_regist?n=" + list[i]['name']}>
                                <Button key={'editButton' + i} variant="danger" className={common.buttonSmall}>編集</Button>
                            </Link>
                        </Col>
                        <Col sm={1} key={'delete' + i} className={common.tableBody + ' ' + common.text_align_center}>
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

RestaurantInterestedList = connect((state) => state)(RestaurantInterestedList);
export default RestaurantInterestedList;