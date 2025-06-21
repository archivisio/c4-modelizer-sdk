import { act, renderHook } from '@testing-library/react';
import { useFlatC4Store, useActiveEntities, useFilteredEntities } from '../flatC4Store';
import { SystemBlock, ContainerBlock, ComponentBlock, CodeBlock } from '../../types/c4';

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any, options: any) => fn,
  subscribeWithSelector: (fn: any) => fn,
}));

describe('FlatC4Store', () => {
  beforeEach(() => {
    // Reset store before each test
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

  describe('System Management', () => {
    it('should add a new system', () => {
      const { result } = renderHook(() => useFlatC4Store());

      const systemData = {
        name: 'Test System',
        description: 'A test system',
        position: { x: 100, y: 100 },
        type: 'system' as const,
        connections: [],
      };

      act(() => {
        result.current.addSystem(systemData);
      });

      expect(result.current.model.systems).toHaveLength(1);
      expect(result.current.model.systems[0]).toMatchObject({
        name: 'Test System',
        description: 'A test system',
        position: { x: 100, y: 100 },
        type: 'system',
      });
      expect(result.current.model.systems[0].id).toBeDefined();
    });

    it('should update an existing system', () => {
      const { result } = renderHook(() => useFlatC4Store());

      // Add a system first
      act(() => {
        result.current.addSystem({
          name: 'Original System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = result.current.model.systems[0].id;

      // Update the system
      act(() => {
        result.current.updateSystem(systemId, {
          name: 'Updated System',
          description: 'Updated description',
        });
      });

      expect(result.current.model.systems[0]).toMatchObject({
        name: 'Updated System',
        description: 'Updated description',
      });
    });

    it('should remove a system', () => {
      const { result } = renderHook(() => useFlatC4Store());

      // Add a system first
      act(() => {
        result.current.addSystem({
          name: 'System to Delete',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = result.current.model.systems[0].id;

      // Remove the system
      act(() => {
        result.current.removeSystem(systemId);
      });

      expect(result.current.model.systems).toHaveLength(0);
    });

    it('should connect two systems', () => {
      const { result } = renderHook(() => useFlatC4Store());

      // Add two systems
      act(() => {
        result.current.addSystem({
          name: 'System 1',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        result.current.addSystem({
          name: 'System 2',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [system1, system2] = result.current.model.systems;

      // Connect system1 to system2
      act(() => {
        result.current.connectSystems(system1.id, {
          targetId: system2.id,
          label: 'Test Connection',
        });
      });

      expect(result.current.model.systems[0].connections).toHaveLength(1);
      expect(result.current.model.systems[0].connections[0]).toMatchObject({
        targetId: system2.id,
        label: 'Test Connection',
      });
    });

    it('should not create duplicate connections', () => {
      const { result } = renderHook(() => useFlatC4Store());

      // Add two systems
      act(() => {
        result.current.addSystem({
          name: 'System 1',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        result.current.addSystem({
          name: 'System 2',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [system1, system2] = result.current.model.systems;

      // Connect system1 to system2 twice
      act(() => {
        result.current.connectSystems(system1.id, {
          targetId: system2.id,
          label: 'Connection 1',
        });
        result.current.connectSystems(system1.id, {
          targetId: system2.id,
          label: 'Connection 2',
        });
      });

      expect(result.current.model.systems[0].connections).toHaveLength(1);
    });
  });

  describe('Container Management', () => {
    let systemId: string;

    beforeEach(() => {
      const { result } = renderHook(() => useFlatC4Store());
      act(() => {
        result.current.addSystem({
          name: 'Parent System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });
      systemId = result.current.model.systems[0].id;
    });

    it('should add a container to a system', () => {
      const { result } = renderHook(() => useFlatC4Store());

      act(() => {
        result.current.addContainer(systemId, {
          name: 'Test Container',
          position: { x: 50, y: 50 },
          type: 'container',
          connections: [],
        });
      });

      expect(result.current.model.containers).toHaveLength(1);
      expect(result.current.model.containers[0]).toMatchObject({
        name: 'Test Container',
        systemId,
        type: 'container',
      });
    });

    it('should update a container', () => {
      const { result } = renderHook(() => useFlatC4Store());

      act(() => {
        result.current.addContainer(systemId, {
          name: 'Original Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = result.current.model.containers[0].id;

      act(() => {
        result.current.updateContainer(containerId, {
          name: 'Updated Container',
          description: 'Updated description',
        });
      });

      expect(result.current.model.containers[0]).toMatchObject({
        name: 'Updated Container',
        description: 'Updated description',
      });
    });

    it('should remove a container and its children', () => {
      const { result } = renderHook(() => useFlatC4Store());

      act(() => {
        result.current.addContainer(systemId, {
          name: 'Container to Delete',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = result.current.model.containers[0].id;

      // Add a component to this container
      act(() => {
        result.current.addComponent(containerId, {
          name: 'Child Component',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });

      expect(result.current.model.components).toHaveLength(1);

      // Remove the container
      act(() => {
        result.current.removeContainer(containerId);
      });

      expect(result.current.model.containers).toHaveLength(0);
      expect(result.current.model.components).toHaveLength(0);
    });
  });

  describe('Component Management', () => {
    let systemId: string;
    let containerId: string;

    beforeEach(() => {
      const { result } = renderHook(() => useFlatC4Store());
      act(() => {
        result.current.addSystem({
          name: 'Parent System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });
      systemId = result.current.model.systems[0].id;

      act(() => {
        result.current.addContainer(systemId, {
          name: 'Parent Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });
      containerId = result.current.model.containers[0].id;
    });

    it('should add a component to a container', () => {
      const { result } = renderHook(() => useFlatC4Store());

      act(() => {
        result.current.addComponent(containerId, {
          name: 'Test Component',
          position: { x: 25, y: 25 },
          type: 'component',
          connections: [],
        });
      });

      expect(result.current.model.components).toHaveLength(1);
      expect(result.current.model.components[0]).toMatchObject({
        name: 'Test Component',
        containerId,
        systemId,
        type: 'component',
      });
    });

    it('should remove a component and its code elements', () => {
      const { result } = renderHook(() => useFlatC4Store());

      act(() => {
        result.current.addComponent(containerId, {
          name: 'Component to Delete',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });

      const componentId = result.current.model.components[0].id;

      // Add a code element to this component
      act(() => {
        result.current.addCodeElement(componentId, {
          name: 'Child Code',
          position: { x: 0, y: 0 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
      });

      expect(result.current.model.codeElements).toHaveLength(1);

      // Remove the component
      act(() => {
        result.current.removeComponent(componentId);
      });

      expect(result.current.model.components).toHaveLength(0);
      expect(result.current.model.codeElements).toHaveLength(0);
    });
  });

  describe('Code Element Management', () => {
    let componentId: string;

    beforeEach(() => {
      const { result } = renderHook(() => useFlatC4Store());
      
      // Setup hierarchy: System -> Container -> Component
      act(() => {
        result.current.addSystem({
          name: 'System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });
      const systemId = result.current.model.systems[0].id;

      act(() => {
        result.current.addContainer(systemId, {
          name: 'Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });
      const containerId = result.current.model.containers[0].id;

      act(() => {
        result.current.addComponent(containerId, {
          name: 'Component',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });
      componentId = result.current.model.components[0].id;
    });

    it('should add a code element to a component', () => {
      const { result } = renderHook(() => useFlatC4Store());

      act(() => {
        result.current.addCodeElement(componentId, {
          name: 'Test Class',
          position: { x: 10, y: 10 },
          type: 'code',
          codeType: 'class',
          code: 'class TestClass {}',
          connections: [],
        });
      });

      expect(result.current.model.codeElements).toHaveLength(1);
      expect(result.current.model.codeElements[0]).toMatchObject({
        name: 'Test Class',
        componentId,
        codeType: 'class',
        code: 'class TestClass {}',
        type: 'code',
      });
    });

    it('should update a code element', () => {
      const { result } = renderHook(() => useFlatC4Store());

      act(() => {
        result.current.addCodeElement(componentId, {
          name: 'Original Class',
          position: { x: 0, y: 0 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
      });

      const codeElementId = result.current.model.codeElements[0].id;

      act(() => {
        result.current.updateCodeElement(codeElementId, {
          name: 'Updated Class',
          codeType: 'interface',
          code: 'interface UpdatedInterface {}',
        });
      });

      expect(result.current.model.codeElements[0]).toMatchObject({
        name: 'Updated Class',
        codeType: 'interface',
        code: 'interface UpdatedInterface {}',
      });
    });
  });

  describe('Navigation', () => {
    it('should set active system and change view level', () => {
      const { result } = renderHook(() => useFlatC4Store());

      act(() => {
        result.current.addSystem({
          name: 'Test System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = result.current.model.systems[0].id;

      act(() => {
        result.current.setActiveSystem(systemId);
      });

      expect(result.current.model.activeSystemId).toBe(systemId);
      expect(result.current.model.viewLevel).toBe('container');
    });

    it('should set view level to system when active system is undefined', () => {
      const { result } = renderHook(() => useFlatC4Store());

      act(() => {
        result.current.setActiveSystem(undefined);
      });

      expect(result.current.model.activeSystemId).toBeUndefined();
      expect(result.current.model.viewLevel).toBe('system');
    });

    it('should clear child elements when changing view level', () => {
      const { result } = renderHook(() => useFlatC4Store());

      // Set up some active states
      act(() => {
        result.current.setModel({
          systems: [],
          containers: [],
          components: [],
          codeElements: [],
          viewLevel: 'code',
          activeSystemId: 'system-1',
          activeContainerId: 'container-1',
          activeComponentId: 'component-1',
        });
      });

      // Change to container view
      act(() => {
        result.current.setViewLevel('container');
      });

      expect(result.current.model.viewLevel).toBe('container');
      expect(result.current.model.activeContainerId).toBeUndefined();
      expect(result.current.model.activeComponentId).toBeUndefined();
    });
  });

  describe('Connection Management', () => {
    it('should update a connection', () => {
      const { result } = renderHook(() => useFlatC4Store());

      // Add two systems and connect them
      act(() => {
        result.current.addSystem({
          name: 'System 1',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        result.current.addSystem({
          name: 'System 2',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [system1, system2] = result.current.model.systems;

      act(() => {
        result.current.connectSystems(system1.id, {
          targetId: system2.id,
          label: 'Original Connection',
        });
      });

      // Update the connection
      act(() => {
        result.current.updateConnection('system', system1.id, system2.id, {
          label: 'Updated Connection',
          description: 'New description',
        });
      });

      expect(result.current.model.systems[0].connections[0]).toMatchObject({
        label: 'Updated Connection',
        description: 'New description',
      });
    });

    it('should remove a connection', () => {
      const { result } = renderHook(() => useFlatC4Store());

      // Add two systems and connect them
      act(() => {
        result.current.addSystem({
          name: 'System 1',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
        result.current.addSystem({
          name: 'System 2',
          position: { x: 100, y: 100 },
          type: 'system',
          connections: [],
        });
      });

      const [system1, system2] = result.current.model.systems;

      act(() => {
        result.current.connectSystems(system1.id, {
          targetId: system2.id,
          label: 'Connection to Remove',
        });
      });

      expect(result.current.model.systems[0].connections).toHaveLength(1);

      // Remove the connection
      act(() => {
        result.current.removeConnection('system', system1.id, system2.id);
      });

      expect(result.current.model.systems[0].connections).toHaveLength(0);
    });
  });
});

describe('useActiveEntities', () => {
  it('should return active entities', () => {
    const { result: storeResult } = renderHook(() => useFlatC4Store());
    
    // Set up test data
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
      storeResult.current.setActiveSystem(systemId);
    });

    const { result: entitiesResult } = renderHook(() => useActiveEntities());

    expect(entitiesResult.current.activeSystem).toMatchObject({
      name: 'System 1',
      id: systemId,
    });
    expect(entitiesResult.current.viewLevel).toBe('container');
  });
});

describe('useFilteredEntities', () => {
  it('should return filtered entities based on active states', () => {
    const { result: storeResult } = renderHook(() => useFlatC4Store());
    
    // Create a hierarchy
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

    act(() => {
      storeResult.current.addContainer(system1.id, {
        name: 'Container 1',
        position: { x: 0, y: 0 },
        type: 'container',
        connections: [],
      });
      storeResult.current.addContainer(system2.id, {
        name: 'Container 2',
        position: { x: 100, y: 100 },
        type: 'container',
        connections: [],
      });
    });

    // Set active system
    act(() => {
      storeResult.current.setActiveSystem(system1.id);
    });

    const { result: filteredResult } = renderHook(() => useFilteredEntities());

    expect(filteredResult.current.containers).toHaveLength(1);
    expect(filteredResult.current.containers[0].name).toBe('Container 1');
    expect(filteredResult.current.viewLevel).toBe('container');
  });
});