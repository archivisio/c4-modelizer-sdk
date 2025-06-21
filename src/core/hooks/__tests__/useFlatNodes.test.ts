import { act, renderHook } from '@testing-library/react';
import { useFlatNodes } from '../useFlatNodes';
import { useFlatC4Store } from '../../store/flatC4Store';

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any, options: any) => fn,
  subscribeWithSelector: (fn: any) => fn,
}));

describe('useFlatNodes', () => {
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

  describe('system nodes', () => {
    it('should return system nodes for system view level', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 100, y: 50 },
          type: 'system',
          connections: [],
        });
      });

      const { result } = renderHook(() => useFlatNodes());

      expect(result.current.systemNodes).toHaveLength(1);
      expect(result.current.systemNodes[0]).toMatchObject({
        id: expect.any(String),
        type: 'system',
        position: { x: 100, y: 50 },
        data: expect.objectContaining({
          name: 'Test System',
          type: 'system',
        }),
      });
    });

    it('should include onEdit callback in system node data', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const onEditSystem = jest.fn();
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 100, y: 50 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;
      const { result } = renderHook(() => useFlatNodes({ onEditSystem }));

      act(() => {
        result.current.systemNodes[0].data.onEdit();
      });

      expect(onEditSystem).toHaveBeenCalledWith(systemId);
    });
  });

  describe('container nodes', () => {
    it('should return container nodes when active system exists', () => {
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
          name: 'Test Container',
          position: { x: 200, y: 100 },
          type: 'container',
          connections: [],
        });
      });

      const { result } = renderHook(() => useFlatNodes());

      expect(result.current.containerNodes).toHaveLength(1);
      expect(result.current.containerNodes[0]).toMatchObject({
        id: expect.any(String),
        type: 'container',
        position: { x: 200, y: 100 },
        data: expect.objectContaining({
          name: 'Test Container',
          type: 'container',
        }),
      });
    });

    it('should return empty array when no active system', () => {
      const { result } = renderHook(() => useFlatNodes());
      expect(result.current.containerNodes).toHaveLength(0);
    });

    it('should include onEdit callback in container node data', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const onEditContainer = jest.fn();
      
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
          name: 'Test Container',
          position: { x: 200, y: 100 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = storeResult.current.model.containers[0].id;
      const { result } = renderHook(() => useFlatNodes({ onEditContainer }));

      act(() => {
        result.current.containerNodes[0].data.onEdit();
      });

      expect(onEditContainer).toHaveBeenCalledWith(containerId);
    });
  });

  describe('component nodes', () => {
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

    it('should return component nodes when active container exists', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.setActiveContainer(containerId);
        storeResult.current.addComponent(containerId, {
          name: 'Test Component',
          position: { x: 300, y: 150 },
          type: 'component',
          connections: [],
        });
      });

      const { result } = renderHook(() => useFlatNodes());

      expect(result.current.componentNodes).toHaveLength(1);
      expect(result.current.componentNodes[0]).toMatchObject({
        id: expect.any(String),
        type: 'component',
        position: { x: 300, y: 150 },
        data: expect.objectContaining({
          name: 'Test Component',
          type: 'component',
        }),
      });
    });

    it('should return empty array when no active container', () => {
      const { result } = renderHook(() => useFlatNodes());
      expect(result.current.componentNodes).toHaveLength(0);
    });

    it('should include onEdit callback in component node data', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const onEditComponent = jest.fn();
      
      act(() => {
        storeResult.current.setActiveContainer(containerId);
        storeResult.current.addComponent(containerId, {
          name: 'Test Component',
          position: { x: 300, y: 150 },
          type: 'component',
          connections: [],
        });
      });

      const componentId = storeResult.current.model.components[0].id;
      const { result } = renderHook(() => useFlatNodes({ onEditComponent }));

      act(() => {
        result.current.componentNodes[0].data.onEdit();
      });

      expect(onEditComponent).toHaveBeenCalledWith(componentId);
    });
  });

  describe('code nodes', () => {
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

    it('should return code nodes when active component exists', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.setActiveComponent(componentId);
        storeResult.current.addCodeElement(componentId, {
          name: 'Test Class',
          position: { x: 400, y: 200 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
      });

      const { result } = renderHook(() => useFlatNodes());

      expect(result.current.codeNodes).toHaveLength(1);
      expect(result.current.codeNodes[0]).toMatchObject({
        id: expect.any(String),
        type: 'code',
        position: { x: 400, y: 200 },
        data: expect.objectContaining({
          name: 'Test Class',
          type: 'code',
          codeType: 'class',
        }),
      });
    });

    it('should return empty array when no active component', () => {
      const { result } = renderHook(() => useFlatNodes());
      expect(result.current.codeNodes).toHaveLength(0);
    });

    it('should include onEdit callback in code node data', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const onEditCode = jest.fn();
      
      act(() => {
        storeResult.current.setActiveComponent(componentId);
        storeResult.current.addCodeElement(componentId, {
          name: 'Test Class',
          position: { x: 400, y: 200 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
      });

      const codeElementId = storeResult.current.model.codeElements[0].id;
      const { result } = renderHook(() => useFlatNodes({ onEditCode }));

      act(() => {
        result.current.codeNodes[0].data.onEdit();
      });

      expect(onEditCode).toHaveBeenCalledWith(codeElementId);
    });
  });

  describe('currentNodes', () => {
    it('should return system nodes when view level is system', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 100, y: 50 },
          type: 'system',
          connections: [],
        });
        storeResult.current.setViewLevel('system');
      });

      const { result } = renderHook(() => useFlatNodes());

      expect(result.current.currentNodes).toHaveLength(1);
      expect(result.current.currentNodes[0].type).toBe('system');
    });

    it('should return container nodes when view level is container', () => {
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
          name: 'Test Container',
          position: { x: 200, y: 100 },
          type: 'container',
          connections: [],
        });
      });

      const { result } = renderHook(() => useFlatNodes());

      expect(result.current.currentNodes).toHaveLength(1);
      expect(result.current.currentNodes[0].type).toBe('container');
    });

    it('should return empty array for unknown view level', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        // @ts-expect-error - Testing invalid view level
        storeResult.current.setViewLevel('invalid');
      });

      const { result } = renderHook(() => useFlatNodes());

      expect(result.current.currentNodes).toHaveLength(0);
    });
  });

  describe('getNodeById', () => {
    it('should find a node by ID across all node types', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 100, y: 50 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;
      const { result } = renderHook(() => useFlatNodes());

      const foundNode = result.current.getNodeById(systemId);
      expect(foundNode).toBeDefined();
      expect(foundNode?.id).toBe(systemId);
      expect(foundNode?.type).toBe('system');
    });

    it('should return undefined for non-existent node ID', () => {
      const { result } = renderHook(() => useFlatNodes());

      const foundNode = result.current.getNodeById('non-existent-id');
      expect(foundNode).toBeUndefined();
    });
  });

  describe('handleNodePositionChange', () => {
    it('should update system position in system view', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 100, y: 50 },
          type: 'system',
          connections: [],
        });
        storeResult.current.setViewLevel('system');
      });

      const systemId = storeResult.current.model.systems[0].id;
      const { result } = renderHook(() => useFlatNodes());

      act(() => {
        result.current.handleNodePositionChange(systemId, { x: 200, y: 150 });
      });

      expect(storeResult.current.model.systems[0].position).toEqual({ x: 200, y: 150 });
    });

    it('should update container position in container view', () => {
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
          name: 'Test Container',
          position: { x: 100, y: 50 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = storeResult.current.model.containers[0].id;
      const { result } = renderHook(() => useFlatNodes());

      act(() => {
        result.current.handleNodePositionChange(containerId, { x: 300, y: 200 });
      });

      expect(storeResult.current.model.containers[0].position).toEqual({ x: 300, y: 200 });
    });

    it('should update component position in component view', () => {
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
        storeResult.current.addContainer(systemId, {
          name: 'Parent Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.setActiveContainer(containerId);
        storeResult.current.addComponent(containerId, {
          name: 'Test Component',
          position: { x: 150, y: 75 },
          type: 'component',
          connections: [],
        });
        storeResult.current.setViewLevel('component');
      });

      const componentId = storeResult.current.model.components[0].id;
      const { result } = renderHook(() => useFlatNodes());

      act(() => {
        result.current.handleNodePositionChange(componentId, { x: 400, y: 250 });
      });

      expect(storeResult.current.model.components[0].position).toEqual({ x: 400, y: 250 });
    });

    it('should update code element position in code view', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Setup complete hierarchy
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
        storeResult.current.addContainer(systemId, {
          name: 'Parent Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.addComponent(containerId, {
          name: 'Parent Component',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });

      const componentId = storeResult.current.model.components[0].id;

      act(() => {
        storeResult.current.setActiveComponent(componentId);
        storeResult.current.addCodeElement(componentId, {
          name: 'Test Class',
          position: { x: 200, y: 100 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
        storeResult.current.setViewLevel('code');
      });

      const codeElementId = storeResult.current.model.codeElements[0].id;
      const { result } = renderHook(() => useFlatNodes());

      act(() => {
        result.current.handleNodePositionChange(codeElementId, { x: 500, y: 300 });
      });

      expect(storeResult.current.model.codeElements[0].position).toEqual({ x: 500, y: 300 });
    });
  });

  describe('callback dependencies', () => {
    it('should update nodes when callbacks change', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 100, y: 50 },
          type: 'system',
          connections: [],
        });
      });

      const firstCallback = jest.fn();
      const { result, rerender } = renderHook(
        ({ onEditSystem }) => useFlatNodes({ onEditSystem }),
        { initialProps: { onEditSystem: firstCallback } }
      );

      const initialNode = result.current.systemNodes[0];

      const secondCallback = jest.fn();
      rerender({ onEditSystem: secondCallback });

      const updatedNode = result.current.systemNodes[0];
      
      // Node should be recreated with new callback
      expect(updatedNode).not.toBe(initialNode);

      act(() => {
        updatedNode.data.onEdit();
      });

      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalled();
    });
  });
});