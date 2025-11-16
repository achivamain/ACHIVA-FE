// 앱 통신 위해 Window에 새 속성 추가 - 타입 오류 방지용
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export {};
