const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};

const configVar = Object.assign({}, config, {
  name: "configVar",
  entry: './src/index.ts',
  output: {
    filename: 'superclustergmapsadapter.js',
    path: path.resolve(__dirname, 'lib'),
    libraryTarget: 'var',
    library: 'SuperClusterAdapter',
    libraryExport: 'Loader',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
          { from: 'src/images', to: 'images' }
      ]
    })
  ],
});

const configUmd = Object.assign({}, config, {
  name: "configUmd",
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    libraryTarget: 'umd',
    library: 'SuperClusterAdapter',
    libraryExport: 'Loader',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
          { from: 'src/images', to: 'images' }
      ]
    })
  ],
});

module.exports = [
  configUmd
];
