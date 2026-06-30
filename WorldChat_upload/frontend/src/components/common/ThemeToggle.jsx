import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Icon } from './Icon.jsx';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`btn-ghost h-10 w-10 !px-0 ${className}`}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Icon name={isDark ? 'sun' : 'moon'} className="h-5 w-5" />
      </motion.span>
    </button>
  );
};

export default ThemeToggle;
