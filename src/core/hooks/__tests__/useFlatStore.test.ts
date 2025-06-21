import { act, renderHook } from '@testing-library/react';
import useFlatStore from '../useFlatStore';
import { useFlatC4Store } from '../../store/flatC4Store';

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any, options: any) => fn,
  subscribeWithSelector: (fn: any) => fn,
}));

describe('useFlatStore', () => {
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

  describe('getBlockById', () => {
    it('should find a system by ID', () => {
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
      const { result } = renderHook(() => useFlatStore());

      const foundBlock = result.current.getBlockById(systemId);
      expect(foundBlock).toBeDefined();
      expect(foundBlock?.id).toBe(systemId);
      expect(foundBlock?.name).toBe('Test System');
      expect(foundBlock?.type).toBe('system');
    });

    it('should find a container by ID', () => {
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
          name: 'Test Container',
          position: { x: 200, y: 100 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = storeResult.current.model.containers[0].id;
      const { result } = renderHook(() => useFlatStore());

      const foundBlock = result.current.getBlockById(containerId);
      expect(foundBlock).toBeDefined();
      expect(foundBlock?.id).toBe(containerId);
      expect(foundBlock?.name).toBe('Test Container');
      expect(foundBlock?.type).toBe('container');
    });

    it('should find a component by ID', () => {
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
        storeResult.current.addComponent(containerId, {
          name: 'Test Component',
          position: { x: 300, y: 150 },
          type: 'component',
          connections: [],
        });
      });

      const componentId = storeResult.current.model.components[0].id;
      const { result } = renderHook(() => useFlatStore());

      const foundBlock = result.current.getBlockById(componentId);
      expect(foundBlock).toBeDefined();
      expect(foundBlock?.id).toBe(componentId);
      expect(foundBlock?.name).toBe('Test Component');
      expect(foundBlock?.type).toBe('component');
    });

    it('should find a code element by ID', () => {
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
        storeResult.current.addCodeElement(componentId, {
          name: 'Test Class',
          position: { x: 400, y: 200 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
      });

      const codeElementId = storeResult.current.model.codeElements[0].id;
      const { result } = renderHook(() => useFlatStore());

      const foundBlock = result.current.getBlockById(codeElementId);
      expect(foundBlock).toBeDefined();
      expect(foundBlock?.id).toBe(codeElementId);
      expect(foundBlock?.name).toBe('Test Class');
      expect(foundBlock?.type).toBe('code');
    });

    it('should return undefined for non-existent ID', () => {
      const { result } = renderHook(() => useFlatStore());

      const foundBlock = result.current.getBlockById('non-existent-id');
      expect(foundBlock).toBeUndefined();
    });

    it('should find blocks across all types in a single call', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Add multiple blocks of different types
      act(() => {
        storeResult.current.addSystem({
          name: 'System 1',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Container 1',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.addComponent(containerId, {
          name: 'Component 1',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });

      const componentId = storeResult.current.model.components[0].id;

      act(() => {
        storeResult.current.addCodeElement(componentId, {
          name: 'Class 1',
          position: { x: 0, y: 0 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
      });

      const codeElementId = storeResult.current.model.codeElements[0].id;
      const { result } = renderHook(() => useFlatStore());

      // Should be able to find all different types
      expect(result.current.getBlockById(systemId)?.type).toBe('system');
      expect(result.current.getBlockById(containerId)?.type).toBe('container');
      expect(result.current.getBlockById(componentId)?.type).toBe('component');
      expect(result.current.getBlockById(codeElementId)?.type).toBe('code');
    });

    it('should handle empty store gracefully', () => {
      const { result } = renderHook(() => useFlatStore());

      const foundBlock = result.current.getBlockById('any-id');
      expect(foundBlock).toBeUndefined();
    });

    it('should find the first matching block when IDs are unique', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System 1',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.addSystem({
          name: 'Test System 2',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [system1, system2] = storeResult.current.model.systems;
      const { result } = renderHook(() => useFlatStore());

      // Each system should have unique IDs
      expect(system1.id).not.toBe(system2.id);
      
      // Should find correct system by ID
      expect(result.current.getBlockById(system1.id)?.name).toBe('Test System 1');
      expect(result.current.getBlockById(system2.id)?.name).toBe('Test System 2');
    });

    it('should update results when store changes', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Original System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;
      const { result } = renderHook(() => useFlatStore());

      // Initial state
      expect(result.current.getBlockById(systemId)?.name).toBe('Original System');

      // Update the system
      act(() => {
        storeResult.current.updateSystem(systemId, { name: 'Updated System' });
      });

      // Should reflect the update
      expect(result.current.getBlockById(systemId)?.name).toBe('Updated System');
    });

    it('should return undefined for deleted blocks', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System to Delete',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;
      const { result } = renderHook(() => useFlatStore());

      // Should find the system initially
      expect(result.current.getBlockById(systemId)).toBeDefined();

      // Delete the system
      act(() => {
        storeResult.current.removeSystem(systemId);
      });

      // Should not find the system after deletion
      expect(result.current.getBlockById(systemId)).toBeUndefined();
    });
  });
});