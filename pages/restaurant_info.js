import Layout from '../components/Layout';
import RestaurantInfo from '../components/RestaurantInfo';
import firebase from 'firebase';

const restaurant_info = () => (
    <Layout header="Info" title="共通メッセージ" backURL='#' backButtonDisplay="0">
        <div>
            <RestaurantInfo />
        </div>
    </Layout>
);

export default restaurant_info;
