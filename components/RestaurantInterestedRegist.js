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
            score: 1,
            price: '',
            station: '',
            category: '',
            updateFlg: 0
        }

        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeCategory = this.onChangeCategory.bind(this);
        this.onChangeScore = this.onChangeScore.bind(this);
        this.onChangeStation = this.onChangeStation.bind(this);
        this.onChangePrice = this.onChangePrice.bind(this);
        this.createEvaluation = this.createEvaluation.bind(this);
        this.createCategoryList = this.createCategoryList.bind(this);
        this.doRegist = this.doRegist.bind(this);
        this.doClear = this.doClear.bind(this);
    }

    componentDidMount() {
        // 未ログインの場合はエラー画面遷移
        if (this.props.login == false) {
            Router.push('/restaurant_error');
        }
    }

    onChangeName(e){
        this.setState({name:e.target.value});
    }

    onChangeCategory(e){
        this.setState({category:e.target.value});
    }

    onChangeScore(e){
        this.setState({score:e.target.value});
    }

    onChangePrice(e){
        this.setState({price:e.target.value});
    }
    
    onChangeStation(e){
        this.setState({station:e.target.value});
    }

    //　点数の入力部作成
    createEvaluation(){
        let stars = [];
        for (let i = 5; i >= 1; i--) {
            let check = false;
            if (this.state.score == i) {
                check = true;
            }
            stars.push(
                <input key={"score_radio" + i} type="radio" id={"score" + i} name="score" value={i} checked={check} onChange={this.onChangeScore} />
            )
            stars.push(
                <label key={"score_label" + i} htmlFor={"score" + i} className={common.evaluation_label}><span className={common.text}>{i}</span>★</label>
            )
        }
        return (
            <div key={"score_div"} className={common.evaluation + ' ' + common.evaluation_active}>
                {stars}
            </div>
        );
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

    // レビュー登録
    doRegist(e){
        if (confirm("登録します。よろしいですか？")){
            let username = this.props.username;

            // レビュー登録用データ作成
            let data = {
                name: this.state.name,
                category: this.state.category,
                price: this.state.price,
                station: this.state.station,
                score: this.state.score
            }
            let db = firebase.database();
            // 登録の場合
            if (this.state.updateFlg == 0){
                let ref = db.ref('Interested/' + username);
                ref.push(data);    

            // 更新の場合
            } else {

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
            score: 1,
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
                            <Col sm={4} className={common.form_div}>
                                <strong>点数：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div}>
                                {this.createEvaluation()}
                            </Col>
                            <hr />
                            <Col sm={12} className={common.form_buttom_div}>
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