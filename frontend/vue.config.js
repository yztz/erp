'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

//定义一个变量，里面用于存储忽略掉的包
let externals={}

//定义一个变量，里面存储cdn引入的路径
let cdn={
  js:[]
}

//判断是否是生产环境，是的话，开始填入忽略包的名字，cdn路径的引入
// if(process.env.ENV==="production"){
  externals={
    "vue":"Vue",
    "element-ui":"ELEMENT",
    "moment": "moment",
    'echarts': 'echarts',
  }
  //cdn路径可以到BootCDN去找对应版本的地址
  cdn={
    js:[
      'https://cdn.bootcdn.net/ajax/libs/vue/2.6.10/vue.js', // vuejs
      'https://unpkg.com/element-ui/lib/index.js', // element
      'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js',
      'https://unpkg.com/browse/echarts@5.5.0/dist/echarts.min.js',
    ]
  }
// }



function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Admin Template' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 9528
const port = process.env.port || process.env.npm_config_port || 8080 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: process.env.PUBLIC_PATH || '/',
  // outputDir: 'dist',
  outputDir: 'dist',
  assetsDir: '',

  // lintOnSave: process.env.NODE_ENV === 'development',
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    host: '0.0.0.0',
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/uploads': {
        target: process.env.VUE_APP_API_BASE_URL
      },
      '/api/upload': {
        target: process.env.VUE_APP_API_BASE_URL
      },
      // '/socket.io':{
      //   target: "http://localhost:8088"
      // }
    }

  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    // plugins: [
    //   new BundleAnalyzerPlugin()
    // ],
    resolve: {
      alias: {
        '@': resolve('src'),
      },
      extensions: ['*', '.mjs', '.js', '.vue', '.json']
    },
    externals
  },
  chainWebpack(config) {
    config.plugin('html').tap(args => {
      args[0].cdn = cdn
      return args
    })
    config.module // fixes https://github.com/graphql/graphql-js/issues/1272
      .rule('mjs$')
      .test(/\.mjs$/)
      .include
      .add(/node_modules/)
      .end()
      .type('javascript/auto');
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
