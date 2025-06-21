import { useFilteredEntities, useFlatC4Store } from '../store/flatC4Store';
import { Connection, Edge, MarkerType } from '@xyflow/react';
import { useCallback, useMemo } from 'react';
import { ConnectionInfo } from '../types/connection';

interface EdgeCallbacks {
  onConnectionDialog?: (connection: ConnectionInfo) => void;
  onConnectionSave?: (connection: ConnectionInfo) => void;
  onConnectionDelete?: (connection: ConnectionInfo) => void;
  getTechnologyColor?: (technologyId?: string) => string;
}

const defaultMarkerStart = (color = '#fff') => ({
  type: MarkerType.ArrowClosed,
  width: 18,
  height: 18,
  color,
});

const defaultMarkerEnd = (color = '#fff') => ({
  type: MarkerType.ArrowClosed,
  width: 18,
  height: 18,
  color,
});

export function useFlatEdges(callbacks: EdgeCallbacks = {}) {
  const {
    model,
    connectSystems,
    connectContainers,
    connectComponents,
    connectCodeElements,
    updateConnection,
    removeConnection
  } = useFlatC4Store();

  const { containers, components, codeElements } = useFilteredEntities();

  const getTechnologyColor = callbacks.getTechnologyColor || (() => '#fff');

  const markerStart = useCallback((technologyId?: string) => {
    const color = getTechnologyColor(technologyId);
    return defaultMarkerStart(color);
  }, [getTechnologyColor]);

  const markerEnd = useCallback((technologyId?: string) => {
    const color = getTechnologyColor(technologyId);
    return defaultMarkerEnd(color);
  }, [getTechnologyColor]);

  const edges: Edge[] = useMemo(() => {
    const { viewLevel, systems } = model;

    if (viewLevel === 'system') {
      return systems.flatMap((sys) =>
        sys.connections.map((conn) => ({
          id: `${sys.id}->${conn.targetId}`,
          source: sys.id,
          target: conn.targetId,
          sourceHandle: conn.sourceHandle,
          targetHandle: conn.targetHandle,
          label: conn.label,
          data: {
            technology: conn.technology,
            description: conn.description,
            labelPosition: conn.labelPosition,
            bidirectional: conn.bidirectional,
          },
          type: conn.technology || conn.label ? 'technology' : 'default',
          markerStart: markerStart(conn.technology),
          markerEnd: markerEnd(conn.technology),
        }))
      );
    } else if (viewLevel === 'container') {
      return containers.flatMap((container) =>
        container.connections.map((conn) => ({
          id: `${container.id}->${conn.targetId}`,
          source: container.id,
          target: conn.targetId,
          sourceHandle: conn.sourceHandle,
          targetHandle: conn.targetHandle,
          label: conn.label,
          data: {
            technology: conn.technology,
            description: conn.description,
            labelPosition: conn.labelPosition,
            bidirectional: conn.bidirectional,
          },
          markerStart: markerStart(conn.technology),
          markerEnd: markerEnd(conn.technology),
          type: conn.technology || conn.label ? 'technology' : 'default',
        }))
      );
    } else if (viewLevel === 'component') {
      return components.flatMap((component) =>
        component.connections.map((conn) => ({
          id: `${component.id}->${conn.targetId}`,
          source: component.id,
          target: conn.targetId,
          sourceHandle: conn.sourceHandle,
          targetHandle: conn.targetHandle,
          label: conn.label,
          data: {
            technology: conn.technology,
            description: conn.description,
            labelPosition: conn.labelPosition,
            bidirectional: conn.bidirectional,
          },
          markerStart: markerStart(conn.technology),
          markerEnd: markerEnd(conn.technology),
          type: conn.technology || conn.label ? 'technology' : 'default',
        }))
      );
    } else if (viewLevel === 'code') {
      return codeElements.flatMap((codeElement) =>
        codeElement.connections.map((conn) => ({
          id: `${codeElement.id}->${conn.targetId}`,
          source: codeElement.id,
          target: conn.targetId,
          sourceHandle: conn.sourceHandle,
          targetHandle: conn.targetHandle,
          label: conn.label,
          data: {
            technology: conn.technology,
            description: conn.description,
            labelPosition: conn.labelPosition,
            bidirectional: conn.bidirectional,
          },
          markerStart: markerStart(conn.technology),
          markerEnd: markerEnd(conn.technology),
          type: conn.technology || conn.label ? 'technology' : 'default',
        }))
      );
    }
    return [];
  }, [model, containers, components, codeElements, markerStart, markerEnd]);

  const onConnect = useCallback(
    (connection: Edge | Connection) => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (source && target) {
        const connectionData = {
          targetId: target,
          sourceHandle,
          targetHandle,
        };

        if (model.viewLevel === 'system') {
          connectSystems(source, connectionData);
        } else if (model.viewLevel === 'container') {
          connectContainers(source, connectionData);
        } else if (model.viewLevel === 'component') {
          connectComponents(source, connectionData);
        } else if (model.viewLevel === 'code') {
          connectCodeElements(source, connectionData);
        }

        const edgeId = `${source}->${target}`;
        const connectionInfo: ConnectionInfo = {
          id: edgeId,
          sourceId: source,
          targetId: target,
          sourceHandle,
          targetHandle,
        };
        callbacks.onConnectionDialog?.(connectionInfo);
      }
    },
    [
      model.viewLevel,
      connectSystems,
      connectContainers,
      connectComponents,
      connectCodeElements,
      callbacks
    ]
  );

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    const connectionInfo: ConnectionInfo = {
      id: edge.id,
      sourceId: edge.source,
      targetId: edge.target,
      label: edge.label as string | undefined,
      technology: edge.data?.technology as string | undefined,
      description: edge.data?.description as string | undefined,
      labelPosition: edge.data?.labelPosition as number | undefined,
      bidirectional: edge.data?.bidirectional as boolean | undefined,
    };

    callbacks.onConnectionDialog?.(connectionInfo);
  }, [callbacks]);

  const handleConnectionSave = useCallback(
    (connectionInfo: ConnectionInfo) => {
      const level = model.viewLevel;
      const data = {
        label: connectionInfo.label,
        technology: connectionInfo.technology,
        description: connectionInfo.description,
        labelPosition: connectionInfo.labelPosition,
        bidirectional: connectionInfo.bidirectional,
      };

      updateConnection(
        level,
        connectionInfo.sourceId,
        connectionInfo.targetId,
        data
      );

      callbacks.onConnectionSave?.(connectionInfo);
    },
    [model.viewLevel, updateConnection, callbacks]
  );

  const handleConnectionDelete = useCallback(
    (connectionInfo: ConnectionInfo) => {
      if (connectionInfo) {
        const level = model.viewLevel;
        removeConnection(
          level,
          connectionInfo.sourceId,
          connectionInfo.targetId
        );
        callbacks.onConnectionDelete?.(connectionInfo);
      }
    },
    [model.viewLevel, removeConnection, callbacks]
  );

  return {
    edges,
    onConnect,
    handleEdgeClick,
    handleConnectionSave,
    handleConnectionDelete
  };
}