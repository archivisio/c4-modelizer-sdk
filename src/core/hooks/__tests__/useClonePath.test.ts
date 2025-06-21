import { act, renderHook } from '@testing-library/react';
import { useClonePath } from '../useClonePath';
import { useFlatC4Store } from '../../store/flatC4Store';
import { BaseBlock } from '../../types/c4';

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any, options: any) => fn,
  subscribeWithSelector: (fn: any) => fn,
}));

describe('useClonePath', () => {
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

  describe('non-cloned items', () => {
    it('should return null for items without original property', () => {
      const item: BaseBlock = {
        id: 'test-id',
        name: 'Test Item',
        type: 'system',
        position: { x: 0, y: 0 },
        connections: [],
      };

      const { result } = renderHook(() => useClonePath(item));
      expect(result.current).toBeNull();
    });

    it('should return null for items with undefined original', () => {
      const item: BaseBlock = {
        id: 'test-id',
        name: 'Test Item',
        type: 'system',
        position: { x: 0, y: 0 },
        connections: [],
        original: undefined,
      };

      const { result } = renderHook(() => useClonePath(item));
      expect(result.current).toBeNull();
    });
  });

  describe('system clones', () => {
    it('should return null for system clones', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Original System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const originalSystem = storeResult.current.model.systems[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned System',
        type: 'system',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalSystem.id,
          name: originalSystem.name,
          type: 'system',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBeNull();
    });
  });

  describe('container clones', () => {
    it('should return full path for container clone with system', () => {
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
          name: 'Original Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      const originalContainer = storeResult.current.model.containers[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Container',
        type: 'container',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalContainer.id,
          name: originalContainer.name,
          type: 'container',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBe('Parent System / Original Container');
    });

    it('should return container name only when system not found', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Create a container manually without proper system setup
      act(() => {
        storeResult.current.setModel({
          systems: [],
          containers: [{
            id: 'container-id',
            name: 'Orphaned Container',
            type: 'container',
            position: { x: 0, y: 0 },
            connections: [],
            systemId: 'non-existent-system-id',
          }],
          components: [],
          codeElements: [],
          viewLevel: 'system',
        });
      });

      const originalContainer = storeResult.current.model.containers[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Container',
        type: 'container',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalContainer.id,
          name: originalContainer.name,
          type: 'container',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBe('Orphaned Container');
    });

    it('should return null when original container not found', () => {
      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Container',
        type: 'container',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: 'non-existent-id',
          name: 'Non-existent Container',
          type: 'container',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBeNull();
    });
  });

  describe('component clones', () => {
    it('should return full path for component clone with system and container', () => {
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
          name: 'Original Component',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });

      const originalComponent = storeResult.current.model.components[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Component',
        type: 'component',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalComponent.id,
          name: originalComponent.name,
          type: 'component',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBe('Parent System / Parent Container / Original Component');
    });

    it('should return partial path when system not found', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Create container and component without system
      act(() => {
        storeResult.current.setModel({
          systems: [],
          containers: [{
            id: 'container-id',
            name: 'Orphaned Container',
            type: 'container',
            position: { x: 0, y: 0 },
            connections: [],
            systemId: 'non-existent-system-id',
          }],
          components: [{
            id: 'component-id',
            name: 'Original Component',
            type: 'component',
            position: { x: 0, y: 0 },
            connections: [],
            containerId: 'container-id',
            systemId: 'non-existent-system-id',
          }],
          codeElements: [],
          viewLevel: 'system',
        });
      });

      const originalComponent = storeResult.current.model.components[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Component',
        type: 'component',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalComponent.id,
          name: originalComponent.name,
          type: 'component',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBe('Orphaned Container / Original Component');
    });

    it('should return component name only when container not found', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Create component without container
      act(() => {
        storeResult.current.setModel({
          systems: [],
          containers: [],
          components: [{
            id: 'component-id',
            name: 'Orphaned Component',
            type: 'component',
            position: { x: 0, y: 0 },
            connections: [],
            containerId: 'non-existent-container-id',
            systemId: 'non-existent-system-id',
          }],
          codeElements: [],
          viewLevel: 'system',
        });
      });

      const originalComponent = storeResult.current.model.components[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Component',
        type: 'component',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalComponent.id,
          name: originalComponent.name,
          type: 'component',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBe('Orphaned Component');
    });

    it('should return null when original component not found', () => {
      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Component',
        type: 'component',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: 'non-existent-id',
          name: 'Non-existent Component',
          type: 'component',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBeNull();
    });
  });

  describe('code element clones', () => {
    it('should return full path for code element clone with complete hierarchy', () => {
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
          name: 'Original Class',
          position: { x: 0, y: 0 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
      });

      const originalCodeElement = storeResult.current.model.codeElements[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Class',
        type: 'code',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalCodeElement.id,
          name: originalCodeElement.name,
          type: 'code',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBe('Parent System / Parent Container / Parent Component / Original Class');
    });

    it('should return partial path when system not found', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Create hierarchy without system
      act(() => {
        storeResult.current.setModel({
          systems: [],
          containers: [{
            id: 'container-id',
            name: 'Orphaned Container',
            type: 'container',
            position: { x: 0, y: 0 },
            connections: [],
            systemId: 'non-existent-system-id',
          }],
          components: [{
            id: 'component-id',
            name: 'Orphaned Component',
            type: 'component',
            position: { x: 0, y: 0 },
            connections: [],
            containerId: 'container-id',
            systemId: 'non-existent-system-id',
          }],
          codeElements: [{
            id: 'code-id',
            name: 'Original Class',
            type: 'code',
            codeType: 'class',
            position: { x: 0, y: 0 },
            connections: [],
            componentId: 'component-id',
          }],
          viewLevel: 'system',
        });
      });

      const originalCodeElement = storeResult.current.model.codeElements[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Class',
        type: 'code',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalCodeElement.id,
          name: originalCodeElement.name,
          type: 'code',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBe('Orphaned Container / Orphaned Component / Original Class');
    });

    it('should return minimal path when only component exists', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Create only component and code element
      act(() => {
        storeResult.current.setModel({
          systems: [],
          containers: [],
          components: [{
            id: 'component-id',
            name: 'Orphaned Component',
            type: 'component',
            position: { x: 0, y: 0 },
            connections: [],
            containerId: 'non-existent-container-id',
            systemId: 'non-existent-system-id',
          }],
          codeElements: [{
            id: 'code-id',
            name: 'Original Class',
            type: 'code',
            codeType: 'class',
            position: { x: 0, y: 0 },
            connections: [],
            componentId: 'component-id',
          }],
          viewLevel: 'system',
        });
      });

      const originalCodeElement = storeResult.current.model.codeElements[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Class',
        type: 'code',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalCodeElement.id,
          name: originalCodeElement.name,
          type: 'code',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBe('Orphaned Component / Original Class');
    });

    it('should return code element name only when component not found', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Create orphaned code element
      act(() => {
        storeResult.current.setModel({
          systems: [],
          containers: [],
          components: [],
          codeElements: [{
            id: 'code-id',
            name: 'Orphaned Class',
            type: 'code',
            codeType: 'class',
            position: { x: 0, y: 0 },
            connections: [],
            componentId: 'non-existent-component-id',
          }],
          viewLevel: 'system',
        });
      });

      const originalCodeElement = storeResult.current.model.codeElements[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Class',
        type: 'code',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalCodeElement.id,
          name: originalCodeElement.name,
          type: 'code',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBe('Orphaned Class');
    });

    it('should return null when original code element not found', () => {
      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Class',
        type: 'code',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: 'non-existent-id',
          name: 'Non-existent Class',
          type: 'code',
        },
      };

      const { result } = renderHook(() => useClonePath(clonedItem));
      expect(result.current).toBeNull();
    });
  });

  describe('memoization', () => {
    it('should memoize results based on item and model', () => {
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

      const originalContainer = storeResult.current.model.containers[0];

      const clonedItem: BaseBlock = {
        id: 'cloned-id',
        name: 'Cloned Container',
        type: 'container',
        position: { x: 100, y: 100 },
        connections: [],
        original: {
          id: originalContainer.id,
          name: originalContainer.name,
          type: 'container',
        },
      };

      const { result, rerender } = renderHook(() => useClonePath(clonedItem));
      const firstResult = result.current;

      // Rerender with same item should return same result
      rerender();
      expect(result.current).toBe(firstResult);

      // Change the system name to test memoization
      act(() => {
        storeResult.current.updateSystem(systemId, { name: 'Updated System' });
      });

      rerender();
      expect(result.current).toBe('Updated System / Parent Container');
      expect(result.current).not.toBe(firstResult);
    });
  });
});