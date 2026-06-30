import { motion } from 'framer-motion';
import Avatar from '../common/Avatar.jsx';
import { Icon } from '../common/Icon.jsx';
import { useCall } from '../../context/CallContext.jsx';
import { CALL_TYPES } from '../../config/constants.js';

/** Incoming call popup with accept / reject actions. */
const IncomingCall = () => {
  const { callState, CALL_STATE, callType, peer, acceptCall, rejectCall } = useCall();

  if (callState !== CALL_STATE.INCOMING || !peer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      className="fixed left-1/2 top-6 z-[60] w-[min(92vw,380px)] -translate-x-1/2"
    >
      <div className="card flex items-center gap-4 p-4 shadow-2xl">
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/40" />
          <Avatar name={peer.name} src={peer.avatar} size="lg" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{peer.name}</p>
          <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Icon name={callType === CALL_TYPES.VIDEO ? 'video' : 'phone'} className="h-4 w-4" />
            Incoming {callType} call…
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={rejectCall} className="btn-danger h-12 w-12 !px-0" aria-label="Reject">
            <Icon name="phone-off" className="h-5 w-5" />
          </button>
          <button
            onClick={acceptCall}
            className="btn h-12 w-12 !px-0 bg-emerald-500 text-white hover:bg-emerald-600"
            aria-label="Accept"
          >
            <Icon name={callType === CALL_TYPES.VIDEO ? 'video' : 'phone'} className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default IncomingCall;
