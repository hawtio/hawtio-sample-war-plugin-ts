package io.hawt.examples.sampleplugin;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;

import io.hawt.web.plugin.HawtioPlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PluginContextListener implements ServletContextListener {

    private static final Logger LOG = LoggerFactory.getLogger(PluginContextListener.class);

    private HawtioPlugin plugin = null;

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        /*
         * These are the parameters required to load a remote Hawtio plugin (a.k.a. Module Federation remote module):
         *
         * - scope: The name of the container defined at Webpack ModuleFederationPlugin. See also: sample-plugin/craco.config.js
         * - module: The path exposed from Webpack ModuleFederationPlugin. See also: sample-plugin/craco.config.js
         * - url: The URL of the remote entry for the plugin, e.g. "http://localhost:8081". (optional)
         */
        plugin = new HawtioPlugin()
            .scope("samplePlugin")
            .module("./plugin")
            .url("/sample-plugin");

        /*
         * By default, Hawtio expects "plugin" as the name of the Hawtio plugin entry function.
         * If you want to use the name other than the default one, specify the name using HawtioPlugin#pluginEntry()
         * as follows. See also: sample-plugin/src/sample-plugin/index.ts
         */
        //plugin.pluginEntry("registerMyPlugin");

        plugin.init();

        LOG.info("Initialised plugin: {}", plugin.getScope());
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        plugin.destroy();
        LOG.info("Destroyed plugin: {}", plugin.getScope());
    }
}
