import React, { useState } from "react";
import { IoBarChart, IoAddCircle, IoClose } from "react-icons/io5";
import "./Poll.css";

const Poll = ({ onSend, currentUser }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isMultiChoice, setIsMultiChoice] = useState(false);
  const [duration, setDuration] = useState(24); // hours

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createPoll = () => {
    const validOptions = options.filter(opt => opt.trim() !== "");
    if (question.trim() && validOptions.length >= 2) {
      const pollData = {
        question: question.trim(),
        options: validOptions,
        isMultiChoice,
        duration,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString(),
        votes: {}
      };
      
      onSend?.(pollData);
      resetPoll();
    }
  };

  const resetPoll = () => {
    setQuestion("");
    setOptions(["", ""]);
    setIsMultiChoice(false);
    setDuration(24);
    setShowCreate(false);
  };

  return (
    <>
      <button 
        className="create-poll-btn"
        onClick={() => setShowCreate(true)}
      >
        <IoBarChart size={20} />
        <span>Create Poll</span>
      </button>

      {showCreate && (
        <div className="poll-modal-overlay">
          <div className="poll-modal">
            <div className="poll-modal-header">
              <h3>Create Poll</h3>
              <button 
                className="close-poll-btn"
                onClick={() => setShowCreate(false)}
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="poll-form">
              <div className="poll-question">
                <label>Poll Question</label>
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="poll-options">
                <label>Options ({options.length}/6)</label>
                {options.map((option, index) => (
                  <div key={index} className="option-input-row">
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      maxLength={100}
                    />
                    {options.length > 2 && (
                      <button 
                        className="remove-option-btn"
                        onClick={() => removeOption(index)}
                      >
                        <IoClose size={18} />
                      </button>
                    )}
                  </div>
                ))}
                
                {options.length < 6 && (
                  <button className="add-option-btn" onClick={addOption}>
                    <IoAddCircle size={20} />
                    <span>Add Option</span>
                  </button>
                )}
              </div>

              <div className="poll-settings">
                <div className="setting-row">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={isMultiChoice}
                      onChange={(e) => setIsMultiChoice(e.target.checked)}
                    />
                    <span>Allow multiple choices</span>
                  </label>
                </div>

                <div className="setting-row">
                  <label>Poll Duration</label>
                  <div className="duration-options">
                    {[1, 6, 12, 24, 72].map((hours) => (
                      <button
                        key={hours}
                        className={`duration-btn ${duration === hours ? 'active' : ''}`}
                        onClick={() => setDuration(hours)}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="poll-preview">
                <h4>Preview</h4>
                <div className="preview-card">
                  <div className="preview-question">{question || "Your question will appear here"}</div>
                  <div className="preview-options">
                    {options.map((option, index) => (
                      option.trim() && (
                        <div key={index} className="preview-option">
                          <div className="option-text">{option}</div>
                          <div className="option-bar">
                            <div className="bar-fill" style={{ width: `${Math.random() * 100}%` }} />
                          </div>
                          <div className="option-percentage">0%</div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              <div className="poll-actions">
                <button 
                  className="cancel-poll-btn"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button 
                  className="create-poll-btn-submit"
                  onClick={createPoll}
                  disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
                >
                  Create Poll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Poll;