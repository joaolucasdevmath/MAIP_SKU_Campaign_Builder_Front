import type { EmblaCarouselType } from 'embla-carousel';

import { useState, useEffect, useCallback } from 'react';

import type { UseCarouselAutoPlayReturn } from '../types';

// ----------------------------------------------------------------------

export function useCarouselAutoScroll(mainApi?: EmblaCarouselType): UseCarouselAutoPlayReturn {
  const [isPlaying, setIsPlaying] = useState(false);

  const onClickAutoplay = useCallback(
    (callback: () => void) => {
      const autoScroll = mainApi?.plugins()?.autoScroll;
      if (!autoScroll) return;

      const resetOrStop =
        (autoScroll.options as any)?.stopOnInteraction === false
          ? autoScroll.reset
          : autoScroll.stop;

      if (typeof resetOrStop === 'function') {
        resetOrStop();
      }
      callback();
    },
    [mainApi]
  );

  const onTogglePlay = useCallback(() => {
    const autoScroll = mainApi?.plugins()?.autoScroll as
      | {
          isPlaying: () => boolean;
          stop: () => void;
          play: () => void;
        }
      | undefined;
    if (!autoScroll) return;

    const playOrStop = autoScroll.isPlaying() ? autoScroll.stop : autoScroll.play;
    playOrStop();
  }, [mainApi]);

  useEffect(() => {
    const autoScroll = mainApi?.plugins()?.autoScroll;
    if (!autoScroll) return;

    setIsPlaying((autoScroll as unknown as { isPlaying: () => boolean }).isPlaying());
    (autoScroll as unknown as { on: (event: string, handler: () => void) => void }).on(
      'autoScroll:play',
      () => setIsPlaying(true)
    );
    (autoScroll as unknown as { on: (event: string, handler: () => void) => void }).on(
      'autoScroll:stop',
      () => setIsPlaying(false)
    );
    mainApi.on('reInit', () => setIsPlaying(false));
  }, [mainApi]);

  return { isPlaying, onTogglePlay, onClickAutoplay };
}
