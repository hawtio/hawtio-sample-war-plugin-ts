import { EVENT_REFRESH, MBeanNode, MBeanTree, PluginNodeSelectionContext, eventService, workspace } from '@hawtio/react'
import { createContext, useContext, useEffect, useState } from 'react'
import { jmxDomain, pluginName } from './globals'

/**
 * Custom React hook for using the plugin-specific JMX MBean tree.
 */
export function useAppJmx() {
  const [tree, setTree] = useState(MBeanTree.createEmpty(pluginName))
  const [loaded, setLoaded] = useState(false)
  const { selectedNode, setSelectedNode } = useContext(PluginNodeSelectionContext)

  useEffect(() => {
    const loadTree = async () => {
      const tree = await populateTree()
      setTree(tree)
      setLoaded(true)
    }
    loadTree()

    const listener = () => {
      setLoaded(false)
      loadTree()
    }
    eventService.onRefresh(listener)

    return () => eventService.removeListener(EVENT_REFRESH, listener)
  }, [])

  return { tree, loaded, selectedNode, setSelectedNode }
}

async function populateTree(): Promise<MBeanTree> {
  const tree = await workspace.getTree()
  const root = tree.find(node => node.name === jmxDomain)
  if (!root || !root.children || root.children.length === 0) {
    return MBeanTree.createEmpty(pluginName)
  }

  return MBeanTree.createFromNodes(pluginName, [root])
}

type AppJmxContext = {
  tree: MBeanTree
  selectedNode: MBeanNode | null
  setSelectedNode: (selected: MBeanNode | null) => void
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AppJmxContext = createContext<AppJmxContext>({
  tree: MBeanTree.createEmpty(pluginName),
  selectedNode: null,
  setSelectedNode: () => {
    // no-op
  },
})
