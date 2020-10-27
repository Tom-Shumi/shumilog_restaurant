import Layout from '../components/Layout';
import RestaurantRegist from '../components/RestaurantRegist';
import firebase from 'firebase';

const restaurant_regist = () => (
    <Layout header="RestaurantRegist" title="レストラン レビュー 登録" backURL="/restaurant_list" backButtonDisplay="1">
        <div>
            <RestaurantRegist />
        </div>
    </Layout>
);

export default restaurant_regist;