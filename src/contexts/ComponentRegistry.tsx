'use client';

import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

export interface RegisteredComponent {
  id: string;
  type: 'chart' | 'metric' | 'response' | 'table' | 'funnel' | 'other';
  label: string;
  bounds: DOMRect;
  data: any; // Component-specific data for AI analysis
  metadata?: Record<string, any>;
}

interface ComponentRegistryContextType {
  registerComponent: (id: string, element: HTMLElement, type: RegisteredComponent['type'], label: string, data: any, metadata?: Record<string, any>) => void;
  unregisterComponent: (id: string) => void;
  getComponentAt: (x: number, y: number) => RegisteredComponent | null;
  getAllComponents: () => RegisteredComponent[];
  updateComponentBounds: () => void;
}

const ComponentRegistryContext = createContext<ComponentRegistryContextType | null>(null);

export function ComponentRegistryProvider({ children }: { children: React.ReactNode }) {
  const componentsRef = useRef<Map<string, RegisteredComponent>>(new Map());
  const [, forceUpdate] = useState({});

  const registerComponent = useCallback((
    id: string,
    element: HTMLElement,
    type: RegisteredComponent['type'],
    label: string,
    data: any,
    metadata?: Record<string, any>
  ) => {
    const bounds = element.getBoundingClientRect();
    componentsRef.current.set(id, {
      id,
      type,
      label,
      bounds,
      data,
      metadata,
    });
    forceUpdate({});
  }, []);

  const unregisterComponent = useCallback((id: string) => {
    componentsRef.current.delete(id);
    forceUpdate({});
  }, []);

  const updateComponentBounds = useCallback(() => {
    // Re-calculate all component bounds (call this on scroll/resize)
    componentsRef.current.forEach((component) => {
      const element = document.getElementById(component.id);
      if (element) {
        component.bounds = element.getBoundingClientRect();
      }
    });
  }, []);

  const getComponentAt = useCallback((x: number, y: number): RegisteredComponent | null => {
    // Find component whose bounds contain the point (x, y)
    for (const component of componentsRef.current.values()) {
      const { bounds } = component;
      if (
        x >= bounds.left &&
        x <= bounds.right &&
        y >= bounds.top &&
        y <= bounds.bottom
      ) {
        return component;
      }
    }
    return null;
  }, []);

  const getAllComponents = useCallback(() => {
    return Array.from(componentsRef.current.values());
  }, []);

  const value: ComponentRegistryContextType = {
    registerComponent,
    unregisterComponent,
    getComponentAt,
    getAllComponents,
    updateComponentBounds,
  };

  return (
    <ComponentRegistryContext.Provider value={value}>
      {children}
    </ComponentRegistryContext.Provider>
  );
}

export function useComponentRegistry() {
  const context = useContext(ComponentRegistryContext);
  if (!context) {
    throw new Error('useComponentRegistry must be used within ComponentRegistryProvider');
  }
  return context;
}

// Hook for components to register themselves
export function useRegisterComponent(
  type: RegisteredComponent['type'],
  label: string,
  data: any,
  metadata?: Record<string, any>
) {
  const { registerComponent, unregisterComponent } = useComponentRegistry();
  const elementRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`component-${Math.random().toString(36).substr(2, 9)}`);

  React.useEffect(() => {
    if (elementRef.current) {
      registerComponent(idRef.current, elementRef.current, type, label, data, metadata);
    }
    return () => {
      unregisterComponent(idRef.current);
    };
  }, [registerComponent, unregisterComponent, type, label, JSON.stringify(data), JSON.stringify(metadata)]);

  // Re-register when data changes
  React.useEffect(() => {
    if (elementRef.current) {
      registerComponent(idRef.current, elementRef.current, type, label, data, metadata);
    }
  }, [data, metadata, label, type, registerComponent]);

  return elementRef;
}
