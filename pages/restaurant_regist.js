import { withRouter } from 'next/router'
import Layout from '../components/Layout';
import RestaurantRegist from '../components/RestaurantRegist';
import firebase from 'firebase';

const restaurant_regist = withRouter(props => (
    <Layout header="RestaurantRegist" title="レストラン レビュー 登録" backURL={props.router.query.t == '1' ? "/restaurant_list": "/restaurant_interested_list"} backButtonDisplay="1">
        <div>
            <RestaurantRegist />
        </div>
    </Layout>
));

export default restaurant_regist;