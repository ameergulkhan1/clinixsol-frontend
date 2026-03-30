import React, { useState } from 'react';
import Button from '../../../../components/common/Button/Button';
import './VideoConsultation.css';

const VideoConsultation = () => {
  const [isCallActive, setIsCallActive] = useState(false);

  const startCall = () => {
    setIsCallActive(true);
    // Initialize video call
  };

  const endCall = () => {
    setIsCallActive(false);
  };

  return (
    <div className="video-consultation">
      <div className="video-container">
        <div className="remote-video">
          {isCallActive ? <p>Doctor's Video</p> : <p>Call not started</p>}
        </div>
        <div className="local-video">
          <p>Your Video</p>
        </div>
      </div>
      <div className="call-controls">
        {!isCallActive ? (
          <Button onClick={startCall}>Start Call</Button>
        ) : (
          <>
            <button className="control-btn">🎤 Mute</button>
            <button className="control-btn">📹 Camera</button>
            <Button variant="danger" onClick={endCall}>End Call</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoConsultation;