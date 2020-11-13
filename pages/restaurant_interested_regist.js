import Layout from '../components/Layout';
import RestaurantInterestedRegist from '../components/RestaurantInterestedRegist';
import firebase from 'firebase';

const restaurant_interested_regist = () => (
    <Layout header="RestaurantInterestedRegist" title="気になる レストラン 登録" backURL="/restaurant_interested_list" backButtonDisplay="1">
        <div>
            <RestaurantInterestedRegist />
        </div>
    </Layout>
);

export default restaurant_interested_regist;