declare module '@remix-run/node' {
  export interface ActionFunctionArgs {
    request: Request;
    context: unknown;
    params: Record<string, string>;
  }

  export interface LoaderFunctionArgs {
    request: Request;
    context: unknown;
    params: Record<string, string>;
  }

  export function json<T>(data: T, init?: ResponseInit): Response;
  export function redirect(url: string, init?: ResponseInit): Response;

  export interface EntryContext {
    appState: any;
    manifest: any;
    matches: any[];
    routeData: Record<string, any>;
    actionData?: Record<string, any>;
    routeModules: Record<string, any>;
    serverHandoffString?: string;
    staticHandlerContext: any;
    future: any;
    serializeError: (error: Error) => any;
  }

  export interface LinksFunction {
    (): Array<{
      rel: string;
      href: string;
      as?: string;
      type?: string;
      integrity?: string;
      crossOrigin?: 'anonymous' | 'use-credentials';
    }>;
  }
}

// Type declaration to make TypeScript happy with missing types during build

// Fix for CSS and SCSS imports
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.css?url' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.scss?url' {
  const content: string;
  export default content;
}

declare module 'virtual:uno.css' {
  const content: string;
  export default content;
}
