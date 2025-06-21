import { act, renderHook } from '@testing-library/react';
import { useFlatModelActions } from '../useFlatModelActions';
import { useFlatC4Store } from '../../store/flatC4Store';

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any, options: any) => fn,
  subscribeWithSelector: (fn: any) => fn,
}));

// Mock the store's persist.clearStorage function
jest.mock('../../store/flatC4Store', () => ({
  ...jest.requireActual('../../store/flatC4Store'),
  useFlatC4Store: Object.assign(
    jest.requireActual('../../store/flatC4Store').useFlatC4Store,
    { persist: { clearStorage: jest.fn() } }
  ),
}));

describe('useFlatModelActions', () => {
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

  describe('addElement', () => {
    it('should add a system when view level is system', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      act(() => {
        actionsResult.current.addElement(
          { name: 'Custom System', technology: 'Node.js' },
          { system: 'My System' }
        );
      });

      expect(storeResult.current.model.systems).toHaveLength(1);
      expect(storeResult.current.model.systems[0]).toMatchObject({
        name: 'Custom System',
        technology: 'Node.js',
        type: 'system',
      });
    });

    it('should add a container when view level is container and active system exists', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      // Add system first
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
      });

      // Now add container
      act(() => {
        actionsResult.current.addElement(
          { technology: 'Docker' },
          { container: 'My Container' }
        );
      });

      expect(storeResult.current.model.containers).toHaveLength(1);
      expect(storeResult.current.model.containers[0]).toMatchObject({
        name: 'My Container',
        technology: 'Docker',
        type: 'container',
        systemId,
      });
    });

    it('should add a component when view level is component and active container exists', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      // Setup hierarchy
      act(() => {
        storeResult.current.addSystem({
          name: 'System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });
      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });
      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.setActiveContainer(containerId);
      });

      // Now add component
      act(() => {
        actionsResult.current.addElement(
          { technology: 'React' },
          { component: 'My Component' }
        );
      });

      expect(storeResult.current.model.components).toHaveLength(1);
      expect(storeResult.current.model.components[0]).toMatchObject({
        name: 'My Component',
        technology: 'React',
        type: 'component',
        containerId,
      });
    });

    it('should add a code element when view level is code and active component exists', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      // Setup hierarchy
      act(() => {
        storeResult.current.addSystem({
          name: 'System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });
      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });
      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.addComponent(containerId, {
          name: 'Component',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });
      const componentId = storeResult.current.model.components[0].id;

      act(() => {
        storeResult.current.setActiveComponent(componentId);
      });

      // Now add code element
      act(() => {
        actionsResult.current.addElement(
          { technology: 'TypeScript' },
          { code: 'My Class' }
        );
      });

      expect(storeResult.current.model.codeElements).toHaveLength(1);
      expect(storeResult.current.model.codeElements[0]).toMatchObject({
        name: 'My Class',
        technology: 'TypeScript',
        type: 'code',
        codeType: 'class',
        componentId,
      });
    });

    it('should use default labels when none provided', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      act(() => {
        actionsResult.current.addElement();
      });

      expect(storeResult.current.model.systems).toHaveLength(1);
      expect(storeResult.current.model.systems[0].name).toBe('New System');
    });
  });

  describe('handleAddElement', () => {
    it('should call addElement with default parameters', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      act(() => {
        actionsResult.current.handleAddElement();
      });

      expect(storeResult.current.model.systems).toHaveLength(1);
      expect(storeResult.current.model.systems[0].name).toBe('New System');
    });
  });

  describe('handleElementSave', () => {
    it('should update a system when view level is system', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      // Add a system first
      act(() => {
        storeResult.current.addSystem({
          name: 'Original System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;

      // Update the system
      act(() => {
        actionsResult.current.handleElementSave(systemId, {
          name: 'Updated System',
          description: 'Updated description',
          technology: 'Node.js',
          url: 'https://example.com',
        });
      });

      expect(storeResult.current.model.systems[0]).toMatchObject({
        name: 'Updated System',
        description: 'Updated description',
        technology: 'Node.js',
        url: 'https://example.com',
      });
    });

    it('should update a code element when view level is code', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      // Setup hierarchy and add code element
      act(() => {
        storeResult.current.addSystem({
          name: 'System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });
      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });
      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.addComponent(containerId, {
          name: 'Component',
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

      const codeElementId = storeResult.current.model.codeElements[0].id;

      // Set view level to code
      act(() => {
        storeResult.current.setViewLevel('code');
      });

      // Update the code element
      act(() => {
        actionsResult.current.handleElementSave(codeElementId, {
          name: 'Updated Class',
          description: 'Updated description',
          codeType: 'interface',
          code: 'interface UpdatedClass {}',
          technology: 'TypeScript',
          url: 'https://example.com',
        });
      });

      expect(storeResult.current.model.codeElements[0]).toMatchObject({
        name: 'Updated Class',
        description: 'Updated description',
        codeType: 'interface',
        code: 'interface UpdatedClass {}',
        technology: 'TypeScript',
        url: 'https://example.com',
      });
    });

    it('should handle missing codeType by defaulting to other', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      // Setup and add code element
      act(() => {
        storeResult.current.addSystem({
          name: 'System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });
      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });
      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.addComponent(containerId, {
          name: 'Component',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });
      const componentId = storeResult.current.model.components[0].id;

      act(() => {
        storeResult.current.addCodeElement(componentId, {
          name: 'Test Code',
          position: { x: 0, y: 0 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
      });

      const codeElementId = storeResult.current.model.codeElements[0].id;

      act(() => {
        storeResult.current.setViewLevel('code');
      });

      // Update without providing codeType
      act(() => {
        actionsResult.current.handleElementSave(codeElementId, {
          name: 'Updated Code',
        });
      });

      expect(storeResult.current.model.codeElements[0].codeType).toBe('other');
    });
  });

  describe('handleNodeDelete', () => {
    it('should delete a system when view level is system', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      act(() => {
        storeResult.current.addSystem({
          name: 'System to Delete',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        actionsResult.current.handleNodeDelete(systemId);
      });

      expect(storeResult.current.model.systems).toHaveLength(0);
    });

    it('should delete a container when view level is container', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      // Setup
      act(() => {
        storeResult.current.addSystem({
          name: 'System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });
      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Container to Delete',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });

      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.setViewLevel('container');
      });

      act(() => {
        actionsResult.current.handleNodeDelete(containerId);
      });

      expect(storeResult.current.model.containers).toHaveLength(0);
    });

    it('should delete a component when view level is component', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      // Setup hierarchy
      act(() => {
        storeResult.current.addSystem({
          name: 'System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });
      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });
      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.addComponent(containerId, {
          name: 'Component to Delete',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });

      const componentId = storeResult.current.model.components[0].id;

      act(() => {
        storeResult.current.setViewLevel('component');
      });

      act(() => {
        actionsResult.current.handleNodeDelete(componentId);
      });

      expect(storeResult.current.model.components).toHaveLength(0);
    });

    it('should delete a code element when view level is code', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      // Setup complete hierarchy
      act(() => {
        storeResult.current.addSystem({
          name: 'System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });
      const systemId = storeResult.current.model.systems[0].id;

      act(() => {
        storeResult.current.addContainer(systemId, {
          name: 'Container',
          position: { x: 0, y: 0 },
          type: 'container',
          connections: [],
        });
      });
      const containerId = storeResult.current.model.containers[0].id;

      act(() => {
        storeResult.current.addComponent(containerId, {
          name: 'Component',
          position: { x: 0, y: 0 },
          type: 'component',
          connections: [],
        });
      });
      const componentId = storeResult.current.model.components[0].id;

      act(() => {
        storeResult.current.addCodeElement(componentId, {
          name: 'Code to Delete',
          position: { x: 0, y: 0 },
          type: 'code',
          codeType: 'class',
          connections: [],
        });
      });

      const codeElementId = storeResult.current.model.codeElements[0].id;

      act(() => {
        storeResult.current.setViewLevel('code');
      });

      act(() => {
        actionsResult.current.handleNodeDelete(codeElementId);
      });

      expect(storeResult.current.model.codeElements).toHaveLength(0);
    });
  });

  describe('resetStore', () => {
    it('should reset the store to initial state', () => {
      const { result: storeResult } = renderHook(() => useFlatC4Store());
      const { result: actionsResult } = renderHook(() => useFlatModelActions());

      // Add some data
      act(() => {
        storeResult.current.addSystem({
          name: 'Test System',
          position: { x: 0, y: 0 },
          type: 'system',
          connections: [],
        });
      });

      expect(storeResult.current.model.systems).toHaveLength(1);

      // Reset store
      act(() => {
        actionsResult.current.resetStore();
      });

      expect(storeResult.current.model.systems).toHaveLength(0);
      expect(storeResult.current.model.viewLevel).toBe('system');
      expect(storeResult.current.model.activeSystemId).toBeUndefined();
      expect(storeResult.current.model.activeContainerId).toBeUndefined();
      expect(storeResult.current.model.activeComponentId).toBeUndefined();
    });
  });
});