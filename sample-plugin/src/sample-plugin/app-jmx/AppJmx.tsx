import { Attributes, Chart, MBeanNode, Operations } from '@hawtio/react'
import {
  EmptyState,
  EmptyStateIcon,
  Nav,
  NavItem,
  NavList,
  PageGroup,
  PageNavigation,
  PageSection,
  Spinner,
  Text,
  Title,
  TreeView,
  TreeViewProps
} from '@patternfly/react-core'
import { CubesIcon } from '@patternfly/react-icons'
import React, { useContext } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Split from 'react-split'
import './AppJmx.css'
import { AppJmxContext, useAppJmx } from './context'
import { pluginPath } from './globals'

export const AppJmx: React.FunctionComponent = () => {
  const { tree, loaded, selectedNode, setSelectedNode } = useAppJmx()

  if (!loaded) {
    return (
      <PageSection>
        <Spinner isSVG aria-label='Loading custom tree' />
      </PageSection>
    )
  }

  // You can use Split.js to implement a split view.
  // For more information, see: https://split.js.org/
  return (
    <AppJmxContext.Provider value={{ tree, selectedNode, setSelectedNode }}>
      <Split className='app-jmx-split' sizes={[30, 70]} minSize={200} gutterSize={5}>
        <div>
          <AppJmxTreeView />
        </div>
        <div>
          <AppJmxContent />
        </div>
      </Split>
    </AppJmxContext.Provider>
  )
}

const AppJmxTreeView: React.FunctionComponent = () => {
  const { tree, selectedNode, setSelectedNode } = useContext(AppJmxContext)

  const onSelect: TreeViewProps['onSelect'] = (_, item) => {
    setSelectedNode(item as MBeanNode)
  }

  return (
    <TreeView
      id='app-jmx-tree-view'
      data={tree.getTree()}
      hasGuides={true}
      hasSelectableNodes={true}
      onSelect={onSelect}
      activeItems={selectedNode ? [selectedNode] : []}
    />
  )
}

const AppJmxContent: React.FunctionComponent = () => {
  const { selectedNode } = useContext(AppJmxContext)
  const { pathname, search } = useLocation()

  if (!selectedNode) {
    return (
      <PageSection variant='light' isFilled>
        <EmptyState variant='full'>
          <EmptyStateIcon icon={CubesIcon} />
          <Title headingLevel='h1' size='lg'>
            Select MBean
          </Title>
        </EmptyState>
      </PageSection>
    )
  }

  const navItems = [
    { id: 'attributes', title: 'Attributes', component: Attributes },
    { id: 'operations', title: 'Operations', component: Operations },
    { id: 'chart', title: 'Chart', component: Chart }
  ]

  const mbeanNav = (
    <Nav aria-label='MBean Nav' variant='tertiary'>
      <NavList>
        {navItems.map(nav => (
          <NavItem key={nav.id} isActive={pathname === `${pluginPath}/${nav.id}`}>
            <NavLink to={{ pathname: nav.id, search }}>{nav.title}</NavLink>
          </NavItem>
        ))}
      </NavList>
    </Nav>
  )

  const mbeanRoutes = navItems.map(nav => (
    <Route key={nav.id} path={nav.id} element={React.createElement(nav.component)} />
  ))

  return (
    <React.Fragment>
      <PageGroup>
        <PageSection id='app-jmx-content-header' variant='light'>
          <Title headingLevel='h1'>{selectedNode.name}</Title>
          <Text component='small'>{selectedNode.objectName}</Text>
        </PageSection>
        <PageNavigation>{mbeanNav}</PageNavigation>
      </PageGroup>
      <PageSection id='app-jmx-content-main'>
        <Routes>
          {mbeanRoutes}
          <Route key='root' path='/' element={<Navigate to={navItems[0]?.id ?? ''} />} />
        </Routes>
      </PageSection>
    </React.Fragment>
  )
}
