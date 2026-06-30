import { useEffect, useRef, useState } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../common/Icon.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

/** Emoji picker trigger with outside-click dismissal. */
const EmojiButton = ({ onSelect }) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost h-10 w-10 !px-0"
        aria-label="Emoji picker"
      >
        <Icon name="smile" className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute bottom-12 left-0 z-50"
          >
            <EmojiPicker
              theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
              onEmojiClick={(emoji) => {
                onSelect(emoji.emoji);
              }}
              lazyLoadEmojis
              width={320}
              height={400}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmojiButton;
