/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SW_PROXY_TARGET: string;
  readonly VITE_DROP_CONSOLE: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
