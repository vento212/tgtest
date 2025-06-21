module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Отключаем source map warnings
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Module Warning/,
        /source-map-loader/,
        /@tonconnect/
      ];
      
      // Отключаем source maps для node_modules
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });
      
      return webpackConfig;
    },
  },
}; 