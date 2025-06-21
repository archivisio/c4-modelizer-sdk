# C4 Modelizer SDK

Shared SDK for C4 Modelizer applications - Types, Zustand store and reusable hooks.

## Installation

### From GitHub Packages

```bash
# Configure GitHub registry (one time setup)
npm config set @archivisio:registry https://npm.pkg.github.com

# Install the package
npm install @archivisio/c4-modelizer-sdk
```

### From NPM (future)

```bash
npm install c4-modelizer-sdk
```

## Peer Dependencies

The SDK requires the following dependencies in your project:

```bash
npm install react react-dom zustand @xyflow/react
```

## SDK Structure

```
c4-modelizer-sdk/
├── src/
│   ├── core/           # Types, store, core hooks
│   │   ├── types/      # Core C4 types
│   │   ├── store/      # Zustand store
│   │   └── hooks/      # Business hooks
│   ├── ui/             # UI components and contexts
│   │   └── contexts/   # React contexts
│   └── utils/          # Utilities
```

## Usage

### Main import

```typescript
import { 
  // Types
  SystemBlock, 
  ContainerBlock, 
  ComponentBlock, 
  CodeBlock,
  ConnectionInfo,
  FlatC4Model,
  
  // Store
  useFlatC4Store,
  useActiveEntities,
  useFilteredEntities,
  
  // Hooks
  useFlatModelActions,
  useFlatNavigation,
  useFlatNodes,
  useFlatEdges,
  
  // UI
  DialogProvider,
  useDialogs
} from '@archivisio/c4-modelizer-sdk';
```

### Selective imports

```typescript
// Core only
import { useFlatC4Store, useFlatModelActions } from '@archivisio/c4-modelizer-sdk/core';

// UI only
import { DialogProvider, useDialogs } from '@archivisio/c4-modelizer-sdk/ui';
```

## API Documentation

### Zustand Store

The main store for managing C4 model state:

```typescript
const {
  model,
  addSystem,
  updateSystem,
  removeSystem,
  setActiveSystem,
  // ... other actions
} = useFlatC4Store();
```

### Main Hooks

#### useFlatModelActions

Hook for CRUD actions on C4 elements:

```typescript
const {
  addElement,
  handleElementSave,
  handleNodeDelete,
  resetStore
} = useFlatModelActions();

// Add element at current level
addElement({ name: "My System" });

// Add with custom labels
addElement({}, { 
  system: "New System",
  container: "New Container" 
});
```

#### useFlatNavigation

Hook for navigation between C4 levels:

```typescript
const {
  navigateToSystem,
  navigateToContainer,
  navigateToComponent,
  navigateToCode
} = useFlatNavigation();

// Navigate to a container
navigateToContainer(systemId);
```

#### useFlatNodes

Hook for ReactFlow, generates nodes for current level:

```typescript
const {
  currentNodes,
  handleNodePositionChange,
  getNodeById
} = useFlatNodes({
  onEditSystem: (id) => console.log('Edit system', id),
  onEditContainer: (id) => console.log('Edit container', id),
  // ... other callbacks
});
```

#### useFlatEdges

Hook for ReactFlow, generates edges (connections):

```typescript
const {
  edges,
  onConnect,
  handleEdgeClick,
  handleConnectionSave
} = useFlatEdges({
  onConnectionDialog: (connection) => console.log('Connection dialog', connection),
  getTechnologyColor: (techId) => getTechnologyById(techId)?.color || '#fff'
});
```

### UI Contexts

#### DialogProvider

Provider for managing edit dialogs:

```typescript
function App() {
  return (
    <DialogProvider>
      <YourApp />
    </DialogProvider>
  );
}

// In a child component
const {
  openEditDialog,
  openConnectionDialog,
  dialogOpen,
  editingElement
} = useDialogs();
```

## Integration Example

```typescript
import React from 'react';
import {
  useFlatC4Store,
  useFlatModelActions,
  useFlatNodes,
  useFlatEdges,
  DialogProvider,
  useDialogs
} from '@archivisio/c4-modelizer-sdk';
import { ReactFlow } from '@xyflow/react';

function C4ModelizerApp() {
  const { model } = useFlatC4Store();
  const { handleAddElement } = useFlatModelActions();
  const { openEditDialog } = useDialogs();
  
  const { currentNodes, handleNodePositionChange } = useFlatNodes({
    onEditSystem: (id) => openEditDialog(id, false),
    onEditContainer: (id) => openEditDialog(id, true),
  });
  
  const { edges, onConnect } = useFlatEdges({
    onConnectionDialog: (connection) => console.log('Edit connection', connection)
  });

  return (
    <div style={{ height: '100vh' }}>
      <button onClick={handleAddElement}>
        Add Element
      </button>
      
      <ReactFlow
        nodes={currentNodes}
        edges={edges}
        onConnect={onConnect}
        onNodeDragStop={(_, node) => 
          handleNodePositionChange(node.id, node.position)
        }
      />
    </div>
  );
}

function App() {
  return (
    <DialogProvider>
      <C4ModelizerApp />
    </DialogProvider>
  );
}

export default App;
```

## Core Types

### BaseBlock

```typescript
interface BaseBlock {
  id: string;
  name: string;
  description?: string;
  url?: string;
  position: { x: number; y: number };
  type: 'system' | 'container' | 'component' | 'code';
  technology?: string;
  original?: {
    id: string;
    type: 'system' | 'container' | 'component' | 'code';
  };
}
```

### SystemBlock, ContainerBlock, ComponentBlock, CodeBlock

Interfaces extending BaseBlock with specific properties for each level.

### FlatC4Model

```typescript
interface FlatC4Model {
  systems: FlatSystemBlock[];
  containers: FlatContainerBlock[];
  components: FlatComponentBlock[];
  codeElements: FlatCodeBlock[];
  viewLevel: ViewLevel;
  activeSystemId?: string;
  activeContainerId?: string;
  activeComponentId?: string;
}
```

## Development

```bash
# Install dependencies
npm install

# Build SDK
npm run build

# Development with watch
npm run dev

# Linting
npm run lint

# Type checking
npm run type-check
```

## License

CC-BY-NC-4.0