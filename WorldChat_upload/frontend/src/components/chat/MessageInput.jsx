import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '../common/Icon.jsx';
import Spinner from '../common/Spinner.jsx';
import EmojiButton from './EmojiButton.jsx';
import { chatService } from '../../services/chatService.js';
import { MESSAGE_TYPES } from '../../config/constants.js';

/**
 * Composer for both global and private chat.
 * @param {(payload:object)=>Promise} onSend
 * @param {(isTyping:boolean)=>void} onTyping
 * @param {boolean} canUploadImage - registered users only
 */
const MessageInput = ({ onSend, onTyping, canUploadImage = false, disabled = false }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const typingRef = useRef(false);
  const typingTimeout = useRef(null);

  const stopTyping = () => {
    if (typingRef.current) {
      typingRef.current = false;
      onTyping?.(false);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      onTyping?.(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(stopTyping, 1500);
  };

  const handleSendText = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    clearTimeout(typingTimeout.current);
    stopTyping();
    try {
      await onSend({ message: value, messageType: MESSAGE_TYPES.TEXT });
      setText('');
    } catch (e) {
      toast.error(e.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { imageUrl, imagePublicId, expiresAt } = await chatService.uploadImage(file);
      await onSend({ messageType: MESSAGE_TYPES.IMAGE, imageUrl, imagePublicId, expiresAt });
      toast.success('Image sent (expires soon)');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-end gap-1.5 border-t border-slate-200 bg-white/80 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <EmojiButton onSelect={(emoji) => setText((t) => t + emoji)} />

      {canUploadImage && (
        <>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || disabled}
            className="btn-ghost h-10 w-10 !px-0"
            aria-label="Upload image"
          >
            {uploading ? <Spinner size={5} /> : <Icon name="image" className="h-5 w-5" />}
          </button>
        </>
      )}

      <textarea
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={stopTyping}
        disabled={disabled}
        placeholder={disabled ? 'Connecting…' : 'Type a message…'}
        className="input max-h-32 min-h-[2.75rem] flex-1 resize-none py-3"
      />

      <button
        onClick={handleSendText}
        disabled={!text.trim() || sending || disabled}
        className="btn-primary h-11 w-11 !px-0"
        aria-label="Send message"
      >
        {sending ? <Spinner size={5} /> : <Icon name="send" className="h-5 w-5" />}
      </button>
    </div>
  );
};

export default MessageInput;
