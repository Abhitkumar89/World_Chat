import { AnimatePresence, motion } from 'framer-motion';
import Avatar from '../common/Avatar.jsx';
import { Icon } from '../common/Icon.jsx';
import { useCall } from '../../context/CallContext.jsx';
import { CALL_TYPES } from '../../config/constants.js';
import { formatDuration } from '../../utils/format.js';

const ControlButton = ({ active, onClick, icon, danger, label }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`grid h-14 w-14 place-items-center rounded-full transition active:scale-95 ${
      danger
        ? 'bg-red-600 text-white hover:bg-red-700'
        : active
          ? 'bg-white/20 text-white hover:bg-white/30'
          : 'bg-white text-slate-900 hover:bg-slate-100'
    }`}
  >
    <Icon name={icon} className="h-6 w-6" />
  </button>
);

/**
 * Full-screen active/outgoing call interface for both voice and video calls.
 */
const CallScreen = () => {
  const {
    callState,
    CALL_STATE,
    callType,
    peer,
    micOn,
    camOn,
    duration,
    localVideoRef,
    remoteVideoRef,
    toggleMic,
    toggleCam,
    endCall,
  } = useCall();

  const visible = callState === CALL_STATE.OUTGOING || callState === CALL_STATE.CONNECTED;
  const isVideo = callType === CALL_TYPES.VIDEO;
  const connected = callState === CALL_STATE.CONNECTED;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col bg-slate-950 text-white"
        >
          {/* Remote video / avatar */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            {isVideo && connected ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {!connected && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/30" />
                  )}
                  <Avatar name={peer?.name} src={peer?.avatar} size="xl" />
                </div>
                <h2 className="text-2xl font-bold">{peer?.name}</h2>
                <p className="text-slate-300">
                  {connected ? formatDuration(duration) : `Calling… ${isVideo ? '📹' : '📞'}`}
                </p>
              </div>
            )}

            {/* Connected video header overlay */}
            {isVideo && connected && (
              <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-5">
                <div>
                  <p className="text-lg font-bold">{peer?.name}</p>
                  <p className="text-sm text-slate-300">{formatDuration(duration)}</p>
                </div>
              </div>
            )}

            {/* Local preview (video calls) */}
            {isVideo && (
              <div className="absolute bottom-28 right-4 h-40 w-28 overflow-hidden rounded-2xl border-2 border-white/20 bg-slate-800 shadow-2xl sm:bottom-6 sm:right-6 sm:h-48 sm:w-36">
                <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                {!camOn && (
                  <div className="absolute inset-0 grid place-items-center bg-slate-900">
                    <Icon name="video-off" className="h-6 w-6 text-slate-400" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 bg-gradient-to-t from-black/70 to-transparent px-6 pb-10 pt-8">
            <ControlButton
              label="Toggle microphone"
              active={micOn}
              onClick={toggleMic}
              icon={micOn ? 'mic' : 'mic-off'}
            />
            <ControlButton label="End call" onClick={endCall} icon="phone-off" danger />
            {isVideo && (
              <ControlButton
                label="Toggle camera"
                active={camOn}
                onClick={toggleCam}
                icon={camOn ? 'video' : 'video-off'}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallScreen;
