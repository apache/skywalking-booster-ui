/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SW_PROXY_TARGET: string;
  readonly drop_console: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
