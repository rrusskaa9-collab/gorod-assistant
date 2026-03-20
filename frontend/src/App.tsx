import { useCallback, useEffect, useState } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { Panel, PanelHeader, PanelHeaderBack, View } from '@vkontakte/vkui';
import { MainPanel } from './vk/MainPanel';
import { DetailPanel } from './vk/DetailPanel';
import type { SearchEntity } from './vk/types';

export default function App() {
  const [history, setHistory] = useState<string[]>(['main']);
  const [selectedEntity, setSelectedEntity] = useState<SearchEntity | null>(null);

  const activePanel = history[history.length - 1];
  const isFirst = history.length === 1;

  const goBack = useCallback(() => {
    if (history.length <= 1) return;
    setHistory((prev) => prev.slice(0, -1));
  }, [history.length]);

  const openDetails = useCallback((entity: SearchEntity) => {
    setSelectedEntity(entity);
    setHistory((prev) => [...prev, 'details']);
  }, []);

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
        <MainPanel onOpenEntity={openDetails} />
      </Panel>

      <Panel id="details">
        <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Детали</PanelHeader>
        {selectedEntity ? <DetailPanel entity={selectedEntity} /> : null}
      </Panel>
    </View>
  );
}
