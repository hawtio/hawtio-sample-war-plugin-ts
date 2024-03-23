import { HawtioPlugin, hawtio } from '@hawtio/react'
import { log, pluginName, pluginPath, pluginTitle } from './globals'
import { AppJmx } from './AppJmx'

/**
 * This example demonstrates how you can create a plugin that reuses the views
 * from the builtin JMX plugin (Attributes, Operations, and Chart) into your own
 * plugin.
 */
export const appJmx: HawtioPlugin = () => {
  log.info('Loading', pluginName)

  hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: AppJmx,
    isActive: async () => true,
  })
}
