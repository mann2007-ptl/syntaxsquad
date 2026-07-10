import React, { useEffect, useRef } from 'react';
import { useVoice } from '../../contexts/VoiceContext.jsx';

function StreamAudio({ stream }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay />;
}

export default function AudioRenderer() {
  const { remoteStreams } = useVoice();

  return (
    <div style={{ display: 'none' }}>
      {Object.entries(remoteStreams).map(([playerId, stream]) => (
        <StreamAudio key={playerId} stream={stream} />
      ))}
    </div>
  );
}
