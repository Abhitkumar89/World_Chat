/** Loading skeleton for a chat message list. */
export const MessageSkeleton = ({ count = 6 }) => (
  <div className="space-y-4 p-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`flex gap-3 ${i % 2 ? 'flex-row-reverse' : ''}`}>
        <div className="skeleton h-9 w-9 rounded-full" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-24 rounded" />
          <div
            className="skeleton h-10 rounded-2xl"
            style={{ width: `${120 + ((i * 47) % 160)}px` }}
          />
        </div>
      </div>
    ))}
  </div>
);

/** Loading skeleton for a sidebar list. */
export const ListSkeleton = ({ count = 8 }) => (
  <div className="space-y-2 p-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 rounded-xl p-2">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-2/3 rounded" />
          <div className="skeleton h-2.5 w-1/2 rounded" />
        </div>
      </div>
    ))}
  </div>
);
