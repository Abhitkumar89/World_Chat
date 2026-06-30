import { createContext, useContext } from 'react';

export const LayoutContext = createContext({ openSidebar: () => {} });

export const useLayout = () => useContext(LayoutContext);
