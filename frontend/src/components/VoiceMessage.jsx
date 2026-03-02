import React, { useState, useRef } from "react";
import { IoMicOutline, IoStopOutline, IoPlayOutline, IoTrashOutline } from "react-icons/io5";
import "./VoiceMessage.css";

const VoiceMessage = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
      resetRecording();
    }
  };

  const handleCancel = () => {
    stopRecording();
    resetRecording();
    onCancel?.();
  };

  const resetRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL(null);
    setRecordingTime(0);
    setIsPlaying(false);
    clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-message-container">
      {!audioBlob ? (
        <div className="recording-section">
          <button
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <IoStopOutline size={24} />
            ) : (
              <IoMicOutline size={24} />
            )}
          </button>
          
          {isRecording ? (
            <div className="recording-display">
              <div className="recording-indicator">
                <div className="pulse-animation"></div>
                <span className="recording-text">Recording...</span>
              </div>
              <div className="recording-timer">{formatTime(recordingTime)}</div>
            </div>
          ) : (
            <div className="recording-prompt">
              <p>Tap to record voice message</p>
              <span className="hint">Hold for longer recording</span>
            </div>
          )}
        </div>
      ) : (
        <div className="playback-section">
          <audio ref={audioRef} src={audioURL} />
          
          <div className="audio-player">
            <button 
              className="play-btn"
              onClick={playAudio}
              disabled={isPlaying}
            >
              <IoPlayOutline size={20} />
            </button>
            
            <div className="audio-visualizer">
              <div className="audio-wave">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div 
                    key={i}
                    className="wave-bar"
                    style={{
                      height: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
              <div className="audio-duration">{formatTime(recordingTime)}</div>
            </div>
            
            <button 
              className="delete-btn"
              onClick={handleCancel}
            >
              <IoTrashOutline size={20} />
            </button>
          </div>
          
          <div className="audio-actions">
            <button className="cancel-audio-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="send-audio-btn" onClick={handleSend}>
              Send Voice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceMessage;