// frontend/src/components/3d/ProjectStack3D.js - НОВАЯ ВЕРСИЯ: Вертикальный стек под углом 25°
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

const ProjectCarouselCard = React.memo(({ 
  project, 
  position = [0, 0, 0], 
  index = 0,
  onClick,
  onHover,
  isMobile = false,
  isActive = false
}) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const navigate = useNavigate();

  const textureUrl = project.imageUrl || `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f8fafc"/>
      <circle cx="200" cy="150" r="50" fill="#cbd5e1"/>
      <text x="200" y="250" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="16" font-weight="500">${project.title}</text>
    </svg>
  `)}`;

  const texture = useTexture(textureUrl, (texture) => {
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
  });

  // Адаптивные размеры карточек
  const cardSize = isMobile ? [2.5, 1.875] : [3.5, 2.625]; // 4:3 пропорции

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Плавный переход к позиции
    groupRef.current.position.x += (position[0] - groupRef.current.position.x) * 0.08;
    groupRef.current.position.y += (position[1] - groupRef.current.position.y) * 0.08;
    groupRef.current.position.z += (position[2] - groupRef.current.position.z) * 0.08;
    
    // Легкое покачивание только для неактивных карточек
    if (!isActive) {
      const floatY = Math.sin(time * 0.6 + index * 0.8) * 0.02;
      const floatX = Math.cos(time * 0.4 + index * 0.6) * 0.015;
      groupRef.current.position.y += floatY;
      groupRef.current.position.x += floatX;
    }
    
    // Поворот карточек под углом 25°
    const targetRotationX = isActive ? -0.1 : -0.436; // -25° = -0.436 радиан
    const targetRotationY = isActive ? 0.05 : 0;
    const targetScale = isActive ? 1.1 : 1;
    
    groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.08;
    groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.08;
    groupRef.current.scale.setScalar(
      groupRef.current.scale.x + (targetScale - groupRef.current.scale.x) * 0.08
    );
    
    // Поворот к камере для лучшей видимости
    if (meshRef.current && state.camera) {
      const direction = new THREE.Vector3();
      meshRef.current.getWorldPosition(direction);
      direction.sub(state.camera.position).normalize();
      
      // Корректировка поворота с учетом наклона
      const lookAtRotation = new THREE.Euler(
        targetRotationX,
        Math.atan2(direction.x, direction.z) * 0.1,
        0
      );
      
      meshRef.current.rotation.x += (lookAtRotation.x - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (lookAtRotation.y - meshRef.current.rotation.y) * 0.05;
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    if (onClick) {
      onClick(project);
    } else {
      navigate(`/portfolio/${project.id}`);
    }
  };

  const handlePointerEnter = (event) => {
    event.stopPropagation();
    onHover && onHover(project, true);
    
    if (window.updateProjectCursor) {
      window.updateProjectCursor({
        show: true,
        title: project.title,
        textColor: 'light'
      });
    }
    
    document.body.style.cursor = 'pointer';
  };

  const handlePointerLeave = (event) => {
    event.stopPropagation();
    onHover && onHover(project, false);
    
    if (window.updateProjectCursor) {
      window.updateProjectCursor({ show: false });
    }
    
    document.body.style.cursor = 'auto';
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={cardSize} />
        <meshBasicMaterial
          map={texture}
          side={THREE.DoubleSide}
          transparent
          opacity={isActive ? 1 : 0.9}
        />
      </mesh>

      {/* Тень карточки */}
      <mesh position={[0.05, -0.05, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cardSize[0] * 0.9, cardSize[1] * 0.9]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isActive ? 0.2 : 0.1}
        />
      </mesh>

      {/* Индикатор избранного */}
      {project.featured && (
        <mesh position={[cardSize[0] * 0.43, cardSize[1] * 0.44, 0.01]}>
          <circleGeometry args={[isMobile ? 0.04 : 0.06, 8]} />
          <meshBasicMaterial color="#0066ff" />
        </mesh>
      )}

      {/* Индикатор активности */}
      {isActive && (
        <mesh position={[0, -cardSize[1] * 0.6, 0.01]}>
          <boxGeometry args={[cardSize[0] * 0.8, 0.02, 0.01]} />
          <meshBasicMaterial
            color="#0066ff"
            emissive="#0066ff"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </group>
  );
});

// Утилита для детекции мобильных устройств
const isMobileDevice = () => {
  return typeof window !== 'undefined' && (
    window.innerWidth <= 1024 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
};

// Обработчик скролла для разных устройств
const useAdvancedScroll = (onScroll, projects) => {
  const scrollState = useRef({
    isScrolling: false,
    scrollTimeout: null,
    accumulator: 0,
    lastTime: 0,
    touchStartY: 0,
    touchStartTime: 0,
    momentum: 0
  });

  // Обработчик колесика мыши
  const handleWheel = useCallback((event) => {
    event.preventDefault();
    
    const now = Date.now();
    const deltaTime = now - scrollState.current.lastTime;
    scrollState.current.lastTime = now;

    // Нормализуем deltaY
    let normalizedDelta = event.deltaY;
    if (event.deltaMode === 1) normalizedDelta *= 16;
    else if (event.deltaMode === 2) normalizedDelta *= window.innerHeight;
    
    // Адаптивная чувствительность
    const isMobile = isMobileDevice();
    const sensitivity = isMobile ? 0.15 : 0.25;
    normalizedDelta *= sensitivity;
    
    if (Math.abs(normalizedDelta) < 1) return;

    scrollState.current.accumulator += normalizedDelta;
    
    // Порог срабатывания
    const threshold = isMobile ? 12 : 20;
    
    if (Math.abs(scrollState.current.accumulator) >= threshold) {
      const direction = scrollState.current.accumulator > 0 ? 1 : -1;
      onScroll(direction);
      scrollState.current.accumulator = 0;
    }

    // Сброс накопителя через время
    if (scrollState.current.scrollTimeout) {
      clearTimeout(scrollState.current.scrollTimeout);
    }
    
    scrollState.current.scrollTimeout = setTimeout(() => {
      scrollState.current.accumulator = 0;
    }, 150);
    
  }, [onScroll]);

  // Обработчик touch событий для мобильных
  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    scrollState.current.touchStartY = touch.clientY;
    scrollState.current.touchStartTime = Date.now();
    scrollState.current.momentum = 0;
  }, []);

  const handleTouchMove = useCallback((event) => {
    event.preventDefault(); // Предотвращаем скролл страницы
  }, []);

  const handleTouchEnd = useCallback((event) => {
    const touch = event.changedTouches[0];
    const touchEndY = touch.clientY;
    const touchEndTime = Date.now();
    
    const deltaY = scrollState.current.touchStartY - touchEndY;
    const deltaTime = touchEndTime - scrollState.current.touchStartTime;
    
    // Минимальное расстояние и время для срабатывания
    if (Math.abs(deltaY) > 50 && deltaTime < 500) {
      const direction = deltaY > 0 ? 1 : -1;
      onScroll(direction);
    }
  }, [onScroll]);

  useEffect(() => {
    const isMobile = isMobileDevice();
    
    // Добавляем обработчики
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    if (isMobile) {
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (isMobile) {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      }
      if (scrollState.current.scrollTimeout) {
        clearTimeout(scrollState.current.scrollTimeout);
      }
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);
};

// Клавиатурная навигация
const useKeyboardNavigation = (onNavigate, projects) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          onNavigate(-1);
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          onNavigate(1);
          break;
        case ' ': // Пробел
          event.preventDefault();
          onNavigate(1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, projects.length]);
};

// Основной компонент стека под углом 25°
export const ProjectStack3D = ({ projects = [], onProjectClick }) => {
  const groupRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [isMobile, setIsMobile] = useState(isMobileDevice());
  
  const { viewport, camera } = useThree();
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Навигация между проектами
  const navigate = useCallback((direction) => {
    if (isTransitioning || projects.length === 0) return;
    
    setIsTransitioning(true);
    
    const newIndex = (currentIndex + direction + projects.length) % projects.length;
    setCurrentIndex(newIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
    
  }, [currentIndex, projects.length, isTransitioning]);

  // Подключаем управление
  useAdvancedScroll(navigate, projects);
  useKeyboardNavigation(navigate, projects);

  // Позиционирование карточек в вертикальном стеке
  const getStackPosition = (index) => {
    const spacing = isMobile ? 1.8 : 2.2; // Расстояние между карточками
    const relativeIndex = index - currentIndex;
    
    // Позиция по Y - основная ось стека (снизу вверх)
    let y = relativeIndex * spacing;
    
    // Позиция по Z - глубина с учетом угла 25°
    let z = Math.abs(relativeIndex) * -0.5; // Дальние карточки глубже
    
    // Позиция по X - легкое смещение для эффекта
    let x = relativeIndex * 0.1;
    
    // Ограничиваем видимые карточки
    const maxVisible = isMobile ? 3 : 5;
    if (Math.abs(relativeIndex) > maxVisible) {
      y += relativeIndex > 0 ? maxVisible * spacing : -maxVisible * spacing;
      z -= 2; // Скрываем далеко
    }
    
    return [x, y, z];
  };

  // Анимация группы
  useFrame((state) => {
    if (groupRef.current && projects.length > 0) {
      const time = state.clock.elapsedTime;
      
      // Легкое покачивание всей группы
      groupRef.current.rotation.z = Math.sin(time * 0.3) * 0.005;
      
      // Настройка позиции группы для лучшего обзора
      const targetY = 0;
      const targetX = 0;
      
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
    }
  });

  // Настройка камеры для наклонного вида
  useEffect(() => {
    if (camera && projects.length > 0) {
      // Позиция камеры для лучшего обзора стека под углом
      const targetPosition = isMobile 
        ? new THREE.Vector3(0, 1, 5)   // Мобильная позиция - ближе и чуть выше
        : new THREE.Vector3(0, 1.5, 6); // Десктопная позиция
      
      // Плавно перемещаем камеру
      camera.position.lerp(targetPosition, 0.05);
      
      // Камера смотрит немного вниз для лучшего обзора стека
      const lookAtTarget = new THREE.Vector3(0, -0.5, 0);
      camera.lookAt(lookAtTarget);
      
      // Обновляем матрицы камеры
      camera.updateProjectionMatrix();
    }
  }, [camera, isMobile, projects.length]);

  const handleProjectHover = (project, isHovered) => {
    setHoveredProject(isHovered ? project : null);
  };

  if (projects.length === 0) {
    return null;
  }

  return (
    <>
      {/* Основной стек карточек */}
      <group ref={groupRef} position={[0, 0, 0]}>
        {projects.map((project, index) => {
          const position = getStackPosition(index);
          const isActive = index === currentIndex;
          
          return (
            <ProjectCarouselCard
              key={project.id}
              project={project}
              position={position}
              index={index}
              onClick={onProjectClick}
              onHover={handleProjectHover}
              isMobile={isMobile}
              isActive={isActive}
            />
          );
        })}
      </group>

      {/* Освещение для красивых теней */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[3, 3, 2]} 
        intensity={0.8}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <pointLight position={[-3, 2, 3]} intensity={0.4} color="#e2e8f0" />

      {/* Индикатор прогресса */}
      <group position={[isMobile ? 2.8 : 3.5, 0, 0]}>
        {projects.map((_, index) => {
          const relativeIndex = index - currentIndex;
          const yPos = relativeIndex * (isMobile ? 0.3 : 0.4);
          const isCurrentIndex = index === currentIndex;
          
          return (
            <mesh
              key={index}
              position={[0, yPos, 0]}
              onClick={() => !isTransitioning && setCurrentIndex(index)}
            >
              <sphereGeometry args={[isCurrentIndex ? 0.04 : 0.02, 8, 8]} />
              <meshBasicMaterial 
                color={isCurrentIndex ? "#0066ff" : "#d4d4d8"}
                transparent
                opacity={isCurrentIndex ? 1 : 0.6}
              />
            </mesh>
          );
        })}
      </group>

      {/* Счетчик проектов */}
      <group position={[isMobile ? -2.8 : -3.5, isMobile ? -2 : -2.5, 0]}>
        <mesh>
          <planeGeometry args={[1, 0.3]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.9}
          />
        </mesh>
        {/* Здесь можно добавить 3D текст для счетчика */}
      </group>
    </>
  );
};

export default ProjectStack3D;