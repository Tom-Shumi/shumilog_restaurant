import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import {Button, Row, Col, Modal, Form} from 'react-bootstrap';
import common from "../static/common.css";
import Link from 'next/link';
import Router from 'next/router';
import Pagination from "material-ui-flat-pagination";

class RestaurantInterestedList extends Component{
    constructor(props){
        super(props);
        let db = firebase.database();
        let ref_CategoryList = db.ref('CategoryMst/');
        let categoryList = [];
        // カテゴリマスタ取得
        ref_CategoryList.orderByKey().on('value', (snapshot)=>{
            for(let i in snapshot.val()){
                let categoryMst = snapshot.val()[i];
                categoryList.push(categoryMst);
            }
        })
        this.state = {
            list: [],
            loading: true,
            detailModalShow: false,
            searchModalShow: false,
            searchCreateDateFrom: '',
            searchCreateDateTo: '',
            searchName: '',
            searchPriceFrom: '',
            searchPriceTo: '',
            searchCategory: '',
            searchStation: '',
            no: 0,
            offset: 0,
            parPage: 10,
            categoryList: categoryList
        }
        this.detailModalShow = this.detailModalShow.bind(this);
        this.detailModalClose = this.detailModalClose.bind(this);
        this.searchModalShow = this.searchModalShow.bind(this);
        this.searchModalClose  = this.searchModalClose.bind(this);
        this.onChangeSearchCreateDateFrom  = this.onChangeSearchCreateDateFrom.bind(this);
        this.onChangeSearchCreateDateTo  = this.onChangeSearchCreateDateTo.bind(this);
        this.onChangeSearchName  = this.onChangeSearchName.bind(this);
        this.onChangeSearchPriceFrom  = this.onChangeSearchPriceFrom.bind(this);
        this.onChangeSearchPriceTo  = this.onChangeSearchPriceTo.bind(this);
        this.onChangeSearchCategory  = this.onChangeSearchCategory.bind(this);
        this.onChangeSearchStation  = this.onChangeSearchStation.bind(this);
        this.doSearch  = this.doSearch.bind(this);
        this.doFilter  = this.doFilter.bind(this);
        this.doClear  = this.doClear.bind(this);
        this.doDelete  = this.doDelete.bind(this);
        this.createCategoryList = this.createCategoryList.bind(this);
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

    onChangeSearchCreateDateFrom(e){
        this.setState({searchCreateDateFrom: e.target.value});
    }

    onChangeSearchCreateDateTo(e){
        this.setState({searchCreateDateTo: e.target.value});
    }

    onChangeSearchName(e){
        this.setState({searchName: e.target.value});
    }

    onChangeSearchPriceFrom(e){
        this.setState({searchPriceFrom: e.target.value});
    }

    onChangeSearchPriceTo(e){
        this.setState({searchPriceTo: e.target.value});
    }

    onChangeSearchCategory(e){
        this.setState({searchCategory: e.target.value});
    }

    onChangeSearchStation(e){
        this.setState({searchStation: e.target.value});
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

    // 表示データ取得
    doSearch(){
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
            list = this.doFilter(list);
            this.setState({
                list: list,
                searchModalShow: false
            });
        });
    }

    // 検索_絞り込み
    doFilter(list){
        if (this.state.searchCreateDateFrom != '') {
            let searchCreateDateFrom = this.state.searchCreateDateFrom;
            list = list.filter(function(item, index){
                if (item.createDate >= searchCreateDateFrom) return true;
            });
        }
        if (this.state.searchCreateDateTo != '') {
            let searchCreateDateTo = this.state.searchCreateDateTo;
            list = list.filter(function(item, index){
                if (item.createDate <= searchCreateDateTo) return true;
            });
        }
        if (this.state.searchName != '') {
            let searchName = this.state.searchName;
            list = list.filter(function(item, index){
                if (item.name.includes(searchName)) return true;
            });
        }
        if (this.state.searchPriceFrom != '') {
            let searchPriceFrom = this.state.searchPriceFrom;
            list = list.filter(function(item, index){
                if (item.price >= searchPriceFrom) return true;
            });
        }
        if (this.state.searchPriceTo != '') {
            let searchPriceTo = this.state.searchPriceTo;
            list = list.filter(function(item, index){
                if (item.price <= searchPriceTo) return true;
            });
        }
        if (this.state.searchCategory != '') {
            let searchCategory = this.state.searchCategory;
            list = list.filter(function(item, index){
                if (item.category == searchCategory) return true;
            });
        }
        if (this.state.searchStation != '') {
            let searchStation = this.state.searchStation;
            list = list.filter(function(item, index){
                if (item.station.includes(searchStation)) return true;
            });
        }
        return list;
    }

    // 検索情報クリア
    doClear(){
        this.setState({
            searchCreateDateFrom: '',
            searchCreateDateTo: '',
            searchName: '',
            searchPriceFrom: '',
            searchPriceTo: '',
            searchCategory: '',
            searchStation: ''
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

    //　カテゴリリスト作成
    createCategoryList(){
        let contentCategoryList = [];
        contentCategoryList.push(
            // 初期表示用のダミー
            <option key={"category"} value=''></option>
        )
        for (let i in this.state.categoryList){
            contentCategoryList.push(
                <option key={"category" + i} value={this.state.categoryList[i]['name']}>{this.state.categoryList[i]['name']}</option>
            )
        }
        return (
            <Form.Control as="select" onChange={this.onChangeSearchCategory} value={this.state.searchCategory} >
                {contentCategoryList}
            </Form.Control>
        );
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
                            戻る
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
                    <Form>
                        <Row>
                            <Col xs={4} className={common.form_div + ' ' + common.modal_label}>
                                <strong>登録日</strong>
                            </Col>
                            <Col xs={8} className={common.form_div}>
                                <Form.Control type="text" className={common.date_text + ' ' + common.modal_date} placeholder="YYYY/MM/DD" maxLength='10' value={this.state.searchCreateDateFrom} onChange={this.onChangeSearchCreateDateFrom} />
                                ～<Form.Control type="text" className={common.date_text + ' ' + common.modal_date} placeholder="YYYY/MM/DD" maxLength='10' value={this.state.searchCreateDateTo} onChange={this.onChangeSearchCreateDateTo} />
                            </Col>
                            <hr />
                            <Col xs={4} className={common.form_div + ' ' + common.modal_label}>
                                <strong>レストラン名</strong>
                            </Col>
                            <Col xs={8} className={common.form_div}>
                                <Form.Control type="text" className={common.date_text + ' ' + common.modal_text} value={this.state.searchName} onChange={this.onChangeSearchName} />
                            </Col>
                            <hr />
                            <Col xs={4} className={common.form_div + ' ' + common.modal_label}>
                                <strong>カテゴリ</strong>
                            </Col>
                            <Col xs={8} className={common.form_div}>
                                {this.createCategoryList()}
                            </Col>
                            <hr />
                            <Col xs={4} className={common.form_div + ' ' + common.modal_label}>
                                <strong>最寄り駅</strong>
                            </Col>
                            <Col xs={8} className={common.form_div}>
                                <Form.Control type="text" className={common.date_text + ' ' + common.modal_text} value={this.state.searchStation} onChange={this.onChangeSearchStation} />駅
                            </Col>
                            <hr />
                            <Col xs={4} className={common.form_div + ' ' + common.modal_label}>
                                <strong>金額</strong>
                            </Col>
                            <Col xs={8} className={common.form_div}>
                                <Form.Control type="number" className={common.date_text + ' ' + common.modal_number} min="0" value={this.state.searchPriceFrom} onChange={this.onChangeSearchPriceFrom} />～
                                <Form.Control type="number" className={common.date_text + ' ' + common.modal_number} min="0" value={this.state.searchPriceTo} onChange={this.onChangeSearchPriceTo} />円
                            </Col>
                            <hr />
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={this.doSearch}>
                        検索
                    </Button>
                    <Button variant="outline-secondary" onClick={this.doClear}>
                        クリア
                    </Button>
                    <Button variant="dark" onClick={this.searchModalClose}>
                        戻る
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