import { HawtioPlugin, configManager } from '@hawtio/react'
import { customTree } from './custom-tree'
import { simple } from './simple'

/**
 * The entry function for the plugin exposed to Hawtio.
 *
 * The default name for the function is "plugin". If you want to use the name other
 * than the default one, you need to specify the name using {HawtioPlugin#pluginEntry()}
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

// Branding and styles can be customised from a plugin as follows
configManager.configure(config => {
  config.branding = {
    appName: 'Hawtio Sample WAR Plugin',
    showAppName: true,
    appLogoUrl: 'img/hawtio-logo.svg',
    css: '/sample-plugin/branding/app.css',
    favicon: '/sample-plugin/branding/favicon.ico',
  }
  config.login = {
    description: 'Login page for Hawtio Sample WAR Plugin application.',
    links: [
      { url: '#terms', text: 'Terms of use' },
      { url: '#help', text: 'Help' },
      { url: '#privacy', text: 'Privacy policy' },
    ],
  }
  config.about = {
    title: 'Hawtio Sample WAR Plugin',
    description: 'About page for Hawtio Sample WAR Plugin application.',
    productInfo: [
      { name: 'simple-plugin', value: '1.0.0' },
      { name: 'custom-tree', value: '1.0.0' },
    ],
    copyright: '(c) 2023 Hawtio team',
    imgSrc: 'img/hawtio-logo.svg',
  }
  // If you want to disable specific plugins, you can specify the paths to disable them.
  //config.disabledRoutes = ['/simple-plugin']
})
