const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const uieditorName = 'vue-uieditor';
const publicPath = './';
const filename = '[name].[hash].js';
const assetPath = path.join(uieditorName, './assets').replace(/\\/g, '/');
const cssPath = path.join(assetPath, 'css').replace(/\\/g, '/');

// vue.config.js
module.exports = {
  publicPath,
  lintOnSave: true,
  outputDir: path.resolve(__dirname, './lib'),
  assetsDir: assetPath,
  runtimeCompiler: true,
  parallel: true,
  productionSourceMap: false,
  css: {
    extract: {
      publicPath: cssPath,
      filename: path.join(cssPath, '[name].css'),
      chunkFilename: path.join(cssPath, '[name].[contenthash:8].css')
    },
    loaderOptions: {
      less: {
        // localIdentName: '[name]_[local]'
      },
      css: {
        // localIdentName: '[name]_[local]'
      }
    }
  },
  configureWebpack: config => {
    // config.output.chunkFilename = '[name].[hash].chunk.js';
    if (process.env.NODE_ENV === 'production') {
      Object.assign(config.output, {
        filename: 'index.js',
        chunkFilename: `./${uieditorName}/${filename}`,
        libraryTarget: 'umd',
        library: 'VueUieditor',
        umdNamedDefine: true
      });
      // console.log('config.output AA', { ...config.output });
    }
  },
  chainWebpack: config => {
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);

    // // 不编译 layui
    config.module
      .rule('js')
      .test(/\.jsx?$/)
      .exclude
      .add(path.resolve(__dirname, './src/vue-uieditor/layui'))
      .end();


      
  config.plugin('copy-assets').use(CopyWebpackPlugin, [
    [{
      from: './src/vue-uieditor/assets/',
      to: './vue-uieditor/assets/'
    }]
  ]);

    if (process.env.NODE_ENV === 'production') {
      // 为生产环境修改配置...

      config.entry('app').clear();
      const entryFile = path.resolve(__dirname, `./src/${uieditorName}/index.ts`);
      config.entry('app').add(entryFile).end();

      const tsConfigFile = path.resolve(__dirname, './tsconfig.json');
      const declarationDir = path.resolve(__dirname, './lib/@types-build');

      //pack 输出 types
      config.module.rule('ts')
        .use('ts-loader')
        .loader('ts-loader')
        .tap(options => {
          Object.assign(options, {
            context: __dirname,
            configFile: tsConfigFile,
            transpileOnly: false,
            happyPackMode: false,
            compilerOptions: {
              "declaration": true,
              "declarationDir": declarationDir
            }
          });
          return options;
        });
      config.module.rule('ts').uses.delete('thread-loader');
      config.module.rule('ts').uses.delete('cache-loader');


      config.plugins.delete('html');
      config.plugins.delete('preload');
      config.plugins.delete('prefetch');
      config.plugins.delete('copy');

    } else {
      // 为开发环境修改配置...


      // config.plugins.delete('html');
      // config.plugins.delete('copy');

      const uieditorPath = path.resolve(__dirname, `./node_modules/${uieditorName}`);
      const uieditorFile = path.resolve(uieditorPath, './index.js');
      if (fs.existsSync(uieditorFile)) {
        config.plugin('copy-vue-uieditor').use(CopyWebpackPlugin, [
          [{
            from: path.resolve(uieditorPath, `./${uieditorName}`),
            to: `./${uieditorName}`
          }]
        ]);
      }

    }

  }
}