import { useFilteredEntities, useFlatC4Store } from '../store/flatC4Store';
import { Node } from '@xyflow/react';
import { useCallback, useMemo } from 'react';

interface NodeCallbacks {
  onEditSystem?: (id: string) => void;
  onEditContainer?: (id: string) => void;
  onEditComponent?: (id: string) => void;
  onEditCode?: (id: string) => void;
}

export function useFlatNodes(callbacks: NodeCallbacks = {}) {
  const { model, updateSystem, updateContainer, updateComponent, updateCodeElement } = useFlatC4Store();
  const { containers, components, codeElements } = useFilteredEntities();

  const systemNodes: Node[] = useMemo(
    () =>
      model.systems.map((sys) => ({
        id: sys.id,
        type: 'system',
        position: sys.position,
        data: {
          ...sys,
          onEdit: () => callbacks.onEditSystem?.(sys.id),
        },
      })),
    [model.systems, callbacks]
  );

  const containerNodes: Node[] = useMemo(() => {
    if (!model.activeSystemId) return [];

    return containers.map((container) => ({
      id: container.id,
      type: 'container',
      position: container.position,
      data: {
        ...container,
        onEdit: () => callbacks.onEditContainer?.(container.id),
      },
    }));
  }, [containers, model.activeSystemId, callbacks]);

  const componentNodes: Node[] = useMemo(() => {
    if (!model.activeContainerId) return [];

    return components.map((component) => ({
      id: component.id,
      type: 'component',
      position: component.position,
      data: {
        ...component,
        onEdit: () => callbacks.onEditComponent?.(component.id),
      },
    }));
  }, [components, model.activeContainerId, callbacks]);

  const codeNodes: Node[] = useMemo(() => {
    if (!model.activeComponentId) return [];

    return codeElements.map((codeElement) => ({
      id: codeElement.id,
      type: 'code',
      position: codeElement.position,
      data: {
        ...codeElement,
        onEdit: () => callbacks.onEditCode?.(codeElement.id),
      },
    }));
  }, [
    codeElements,
    model.activeComponentId,
    callbacks
  ]);

  const currentNodes = useMemo(() => {
    switch (model.viewLevel) {
      case 'system':
        return systemNodes;
      case 'container':
        return containerNodes;
      case 'component':
        return componentNodes;
      case 'code':
        return codeNodes;
      default:
        return [];
    }
  }, [model.viewLevel, systemNodes, containerNodes, componentNodes, codeNodes]);

  const getNodeById = useCallback(
    (id: string) => {
      return [...systemNodes, ...containerNodes, ...componentNodes, ...codeNodes].find((node) => node.id === id);
    },
    [systemNodes, containerNodes, componentNodes, codeNodes]
  );

  const handleNodePositionChange = useCallback(
    (id: string, position: { x: number; y: number }) => {
      if (model.viewLevel === 'system') {
        updateSystem(id, { position });
      } else if (model.viewLevel === 'container') {
        updateContainer(id, { position });
      } else if (model.viewLevel === 'component') {
        updateComponent(id, { position });
      } else if (model.viewLevel === 'code') {
        updateCodeElement(id, { position });
      }
    },
    [
      model.viewLevel,
      updateSystem,
      updateContainer,
      updateComponent,
      updateCodeElement,
    ]
  );

  return {
    systemNodes,
    containerNodes,
    componentNodes,
    codeNodes,
    currentNodes,
    handleNodePositionChange,
    getNodeById
  };
}