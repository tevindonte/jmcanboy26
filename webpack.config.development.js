const path = require('path')
const { merge } = require('webpack-merge')
const CopyPlugin = require('copy-webpack-plugin')

const config = require('./webpack.config')

module.exports = merge(config, {
  mode: 'development',

  devtool: 'inline-source-map',

  devServer: {
    writeToDisk: true
  },

  output: {
    path: path.join(__dirname, 'InfiniteCircularGallery')
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'infinite-canvas/dist', to: 'infinite-canvas' },
        { from: 'marquee-section/dist', to: 'marquee-section' },
        { from: 'r3f-carousel/dist', to: 'r3f-carousel' },
        { from: 'infinite-img-gallery/dist', to: 'infinite-img-gallery' },
        { from: 'section-9-widen/dist', to: 'section-9-widen' },
        { from: path.join(__dirname, '..', 'portfolio', 'public', 'widen_1220x0.min.ply'), to: 'section-9-widen/widen_1220x0.min.ply', noErrorOnMissing: true },
        { from: 'section-9-circling', to: 'section-9-circling' },
        { from: 'section-5-glb/dist', to: 'section-5-glb' },
        { from: 'section-6-aboutme', to: 'section-6-aboutme' },
        { from: 'aboutmepick', to: 'section-6-aboutme/images' },
        { from: 'ffsection1/aboutme.jpg', to: 'section-6-aboutme/images/aboutme.jpg' },
        { from: 'ffsection1/IMG_8416.jpg', to: 'section-6-aboutme/images/IMG_8416.jpg', noErrorOnMissing: true },
        { from: 'ffsection1/smiley_overlay.png', to: 'section-6-aboutme/images/smiley_overlay.png', noErrorOnMissing: true },
        { from: 'aboutmepick/over.png', to: 'section-6-aboutme/images/smiley_overlay.png', noErrorOnMissing: true },
        { from: 'section-7-projects', to: 'section-7-projects' },
        { from: 'logos/getmexpblack.jpg', to: 'section-7-projects/images/getmexpblack.jpg' },
        { from: 'logos/flightgrabblack.PNG', to: 'section-7-projects/images/flightgrabblack.PNG' },
        { from: 'logos/Citibike.JPG', to: 'section-7-projects/images/Citibike.JPG' },
        { from: 'logos/Sector types.png', to: 'section-7-projects/images/Sector_types.png' },
        { from: 'logos/mental health.jpg', to: 'section-7-projects/images/mental_health.jpg' },
        { from: 'section-8-grid', to: 'section-8-grid' },
        { from: 'section-10-motion-grid', to: 'section-10-motion-grid' },
        { from: 'motion', to: 'section-10-motion-grid/img' },
        { from: 'section-8-credentials', to: 'section-8-credentials' },
        { from: 'credentials', to: 'section-8-credentials/images' },
        { from: 'credentials/AWS machine Learning Specialty.png', to: 'section-8-credentials/images/aws_ml_cert.png' },
        { from: 'credentials/Masters in AI ML.jpg', to: 'section-8-credentials/images/masters_aiml.jpg', noErrorOnMissing: true },
        { from: 'credentials/Bachelors in Math.jpg', to: 'section-8-credentials/images/bachelors_math.jpg', noErrorOnMissing: true },
        { from: 'credentials/PHd Coming soon.png', to: 'section-8-credentials/images/phd_placeholder.png' },
        { from: 'credentials/Quant Finance Certificate.jpg', to: 'section-8-credentials/images/quant_cert.jpg', noErrorOnMissing: true },
        { from: 'credentials/Scholars Day Certificate.jpg', to: 'section-8-credentials/images/scholars_day_cert.jpg', noErrorOnMissing: true },
        { from: 'credentials/Lois Bronz Award.jpg', to: 'section-8-credentials/images/lois_bronz.jpg', noErrorOnMissing: true },
        { from: 'credentials/My Book Know Change Grow.jpg', to: 'section-8-credentials/images/book_cover.jpg', noErrorOnMissing: true },
        { from: 'credentials/Scholars Day Project.jpg', to: 'section-8-credentials/images/scholars_project.jpg', noErrorOnMissing: true },
        { from: 'section-9-videos', to: 'section-9-videos' },
        { from: 'section-10-grid-slideshow', to: 'section-10-grid-slideshow' },
        { from: 'gradientslider', to: 'gradientslider' },
        { from: 'art', to: 'art' },
        { from: 'section-13-repeating', to: 'section-13-repeating' },
        { from: 'section-15-rotating/dist', to: 'section-15-rotating' },
        { from: 'section-19-marquee/dist', to: 'section-19-marquee' },
        { from: 'section-19-marquee/src/assets/images', to: 'section-19-marquee/assets/images', noErrorOnMissing: true },
        { from: 'sectio', to: 'sectio' },
        { from: 'header', to: 'header' },
        { from: 'app/images', to: 'gallery-tiles' },
        { from: 'd.png', to: 'd.png' },
        { from: path.join(__dirname, 'branding', 'usageblack.png'), to: 'usageblack.png', noErrorOnMissing: true }
      ]
    })
  ]
})
