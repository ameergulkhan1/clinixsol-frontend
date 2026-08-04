import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './store/store';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import reportWebVitals from './reportWebVitals';

// ===== GLOBAL ERROR HANDLERS =====
// Catch uncaught errors
window.addEventListener('error', (event) => {
  console.error('💥 Global Error Caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise
  });
});

console.log('🚀 Application Starting...');
console.log('📌 Environment:', process.env.NODE_ENV);
console.log('📌 Firebase Config:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '✅ Present' : '❌ Missing',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing',
});

// ===== QUERY CLIENT CONFIGURATION =====
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

console.log('✅ QueryClient initialized');

// ===== ROOT ELEMENT CHECK =====
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found! Check your public/index.html');
} else {
  console.log('✅ Root element found');
}

// ===== RENDER APPLICATION =====
try {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </React.StrictMode>
  );

  console.log('✅ React rendered successfully');
} catch (error) {
  console.error('❌ Failed to render React application:', error);
  
  // Show error on screen
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial; color: red;">
        <h1>❌ Failed to load application</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <details>
          <summary>Stack Trace</summary>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack}</pre>
        </details>
        <p>Check console for more details.</p>
      </div>
    `;
  }
}

// ===== MEASURE PERFORMANCE =====
reportWebVitals((metric) => {
  console.log(`📊 ${metric.name}:`, metric.value);
});