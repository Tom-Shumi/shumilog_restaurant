import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import {Container, Row, Col, Button, Form} from 'react-bootstrap';
import common from "../static/common.css";
import restaurant_regist_css from "../static/restaurant_regist.css";
import Link from 'next/link';
import Router from 'next/router';


class RestaurantRegist extends Component{
    constructor(props){
        super(props);
        // 現在日時取得
        let now = new Date();

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
            visitYear: now.getFullYear(),
            visitMonth: now.getMonth() + 1,
            visitDay: now.getDate(),
            category: '',
            review: '',
            photo: ''
        }
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeCategory = this.onChangeCategory.bind(this);
        this.onChangeScore = this.onChangeScore.bind(this);
        this.onChangeVisitYear = this.onChangeVisitYear.bind(this);
        this.onChangeVisitMonth = this.onChangeVisitMonth.bind(this);
        this.onChangeVisitDay = this.onChangeVisitDay.bind(this);
        this.onChangeReview = this.onChangeReview.bind(this);
        this.onChangePhoto = this.onChangePhoto.bind(this);
        this.onChangePrice = this.onChangePrice.bind(this);
        this.doRegist = this.doRegist.bind(this);
        this.doClear = this.doClear.bind(this);
    }

    componentDidMount() {
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

    onChangeVisitYear(e){
        this.setState({visitYear:e.target.value});
    }

    onChangeVisitMonth(e){
        this.setState({visitMonth:e.target.value});
    }

    onChangeVisitDay(e){
        this.setState({visitDay:e.target.value});
    }

    onChangeReview(e){
        this.setState({review:e.target.value});
    }

    onChangePhoto(e){
        this.setState({photo:e.target.value});
    }

    onChangePrice(e){
        this.setState({price:e.target.value});
    }
    

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

    createCategoryList(){
        let contentCategoryList = [];
        contentCategoryList.push(
            <option key={"category"} value='00'></option>
        )
        for (let i in this.state.categoryList){
            contentCategoryList.push(
                <option key={"category" + i} value={this.state.categoryList[i]['name']}>{this.state.categoryList[i]['name']}</option>
            )
        }
        return (
            <Form.Control as="select" onChange={this.onChangeCategory} >
                {contentCategoryList}
            </Form.Control>
        );
    }
    
    doRegist(e){
        let data = {
            name: this.state.name,
            category: this.state.category,
            visitDate: this.state.visitYear + '/' + this.state.visitMonth + '/' + this.state.visitDay,
            price: this.state.price,
            score: this.state.score,
            review: this.state.review
        }
        let db = firebase.database();
        let ref = db.ref('Review/' + this.props.username);
        ref.push(data);
        this.props.dispatch({
            type: 'UPDATE_INFO',
            value: {
                login: true,
                username: this.props.username,
                data: [],
                actionURL: '/restaurant_list',
                message: '登録が完了しました。'
            }
        });
        Router.push('/restaurant_info');
    }

    doClear(e){

    }

    render(){
        return (
            <div className={common.form_frame}>
                <Container>
                    <Row>
                        <Form>
                            <Col sm={4} className={common.form_div}>
                                <strong>レストラン名：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div + ' ' + restaurant_regist_css.form_div_padding1}>
                                <Form.Control type="text" size="30" value={this.state.name} onChange={this.onChangeName} />
                            </Col>
                            <Col sm={4} className={common.form_div}>
                                <strong>ジャンル：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div + ' ' + restaurant_regist_css.form_div_padding2}>
                                {this.createCategoryList()}
                            </Col>
                            <Col sm={4} className={common.form_div}>
                                <strong>来店日：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div + ' ' + restaurant_regist_css.form_div_padding3}>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Control type="number" value={this.state.visitYear} onChange={this.onChangeVisitYear} className={common.date_text} />年
                                    </Col>
                                    <Col sm={3}>
                                        <Form.Control type="number" value={this.state.visitMonth} onChange={this.onChangeVisitMonth} className={common.date_text} />月
                                    </Col>
                                    <Col sm={3}>
                                        <Form.Control type="number" value={this.state.visitDay} onChange={this.onChangeVisitDay} className={common.date_text} />日
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={4} className={common.form_div}>
                                <strong>金額：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div + ' ' + restaurant_regist_css.form_div_padding4}>
                                <Col sm={4}>
                                        <Form.Control type="number" value={this.state.price} onChange={this.onChangePrice} className={common.price_text} />円
                                </Col>
                            </Col>
                            <Col sm={4} className={common.form_div}>
                                <strong>点数：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div + ' ' + restaurant_regist_css.form_div_padding5}>
                                {this.createEvaluation()}
                            </Col>
                            <Col sm={4} className={common.form_div}>
                                <strong>レビュー：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div + ' ' + restaurant_regist_css.form_div_padding6}>
                                <Form.Control as="textarea" rows={4} cols={40} className={common.form_textarea} onChange={this.onChangeReview} />
                            </Col>
                            <Col sm={4} className={common.form_div}>
                                <strong>画像：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div + ' ' + restaurant_regist_css.form_div_padding7}>
                                <Form.File id="photo" onChange={this.onChangePhoto} />
                            </Col>
                            <Col sm={12} className={common.form_buttom_div}>
                                <Button key="regist" variant="warning" className={common.buttonMiddle}  onClick={this.doRegist}>登録</Button>
                                <Button key="clear" variant="outline-secondary" className={common.buttonMiddle}  onClick={this.doClear}>クリア</Button>
                            </Col>
                        </Form>
                    </Row>
                </Container>
            </div>
        );
    }
}

RestaurantRegist = connect((state) => state)(RestaurantRegist);
export default RestaurantRegist;