import type { AdaptivityProps } from '@vkontakte/vkui';
import { getViewHeightByViewportHeight, getViewWidthByViewportWidth, ViewWidth } from '@vkontakte/vkui';
import type { UseAdaptivity } from '@vkontakte/vk-bridge-react';

/**
 * VKUI ожидает AdaptivityProps, а VK Bridge отдаёт свои значения.
 * Конвертируем их, чтобы адаптивность работала в VK Mini Apps webview.
 */
export const transformVKBridgeAdaptivity = ({
  type,
  viewportWidth,
  viewportHeight,
}: UseAdaptivity): AdaptivityProps => {
  switch (type) {
    case 'adaptive':
      return {
        viewWidth: getViewWidthByViewportWidth(viewportWidth),
        viewHeight: getViewHeightByViewportHeight(viewportHeight),
      };
    case 'force_mobile':
    case 'force_mobile_compact':
      return {
        viewWidth: ViewWidth.MOBILE,
        sizeX: 'compact',
        sizeY: type === 'force_mobile_compact' ? 'compact' : 'regular',
      };
    default:
      return {};
  }
};

