var config = {
  entry: './src/index.js',
  output: {
    filename: './public/index.web.js',
    library: 'Init',
    libraryTarget: 'var'
  },
  module:{
    loaders: [
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
    ]
  }
};

module.exports = config;
