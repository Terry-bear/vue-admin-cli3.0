const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
console.log('当前环境:', process.env.NODE_ENV)
console.log('当前名称:', process.argv[4])
process.env.VUE_APP_TARGET_PROJECT = process.argv[4]
module.exports = {
  // 选项...outputDir => output.path
  // outputDir: path.resolve(__dirname, '../dist/index.html'),
  pages: {
    index: {
      // page 的入口
      entry: 'src/main.ts',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Index Page',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    newPages: {
      entry: 'src/projects/multi-pages/newPages/newPages.ts',
      template: 'public/newPages.html',
      filename: 'newPages.html',
      title: 'newPages Page',
      chunks: ['chunk-vendors', 'chunk-common', 'newPages']
    }
  },
  configureWebpack: {
    plugins: [new BundleAnalyzerPlugin({
      //  可以是`server`，`static`或`disabled`。
      //  在`server`模式下，分析器将启动HTTP服务器来显示软件包报告。
      //  在“静态”模式下，会生成带有报告的单个HTML文件。
      //  在`disabled`模式下，你可以使用这个插件来将`generateStatsFile`设置为`true`来生成Webpack Stats JSON文件。
      analyzerMode: 'server',
      //  将在“服务器”模式下使用的主机启动HTTP服务器。
      analyzerHost: '127.0.0.1',
      //  将在“服务器”模式下使用的端口启动HTTP服务器。
      analyzerPort: 7260,
      //  路径捆绑，将在`static`模式下生成的报告文件。
      //  相对于捆绑输出目录。
      reportFilename: 'report.html',
      //  模块大小默认显示在报告中。
      //  应该是`stat`，`parsed`或者`gzip`中的一个。
      //  有关更多信息，请参见“定义”一节。
      defaultSizes: 'parsed',
      //  在默认浏览器中自动打开报告
      openAnalyzer: false,
      //  如果为true，则Webpack Stats JSON文件将在bundle输出目录中生成
      generateStatsFile: false,
      //  如果`generateStatsFile`为`true`，将会生成Webpack Stats JSON文件的名字。
      //  相对于捆绑输出目录。
      statsFilename: 'stats.json',
      //  stats.toJson（）方法的选项。
      //  例如，您可以使用`source：false`选项排除统计文件中模块的来源。
      //  在这里查看更多选项：https：  //github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
      statsOptions: null,
      logLevel: 'info' // 日志级别。可以是'信息'，'警告'，'错误'或'沉默'。
    })],
    // 高德地图原生SDK
    externals: {
      'vue':'Vue',
      AMap: 'AMap',
      AMapUI: 'AMapUI',
      aliOss: 'OSS',
      elementUI: 'ELEMENT'
    }
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('mixin', path.resolve(__dirname, 'src/projects/menu/mixin'))
      .set('api', path.resolve(__dirname, 'src/projects/menu/graphql'))

    config.module
      .rule('graphql')
      .test(/\.graphql$/)
      .use('graphql-tag/loader')
      .loader('graphql-tag/loader')
      .end()

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .test(/\.svg$/)
      .include.add(path.resolve(__dirname, 'src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .tap(options => {
        // change options setting
        options = {
          symbolId: 'icon-[name]'
        }
        return options
      })
    const svgDefRule = config.module.rule('extsvg')
    // todo vue-img 插件的解决方法
    svgDefRule
      .test(/iconfont\.svg$/)
      .use('file-loader')
      .loader('file-loader')
      .tap(options => {
        options = {
          limit: 10000,
          name: 'img/[name].[hash:8].[ext]'
        }
        return options
      })
  }
}
