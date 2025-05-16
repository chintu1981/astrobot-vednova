const webpack = require('webpack');

module.exports = {
  // Existing config (if any)
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  // Fix for Node.js > v17 OpenSSL breaking change
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
  },
  // Override default hash function
  output: {
    hashFunction: 'sha256'
  }
};
