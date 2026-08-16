/// <reference types="vite/client" />

declare module 'virtual:backend-live' {
  /** 백엔드가 떠 있으면 true. dev 서버가 뜰 때 한 번 판정한다. */
  export const backendLive: boolean
}
