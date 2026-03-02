import React, { useState } from "react";
import { 
  IoCloseOutline, 
  IoCheckmarkOutline,
  IoAddCircleOutline,
  IoBarChartOutline,
  IoTimeOutline 
} from "react-icons/io5";
import "./CreatePoll.css";

const CreatePoll = ({ currentUser, onCreatePoll, onClose }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isMultiChoice, setIsMultiChoice] = useState(false);
  const [duration, setDuration] = useState(24); // hours
  const [anonymous, setAnonymous] = useState(false);

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

  const handleSubmit = () => {
    const validOptions = options.filter(opt => opt.trim() !== "");
    if (question.trim() && validOptions.length >= 2) {
      onCreatePoll?.({
        question: question.trim(),
        options: validOptions,
        isMultiChoice,
        duration,
        anonymous,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString()
      });
      onClose?.();
    }
  };

  const isFormValid = question.trim() && options.filter(opt => opt.trim()).length >= 2;

  return (
    <div className="create-poll-overlay" onClick={onClose}>
      <div className="create-poll-modal" onClick={(e) => e.stopPropagation()}>
        <div className="poll-modal-header">
          <h3>
            <IoBarChartOutline />
            Create Poll
          </h3>
          <button className="close-poll-btn" onClick={onClose}>
            <IoCloseOutline size={24} />
          </button>
        </div>

        <div className="poll-form">
          <div className="form-group">
            <label>Poll Question</label>
            <textarea
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
              rows={2}
            />
            <div className="char-count">{question.length}/200</div>
          </div>

          <div className="form-group">
            <label>Options ({options.length}/6)</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-row">
                <span className="option-number">{index + 1}</span>
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
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            {options.length < 6 && (
              <button className="add-option-btn" onClick={addOption} type="button">
                <IoAddCircleOutline />
                Add Option
              </button>
            )}
          </div>

          <div className="poll-settings">
            <div className="setting-row">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={isMultiChoice}
                  onChange={(e) => setIsMultiChoice(e.target.checked)}
                />
                <span>Allow multiple choices</span>
              </label>
            </div>

            <div className="setting-row">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                <span>Anonymous voting</span>
              </label>
            </div>

            <div className="setting-row">
              <label className="setting-label">
                <IoTimeOutline />
                Poll Duration
              </label>
              <div className="duration-options">
                {[1, 6, 12, 24, 72].map((hours) => (
                  <button
                    key={hours}
                    type="button"
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
              <div className="preview-question">
                {question || "Your question will appear here"}
              </div>
              <div className="preview-options">
                {options.map((option, index) => (
                  option.trim() && (
                    <div key={index} className="preview-option">
                      <div className="option-circle">{index + 1}</div>
                      <div className="option-text">{option}</div>
                      <div className="option-bar">
                        <div className="bar-fill" style={{ width: `${Math.random() * 100}%` }} />
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          <div className="poll-actions">
            <button 
              className="cancel-btn"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button 
              className="create-btn"
              onClick={handleSubmit}
              disabled={!isFormValid}
              type="button"
            >
              <IoCheckmarkOutline />
              Create Poll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;