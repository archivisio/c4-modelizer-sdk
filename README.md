# C4 Modelizer SDK

SDK partagé pour les applications C4 Modelizer - Types, store Zustand et hooks réutilisables.

## Installation

### Depuis GitHub Packages

```bash
# Configuration du registre GitHub (une seule fois)
npm config set @eth3rnit3:registry https://npm.pkg.github.com

# Installation du package
npm install @eth3rnit3/c4-modelizer-sdk
```

### Depuis NPM (futur)

```bash
npm install c4-modelizer-sdk
```

## Peer Dependencies

Le SDK nécessite les dépendances suivantes dans votre projet :

```bash
npm install react react-dom zustand @xyflow/react
```

## Structure du SDK

```
c4-modelizer-sdk/
├── src/
│   ├── core/           # Types, store, hooks core
│   │   ├── types/      # Types C4 fondamentaux
│   │   ├── store/      # Store Zustand
│   │   └── hooks/      # Hooks métier
│   ├── ui/             # Composants UI et contextes
│   │   └── contexts/   # Contextes React
│   └── utils/          # Utilitaires
```

## Utilisation

### Import principal

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
} from '@eth3rnit3/c4-modelizer-sdk';
```

### Import sélectif

```typescript
// Core uniquement
import { useFlatC4Store, useFlatModelActions } from '@eth3rnit3/c4-modelizer-sdk/core';

// UI uniquement
import { DialogProvider, useDialogs } from '@eth3rnit3/c4-modelizer-sdk/ui';
```

## API Documentation

### Store Zustand

Le store principal pour gérer l'état du modèle C4 :

```typescript
const {
  model,
  addSystem,
  updateSystem,
  removeSystem,
  setActiveSystem,
  // ... autres actions
} = useFlatC4Store();
```

### Hooks principaux

#### useFlatModelActions

Hook pour les actions CRUD sur les éléments C4 :

```typescript
const {
  addElement,
  handleElementSave,
  handleNodeDelete,
  resetStore
} = useFlatModelActions();

// Ajouter un élément au niveau actuel
addElement({ name: "Mon Système" });

// Ajouter avec labels personnalisés
addElement({}, { 
  system: "Nouveau Système",
  container: "Nouveau Container" 
});
```

#### useFlatNavigation

Hook pour la navigation entre les niveaux C4 :

```typescript
const {
  navigateToSystem,
  navigateToContainer,
  navigateToComponent,
  navigateToCode
} = useFlatNavigation();

// Navigation vers un container
navigateToContainer(systemId);
```

#### useFlatNodes

Hook pour ReactFlow, génère les nodes pour le niveau actuel :

```typescript
const {
  currentNodes,
  handleNodePositionChange,
  getNodeById
} = useFlatNodes({
  onEditSystem: (id) => console.log('Edit system', id),
  onEditContainer: (id) => console.log('Edit container', id),
  // ... autres callbacks
});
```

#### useFlatEdges

Hook pour ReactFlow, génère les edges (connexions) :

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

### Contextes UI

#### DialogProvider

Provider pour gérer les dialogs d'édition :

```typescript
function App() {
  return (
    <DialogProvider>
      <YourApp />
    </DialogProvider>
  );
}

// Dans un composant enfant
const {
  openEditDialog,
  openConnectionDialog,
  dialogOpen,
  editingElement
} = useDialogs();
```

## Exemple d'intégration

```typescript
import React from 'react';
import {
  useFlatC4Store,
  useFlatModelActions,
  useFlatNodes,
  useFlatEdges,
  DialogProvider,
  useDialogs
} from '@eth3rnit3/c4-modelizer-sdk';
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
        Ajouter un élément
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

## Types principaux

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

Interfaces étendant BaseBlock avec des propriétés spécifiques à chaque niveau.

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

## Développement

```bash
# Installation des dépendances
npm install

# Build du SDK
npm run build

# Développement avec watch
npm run dev

# Linting
npm run lint

# Type checking
npm run type-check
```

## License

CC-BY-NC-4.0