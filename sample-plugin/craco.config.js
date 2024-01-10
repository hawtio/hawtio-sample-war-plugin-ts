const { ModuleFederationPlugin } = require('webpack').container
const CracoEsbuildPlugin = require('craco-esbuild')
const { hawtioBackend } = require('@hawtio/backend-middleware')
const { dependencies } = require('./package.json')

module.exports = {
  plugins: [{ plugin: CracoEsbuildPlugin }],
  webpack: {
    plugins: {
      add: [
        new ModuleFederationPlugin({
          // The container name corresponds to 'scope' passed to HawtioPlugin
          name: 'samplePlugin',
          filename: 'remoteEntry.js',
          // The key in exposes corresponds to 'remote' passed to HawtioPlugin
          exposes: {
            './plugin': './src/sample-plugin',
          },
          shared: {
            ...dependencies,
            react: {
              singleton: true,
              requiredVersion: dependencies['react'],
            },
            'react-dom': {
              singleton: true,
              requiredVersion: dependencies['react-dom'],
            },
            'react-router-dom': {
              singleton: true,
              requiredVersion: dependencies['react-router-dom'],
            },
            '@hawtio/react': {
              singleton: true,
              requiredVersion: dependencies['@hawtio/react'],
            },
          },
        }),
      ],
    },
    configure: webpackConfig => {
      // Required for Module Federation
      webpackConfig.output.publicPath = 'auto'

      webpackConfig.module.rules.push({
        test: /\.md/,
        type: 'asset/source',
      })

      // For suppressing sourcemap warnings from dependencies
      webpackConfig.ignoreWarnings = [/Failed to parse source map/]

      // To resolve errors for @module-federation/utilities 2.x
      // https://github.com/module-federation/universe/issues/827
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          path: require.resolve('path-browserify'),
          os: require.resolve('os-browserify'),
        },
      }

      // MiniCssExtractPlugin - Ignore order as otherwise conflicting order warning is raised
      const miniCssExtractPlugin = webpackConfig.plugins.find(p => p.constructor.name === 'MiniCssExtractPlugin')
      if (miniCssExtractPlugin) {
        miniCssExtractPlugin.options.ignoreOrder = true
      }

      return webpackConfig
    },
  },
  // For plugin development
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Enabling branding in dev mode
      devServer.app.use((req, _, next) => {
        if (req.url.startsWith('/sample-plugin')) {
          req.url = req.url.replace(/\/sample-plugin(.*)/, '/hawtio$1')
        }
        next()
      })

      // Redirect / or /hawtio to /hawtio/
      devServer.app.get('/', (_, res) => res.redirect('/hawtio/'))
      devServer.app.get('/hawtio$', (_, res) => res.redirect('/hawtio/'))

      const username = 'developer'
      const proxyEnabled = true
      const plugin = []
      const hawtconfig = {}

      // Hawtio backend API mock
      let login = true
      devServer.app.get('/hawtio/user', (_, res) => {
        login ? res.send(`"${username}"`) : res.sendStatus(403)
      })
      devServer.app.post('/hawtio/auth/login', (_, res) => {
        login = true
        res.send(String(login))
      })
      devServer.app.get('/hawtio/auth/logout', (_, res) => {
        login = false
        res.redirect('/hawtio/login')
      })
      devServer.app.get('/hawtio/proxy/enabled', (_, res) => res.send(String(proxyEnabled)))
      devServer.app.get('/hawtio/plugin', (_, res) => res.send(JSON.stringify(plugin)))

      // hawtconfig.json mock
      devServer.app.get('/hawtio/hawtconfig.json', (_, res) => res.send(JSON.stringify(hawtconfig)))

      // Hawtio backend middleware should be run before other middlewares (thus 'unshift')
      // in order to handle GET requests to the proxied Jolokia endpoint.
      middlewares.unshift({
        name: 'hawtio-backend',
        path: '/hawtio/proxy',
        middleware: hawtioBackend({
          // Uncomment it if you want to see debug log for Hawtio backend
          logLevel: 'debug',
        }),
      })

      return middlewares
    },
  },
}
