import { colorFromString, getInitials } from '../../utils/format.js';

const sizeMap = {
  xs: 'h-7 w-7 text-xs',
  sm: 'h-9 w-9 text-sm',
  md: 'h-11 w-11 text-base',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

const Avatar = ({ name = '', src = '', size = 'md', online, className = '' }) => {
  const dim = sizeMap[size] || sizeMap.md;
  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${dim} rounded-full object-cover ring-2 ring-white/10`}
        />
      ) : (
        <div
          className={`${dim} ${colorFromString(name)} flex items-center justify-center rounded-full font-semibold text-white`}
        >
          {getInitials(name) || '?'}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${
            online ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
