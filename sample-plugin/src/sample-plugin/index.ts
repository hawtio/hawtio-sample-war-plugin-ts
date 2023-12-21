import { HawtioPlugin, configManager } from '@hawtio/react'
import { customTree } from './custom-tree'
import { simple } from './simple'

/**
 * The entry function for the plugin exposed to Hawtio.
 *
 * The default name for the function is "plugin". If you want to use the name other
 * than the default one, you need to specify the name using `HawtioPlugin#pluginEntry()`
 * method when registering the plugin to JMX MBean server.
 *
 * <code>
 * new HawtioPlugin()
 *     .pluginEntry("registerMyPlugin");
 * </code>
 *
 * @see src/main/java/io/hawt/examples/sampleplugin/PluginContextListener.java
 */
export const plugin: HawtioPlugin = () => {
  simple()
  customTree()
}

// Register the custom plugin version to Hawtio
// See package.json "replace-version" script for how to replace the version placeholder with a real version
configManager.addProductInfo('Hawtio Sample Plugin', '__PACKAGE_VERSION_PLACEHOLDER__')

/*
 * This example also demonstrates how branding and styles can be customised from a WAR plugin.
 *
 * The Plugin API `configManager` provides `configure(configurer: (config: Hawtconfig) => void)` method
 * and you can customise the `Hawtconfig` by invoking it from the plugin's `index.ts`.
 *
 * NOTE: It is important that you invoke `configManager.configure()` at the top level of `index.ts`.
 * If you don't, the customisation of branding and styles is not applied to the console.
 */
configManager.configure(config => {
  // Branding & styles
  config.branding = {
    appName: 'Hawtio Sample WAR Plugin',
    showAppName: true,
    appLogoUrl: '/sample-plugin/branding/Logo-RedHat-A-Reverse-RGB.png',
    css: '/sample-plugin/branding/app.css',
    favicon: '/sample-plugin/branding/favicon.ico',
  }
  // Login page
  config.login = {
    description: 'Login page for Hawtio Sample WAR Plugin application.',
    links: [
      { url: '#terms', text: 'Terms of use' },
      { url: '#help', text: 'Help' },
      { url: '#privacy', text: 'Privacy policy' },
    ],
  }
  // About modal
  if (!config.about) {
    config.about = {}
  }
  config.about.title = 'Hawtio Sample WAR Plugin'
  config.about.description = 'About page for Hawtio Sample WAR Plugin application.'
  config.about.imgSrc = '/sample-plugin/branding/Logo-RedHat-A-Reverse-RGB.png'
  if (!config.about.productInfo) {
    config.about.productInfo = []
  }
  config.about.productInfo.push(
    { name: 'Hawtio Sample Plugin - simple-plugin', value: '1.0.0' },
    { name: 'Hawtio Sample Plugin - custom-tree', value: '1.0.0' },
  )
  // If you want to disable specific plugins, you can specify the paths to disable them.
  //config.disabledRoutes = ['/simple-plugin']
})
