import { useCallback, useEffect, useState } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { Panel, PanelHeader, View } from '@vkontakte/vkui';
import { MainPanel } from './vk/MainPanel';

export default function App() {
  const [history, setHistory] = useState<string[]>(['main']);

  const activePanel = history[history.length - 1];
  const isFirst = history.length === 1;

  const goBack = useCallback(() => {
    if (history.length <= 1) return;
    setHistory((prev) => prev.slice(0, -1));
  }, [history.length]);

  // Для стандартных mini apps — включаем/выключаем свайпбек.
  useEffect(() => {
    try {
      // Вне VK окружения bridge может быть недоступен.
      (vkBridge as any).send?.('VKWebAppSetSwipeSettings', { history: isFirst });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[vk-bridge] VKWebAppSetSwipeSettings failed:', e);
    }
  }, [isFirst]);

  return (
    <View history={history} activePanel={activePanel} onSwipeBack={goBack}>
      <Panel id="main">
        <PanelHeader>Городской ассистент</PanelHeader>
        <MainPanel />
      </Panel>
    </View>
  );
}
