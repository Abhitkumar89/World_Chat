/** Animated three-dot typing indicator with an optional label. */
const TypingIndicator = ({ users = [], label }) => {
  const text =
    label ||
    (users.length === 1
      ? `${users[0].name} is typing`
      : users.length === 2
        ? `${users[0].name} and ${users[1].name} are typing`
        : users.length > 2
          ? `${users.length} people are typing`
          : '');

  if (!text) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-slate-500 dark:text-slate-400">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-current animate-bounce-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      <span>{text}</span>
    </div>
  );
};

export default TypingIndicator;
