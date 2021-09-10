const fs = require('fs');

const devServerConfig = () => process.env.NODE_ENV === 'production'
  ? {}
  : {
    host: 'dev.lan',
    https: {
      key: fs.readFileSync('../certs/server.key'),
      cert: fs.readFileSync('../certs/server.cer')
    },
    proxy: {
      '^/api/+.': {
        target: 'https://dev.lan:3000'
      }
    }
  };

module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },

  devServer: devServerConfig(),

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
};
