import { act, renderHook } from '@testing-library/react';
import { useFlatSearch } from '../useFlatSearch';
import { useFlatC4Store } from '../../store/flatC4Store';

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any, options: any) => fn,
  subscribeWithSelector: (fn: any) => fn,
}));

describe('useFlatSearch', () => {
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

  describe('search value management', () => {
    it('should initialize with empty search value', () => {
      const { result } = renderHook(() => useFlatSearch());
      expect(result.current.searchValue).toBe('');
    });

    it('should update search value', () => {
      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('test search');
      });

      expect(result.current.searchValue).toBe('test search');
    });
  });

  describe('search results', () => {
    it('should return empty results when search value is empty', () => {
      const { result } = renderHook(() => useFlatSearch());
      expect(result.current.searchResults).toHaveLength(0);
    });

    it('should filter items by name (case insensitive)', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Add systems and containers so we can search for containers while in system view
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
          name: 'Test System Alpha Container',
          position: { x: 100, y: 100 },
          type: 'container',
          connections: [],
        });
        storeResult.current.addContainer(systemId, {
          name: 'Another System Beta Container',
          position: { x: 200, y: 200 },
          type: 'container',
          connections: [],
        });
        storeResult.current.addContainer(systemId, {
          name: 'Different Service Container',
          position: { x: 300, y: 300 },
          type: 'container',
          connections: [],
        });
        storeResult.current.setViewLevel('system');
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('system');
      });

      expect(result.current.searchResults).toHaveLength(2);
      expect(result.current.searchResults.map(item => item.name)).toEqual([
        'Test System Alpha Container',
        'Another System Beta Container'
      ]);
    });

    it('should filter items by name with case insensitive search', () => {
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
          name: 'Test System Alpha Container',
          position: { x: 100, y: 100 },
          type: 'container',
          connections: [],
        });
        storeResult.current.setViewLevel('system');
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('ALPHA');
      });

      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].name).toBe('Test System Alpha Container');
    });
  });

  describe('view level filtering in system view', () => {
    it('should exclude systems from search results in system view', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.setViewLevel('system');
      });

      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Test Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('test');
      });

      // Should find container but not system (systems are excluded in system view)
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].name).toBe('Test Container');
      expect(result.current.searchResults[0].type).toBe('container');
    });
  });

  describe('view level filtering in container view', () => {
    it('should exclude containers from active system in container view', () => {
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
        storeResult.current.addContainer(systemA.id, {
          name: 'Test Container A',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
        storeResult.current.addContainer(systemB.id, {
          name: 'Test Container B',
          position: { x: 100, y: 100 },
          type: 'container',
          connections: [],
        });
        storeResult.current.setActiveSystem(systemA.id);
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('test');
      });

      // Should find Container B but not Container A (Container A belongs to active system)
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].name).toBe('Test Container B');
    });
  });

  describe('view level filtering in component view', () => {
    it('should exclude components from active container in component view', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
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
        storeResult.current.addComponent(containerA.id, {
          name: 'Test Component A',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
        storeResult.current.addComponent(containerB.id, {
          name: 'Test Component B',
          position: { x: 100, y: 100 },
          type: 'component',
          connections: [],
        });
        storeResult.current.setActiveContainer(containerA.id);
        storeResult.current.setViewLevel('component');
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('test');
      });

      // Should find Component B but not Component A (Component A belongs to active container)
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].name).toBe('Test Component B');
    });
  });

  describe('view level filtering in code view', () => {
    it('should exclude code elements from active component in code view', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Setup complete hierarchy
      act(() => {
        storeResult.current.addSystem({
          name: 'System A',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Container A',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
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
        storeResult.current.addCodeElement(componentA.id, {
          name: 'Test Class A',
          position: { x: 0, y: 0 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
        storeResult.current.addCodeElement(componentB.id, {
          name: 'Test Class B',
          position: { x: 100, y: 100 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
        storeResult.current.setActiveComponent(componentA.id);
        storeResult.current.setViewLevel('code');
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('test');
      });

      // Should find Class B but not Class A (Class A belongs to active component)
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].name).toBe('Test Class B');
    });
  });

  describe('clone filtering', () => {
    it('should exclude cloned items from search results', () => {
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

      // Manually add a cloned system to test clone filtering
      act(() => {
        storeResult.current.setModel({
          ...storeResult.current.model,
          systems: [
            ...storeResult.current.model.systems,
            {
              ...originalSystem,
              id: 'cloned-system-id',
              name: 'Test Clone System',
              original: {
                id: originalSystem.id,
                name: originalSystem.name,
              },
            } as any,
          ],
        });
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('system');
      });

      // Should not find the cloned system in results
      expect(result.current.searchResults.some(item => item.name === 'Test Clone System')).toBe(false);
    });

    it('should exclude items that have clones in current view', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Original System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        storeResult.current.setViewLevel('system');
      });

      const originalSystem = storeResult.current.model.systems[0];

      // Add a cloned system that appears in current view
      act(() => {
        storeResult.current.setModel({
          ...storeResult.current.model,
          systems: [
            ...storeResult.current.model.systems,
            {
              ...originalSystem,
              id: 'cloned-system-id',
              name: 'Cloned System',
              original: {
                id: originalSystem.id,
                name: originalSystem.name,
              },
            } as any,
          ],
        });
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('original');
      });

      // Should not find the original system because it has a clone in current view
      expect(result.current.searchResults.some(item => item.name === 'Original System')).toBe(false);
    });
  });

  describe('mixed content search', () => {
    it('should search across all item types', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      // Create a hierarchy with different types
      act(() => {
        storeResult.current.addSystem({
          name: 'User System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'User Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.addComponent(containerId, {
          name: 'User Component',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });

      const componentId = storeResult.current.model.components[0].id;

      act(() => {
        storeResult.current.addCodeElement(componentId, {
          name: 'User Class',
          position: { x: 0, y: 0 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
        storeResult.current.setViewLevel('system');
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('user');
      });

      // Should find container, component, and code element but not system (excluded in system view)
      expect(result.current.searchResults).toHaveLength(3);
      const resultTypes = result.current.searchResults.map(item => item.type);
      expect(resultTypes).toContain('container');
      expect(resultTypes).toContain('component');
      expect(resultTypes).toContain('code');
      expect(resultTypes).not.toContain('system');
    });
  });

  describe('edge cases', () => {
    it('should handle empty search gracefully', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('');
      });

      expect(result.current.searchResults).toHaveLength(0);
    });

    it('should handle whitespace-only search', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('   ');
      });

      expect(result.current.searchResults).toHaveLength(0);
    });

    it('should handle search with no matches', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const { result } = renderHook(() => useFlatSearch());

      act(() => {
        result.current.setSearchValue('nonexistent');
      });

      expect(result.current.searchResults).toHaveLength(0);
    });
  });
});