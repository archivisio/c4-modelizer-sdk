import { act, renderHook } from '@testing-library/react';
import { useFlatEdges } from '../useFlatEdges';
import { useFlatC4Store } from '../../store/flatC4Store';
import { MarkerType } from '@xyflow/react';

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any, options: any) => fn,
  subscribeWithSelector: (fn: any) => fn,
}));

describe('useFlatEdges', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useFlatC4Store());
    act(() => {
      result.current.setModel({
        systems: [],
        containers: [],
        components: [],
        codeElements: [],
        viewLevel: 'system',
      });
    });
  });

  describe('system edges', () => {
    it('should return system edges for system view level', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.addSystem({
          name: 'System B',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [systemA, systemB] = storeResult.current.model.systems;

      act(() => {
        storeResult.current.connectSystems(systemA.id, {
          targetId: systemB.id,
          label: 'Test Connection',
          technology: 'HTTP',
        });
      });

      const { result } = renderHook(() => useFlatEdges());

      expect(result.current.edges).toHaveLength(1);
      expect(result.current.edges[0]).toMatchObject({
        id: `${systemA.id}->${systemB.id}`,
        source: systemA.id,
        target: systemB.id,
        label: 'Test Connection',
        type: 'technology',
        data: {
          technology: 'HTTP',
        },
        markerStart: expect.objectContaining({
          type: MarkerType.ArrowClosed,
        }),
        markerEnd: expect.objectContaining({
          type: MarkerType.ArrowClosed,
        }),
      });
    });

    it('should use default type when no technology or label', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.addSystem({
          name: 'System B',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [systemA, systemB] = storeResult.current.model.systems;

      act(() => {
        storeResult.current.connectSystems(systemA.id, {
          targetId: systemB.id,
        });
      });

      const { result } = renderHook(() => useFlatEdges());

      expect(result.current.edges[0].type).toBe('default');
    });
  });

  describe('container edges', () => {
    let systemId: string;

    beforeEach(() => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Parent System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      systemId = storeResult.current.model.systems[0].id;
    });

    it('should return container edges for container view level', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.setActiveSystem(systemId);
        storeResult.current.addContainer(systemId, {
          name: 'Container A',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
        storeResult.current.addContainer(systemId, {
          name: 'Container B',
          position: { x: 100, y: 100 },
          type: 'container',
          connections: [],
        });
      });

      const [containerA, containerB] = storeResult.current.model.containers;

      act(() => {
        storeResult.current.connectContainers(containerA.id, {
          targetId: containerB.id,
          label: 'Container Connection',
          technology: 'REST',
        });
      });

      const { result } = renderHook(() => useFlatEdges());

      expect(result.current.edges).toHaveLength(1);
      expect(result.current.edges[0]).toMatchObject({
        id: `${containerA.id}->${containerB.id}`,
        source: containerA.id,
        target: containerB.id,
        label: 'Container Connection',
        type: 'technology',
        data: {
          technology: 'REST',
        },
      });
    });
  });

  describe('component edges', () => {
    let systemId: string;
    let containerId: string;

    beforeEach(() => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Parent System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Parent Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      containerId = storeResult.current.model.containers[0].id;
    });

    it('should return component edges for component view level', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.setActiveContainer(containerId);
        storeResult.current.addComponent(containerId, {
          name: 'Component A',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
        storeResult.current.addComponent(containerId, {
          name: 'Component B',
          position: { x: 100, y: 100 },
          type: 'component',
          connections: [],
        });
      });

      const [componentA, componentB] = storeResult.current.model.components;

      act(() => {
        storeResult.current.connectComponents(componentA.id, {
          targetId: componentB.id,
          label: 'Component Connection',
          technology: 'RPC',
        });
        storeResult.current.setViewLevel('component');
      });

      const { result } = renderHook(() => useFlatEdges());

      expect(result.current.edges).toHaveLength(1);
      expect(result.current.edges[0]).toMatchObject({
        id: `${componentA.id}->${componentB.id}`,
        source: componentA.id,
        target: componentB.id,
        label: 'Component Connection',
        type: 'technology',
        data: {
          technology: 'RPC',
        },
      });
    });
  });

  describe('code edges', () => {
    let systemId: string;
    let containerId: string;
    let componentId: string;

    beforeEach(() => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Parent System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Parent Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.addComponent(containerId, {
          name: 'Parent Component',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });

      componentId = storeResult.current.model.components[0].id;
    });

    it('should return code edges for code view level', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.setActiveComponent(componentId);
        storeResult.current.addCodeElement(componentId, {
          name: 'Class A',
          position: { x: 0, y: 0 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
        storeResult.current.addCodeElement(componentId, {
          name: 'Class B',
          position: { x: 100, y: 100 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
      });

      const [codeA, codeB] = storeResult.current.model.codeElements;

      act(() => {
        storeResult.current.connectCodeElements(codeA.id, {
          targetId: codeB.id,
          label: 'Code Connection',
          technology: 'Function Call',
        });
        storeResult.current.setViewLevel('code');
      });

      const { result } = renderHook(() => useFlatEdges());

      expect(result.current.edges).toHaveLength(1);
      expect(result.current.edges[0]).toMatchObject({
        id: `${codeA.id}->${codeB.id}`,
        source: codeA.id,
        target: codeB.id,
        label: 'Code Connection',
        type: 'technology',
        data: {
          technology: 'Function Call',
        },
      });
    });
  });

  describe('technology colors', () => {
    it('should use custom getTechnologyColor callback', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const getTechnologyColor = jest.fn().mockReturnValue('#ff0000');
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.addSystem({
          name: 'System B',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [systemA, systemB] = storeResult.current.model.systems;

      act(() => {
        storeResult.current.connectSystems(systemA.id, {
          targetId: systemB.id,
          technology: 'HTTP',
        });
      });

      const { result } = renderHook(() => useFlatEdges({ getTechnologyColor }));

      expect(getTechnologyColor).toHaveBeenCalledWith('HTTP');
      expect(result.current.edges[0].markerStart.color).toBe('#ff0000');
      expect(result.current.edges[0].markerEnd.color).toBe('#ff0000');
    });

    it('should use default color when no getTechnologyColor callback', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.addSystem({
          name: 'System B',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [systemA, systemB] = storeResult.current.model.systems;

      act(() => {
        storeResult.current.connectSystems(systemA.id, {
          targetId: systemB.id,
          technology: 'HTTP',
        });
      });

      const { result } = renderHook(() => useFlatEdges());

      expect(result.current.edges[0].markerStart.color).toBe('#fff');
      expect(result.current.edges[0].markerEnd.color).toBe('#fff');
    });
  });

  describe('onConnect', () => {
    it('should create system connection', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const onConnectionDialog = jest.fn();
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.addSystem({
          name: 'System B',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
        storeResult.current.setViewLevel('system');
      });

      const [systemA, systemB] = storeResult.current.model.systems;
      const { result } = renderHook(() => useFlatEdges({ onConnectionDialog }));

      act(() => {
        result.current.onConnect({
          source: systemA.id,
          target: systemB.id,
          sourceHandle: 'source-handle',
          targetHandle: 'target-handle',
        });
      });

      expect(storeResult.current.model.systems[0].connections).toHaveLength(1);
      expect(storeResult.current.model.systems[0].connections[0]).toMatchObject({
        targetId: systemB.id,
        sourceHandle: 'source-handle',
        targetHandle: 'target-handle',
      });

      expect(onConnectionDialog).toHaveBeenCalledWith({
        id: `${systemA.id}->${systemB.id}`,
        sourceId: systemA.id,
        targetId: systemB.id,
        sourceHandle: 'source-handle',
        targetHandle: 'target-handle',
      });
    });

    it('should create container connection', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Parent System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.setActiveSystem(systemId);
        storeResult.current.addContainer(systemId, {
          name: 'Container A',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
        storeResult.current.addContainer(systemId, {
          name: 'Container B',
          position: { x: 100, y: 100 },
          type: 'container',
          connections: [],
        });
      });

      const [containerA, containerB] = storeResult.current.model.containers;
      const { result } = renderHook(() => useFlatEdges());

      act(() => {
        result.current.onConnect({
          source: containerA.id,
          target: containerB.id,
        });
      });

      expect(storeResult.current.model.containers[0].connections).toHaveLength(1);
      expect(storeResult.current.model.containers[0].connections[0].targetId).toBe(containerB.id);
    });

    it('should not create connection with missing source or target', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result } = renderHook(() => useFlatEdges());

      act(() => {
        result.current.onConnect({
          source: null,
          target: 'target-id',
        });
      });

      expect(storeResult.current.model.systems).toHaveLength(0);
    });
  });

  describe('handleEdgeClick', () => {
    it('should call onConnectionDialog with edge information', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const onConnectionDialog = jest.fn();
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.addSystem({
          name: 'System B',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [systemA, systemB] = storeResult.current.model.systems;

      act(() => {
        storeResult.current.connectSystems(systemA.id, {
          targetId: systemB.id,
          label: 'Test Connection',
          technology: 'HTTP',
          description: 'Test description',
        });
      });

      const { result } = renderHook(() => useFlatEdges({ onConnectionDialog }));

      const mockEvent = {} as React.MouseEvent;
      const mockEdge = {
        id: `${systemA.id}->${systemB.id}`,
        source: systemA.id,
        target: systemB.id,
        label: 'Test Connection',
        data: {
          technology: 'HTTP',
          description: 'Test description',
          labelPosition: 0.5,
          bidirectional: true,
        },
      };

      act(() => {
        result.current.handleEdgeClick(mockEvent, mockEdge as any);
      });

      expect(onConnectionDialog).toHaveBeenCalledWith({
        id: `${systemA.id}->${systemB.id}`,
        sourceId: systemA.id,
        targetId: systemB.id,
        label: 'Test Connection',
        technology: 'HTTP',
        description: 'Test description',
        labelPosition: 0.5,
        bidirectional: true,
      });
    });
  });

  describe('handleConnectionSave', () => {
    it('should update connection and call callback', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const onConnectionSave = jest.fn();
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.addSystem({
          name: 'System B',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [systemA, systemB] = storeResult.current.model.systems;

      act(() => {
        storeResult.current.connectSystems(systemA.id, {
          targetId: systemB.id,
        });
      });

      const { result } = renderHook(() => useFlatEdges({ onConnectionSave }));

      const connectionInfo = {
        id: `${systemA.id}->${systemB.id}`,
        sourceId: systemA.id,
        targetId: systemB.id,
        label: 'Updated Connection',
        technology: 'REST',
        description: 'Updated description',
      };

      act(() => {
        result.current.handleConnectionSave(connectionInfo);
      });

      expect(storeResult.current.model.systems[0].connections[0]).toMatchObject({
        label: 'Updated Connection',
        technology: 'REST',
        description: 'Updated description',
      });

      expect(onConnectionSave).toHaveBeenCalledWith(connectionInfo);
    });
  });

  describe('handleConnectionDelete', () => {
    it('should remove connection and call callback', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const onConnectionDelete = jest.fn();
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.addSystem({
          name: 'System B',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [systemA, systemB] = storeResult.current.model.systems;

      act(() => {
        storeResult.current.connectSystems(systemA.id, {
          targetId: systemB.id,
          label: 'Connection to Delete',
        });
      });

      expect(storeResult.current.model.systems[0].connections).toHaveLength(1);

      const { result } = renderHook(() => useFlatEdges({ onConnectionDelete }));

      const connectionInfo = {
        id: `${systemA.id}->${systemB.id}`,
        sourceId: systemA.id,
        targetId: systemB.id,
      };

      act(() => {
        result.current.handleConnectionDelete(connectionInfo);
      });

      expect(storeResult.current.model.systems[0].connections).toHaveLength(0);
      expect(onConnectionDelete).toHaveBeenCalledWith(connectionInfo);
    });

    it('should not delete when connectionInfo is falsy', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const onConnectionDelete = jest.fn();
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.addSystem({
          name: 'System B',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [systemA, systemB] = storeResult.current.model.systems;

      act(() => {
        storeResult.current.connectSystems(systemA.id, {
          targetId: systemB.id,
        });
      });

      const { result } = renderHook(() => useFlatEdges({ onConnectionDelete }));

      act(() => {
        result.current.handleConnectionDelete(null as any);
      });

      expect(storeResult.current.model.systems[0].connections).toHaveLength(1);
      expect(onConnectionDelete).not.toHaveBeenCalled();
    });
  });

  describe('empty edges', () => {
    it('should return empty array for unknown view level', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        // @ts-expect-error - Testing invalid view level
        storeResult.current.setViewLevel('invalid');
      });

      const { result } = renderHook(() => useFlatEdges());

      expect(result.current.edges).toHaveLength(0);
    });
  });
});