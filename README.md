# Hawtio Sample WAR Plugin

[![Build](https://github.com/hawtio/hawtio-sample-war-plugin-ts/actions/workflows/build.yml/badge.svg)](https://github.com/hawtio/hawtio-sample-war-plugin-ts/actions/workflows/build.yml)

This sample demonstrates how to write a plugin for [Hawtio v4](https://github.com/hawtio/hawtio) as a WAR file; WAR plugins are useful when deploying Hawtio and plugins to an application server such as Jetty, WildFly, and Tomcat.

## Key components

The key components of this sample are as follows:

| File/Directory | Description |
| -------------- | ----------- |
| [sample-plugin/](./sample-plugin) | The Hawtio v4 plugin project written in TypeScript. Since a Hawtio plugin is based on React and [Webpack Module Federation](https://module-federation.github.io/), this project uses Yarn v4 and [CRACO](https://craco.js.org/) as the build tools. You can use any JS/TS tools for developing a Hawtio plugin so long as they can build a React and Webpack Module Federation application. |
| [craco.config.js](./sample-plugin/craco.config.js) | The React application configuration file. The plugin interface is defined with `ModuleFederationPlugin`. The name `samplePlugin` and the module name `./plugin` at the `exposes` section correspond to the parameters `scope` and `module` set to `HawtioPlugin` in `PluginContextListener.java`. |
| [PluginContextListener.java](./src/main/java/io/hawt/examples/sampleplugin/PluginContextListener.java) | The only Java code that is required to register the Hawtio plugin. To register a plugin, it should instantiate [HawtioPlugin](https://github.com/hawtio/hawtio/blob/hawtio-3.0-M3/hawtio-plugin-mbean/src/main/java/io/hawt/web/plugin/HawtioPlugin.java) and invoke its `init()` method at initialisation time. The three key parameters to pass to `HawtioPlugin` are `url`, `scope`, and `module`, which are required by Module Federation. (See also the description of `craco.config.js`.) This servlet listener is then configured in `web.xml`. |
| [pom.xml](./pom.xml) | This project uses Maven as the primary tool for building. Here, the `frontend-maven-plugin` is used to trigger the build of `sample-plugin` TypeScript project, then the built output is included as resources for packaging the WAR archive. |

### Branding and styles customisation via a WAR plugin

This example also demonstrates how branding and styles can be customised from a WAR plugin.

The Plugin API `configManager` provides `configure(configurer: (config: Hawtconfig) => void)` method and you can customise the `Hawtconfig` by invoking it from the plugin's `index.ts`.

[sample-plugin/src/sample-plugin/index.ts](sample-plugin/src/sample-plugin/index.ts)

```typescript

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
```

## How to run

### Build

The following command first builds the `sample-plugin` frontend project and then compiles and packages the main Java project together.

```console
mvn clean install
```

Building the frontend project can take time, so if you build it once and make no changes on the project afterwards, you can speed up the whole build by skipping the frontend part next time.

```console
mvn install -Dskip.yarn
```

### Deploy

Copy the built file `target/hawtio-sample-war-plugin.war` to the deployment directory of the application server of your choice.

### Test run

You can quickly run and test the application by using `jetty-maven-plugin` configured in `pom.xml`. It launches an embedded Jetty server and deploy the plugin WAR application, as well as the main `hawtio.war`.

```console
mvn jetty:run -Dskip.yarn
```

You can access the Hawtio console with the sample plugin at: <http://localhost:8080/hawtio/>

## Faster plugin development

You could run `mvn install` or `mvn jetty:run` every time to incrementally develop the `sample-plugin` frontend project while checking its behaviour in the browser. But this is not suitable for running the fast development feedback cycle.

As shown below, a faster development cycle can be achieved by directly running the `sample-plugin` frontend project itself in development mode with `yarn start`, while starting the main WAR application on the backend.

### Development

To develop the plugin, firstly launch the main WAR application on the backend:

```console
mvn jetty:run -Dskip.yarn
```

Then start the plugin project in development mode:

```console
cd sample-plugin
yarn start
```

Now you should be able to preview the plugins under development at <http://localhost:3001/hawtio/>. However, since it still hasn't been connected to a backend JVM, you can only test plugins that don't require the JMX MBean tree.

To test plugins that depend on the JMX MBean tree, use Connect plugin <http://localhost:3001/hawtio/connect> to connect to the main WAR application running in the background. The Jolokia endpoint should be <http://localhost:8080/hawtio/jolokia>.

Now you can preview all kinds of plugins on the console under development, and run a faster development cycle by utilising hot reloading provided by Create React App.
