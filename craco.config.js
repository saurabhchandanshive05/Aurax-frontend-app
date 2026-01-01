module.exports = {
  devServer: {
    // Suppress webpack-dev-server deprecation warnings by using the new API
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      return middlewares;
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Disable react-refresh in production
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          plugin => plugin.constructor.name !== 'ReactRefreshPlugin'
        );
      }
      return webpackConfig;
    }
  }
};
