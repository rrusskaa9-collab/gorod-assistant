import { Component, StrictMode, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import vkBridge, { parseURLSearchParamsForGetLaunchParams } from '@vkontakte/vk-bridge';
import { useAppearance, useInsets, useAdaptivity } from '@vkontakte/vk-bridge-react';
import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import App from './App.tsx';
import './index.css';
import { transformVKBridgeAdaptivity } from './vk/transformVKBridgeAdaptivity';
import './vk/vkMiniApp.css';
import bridge from '@vkontakte/vk-bridge';

bridge.send('VKWebAppInit');

class ErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: unknown) {
    // Приводим к Error, чтобы безопасно читать message/name в рендере.
    const normalized =
      error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error');
    return { error: normalized };
  }

  render() {
    const err = this.state.error;
    if (err) {
      const message = err.message;
      const name = err.name;
      return (
        <div style={{ padding: 12, color: 'red', fontFamily: 'monospace' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>React runtime error</div>
          <div>
            {name}: {message}
          </div>
          <div style={{ opacity: 0.9, marginTop: 8 }}>
            Если вы открываете вне VK — напишите текст ошибки.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const VkMiniAppProviders = () => {
  const vkBridgeAppearance = useAppearance() || undefined;
  const vkBridgeInsets = useInsets() || undefined;
  const vkBridgeAdaptivityProps = transformVKBridgeAdaptivity(useAdaptivity());

  const { vk_platform } = parseURLSearchParamsForGetLaunchParams(window.location.search);

  useEffect(() => {
    // Вне VK (например, в обычном браузере localhost) Bridge может быть недоступен.
    // Нам важно не падать до рендера React.
    try {
      vkBridge.send('VKWebAppInit');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[vk-bridge] VKWebAppInit failed (dev mode fallback):', e);
    }
  }, []);

  return (
    <ConfigProvider
      colorScheme={vkBridgeAppearance}
      platform={vk_platform === 'desktop_web' ? 'vkcom' : undefined}
      // В dev/outside VK окружении методы bridge могут отсутствовать/отличаться.
      // Нам главное не падать до отрисовки.
      isWebView={typeof (vkBridge as any).isWebView === 'function' ? vkBridge.isWebView() : false}
    >
      <AdaptivityProvider {...vkBridgeAdaptivityProps}>
        <AppRoot mode="full" safeAreaInsets={vkBridgeInsets}>
          <App />
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

const rootEl = document.getElementById('root')!;
createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <VkMiniAppProviders />
    </ErrorBoundary>
  </StrictMode>,
);
