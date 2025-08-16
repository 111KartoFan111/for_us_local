// frontend/src/pages/Portfolio.js - ПОЛНАЯ ВЕРСИЯ с угловым стеком под 25°
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { projectsAPI } from '../utils/api';
import { useMobileScroll, useMobileHints } from '../hooks/useMobileScroll';

// Ленивая загрузка оптимизированного 3D компонента
const ProjectStack3D = React.lazy(() => 
  import('../components/3d/ProjectStack3D').then(module => ({
    default: module.ProjectStack3D
  }))
);

// Улучшенный лоадер для 3D сцены
const Scene3DLoader = () => (
  <div className="loading-3d-indicator">
    <div className="loading-spinner-3d" />
    <p className="text-sm text-neutral-600 font-medium">Loading 3D Scene...</p>
  </div>
);

// Компонент мобильных подсказок
const MobileHints = ({ show, hint, onHide }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mobile-scroll-hint"
      onClick={onHide}
    >
      {hint}
    </motion.div>
  );
};

// Индикатор прогресса для мобильных
const ProgressIndicator = ({ projects, currentIndex, onProjectSelect }) => {
  const isMobile = window.innerWidth <= 768;
  
  if (!isMobile || projects.length <= 1) return null;

  return (
    <div className="progress-indicator-mobile">
      {projects.map((project, index) => (
        <button
          key={project.id}
          onClick={() => onProjectSelect(index)}
          className={`progress-dot ${index === currentIndex ? 'active' : ''}`}
          aria-label={`Go to project ${index + 1}: ${project.title}`}
        />
      ))}
    </div>
  );
};

// Счетчик проектов
const ProjectCounter = ({ current, total }) => {
  const isMobile = window.innerWidth <= 768;
  
  if (!isMobile) return null;

  return (
    <div className="project-counter-mobile">
      {current + 1} / {total}
    </div>
  );
};

// Компонент фильтров проектов
const ProjectFilters = ({ filters, currentFilter, onFilterChange, projects }) => {
  return (
    <div className="fixed top-20 right-6 z-20 bg-white/90 backdrop-blur-sm rounded-lg border border-neutral-200 p-2">
      <div className="flex flex-col gap-1">
        {filters.map((filterOption) => {
          const projectCount = filterOption === 'ALL' 
            ? projects.length 
            : projects.filter(project => project.category === filterOption).length;
          
          return (
            <button
              key={filterOption}
              onClick={() => onFilterChange(filterOption)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center justify-between ${
                currentFilter === filterOption
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <span>{filterOption}</span>
              <span className={`ml-2 text-xs ${
                currentFilter === filterOption
                  ? 'text-neutral-300'
                  : 'text-neutral-400'
              }`}>
                ({projectCount})
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Показываем выбранную категорию */}
      {currentFilter !== 'ALL' && (
        <div className="mt-2 pt-2 border-t border-neutral-200">
          <div className="text-xs text-neutral-500 text-center">
            {currentFilter}
          </div>
        </div>
      )}
    </div>
  );
};

// Подсказки навигации для десктопа
const DesktopNavHints = () => {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) return null;

  return (
    <div className="fixed bottom-6 left-6 z-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.6 }}
        className="bg-white/90 backdrop-blur-sm rounded-lg border border-neutral-200 p-3"
      >
        <div className="text-xs text-neutral-500 space-y-1">
          <div className="font-medium text-neutral-700 mb-2">Navigation:</div>
          <div>🖱️ Scroll to navigate</div>
          <div>← → Arrow keys</div>
          <div>Click to view project</div>
        </div>
      </motion.div>
    </div>
  );
};

// Информационная панель проекта
const ProjectInfoPanel = ({ project, onNavigate }) => {
  if (!project) return null;

  const isMobile = window.innerWidth <= 768;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-neutral-200 p-6 z-30"
    >
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Теги и категория */}
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-sm font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
            {project.category}
          </span>
          {project.featured && (
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
        
        {/* Заголовок */}
        <h2 className="text-2xl lg:text-3xl font-light text-neutral-900 tracking-tight mb-4">
          {project.title}
        </h2>
        
        {/* Описание */}
        <p className="text-neutral-600 leading-relaxed mb-6 max-w-2xl mx-auto">
          {project.description}
        </p>
        
        {/* Технологии */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {project.technologies.split(',').slice(0, 5).map((tech, index) => (
            <span key={index} className="tech-tag-unveil">
              {tech.trim()}
            </span>
          ))}
          {project.technologies.split(',').length > 5 && (
            <span className="tech-tag-unveil opacity-60">
              +{project.technologies.split(',').length - 5} more
            </span>
          )}
        </div>
        
        {/* Кнопки действий */}
        <div className="flex justify-center space-x-4 flex-wrap gap-2">
          {/* Кастомные кнопки */}
          {project.customButtons?.map((button, index) => (
            <a
              key={index}
              href={button.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`catalog-button-unveil ${index === 0 ? 'catalog-button-primary' : ''}`}
            >
              {button.text}
            </a>
          ))}
          
          {/* Legacy кнопки */}
          {(!project.customButtons || project.customButtons.length === 0) && (
            <>
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="catalog-button-unveil catalog-button-primary"
                >
                  VIEW PROJECT
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="catalog-button-unveil"
                >
                  VIEW CODE
                </a>
              )}
            </>
          )}
          
          <button
            onClick={() => onNavigate(`/portfolio/${project.id}`)}
            className="catalog-button-unveil"
          >
            LEARN MORE
          </button>
        </div>

        {/* Дополнительная информация для мобильных */}
        {isMobile && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex justify-center space-x-6 text-xs text-neutral-500">
              <div>
                <span className="font-medium">Released:</span>{' '}
                {project.releaseDate ? 
                  new Date(project.releaseDate).getFullYear() : 'N/A'
                }
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                {project.status === 'published' ? 'Live' : project.status}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};

// Фоновые эффекты
const BackgroundEffects = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    {/* Градиентные области для создания атмосферы */}
    <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-50/30 to-transparent rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-purple-50/20 to-transparent rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-gradient-to-r from-transparent via-neutral-50/10 to-transparent rounded-full blur-3xl"></div>
  </div>
);

// Основной компонент Portfolio
const Portfolio = () => {
  const [filter, setFilter] = useState('ALL');
  const [hoveredProject, setHoveredProject] = useState(null);
  const [currentProject, setCurrentProject] = useState(0);
  const [is3DReady, setIs3DReady] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef();

  // Оптимизированный запрос проектов
  const { data: projectsData, isLoading, error } = useQuery(
    'projects',
    () => projectsAPI.getAll({ status: 'published' }),
    {
      select: (response) => response.data.projects,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  // Получаем категории
  const { data: categoriesData } = useQuery(
    'project-categories',
    () => projectsAPI.getCategories(),
    {
      select: (response) => response.data.categories,
      staleTime: 5 * 60 * 1000,
    }
  );

  const projects = projectsData || [];
  const categories = categoriesData || [];

  // Мемоизированная фильтрация по категориям
  const filteredProjects = React.useMemo(() => {
    return projects.filter(project => {
      if (filter === 'ALL') return true;
      return project.category === filter;
    });
  }, [projects, filter]);

  // Настройка мобильного скролла
  const handleScroll = React.useCallback((direction) => {
    if (filteredProjects.length === 0) return;
    
    setCurrentProject(prev => {
      const newIndex = (prev + direction + filteredProjects.length) % filteredProjects.length;
      // Обновляем hoveredProject при скролле
      setHoveredProject(filteredProjects[newIndex]);
      return newIndex;
    });
  }, [filteredProjects]);

  const { isMobile } = useMobileScroll(handleScroll, {
    sensitivity: 0.2,
    threshold: 40,
    preventPageScroll: true,
    enableHaptic: true,
    debounceTime: 100
  });

  const { showHints, currentHint, hideHints } = useMobileHints(filteredProjects);

  // Сброс текущего проекта при смене фильтра
  useEffect(() => {
    setCurrentProject(0);
    setHoveredProject(filteredProjects[0] || null);
  }, [filter, filteredProjects]);

  // Предзагрузка критических ресурсов
  useEffect(() => {
    if (filteredProjects.length > 0) {
      const firstProject = filteredProjects[0];
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/portfolio/${firstProject.id}`;
      document.head.appendChild(link);
    }
  }, [filteredProjects]);

  // Генерируем динамические фильтры
  const filterOptions = React.useMemo(() => {
    const options = ['ALL'];
    categories.forEach(category => {
      if (category && !options.includes(category)) {
        options.push(category);
      }
    });
    return options;
  }, [categories]);

  // Обработчик выбора проекта
  const handleProjectSelect = (index) => {
    if (index >= 0 && index < filteredProjects.length) {
      setCurrentProject(index);
      setHoveredProject(filteredProjects[index]);
    }
  };

  // Обработчик смены фильтра
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Показываем ошибку
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-white"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Loading Error</h2>
          <p className="text-neutral-600 mb-8">Failed to load projects.</p>
          <button
            onClick={() => window.location.reload()}
            className="catalog-button-unveil catalog-button-primary"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  // Показываем лоадер
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white"
      >
        <section className="pt-24 pb-8 px-6 lg:px-8">
          <div className="max-w-screen-2xl mx-auto text-center">
            <div className="loading-shimmer h-16 w-64 mx-auto mb-4 rounded" />
            <div className="loading-shimmer h-6 w-32 mx-auto rounded" />
          </div>
        </section>
        <div className="w-full h-96 flex items-center justify-center">
          <Scene3DLoader />
        </div>
      </motion.div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-white"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">No Projects Found</h2>
          <p className="text-neutral-600 mb-8">
            {filter === 'ALL' ? 'No projects available.' : `No projects in "${filter}" category.`}
          </p>
          <button
            onClick={() => setFilter('ALL')}
            className="catalog-button-unveil catalog-button-primary"
          >
            Show All Projects
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white overflow-hidden"
    >

      {/* 3D Сцена с угловым стеком */}
      <section className="portfolio-3d-scene perspective-stack relative">
        <motion.div 
          className="canvas-container w-full bg-white gpu-optimized"
          style={{ height: '100vh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Canvas
            ref={canvasRef}
            camera={{ 
              position: isMobile ? [0, 1, 5] : [0, 1.5, 6], 
              fov: isMobile ? 65 : 60,
              near: 0.1,
              far: 1000 
            }}
            onCreated={({ gl, camera }) => {
              gl.setClearColor('#ffffff');
              gl.physicallyCorrectLights = true;
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              
              // Оптимизация рендеринга
              gl.powerPreference = "high-performance";
              gl.antialias = !isMobile; // Отключаем антиалиасинг на мобильных
              
              // Настройка камеры для углового обзора
              camera.lookAt(0, -0.5, 0); // Смотрим немного вниз
              
              setIs3DReady(true);
            }}
            style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)' }}
            dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
          >
            {/* Угловой стек проектов */}
            <Suspense fallback={null}>
              <ProjectStack3D 
                projects={filteredProjects}
                currentIndex={currentProject}
                onProjectClick={(project) => {
                  navigate(`/portfolio/${project.id}`);
                }}
                onProjectHover={(project, isHovered) => {
                  if (isHovered) {
                    setHoveredProject(project);
                  }
                }}
              />
            </Suspense>

            {/* Отключаем OrbitControls для полного контроля */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
              autoRotate={false}
            />
          </Canvas>

          {/* Индикатор загрузки 3D */}
          <AnimatePresence>
            {!is3DReady && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-white/90 flex items-center justify-center"
              >
                <Scene3DLoader />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Мобильные подсказки */}
          <AnimatePresence>
            <MobileHints 
              show={showHints && is3DReady && isMobile} 
              hint={currentHint}
              onHide={hideHints}
            />
          </AnimatePresence>

        </motion.div>
      </section>

      {/* Фильтры проектов */}
      <ProjectFilters 
        filters={filterOptions}
        currentFilter={filter}
        onFilterChange={handleFilterChange}
        projects={projects}
      />

      {/* Прогресс индикатор для мобильных */}
      <ProgressIndicator 
        projects={filteredProjects}
        currentIndex={currentProject}
        onProjectSelect={handleProjectSelect}
      />

      {/* Счетчик проектов для мобильных */}
      <ProjectCounter 
        current={currentProject} 
        total={filteredProjects.length} 
      />

      {/* Navigation подсказки для десктопа */}
      <DesktopNavHints />

      {/* Информация о текущем проекте */}
      <AnimatePresence>
        {hoveredProject && (
          <ProjectInfoPanel 
            project={hoveredProject}
            onNavigate={navigate}
          />
        )}
      </AnimatePresence>

      {/* Swipe подсказка для первого посещения мобильных */}
      {isMobile && is3DReady && filteredProjects.length > 1 && (
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
            >
              <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
                👆 Swipe up/down to browse projects
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Фоновые эффекты */}
      <BackgroundEffects />

    </motion.div>
  );
};

export default Portfolio;