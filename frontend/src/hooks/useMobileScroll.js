// frontend/src/hooks/useMobileScroll.js - Полная версия с импортами
import { useEffect, useRef, useCallback, useState } from 'react';

export const useMobileScroll = (onScroll, options = {}) => {
  const {
    sensitivity = 0.2,
    threshold = 50,
    preventPageScroll = true,
    enableHaptic = true,
    debounceTime = 100
  } = options;

  const scrollState = useRef({
    isScrolling: false,
    lastTouchY: 0,
    lastTouchTime: 0,
    velocity: 0,
    momentum: 0,
    scrollTimeout: null,
    accumulator: 0
  });

  // Определение типа устройства
  const isMobile = useCallback(() => {
    return typeof window !== 'undefined' && (
      window.innerWidth <= 1024 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  }, []);

  // Haptic feedback (если поддерживается)
  const triggerHaptic = useCallback(() => {
    if (!enableHaptic || !isMobile()) return;
    
    try {
      if (navigator.vibrate) {
        navigator.vibrate(10); // Короткая вибрация
      }
    } catch (error) {
      // Игнорируем ошибки haptic feedback
    }
  }, [enableHaptic, isMobile]);

  // Обработчик wheel событий (для десктопа и трекпадов)
  const handleWheel = useCallback((event) => {
    if (!isMobile()) {
      event.preventDefault();
      
      let normalizedDelta = event.deltaY;
      
      // Нормализация для разных типов устройств ввода
      if (event.deltaMode === 1) normalizedDelta *= 16;
      else if (event.deltaMode === 2) normalizedDelta *= window.innerHeight;
      
      normalizedDelta *= sensitivity;
      
      if (Math.abs(normalizedDelta) < 1) return;

      scrollState.current.accumulator += normalizedDelta;
      
      if (Math.abs(scrollState.current.accumulator) >= threshold) {
        const direction = scrollState.current.accumulator > 0 ? 1 : -1;
        onScroll(direction);
        scrollState.current.accumulator = 0;
        triggerHaptic();
      }

      // Очистка накопителя через время
      if (scrollState.current.scrollTimeout) {
        clearTimeout(scrollState.current.scrollTimeout);
      }
      
      scrollState.current.scrollTimeout = setTimeout(() => {
        scrollState.current.accumulator = 0;
      }, debounceTime);
    }
  }, [onScroll, sensitivity, threshold, triggerHaptic, debounceTime, isMobile]);

  // Touch события для мобильных устройств
  const handleTouchStart = useCallback((event) => {
    if (!isMobile()) return;
    
    const touch = event.touches[0];
    scrollState.current.lastTouchY = touch.clientY;
    scrollState.current.lastTouchTime = Date.now();
    scrollState.current.velocity = 0;
    scrollState.current.isScrolling = false;
    
    // Предотвращаем выделение текста
    if (preventPageScroll) {
      event.preventDefault();
    }
  }, [preventPageScroll, isMobile]);

  const handleTouchMove = useCallback((event) => {
    if (!isMobile()) return;
    
    if (preventPageScroll) {
      event.preventDefault(); // Блокируем скролл страницы
    }
    
    const touch = event.touches[0];
    const currentTime = Date.now();
    const deltaY = scrollState.current.lastTouchY - touch.clientY;
    const deltaTime = currentTime - scrollState.current.lastTouchTime;
    
    // Вычисляем скорость
    if (deltaTime > 0) {
      scrollState.current.velocity = deltaY / deltaTime;
    }
    
    scrollState.current.lastTouchY = touch.clientY;
    scrollState.current.lastTouchTime = currentTime;
  }, [preventPageScroll, isMobile]);

  const handleTouchEnd = useCallback((event) => {
    if (!isMobile()) return;
    
    const touch = event.changedTouches[0];
    const endTime = Date.now();
    const totalDeltaY = scrollState.current.lastTouchY - touch.clientY;
    const totalTime = endTime - scrollState.current.lastTouchTime;
    
    // Определяем намерение скролла
    const minDistance = 30; // Минимальное расстояние для срабатывания
    const maxTime = 300; // Максимальное время для считывания жеста
    const minVelocity = 0.1; // Минимальная скорость
    
    const shouldScroll = (
      Math.abs(totalDeltaY) > minDistance &&
      totalTime < maxTime &&
      Math.abs(scrollState.current.velocity) > minVelocity
    );
    
    if (shouldScroll) {
      const direction = totalDeltaY > 0 ? 1 : -1;
      
      // Дополнительная проверка скорости для определения интенсивности
      const isQuickSwipe = Math.abs(scrollState.current.velocity) > 0.5;
      const steps = isQuickSwipe ? Math.min(Math.floor(Math.abs(scrollState.current.velocity) * 2), 3) : 1;
      
      // Выполняем скролл (возможно несколько шагов для быстрых свайпов)
      for (let i = 0; i < steps; i++) {
        setTimeout(() => {
          onScroll(direction);
          if (i === 0) triggerHaptic(); // Haptic только для первого шага
        }, i * 150); // Задержка между шагами
      }
    }
    
    // Сброс состояния
    scrollState.current.isScrolling = false;
    scrollState.current.velocity = 0;
  }, [onScroll, triggerHaptic, isMobile]);

  // Обработчик для клавиатуры
  const handleKeyDown = useCallback((event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    let direction = 0;
    
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        direction = -1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
      case ' ': // Пробел
        direction = 1;
        break;
      default:
        return;
    }
    
    if (direction !== 0) {
      event.preventDefault();
      onScroll(direction);
      triggerHaptic();
    }
  }, [onScroll, triggerHaptic]);

  // Блокировка скролла страницы
  useEffect(() => {
    if (!preventPageScroll || !isMobile()) return;
    
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.classList.add('portfolio-active');
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.classList.remove('portfolio-active');
    };
  }, [preventPageScroll, isMobile]);

  // Подключение всех обработчиков
  useEffect(() => {
    const options = { passive: false };
    
    // Wheel для десктопа
    window.addEventListener('wheel', handleWheel, options);
    
    // Touch для мобильных
    if (isMobile()) {
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    // Клавиатура для всех устройств
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      
      // Очистка таймеров
      if (scrollState.current.scrollTimeout) {
        clearTimeout(scrollState.current.scrollTimeout);
      }
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleKeyDown, isMobile]);

  // Возвращаем дополнительные утилиты
  return {
    isMobile: isMobile(),
    isScrolling: scrollState.current.isScrolling,
    velocity: scrollState.current.velocity
  };
};

// Хук для визуальных подсказок
export const useMobileHints = (projects = []) => {
  const [showHints, setShowHints] = useState(true);
  const [currentHint, setCurrentHint] = useState('swipe');
  
  const hints = {
    swipe: '👆 Swipe up/down to navigate',
    tap: '👆 Tap to select project',
    keys: '⌨️ Use arrow keys or space'
  };
  
  useEffect(() => {
    if (showHints) {
      const hintKeys = Object.keys(hints);
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % hintKeys.length;
        setCurrentHint(hintKeys[currentIndex]);
      }, 3000);
      
      // Скрываем подсказки через 12 секунд
      const hideTimeout = setTimeout(() => {
        setShowHints(false);
      }, 12000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(hideTimeout);
      };
    }
  }, [showHints]);
  
  // Скрываем при первом взаимодействии
  useEffect(() => {
    const hideOnInteraction = () => setShowHints(false);
    
    window.addEventListener('touchstart', hideOnInteraction, { once: true });
    window.addEventListener('wheel', hideOnInteraction, { once: true });
    window.addEventListener('keydown', hideOnInteraction, { once: true });
    
    return () => {
      window.removeEventListener('touchstart', hideOnInteraction);
      window.removeEventListener('wheel', hideOnInteraction);
      window.removeEventListener('keydown', hideOnInteraction);
    };
  }, []);
  
  return {
    showHints,
    currentHint: hints[currentHint],
    hideHints: () => setShowHints(false)
  };
};

export default useMobileScroll;