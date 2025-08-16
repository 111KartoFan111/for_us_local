// frontend/src/components/ui/ThreeErrorBoundary.js - Компонент для обработки ошибок Three.js
import React from 'react';
import { motion } from 'framer-motion';

class ThreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Обновляем состояние для показа fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Логируем ошибку
    console.error('❌ Three.js Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Отправляем ошибку в сервис мониторинга (опционально)
    if (process.env.NODE_ENV === 'production') {
      // Здесь можно интегрировать Sentry, LogRocket и т.д.
      console.error('Production Three.js error:', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI для ошибки Three.js
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-white flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              {/* 3D Error Icon */}
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-light text-neutral-900 mb-4">
                3D Scene Error
              </h2>
              
              <p className="text-neutral-600 mb-6 leading-relaxed">
                The 3D visualization encountered an error. This might be due to 
                graphics compatibility or texture loading issues.
              </p>
            </motion.div>

            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="w-full bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full border border-neutral-300 text-neutral-700 px-6 py-3 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
              >
                Reload Page
              </button>
            </div>

            {/* Error Details (только в разработке) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-left"
              >
                <summary className="cursor-pointer text-sm font-medium text-neutral-600 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs">
                  <div className="font-mono text-red-800 mb-2">
                    {this.state.error.toString()}
                  </div>
                  {this.state.error.stack && (
                    <pre className="text-red-600 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </motion.details>
            )}

            {/* Troubleshooting Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left"
            >
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Troubleshooting Tips:
              </h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Update your browser to the latest version</li>
                <li>• Enable hardware acceleration in browser settings</li>
                <li>• Check if WebGL is supported and enabled</li>
                <li>• Try using a different browser (Chrome, Firefox, Safari)</li>
                <li>• Disable browser extensions that might interfere</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Hook для проверки WebGL поддержки
export const useWebGLSupport = () => {
  const [isSupported, setIsSupported] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        setIsSupported(false);
        setError('WebGL is not supported by this browser');
        return;
      }

      // Проверяем основные расширения
      const extensions = [
        'OES_texture_float',
        'OES_texture_half_float',
        'WEBGL_depth_texture'
      ];

      const supportedExtensions = extensions.filter(ext => gl.getExtension(ext));
      
      console.log('✅ WebGL Support Check:', {
        webgl: true,
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        supportedExtensions
      });

      // Очистка
      canvas.remove();
      
    } catch (error) {
      console.error('❌ WebGL Support Check Failed:', error);
      setIsSupported(false);
      setError(error.message);
    }
  }, []);

  return { isSupported, error };
};

// Компонент для отображения ошибки WebGL
export const WebGLErrorFallback = ({ error }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen bg-white flex items-center justify-center p-6"
  >
    <div className="max-w-md w-full text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center">
        <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-light text-neutral-900 mb-4">
        WebGL Not Supported
      </h2>
      
      <p className="text-neutral-600 mb-6 leading-relaxed">
        Your browser doesn't support WebGL, which is required for 3D visualization. 
        Please update your browser or enable hardware acceleration.
      </p>

      <div className="space-y-4">
        <a
          href="https://get.webgl.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
        >
          Check WebGL Support
        </a>
        
        <div className="text-sm text-neutral-500">
          Error: {error}
        </div>
      </div>
    </div>
  </motion.div>
);

// Компонент-обертка с проверкой WebGL
export const ThreeJSWrapper = ({ children, fallback = null }) => {
  const { isSupported, error } = useWebGLSupport();

  if (!isSupported) {
    return fallback || <WebGLErrorFallback error={error} />;
  }

  return (
    <ThreeErrorBoundary>
      {children}
    </ThreeErrorBoundary>
  );
};

export default ThreeErrorBoundary;