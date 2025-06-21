import { act, renderHook } from '@testing-library/react';
import { useFlatActiveElements } from '../useFlatActiveElements';
import { useFlatC4Store } from '../../store/flatC4Store';

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any, options: any) => fn,
  subscribeWithSelector: (fn: any) => fn,
}));

describe('useFlatActiveElements', () => {
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

  it('should return the same result as useActiveEntities', () => {
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

    act(() => {
      storeResult.current.setActiveSystem(systemId);
    });

    const { result } = renderHook(() => useFlatActiveElements());

    expect(result.current.activeSystem).toBeDefined();
    expect(result.current.activeSystem?.id).toBe(systemId);
    expect(result.current.activeSystem?.name).toBe('Test System');
    expect(result.current.viewLevel).toBe('container');
    expect(result.current.activeContainer).toBeUndefined();
    expect(result.current.activeComponent).toBeUndefined();
  });

  it('should return active container when set', () => {
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

    const containerId = storeResult.current.model.containers[0].id;

    act(() => {
      storeResult.current.setActiveContainer(containerId);
    });

    const { result } = renderHook(() => useFlatActiveElements());

    expect(result.current.activeSystem?.id).toBe(systemId);
    expect(result.current.activeContainer).toBeDefined();
    expect(result.current.activeContainer?.id).toBe(containerId);
    expect(result.current.activeContainer?.name).toBe('Test Container');
    expect(result.current.viewLevel).toBe('component');
    expect(result.current.activeComponent).toBeUndefined();
  });

  it('should return active component when set', () => {
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
      storeResult.current.setActiveSystem(systemId);
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
        position: { x: 300, y: 150 },
        type: 'component',
        connections: [],
      });
    });

    const componentId = storeResult.current.model.components[0].id;

    act(() => {
      storeResult.current.setActiveComponent(componentId);
    });

    const { result } = renderHook(() => useFlatActiveElements());

    expect(result.current.activeSystem?.id).toBe(systemId);
    expect(result.current.activeContainer?.id).toBe(containerId);
    expect(result.current.activeComponent).toBeDefined();
    expect(result.current.activeComponent?.id).toBe(componentId);
    expect(result.current.activeComponent?.name).toBe('Test Component');
    expect(result.current.viewLevel).toBe('code');
  });

  it('should return undefined for all active elements in initial state', () => {
    const { result } = renderHook(() => useFlatActiveElements());

    expect(result.current.activeSystem).toBeUndefined();
    expect(result.current.activeContainer).toBeUndefined();
    expect(result.current.activeComponent).toBeUndefined();
    expect(result.current.viewLevel).toBe('system');
  });

  it('should update when active elements change', () => {
    const { result: storeResult } = renderHook(() => useFlatC4Store());
    
    act(() => {
      storeResult.current.addSystem({
        name: 'System 1',
        position: { x: 0, y: 0 },
        type: 'system',
        connections: [],
      });
      storeResult.current.addSystem({
        name: 'System 2',
        position: { x: 100, y: 100 },
        type: 'system',
        connections: [],
      });
    });

    const [system1, system2] = storeResult.current.model.systems;
    const { result } = renderHook(() => useFlatActiveElements());

    // Initially no active system
    expect(result.current.activeSystem).toBeUndefined();

    // Set first system as active
    act(() => {
      storeResult.current.setActiveSystem(system1.id);
    });

    expect(result.current.activeSystem?.id).toBe(system1.id);
    expect(result.current.activeSystem?.name).toBe('System 1');

    // Change to second system
    act(() => {
      storeResult.current.setActiveSystem(system2.id);
    });

    expect(result.current.activeSystem?.id).toBe(system2.id);
    expect(result.current.activeSystem?.name).toBe('System 2');
  });

  it('should reflect view level changes', () => {
    const { result: storeResult } = renderHook(() => useFlatC4Store());
    const { result } = renderHook(() => useFlatActiveElements());

    // Initial view level
    expect(result.current.viewLevel).toBe('system');

    // Change view level
    act(() => {
      storeResult.current.setViewLevel('container');
    });

    expect(result.current.viewLevel).toBe('container');

    act(() => {
      storeResult.current.setViewLevel('component');
    });

    expect(result.current.viewLevel).toBe('component');

    act(() => {
      storeResult.current.setViewLevel('code');
    });

    expect(result.current.viewLevel).toBe('code');
  });

  it('should clear active elements when navigating up the hierarchy', () => {
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
      storeResult.current.setActiveSystem(systemId);
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
        name: 'Parent Component',
        position: { x: 0, y: 0 },
        type: 'component',
        connections: [],
      });
    });

    const componentId = storeResult.current.model.components[0].id;

    act(() => {
      storeResult.current.setActiveComponent(componentId);
    });

    const { result } = renderHook(() => useFlatActiveElements());

    // Should have all active elements
    expect(result.current.activeSystem?.id).toBe(systemId);
    expect(result.current.activeContainer?.id).toBe(containerId);
    expect(result.current.activeComponent?.id).toBe(componentId);
    expect(result.current.viewLevel).toBe('code');

    // Navigate back to container view
    act(() => {
      storeResult.current.setViewLevel('container');
    });

    expect(result.current.activeSystem?.id).toBe(systemId);
    expect(result.current.activeContainer).toBeUndefined();
    expect(result.current.activeComponent).toBeUndefined();
    expect(result.current.viewLevel).toBe('container');

    // Navigate back to system view
    act(() => {
      storeResult.current.setViewLevel('system');
    });

    expect(result.current.activeSystem).toBeUndefined();
    expect(result.current.activeContainer).toBeUndefined();
    expect(result.current.activeComponent).toBeUndefined();
    expect(result.current.viewLevel).toBe('system');
  });

  it('should handle missing active elements gracefully', () => {
    const { result: storeResult } = renderHook(() => useFlatC4Store());
    
    // Manually set active IDs that don't exist
    act(() => {
      storeResult.current.setModel({
        systems: [],
        containers: [],
        components: [],
        codeElements: [],
        viewLevel: 'container',
        activeSystemId: 'non-existent-system-id',
        activeContainerId: 'non-existent-container-id',
        activeComponentId: 'non-existent-component-id',
      });
    });

    const { result } = renderHook(() => useFlatActiveElements());

    expect(result.current.activeSystem).toBeUndefined();
    expect(result.current.activeContainer).toBeUndefined();
    expect(result.current.activeComponent).toBeUndefined();
    expect(result.current.viewLevel).toBe('container');
  });
});