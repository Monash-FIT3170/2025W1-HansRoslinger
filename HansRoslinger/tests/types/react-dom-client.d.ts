declare module "react-dom/client" {
  import * as React from "react";
  export function createRoot(container: Element | DocumentFragment): {
    render(children: React.ReactNode): void;
    unmount(): void;
  };
}
