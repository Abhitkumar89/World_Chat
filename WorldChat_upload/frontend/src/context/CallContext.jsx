import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from './SocketContext.jsx';
import { SOCKET_EVENTS, CALL_TYPES, ICE_SERVERS } from '../config/constants.js';

const CallContext = createContext(null);

/** Call lifecycle states. */
const CALL_STATE = {
  IDLE: 'idle',
  OUTGOING: 'outgoing', // we are calling someone
  INCOMING: 'incoming', // someone is calling us
  CONNECTED: 'connected',
};

/**
 * Centralized WebRTC call manager. Handles signaling via Socket.IO, the
 * RTCPeerConnection lifecycle, local/remote media streams, mute/camera toggles
 * and the call duration timer. Mounted once at app level so incoming calls are
 * caught anywhere in the app.
 */
export const CallProvider = ({ children }) => {
  const { socket } = useSocket();

  const [callState, setCallState] = useState(CALL_STATE.IDLE);
  const [callType, setCallType] = useState(CALL_TYPES.VIDEO);
  const [peer, setPeer] = useState(null); // { id, name, avatar }
  const [callId, setCallId] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [duration, setDuration] = useState(0);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingCandidates = useRef([]);
  const incomingOffer = useRef(null);
  const durationTimer = useRef(null);

  const isActive = callState !== CALL_STATE.IDLE;

  // ---- Media helpers ----
  const getMedia = useCallback(async (type) => {
    const constraints = {
      audio: true,
      video: type === CALL_TYPES.VIDEO ? { width: 1280, height: 720 } : false,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  }, []);

  const createPeerConnection = useCallback(
    (remoteId) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit(SOCKET_EVENTS.WEBRTC_ICE, {
            to: remoteId,
            candidate: event.candidate,
            callId,
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
          // Peer dropped; clean up locally.
          if (pc.connectionState === 'failed') toast.error('Connection lost');
        }
      };

      pcRef.current = pc;
      return pc;
    },
    [socket, callId]
  );

  const startTimer = useCallback(() => {
    setDuration(0);
    clearInterval(durationTimer.current);
    durationTimer.current = setInterval(() => setDuration((d) => d + 1), 1000);
  }, []);

  const cleanup = useCallback(() => {
    clearInterval(durationTimer.current);
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pendingCandidates.current = [];
    incomingOffer.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCallState(CALL_STATE.IDLE);
    setPeer(null);
    setCallId(null);
    setDuration(0);
    setMicOn(true);
    setCamOn(true);
  }, []);

  // ---- Outgoing call ----
  const startCall = useCallback(
    async (targetUser, type) => {
      if (isActive) return;
      try {
        setCallType(type);
        setPeer(targetUser);
        setCallState(CALL_STATE.OUTGOING);
        await getMedia(type);

        socket?.emit(
          SOCKET_EVENTS.CALL_INITIATE,
          { receiverId: targetUser.id, callType: type },
          (res) => {
            if (res?.success) setCallId(res.callId);
            else {
              toast.error(res?.error || 'Could not start call');
              cleanup();
            }
          }
        );
      } catch {
        toast.error('Could not access microphone/camera');
        cleanup();
      }
    },
    [isActive, getMedia, socket, cleanup]
  );

  // ---- Accept incoming call ----
  const acceptCall = useCallback(async () => {
    if (callState !== CALL_STATE.INCOMING || !peer) return;
    try {
      await getMedia(callType);
      const pc = createPeerConnection(peer.id);
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer.current));
      // Flush queued ICE candidates.
      for (const c of pendingCandidates.current) {
        await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      }
      pendingCandidates.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket?.emit(SOCKET_EVENTS.CALL_ACCEPT, { callId, callerId: peer.id });
      socket?.emit(SOCKET_EVENTS.WEBRTC_ANSWER, { to: peer.id, sdp: answer, callId });

      setCallState(CALL_STATE.CONNECTED);
      startTimer();
    } catch {
      toast.error('Failed to accept call');
      cleanup();
    }
  }, [callState, peer, callType, getMedia, createPeerConnection, socket, callId, startTimer, cleanup]);

  // ---- Reject / End ----
  const rejectCall = useCallback(() => {
    if (peer) socket?.emit(SOCKET_EVENTS.CALL_REJECT, { callId, callerId: peer.id });
    cleanup();
  }, [socket, callId, peer, cleanup]);

  const endCall = useCallback(() => {
    if (peer) socket?.emit(SOCKET_EVENTS.CALL_END, { callId, peerId: peer.id, durationSec: duration });
    cleanup();
  }, [socket, callId, peer, duration, cleanup]);

  // ---- Controls ----
  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, []);

  const toggleCam = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  }, []);

  // ---- Signaling listeners ----
  useEffect(() => {
    if (!socket) return undefined;

    const onIncoming = ({ callId: id, callType: type, from }) => {
      if (isActive) {
        // Already busy: auto-reject.
        socket.emit(SOCKET_EVENTS.CALL_REJECT, { callId: id, callerId: from.id });
        return;
      }
      setCallId(id);
      setCallType(type);
      setPeer(from);
      setCallState(CALL_STATE.INCOMING);
    };

    const onAccepted = async () => {
      // Receiver accepted; caller creates the offer.
      try {
        const pc = createPeerConnection(peer.id);
        localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, { to: peer.id, sdp: offer, callId });
        setCallState(CALL_STATE.CONNECTED);
        startTimer();
      } catch {
        toast.error('Failed to establish call');
        cleanup();
      }
    };

    const onRejected = () => {
      toast('Call declined', { icon: '📵' });
      cleanup();
    };

    const onEnded = () => {
      toast('Call ended');
      cleanup();
    };

    const onUnavailable = ({ reason }) => {
      toast.error(reason || 'User unavailable');
      cleanup();
    };

    const onOffer = ({ sdp }) => {
      // Stash the offer until the user accepts.
      incomingOffer.current = sdp;
    };

    const onAnswer = async ({ sdp }) => {
      try {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
        for (const c of pendingCandidates.current) {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        }
        pendingCandidates.current = [];
      } catch {
        /* ignore */
      }
    };

    const onIce = async ({ candidate }) => {
      if (!candidate) return;
      if (pcRef.current?.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        pendingCandidates.current.push(candidate);
      }
    };

    socket.on(SOCKET_EVENTS.CALL_INCOMING, onIncoming);
    socket.on(SOCKET_EVENTS.CALL_ACCEPTED, onAccepted);
    socket.on(SOCKET_EVENTS.CALL_REJECTED, onRejected);
    socket.on(SOCKET_EVENTS.CALL_ENDED, onEnded);
    socket.on(SOCKET_EVENTS.CALL_UNAVAILABLE, onUnavailable);
    socket.on(SOCKET_EVENTS.WEBRTC_OFFER, onOffer);
    socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, onAnswer);
    socket.on(SOCKET_EVENTS.WEBRTC_ICE, onIce);

    return () => {
      socket.off(SOCKET_EVENTS.CALL_INCOMING, onIncoming);
      socket.off(SOCKET_EVENTS.CALL_ACCEPTED, onAccepted);
      socket.off(SOCKET_EVENTS.CALL_REJECTED, onRejected);
      socket.off(SOCKET_EVENTS.CALL_ENDED, onEnded);
      socket.off(SOCKET_EVENTS.CALL_UNAVAILABLE, onUnavailable);
      socket.off(SOCKET_EVENTS.WEBRTC_OFFER, onOffer);
      socket.off(SOCKET_EVENTS.WEBRTC_ANSWER, onAnswer);
      socket.off(SOCKET_EVENTS.WEBRTC_ICE, onIce);
    };
  }, [socket, isActive, peer, callId, createPeerConnection, startTimer, cleanup]);

  const value = {
    callState,
    CALL_STATE,
    callType,
    peer,
    micOn,
    camOn,
    duration,
    isActive,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCam,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
};
