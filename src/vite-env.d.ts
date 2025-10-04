/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Add type declarations for SVG imports
declare module '*.svg' {
  import * as React from 'react';
  
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string; className?: string }
  >;

  const src: string;
  export default src;
}

declare module '*.svg?react' {
  import * as React from 'react';
  
  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string; className?: string }
  >;
  
  export default ReactComponent;
}
