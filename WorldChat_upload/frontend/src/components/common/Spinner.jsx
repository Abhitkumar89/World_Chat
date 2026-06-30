const Spinner = ({ size = 5, className = '' }) => (
  <svg
    className={`animate-spin text-current h-${size} w-${size} ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    style={{ height: `${size * 0.25}rem`, width: `${size * 0.25}rem` }}
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
    />
  </svg>
);

export default Spinner;
