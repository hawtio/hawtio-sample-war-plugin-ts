import { Attributes, Chart, MBeanNode, Operations } from '@hawtio/react'
import {
  Content,
  EmptyState,
  Nav,
  NavItem,
  NavList,
  PageGroup,
  PageSection,
  Spinner,
  Title,
  TreeView,
  TreeViewProps,
} from '@patternfly/react-core'
import { CubesIcon } from '@patternfly/react-icons'
import React, { useContext } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Split from 'react-split'
import './AppJmx.css'
import { AppJmxContext, useAppJmx } from './context'
import { log, pluginPath } from './globals'

export const AppJmx: React.FunctionComponent = () => {
  const { tree, loaded, selectedNode, setSelectedNode } = useAppJmx()

  if (!loaded) {
    return (
      <PageSection hasBodyWrapper={false}>
        <Spinner aria-label='Loading custom tree' />
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
    log.debug('Selected node:', item)
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
      <PageSection isFilled hasBodyWrapper={false}>
        <EmptyState
          titleText={
            <Title headingLevel='h1' size='lg'>
              Select MBean
            </Title>
          }
          variant='full'
          icon={CubesIcon}
        />
      </PageSection>
    )
  }

  const navItems = [
    { id: 'attributes', title: 'Attributes', component: Attributes },
    { id: 'operations', title: 'Operations', component: Operations },
    { id: 'chart', title: 'Chart', component: Chart },
  ]

  const mbeanNav = (
    <Nav aria-label='MBean Nav' variant='horizontal-subnav'>
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
        <PageSection id='app-jmx-content-header' hasBodyWrapper={false}>
          <Title headingLevel='h1'>{selectedNode.name}</Title>
          <Content component='small'>{selectedNode.objectName}</Content>
        </PageSection>
        <PageSection type='tabs' hasBodyWrapper={false}>
          {mbeanNav}
        </PageSection>
      </PageGroup>
      <PageSection id='app-jmx-content-main' hasBodyWrapper={false}>
        <Routes>
          {mbeanRoutes}
          <Route key='root' path='/' element={<Navigate to={navItems[0]?.id ?? ''} />} />
        </Routes>
      </PageSection>
    </React.Fragment>
  )
}
