import { withRouter } from 'next/router'
import Layout from '../components/Layout';
import RestaurantList from '../components/RestaurantList';
import firebase from 'firebase';

const restaurant_list = withRouter(props => (
    <Layout header="RestaurantList" title="レストラン レビュー 一覧" backURL={process.env.REACT_APP_SHUMILOG_URL + "/menu/"} backButtonDisplay="1">
        <div>
            <RestaurantList requestId={props.router.query.i} />
        </div>
    </Layout>
));

export default restaurant_list;