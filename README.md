# Hawtio Sample WAR Plugin

This sample demonstrates how to write a plugin for [Hawtio v3](https://github.com/hawtio/hawtio) as a WAR file; WAR plugins are useful when deploying Hawtio and plugins to an application server such as Jetty, WildFly, and Tomcat.

## Key components

The key components of this sample are as follows:

| File/Directory | Description |
| -------------- | ----------- |
| [sample-plugin/](./sample-plugin) | The Hawtio v3 plugin project written in TypeScript. Since a Hawtio plugin is based on React and [Webpack Module Federation](https://module-federation.github.io/), this project uses Yarn v3 and [CRACO](https://craco.js.org/) as the build tools. You can use any JS/TS tools for developing a Hawtio plugin so long as they can build a React and Webpack Module Federation application. |
| [craco.config.js](./sample-plugin/craco.config.js) | The React application configuration file. The plugin interface is defined with `ModuleFederationPlugin`. The name `samplePlugin` and the module name `./plugin` at the `exposes` section correspond to the parameters `scope` and `module` set to `HawtioPlugin` in `PluginContextListener.java`. |
| [PluginContextListener.java](./src/main/java/io/hawt/examples/sampleplugin/PluginContextListener.java) | The only Java code that is required to register the Hawtio plugin. To register a plugin, it should instantiate [HawtioPlugin](https://github.com/hawtio/hawtio/blob/hawtio-3.0-M3/hawtio-plugin-mbean/src/main/java/io/hawt/web/plugin/HawtioPlugin.java) and invoke its `init()` method at initialisation time. The three key parameters to pass to `HawtioPlugin` are `url`, `scope`, and `module`, which are required by Module Federation. (See also the description of `craco.config.js`.) This servlet listener is then configured in `web.xml`. |
| [pom.xml](./pom.xml) | This project uses Maven as the primary tool for building. Here, the `frontend-maven-plugin` is used to trigger the build of `sample-plugin` TypeScript project, then the built output is included as resources for packaging the WAR archive. |

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
