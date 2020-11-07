import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase';
import {Container, Row, Col, Button, Form, Image} from 'react-bootstrap';
import common from "../static/common.css";
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
            photo: '',
            stragePhoto: '',
            photoURL: '',
            updateFlg: 0
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
        this.createEvaluation = this.createEvaluation.bind(this);
        this.createCategoryList = this.createCategoryList.bind(this);
        this.createPhoto = this.createPhoto.bind(this);
        this.doRegist = this.doRegist.bind(this);
        this.doClear = this.doClear.bind(this);
        this.doImageClear = this.doImageClear.bind(this);
        this.validation = this.validation.bind(this);
        this.getTargetData = this.getTargetData.bind(this);
    }

    componentDidMount() {
        // 未ログインの場合はエラー画面遷移
        if (this.props.login == false) {
            Router.push('/restaurant_error');
        }

        // レビュー編集時
        if (Router.query.n != undefined && Router.query.d != undefined) {
            // 元データ取得
            this.getTargetData();
            this.setState({updateFlg: 1});
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
        this.setState({photo:e.target.files[0]});
    }

    onChangePrice(e){
        this.setState({price:e.target.value});
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

    // 画像表示部
    createPhoto(){
        let contentPhoto = [];
        if (this.state.stragePhoto == '') {
            contentPhoto.push(<Form.File key='photo_input' id="photo" filename={this.state.photo} onChange={this.onChangePhoto} />);
        } else {
            contentPhoto.push(<Image key='photo' src={this.state.photoURL}/>);
            contentPhoto.push(<Button key="photo_clear" variant="outline-secondary" className={common.buttonMiddle + ' ' + common.vertical_bottom}  onClick={this.doImageClear} >画像クリア</Button>);
        }
        return contentPhoto;
    }
    
    // レビュー登録
    doRegist(e){
        if (confirm("レビューを登録します。よろしいですか？")){
            let username = this.props.username;
            let photoName = '';
            
            // 画像が設定されている場合は登録
            if (this.state.photo != '') {
                let extension = this.state.photo.name.split('.')[1];
                photoName = Math.random().toString(36).substring(2) + '.' + extension;
                let storageRef = firebase.storage().ref('/review_image/' + photoName);
                storageRef.put(this.state.photo);
            };
    
            // レビュー登録用データ作成
            let date = this.state.visitYear + '/' + this.state.visitMonth + '/' + this.state.visitDay;
            let data = {
                name: this.state.name,
                category: this.state.category,
                visitDate: date,
                price: this.state.price,
                score: this.state.score,
                review: this.state.review,
                photo: photoName,
                key: this.state.name + '_' + date
            }
            let db = firebase.database();
            // 登録の場合
            if (this.state.updateFlg == 0){
                let ref = db.ref('Reviews/' + username);
                ref.push(data);    

            // 更新の場合
            } else {
                db.ref('Reviews/' + username).orderByChild("key").equalTo(Router.query.n + '_' + Router.query.d).on('value', (snapshot)=>{
                    let target = snapshot.val() || null;
                    if (target) {
                        let key = Object.keys(target)[0];
                        let update = db.ref('Reviews/' + username + '/' + key);
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
                    actionURL: '/restaurant_list',
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
            visitYear: now.getFullYear(),
            visitMonth: now.getMonth() + 1,
            visitDay: now.getDate(),
            category: '',
            review: '',
            photo: '',
            stragePhoto: ''
        });
    }

    // 画像のクリア
    doImageClear(){
        this.setState({
            photo: '',
            stragePhoto: ''
        });
    }

    // 編集時用の初期表示データ取得
    getTargetData(){
        let name = this.props.username;
        let db = firebase.database();
        let ref = db.ref('Reviews/');    
        ref.orderByKey().equalTo(name).on('value', (snapshot)=>{
            let target = snapshot.val() || null;
            if (target) {
                let d = target[name];
                let reviewArr = [];
                //　一時的に全件取得
                for(let i in d){
                    reviewArr.push(d[i]);
                }
                
                // 編集用のデータのみに絞り込み
                let review = reviewArr.filter(function(item, index){
                    if (item.name == Router.query.n) return true;
                }).filter(function(item, index){
                    if (item.visitDate == Router.query.d) return true;
                });
    
                if (review && review.length != 0) {
                    let date = new Date(Date.parse(review[0].visitDate));
                    // 画像取得
                    if (review[0].photo != '') {
                        let storageRef = firebase.storage().ref('/review_image/' + review[0].photo);
                        storageRef.getDownloadURL().then((url) => {
                            this.setState({ photoURL: url + '/170x170' });
                        });
                    }
        
                    this.setState({
                        name: review[0].name,
                        score: review[0].score,
                        price: review[0].price,
                        visitYear: date.getFullYear(),
                        visitMonth: date.getMonth() + 1,
                        visitDay: date.getDate(),
                        category: review[0].category,
                        review: review[0].review,
                        photo: review[0].photo,
                        stragePhoto: review[0].photo
                    });    
                }
            }
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
        if (!error && this.state.visitYear == '') {
            error = true;
            errorMsg = '来店日[年]を入力してください。';
        }
        if (!error && this.state.visitMonth == '') {
            error = true;
            errorMsg = '来店日[月]を入力してください。';
        }
        if (!error && this.state.visitDay == '') {
            error = true;
            errorMsg = '来店日[日]を入力してください。';
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
                                <strong>来店日：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div}>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Control type="number" value={this.state.visitYear} onChange={this.onChangeVisitYear} className={common.date_text} min="1900" />年
                                    </Col>
                                    <Col sm={3}>
                                        <Form.Control type="number" value={this.state.visitMonth} onChange={this.onChangeVisitMonth} className={common.date_text} min="1" max="12" />月
                                    </Col>
                                    <Col sm={3}>
                                        <Form.Control type="number" value={this.state.visitDay} onChange={this.onChangeVisitDay} className={common.date_text} min="1" max="31" />日
                                    </Col>
                                </Row>
                            </Col>
                            <hr />
                            <Col sm={4} className={common.form_div}>
                                <strong>金額：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div}>
                                <Col sm={4}>
                                        <Form.Control type="number" value={this.state.price} onChange={this.onChangePrice} className={common.price_text} min="0" />円
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
                            <Col sm={4} className={common.form_div}>
                                <strong>レビュー：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div}>
                                <Form.Control as="textarea" value={this.state.review} rows={4} cols={40} className={common.form_textarea} onChange={this.onChangeReview} />
                            </Col>
                            <hr />
                            <Col sm={4} className={common.form_div}>
                                <strong>画像：</strong>
                            </Col>
                            <Col sm={8} className={common.form_div + ' ' + common.vertical_bottom}>
                                {this.createPhoto()}
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

RestaurantRegist = connect((state) => state)(RestaurantRegist);
export default RestaurantRegist;