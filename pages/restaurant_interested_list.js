import Layout from '../components/Layout';
import RestaurantInterestedList from '../components/RestaurantInterestedList';
import firebase from 'firebase';

const restaurant_interested_list = () => (
    <Layout header="RestaurantInterestedList" title="気になる レストラン 一覧" backURL="/restaurant_list" backButtonDisplay="1">
        <div>
            <RestaurantInterestedList />
        </div>
    </Layout>
);

export default restaurant_interested_list;