// frontend/src/components/3d/ProjectCatalog3D.js - ГОРИЗОНТАЛЬНЫЙ КАТАЛОГ как на unveil.fr
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

// Минимальный компонент карточки проекта
const ProjectCatalogCard = React.memo(({ 
  project, 
  position = [0, 0, 0], 
  index = 0,
  onClick,
  onHover,
  hoveredProject = null,
  isVisible = true
}) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const navigate = useNavigate();
  
  // Проверяем, наведен ли именно этот проект
  const isHovered = hoveredProject?.id === project.id;

  // URL текстуры с fallback
  const textureUrl = useMemo(() => {
    return project.imageUrl || `data:image/svg+xml;base64,${btoa(`
      <svg width="320" height="450" viewBox="0 0 320 450" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="450" fill="#f8fafc"/>
        <circle cx="160" cy="200" r="40" fill="#e2e8f0"/>
        <text x="160" y="280" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="14" font-weight="500">${project.title}</text>
        <text x="160" y="300" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="10">${project.category || 'Project'}</text>
      </svg>
    `)}`;
  }, [project.imageUrl, project.title, project.category]);

  // Загружаем текстуру
  const texture = useTexture(textureUrl, (texture) => {
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
  });

  // Плавная анимация только при hover
  useFrame((state) => {
    if (!groupRef.current || !isVisible) return;
    
    const time = state.clock.elapsedTime;
    
    // Легкое парение
    const floatY = Math.sin(time * 0.8 + index * 1.2) * 0.02;
    
    // Позиционирование
    const targetY = position[1] + floatY + (isHovered ? 0.3 : 0);
    const targetScale = isHovered ? 1.05 : 1.0;
    const targetZ = position[2] + (isHovered ? 0.1 : 0);
    
    // Плавное движение
    groupRef.current.position.x = position[0];
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.08;
    
    // Плавное масштабирование
    const currentScale = groupRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * 0.08;
    groupRef.current.scale.setScalar(newScale);
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
    
    document.body.style.cursor = 'none';
  };

  const handlePointerLeave = (event) => {
    event.stopPropagation();
    onHover && onHover(project, false);
    
    if (window.updateProjectCursor) {
      window.updateProjectCursor({ show: false });
    }
    
    document.body.style.cursor = 'auto';
  };

  if (!isVisible) return null;

  return (
    <group ref={groupRef} position={position}>
      
      {/* Невидимая область для клика */}
      <mesh
        position={[0, 0, 0.1]}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        visible={false}
      >
        <planeGeometry args={[3.2, 4.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Основное изображение проекта */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[3, 4.2]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Рамка */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[3.1, 4.3]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Тень */}
      <mesh position={[0.05, -0.05, -0.05]}>
        <planeGeometry args={[3.0, 4.2]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isHovered ? 0.15 : 0.08}
        />
      </mesh>

      {/* Индикатор избранного проекта */}
      {project.featured && (
        <mesh position={[1.4, 1.9, 0.05]}>
          <circleGeometry args={[0.08, 8]} />
          <meshBasicMaterial
            color="#0066ff"
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
});

// Основной компонент горизонтального каталога
export const ProjectCatalog3D = ({ projects = [], onProjectClick }) => {
  const groupRef = useRef();
  const [hoveredProject, setHoveredProject] = useState(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Определяем параметры сетки
  const CARD_SPACING = 4.0; // Расстояние между карточками
  const VIEWPORT_WIDTH = 12; // Ширина видимой области
  const MAX_SCROLL = Math.max(0, (projects.length - 1) * CARD_SPACING - VIEWPORT_WIDTH);

  // Вычисляем позицию каждого проекта
  const getProjectPosition = useCallback((index) => {
    const x = (index * CARD_SPACING) - scrollOffset;
    const y = 0;
    const z = 0;
    
    return [x, y, z];
  }, [scrollOffset]);

  // Определяем видимые проекты для оптимизации
  const visibleProjects = useMemo(() => {
    const startIndex = Math.max(0, Math.floor((scrollOffset - CARD_SPACING) / CARD_SPACING));
    const endIndex = Math.min(projects.length - 1, Math.ceil((scrollOffset + VIEWPORT_WIDTH + CARD_SPACING) / CARD_SPACING));
    
    return projects.map((project, index) => ({
      ...project,
      index,
      isVisible: index >= startIndex && index <= endIndex,
      position: getProjectPosition(index)
    }));
  }, [projects, scrollOffset, getProjectPosition]);

  // Обработчик скролла
  useEffect(() => {
    let scrollTimeout;
    
    const handleWheel = (event) => {
      event.preventDefault();
      
      setIsScrolling(true);
      
      // Нормализуем deltaY для разных устройств
      let normalizedDelta = event.deltaY;
      if (event.deltaMode === 1) normalizedDelta *= 16;
      else if (event.deltaMode === 2) normalizedDelta *= window.innerHeight;
      
      // Применяем скролл
      setScrollOffset(prev => {
        const scrollSpeed = 0.02; // Чувствительность скролла
        const newOffset = prev + (normalizedDelta * scrollSpeed);
        return Math.max(0, Math.min(newOffset, MAX_SCROLL));
      });

      // Останавливаем индикатор скролла
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    // Обработчик клавиш
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      let direction = 0;
      
      switch (event.key) {
        case 'ArrowLeft':
          direction = -1;
          break;
        case 'ArrowRight':
          direction = 1;
          break;
        default:
          return;
      }
      
      if (direction !== 0) {
        event.preventDefault();
        setScrollOffset(prev => {
          const newOffset = prev + (direction * CARD_SPACING);
          return Math.max(0, Math.min(newOffset, MAX_SCROLL));
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(scrollTimeout);
    };
  }, [MAX_SCROLL]);

  // Плавная анимация скролла
  useFrame(() => {
    if (groupRef.current) {
      const targetX = -scrollOffset;
      const currentX = groupRef.current.position.x;
      const newX = currentX + (targetX - currentX) * 0.08;
      groupRef.current.position.x = newX;
    }
  });

  const handleProjectHover = (project, isHovered) => {
    setHoveredProject(isHovered ? project : null);
  };

  return (
    <>
      {/* Основная группа проектов */}
      <group ref={groupRef}>
        {visibleProjects.map((project) => (
          <ProjectCatalogCard
            key={project.id}
            project={project}
            index={project.index}
            position={project.position}
            onClick={onProjectClick}
            onHover={handleProjectHover}
            hoveredProject={hoveredProject}
            isVisible={project.isVisible}
          />
        ))}
      </group>

      {/* Индикатор прогресса */}
      {projects.length > 0 && MAX_SCROLL > 0 && (
        <group position={[0, -3, 0]}>
          {/* Полоса прогресса */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[8, 0.02]} />
            <meshBasicMaterial
              color="#e2e8f0"
              transparent
              opacity={0.6}
            />
          </mesh>
          
          {/* Индикатор текущей позиции */}
          <mesh position={[
            -4 + (8 * (scrollOffset / MAX_SCROLL)), 
            0, 
            0.01
          ]}>
            <planeGeometry args={[1, 0.04]} />
            <meshBasicMaterial
              color="#0066ff"
              transparent
              opacity={isScrolling ? 1 : 0.7}
            />
          </mesh>
        </group>
      )}

      {/* Навигационные стрелки */}
      {scrollOffset > 0 && (
        <group position={[-6, 0, 1]}>
          <mesh
            onClick={() => {
              setScrollOffset(prev => Math.max(0, prev - CARD_SPACING * 3));
            }}
          >
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial
              color="#0066ff"
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}

      {scrollOffset < MAX_SCROLL && (
        <group position={[6, 0, 1]}>
          <mesh
            onClick={() => {
              setScrollOffset(prev => Math.min(MAX_SCROLL, prev + CARD_SPACING * 3));
            }}
          >
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial
              color="#0066ff"
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}

      {/* Подсказка для пользователя */}
      {projects.length > 3 && (
        <group position={[0, -4, 0]}>
          <mesh>
            <planeGeometry args={[6, 0.3]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      )}
    </>
  );
};

export default ProjectCatalog3D;