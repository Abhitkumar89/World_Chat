import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { CallProvider } from './context/CallContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <CallProvider>
            <AppRoutes />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                className:
                  'dark:!bg-slate-800 dark:!text-slate-100 !rounded-xl !text-sm !shadow-lg',
              }}
            />
          </CallProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
