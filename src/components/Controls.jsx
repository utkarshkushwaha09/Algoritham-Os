import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Controls = ({ currentStep, totalSteps, onStepChange, seekCount }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    let intervalId = null;
    if (isPlaying && totalSteps > 0 && currentStep < totalSteps - 1) {
      const intervalDuration = 1000 / playbackSpeed;
      intervalId = setInterval(() => {
        onStepChange(currentStep + 1);
      }, intervalDuration);
    }
    if (currentStep >= totalSteps - 1 && isPlaying) {
      setIsPlaying(false);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, currentStep, totalSteps, onStepChange, playbackSpeed]);

  const handlePlayPause = () => {
    if (!isPlaying && currentStep >= totalSteps - 1) return;
    setIsPlaying(!isPlaying);
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (currentStep > 0) onStepChange(currentStep - 1);
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (currentStep < totalSteps - 1) onStepChange(currentStep + 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const handleSpeedChange = (e) => {
    setPlaybackSpeed(parseFloat(e.target.value));
  };

  const isAtStart = currentStep === 0;
  const isAtEnd = currentStep >= totalSteps - 1;
  const hasSteps = totalSteps > 0;

  return (
    <div className="w-full max-w-3xl p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 sm:mb-0">
          Simulation Controls
        </h3>
        <div className="flex items-center space-x-2">
          <label htmlFor="speed-select" className="text-sm text-gray-600">Speed:</label>
          <select
            id="speed-select"
            value={playbackSpeed}
            onChange={handleSpeedChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x (Normal)</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
            <option value={8}>8x</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex space-x-2 mb-3 sm:mb-0">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isAtStart || !hasSteps}
            aria-label="Reset Simulation"
          >
            Reset
          </button>
          <button
            onClick={handlePrevStep}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isAtStart || !hasSteps}
            aria-label="Previous Step"
          >
            Previous
          </button>
          <button
            onClick={handlePlayPause}
            className={`px-3 py-1.5 text-sm font-medium text-white rounded disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
            disabled={isAtEnd || !hasSteps}
            aria-label={isPlaying ? "Pause Simulation" : "Play Simulation"}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleNextStep}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isAtEnd || !hasSteps}
            aria-label="Next Step"
          >
            Next
          </button>
        </div>
        <div className="text-right text-sm text-gray-700">
          {hasSteps ? (
            <>
              <p>Step: <span className="font-medium">{currentStep + 1} / {totalSteps}</span></p>
              {seekCount !== undefined && (
                <p>Total Seek: <span className="font-semibold text-orange-600">{seekCount}</span></p>
              )}
            </>
          ) : (
            <p>No simulation data.</p>
          )}
        </div>
      </div>
    </div>
  );
};

Controls.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onStepChange: PropTypes.func.isRequired,
  seekCount: PropTypes.number,
};

export default Controls;