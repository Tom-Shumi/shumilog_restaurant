import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import {Container, Row, Col, Button, Form, Image} from 'react-bootstrap';
import common from "../static/common.css";
import Link from 'next/link';
import Router from 'next/router';


class RestaurantInterestedRegist extends Component{
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
            categoryList: categoryList,
            name: '',
            price: '',
            station: '',
            category: '',
            updateFlg: 0
        }

        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeCategory = this.onChangeCategory.bind(this);
        this.onChangeStation = this.onChangeStation.bind(this);
        this.onChangePrice = this.onChangePrice.bind(this);
        this.createCategoryList = this.createCategoryList.bind(this);
        this.doRegist = this.doRegist.bind(this);
        this.doClear = this.doClear.bind(this);
    }

    componentDidMount() {
        // 未ログインの場合はエラー画面遷移
        if (this.props.login == false) {
            Router.push('/restaurant_error');
        }
        // レビュー編集時
        if (Router.query.n != undefined) {
            // 元データ取得
            this.getTargetData();
            this.setState({updateFlg: 1});
        }
    }

    // 編集時用の初期表示データ取得
    getTargetData(){
        let name = this.props.username;
        let db = firebase.database();
        let ref = db.ref('Interested/');    
        ref.orderByKey().equalTo(name).on('value', (snapshot)=>{
            let target = snapshot.val() || null;
            if (target) {
                let d = target[name];
                let arr = [];
                //　一時的に全件取得
                for(let i in d){
                    arr.push(d[i]);
                }
                
                // 編集用のデータのみに絞り込み
                let data = arr.filter(function(item, index){
                    if (item.name == Router.query.n) return true;
                });
    
                if (data && data.length != 0) {
                    this.setState({
                        name: data[0].name,
                        price: data[0].price,
                        station: data[0].station,
                        category: data[0].category
                    });    
                }
            }
        });
    }

    onChangeName(e){
        this.setState({name:e.target.value});
    }

    onChangeCategory(e){
        this.setState({category:e.target.value});
    }

    onChangePrice(e){
        this.setState({price:e.target.value});
    }
    
    onChangeStation(e){
        this.setState({station:e.target.value});
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
            <Form.Control as="select" onChange={this.onChangeCategory} value={this.state.category} >
                {contentCategoryList}
            </Form.Control>
        );
    }

    // 登録
    doRegist(e){
        if (confirm("登録します。よろしいですか？")){
            let username = this.props.username;
            let now = new Date();
            let nowStr = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate()
            // 登録用データ作成
            let data = {
                name: this.state.name,
                category: this.state.category,
                price: this.state.price,
                station: this.state.station,
                createDate: nowStr
            }
            let db = firebase.database();
            // 登録の場合
            if (this.state.updateFlg == 0){
                let ref = db.ref('Interested/' + username);
                ref.push(data);
            // 更新の場合
            } else {
                db.ref('Interested/' + username).orderByChild("name").equalTo(Router.query.n).on('value', (snapshot)=>{
                    let target = snapshot.val() || null;
                    if (target) {
                        let key = Object.keys(target)[0];
                        let update = db.ref('Interested/' + username + '/' + key);
                        update.set(data);  
                    }
                });
            }

            // 共通メッセージ画面遷移
            this.props.dispatch({
                type: 'UPDATE_INFO',
                value: {
                    login: true,
                    username: this.props.username,
                    data: [],
                    actionURL: '/restaurant_interested_list',
                    message: '登録が完了しました。'
                }
            });
            Router.push('/restaurant_info');
        }
    }

    // 入力情報クリア
    doClear(e){
        let now = new Date();
        this.setState({
            name: '',
            price: '',
            station: '',
            category: ''
        });
    }

    // 入力チェック
    validation(){
        let error = false;
        let errorMsg = '';
        if (this.state.name == '') {
            error = true;
            errorMsg = 'レストラン名を入力してください。';
        }
        if (!error && this.state.category == '') {
            error = true;
            errorMsg = 'カテゴリを選択してください。';
        }
        if (!error && this.state.station == '') {
            error = true;
            errorMsg = '最寄り駅を入力してください。';
        }
        if (!error && this.state.price == '') {
            error = true;
            errorMsg = '金額を入力してください。';
        }
        return errorMsg;
    }

    render(){
        let error = true;
        let errorMsg = this.validation();
        if (errorMsg == '') {
            error = false;
        }
        return (
            <div className={common.form_frame}>
                <Container>
                    <Row>
                        <Form>
                            {error && <p className={common.error_msg}>{errorMsg}</p>}
                            <Col sm={4} className={common.form_div}>
                                <strong>レストラン名：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div}>
                                <Form.Control type="text" size="30" value={this.state.name} onChange={this.onChangeName} />
                            </Col>
                            <hr />
                            <Col sm={4} className={common.form_div}>
                                <strong>カテゴリ：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div}>
                                {this.createCategoryList()}
                            </Col>
                            <hr />
                            <Col sm={4} className={common.form_div}>
                                <strong>最寄り駅：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div}>
                                <Col sm={4}>
                                    <Form.Control type="text" size="30" value={this.state.station} onChange={this.onChangeStation} className={common.suffix_text} /> 駅
                                </Col>
                            </Col>
                            <hr />
                            <Col sm={4} className={common.form_div}>
                                <strong>金額：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div}>
                                <Col sm={4}>
                                        <Form.Control type="number" value={this.state.price} onChange={this.onChangePrice} className={common.suffix_text} min="0" />円
                                </Col>
                            </Col>
                            <hr />
                            <Col sm={12} className={common.text_align_center}>
                                <Button key="regist" variant="warning" className={common.buttonMiddle}  onClick={this.doRegist}  disabled={error} >登録</Button>
                                <Button key="clear" variant="outline-secondary" className={common.buttonMiddle}  onClick={this.doClear}>クリア</Button>
                            </Col>
                        </Form>
                    </Row>
                </Container>
            </div>
        );
    }
}

RestaurantInterestedRegist = connect((state) => state)(RestaurantInterestedRegist);
export default RestaurantInterestedRegist;