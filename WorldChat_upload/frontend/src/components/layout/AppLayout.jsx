import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../sidebar/Sidebar.jsx';
import IncomingCall from '../call/IncomingCall.jsx';
import CallScreen from '../call/CallScreen.jsx';
import { LayoutContext } from './layoutContext.js';

/**
 * Authenticated app shell: responsive sidebar (drawer on mobile), routed content,
 * and globally-mounted call overlays.
 */
const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ openSidebar: () => setDrawerOpen(true) }}>
      <div className="flex h-[100dvh] overflow-hidden bg-slate-100 dark:bg-slate-950">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
              />
              <motion.div
                className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] md:hidden"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Sidebar onClose={() => setDrawerOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </main>

        {/* Call overlays (mounted once, app-wide) */}
        <AnimatePresence>
          <IncomingCall />
        </AnimatePresence>
        <CallScreen />
      </div>
    </LayoutContext.Provider>
  );
};

export default AppLayout;
