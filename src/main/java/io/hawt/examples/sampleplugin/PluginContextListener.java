package io.hawt.examples.sampleplugin;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import io.hawt.web.plugin.HawtioPlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PluginContextListener implements ServletContextListener {

    private static final Logger LOG = LoggerFactory.getLogger(PluginContextListener.class);

    private HawtioPlugin plugin = null;

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        plugin = new HawtioPlugin()
            .url("http://localhost:8080")
            .scope("samplePlugin")
            .module("./plugin");
        plugin.init();

        LOG.info("Initialised plugin: {}", plugin.getScope());
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        plugin.destroy();
        LOG.info("Destroyed plugin: {}", plugin.getScope());
    }
}
