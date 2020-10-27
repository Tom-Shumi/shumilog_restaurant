import Layout from '../components/Layout';
import firebase from 'firebase';

const restaurant_error = () => (
    <Layout header="Error" title="システムエラー" backURL="#" backButtonDisplay="0">
        <div>
            予期しないエラーが発生しました。
        </div>
    </Layout>
);

export default restaurant_error;