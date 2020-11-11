const withSass = require('@zeit/next-sass');
const withCSS = require('@zeit/next-css');
module.exports = withCSS(withSass({
    cssModules: true,
    env: {
        REACT_APP_API_KEY: process.env.REACT_APP_API_KEY,
        REACT_APP_AUTH_DOMAIN: process.env.REACT_APP_AUTH_DOMAIN,
        REACT_APP_DATABASE_URL: process.env.REACT_APP_DATABASE_URL,
        REACT_APP_PROJECT_ID: process.env.REACT_APP_PROJECT_ID,
        REACT_APP_STRAGE_BUCKET: process.env.REACT_APP_STRAGE_BUCKET,
        REACT_APP_MESSAGING_SENDER_ID: process.env.REACT_APP_MESSAGING_SENDER_ID,
        REACT_APP_APP_ID: process.env.REACT_APP_APP_ID,
        REACT_APP_MEASUREMENT_ID: process.env.REACT_APP_MEASUREMENT_ID,
        REACT_APP_SHUMILOG_URL: process.env.REACT_APP_SHUMILOG_URL
      }
}));