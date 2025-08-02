const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/extension.js',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.js']
  },
  devtool: 'nosources-source-map'
};