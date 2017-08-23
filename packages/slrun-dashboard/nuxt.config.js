const path = require('path')

module.exports = {
  head: {
    link: [
      { rel: 'stylesheet', type: 'text/css', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  build: {
    vendor: ['axios', 'chart.js', 'filesize', 'moment', 'vue-chartjs', 'vuetify', '~/plugins/apiClient'],
    dll: true,
    extractCSS: true,
    extend (config) {
      const packageContainerPath = path.join(__dirname, '../../node_modules')
      config.resolve.modules.push(packageContainerPath)
      config.resolveLoader.modules.push(packageContainerPath)
    }
  },
  plugins: ['~/plugins/vuetify'],
  css: ['~/assets/app.styl']
}
