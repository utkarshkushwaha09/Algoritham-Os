import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Controls from './Controls';

const scaleX = (track, maxTrack, width, paddingX) => {
  const clampedTrack = Math.max(0, Math.min(track, maxTrack));
  return (clampedTrack / maxTrack) * (width - 2 * paddingX) + paddingX;
};

const DiskVisualizer = ({ path = [], diskSize = 199, currentStep, onStepChange, seekCount }) => {
  const [positions, setPositions] = useState([]);
  const svgRef = useRef(null);

  const maxTrack = diskSize;
  const verticalSpacing = 50;
  const padding = { x: 60, y: 80 };
  const viewBoxWidth = 1100;
  const viewBoxHeight = Math.max(600, (path.length || 0) * verticalSpacing + padding.y * 2);

  useEffect(() => {
    if (!path || path.length === 0) {
      setPositions([]);
      return;
    }
    const startY = padding.y + verticalSpacing / 2;
    const scaled = path.map((track, idx) => ({
      track,
      x: scaleX(track, maxTrack, viewBoxWidth, padding.x),
      y: startY + idx * verticalSpacing,
    }));
    setPositions(scaled);
  }, [path, maxTrack, padding.x, padding.y, verticalSpacing, viewBoxWidth]);

  const uniqueTracks = useMemo(() => {
    return [...new Set([0, ...path, maxTrack])].sort((a, b) => a - b);
  }, [path, maxTrack]);

  if (!path || path.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg my-4 text-center text-gray-500">
        Enter a sequence of tracks to visualize the disk head movement.
      </div>
    );
  }
  if (positions.length === 0 && path.length > 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg my-4 text-center text-gray-500">
        Calculating positions...
      </div>
    );
  }

  const currentPos = positions[currentStep];
  const prevPos = currentStep > 0 ? positions[currentStep - 1] : null;

  return (
    <div className="p-4 sm:p-6 bg-linear-to-r from-cyan-200 via-blue-400 to-indigo-600 rounded-lg shadow-xl my-4 flex flex-col items-center space-y-6">
      <h3 className="text-xl sm:text-2xl font-bold text-center text-white">
        Disk Head Movement Visualization
      </h3>
      <div className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-inner bg-gray-50">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ backgroundColor: '#fff2e0' }}
        >
          <g className="ruler">
            <line x1={padding.x} y1={padding.y} x2={viewBoxWidth - padding.x} y2={padding.y} stroke="#6b7280" strokeWidth="2"/>
            {uniqueTracks.map((track) => {
              const posX = scaleX(track, maxTrack, viewBoxWidth, padding.x);
              return (
                <g key={`ruler-track-${track}`}>
                  <line x1={posX} y1={padding.y - 5} x2={posX} y2={padding.y + 5} stroke="#6b7280" strokeWidth="1.5"/>
                  <text x={posX} y={padding.y - 10} transform={`rotate(-90, ${posX}, ${padding.y - 10})`} textAnchor="start" fontSize="11" fill="#F97316" fontWeight="600" fontFamily="sans-serif">
                    {track}
                  </text>
                </g>
              );
            })}
          </g>
          <g className="movement-path">
            {positions.slice(1, currentStep).map((pos, i) => {
              const prev = positions[i];
              return <line key={`line-static-${i}`} x1={prev.x} y1={prev.y} x2={pos.x} y2={pos.y} stroke="#a0aec0" strokeWidth="2" opacity="0.7"/>;
            })}
            {prevPos && currentPos && (
                <motion.line key={`line-anim-${currentStep}`} x1={prevPos.x} y1={prevPos.y} initial={{ x2: prevPos.x, y2: prevPos.y }} animate={{ x2: currentPos.x, y2: currentPos.y }} transition={{ type: 'spring', stiffness: 150, damping: 20, duration: 0.5 }} stroke="#374151" strokeWidth="2.5" strokeLinecap="round"/>
            )}
          </g>
           <g className="visited-dots">
             <AnimatePresence>
               {positions.slice(0, currentStep).map((pos, i) => (
                 <motion.g key={`dot-group-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                     <circle cx={pos.x} cy={pos.y} r="5" fill="#4b5563"/>
                     <text x={pos.x + 10} y={pos.y + 4} fontSize="12" fill="#4b5563" fontFamily="sans-serif"> {path[i]} </text>
                 </motion.g>
               ))}
             </AnimatePresence>
           </g>
           {currentPos && (
             <motion.g className="moving-head">
               <motion.circle key={`head-${currentStep}`} initial={false} animate={{ cx: currentPos.x, cy: currentPos.y }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} r="9" fill="#F97316" stroke="#1f2937" strokeWidth="2" style={{ cursor: 'pointer' }}/>
               <motion.text key={`head-label-${currentStep}`} initial={{ opacity: 0, y: 5 }} animate={{ x: currentPos.x + 15, y: currentPos.y + 5, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }} fontSize="14" fill="#F97316" fontWeight="bold" fontFamily="sans-serif">
                 {currentPos.track}
               </motion.text>
             </motion.g>
           )}
        </svg>
      </div>
      <div className="w-full max-w-xl text-center bg-gray-100 p-3 rounded-md shadow-sm">
        <p className="font-semibold text-lg my-1">
          Current Track: <span className="text-orange-600 font-bold">{currentPos?.track ?? 'N/A'}</span>
        </p>
        {currentStep > 0 && prevPos && currentPos && (
          <p className="text-gray-700">
            Moved from {prevPos.track} ➔ {currentPos.track}{' '}
            <span className="font-medium">
              (Seek Distance: {Math.abs(currentPos.track - prevPos.track)})
            </span>
          </p>
        )}
         {currentStep === 0 && path.length > 0 && (
            <p className="text-gray-600 italic">Starting at track {path[0]}.</p>
        )}
      </div>
      <Controls
        currentStep={currentStep}
        totalSteps={path.length}
        onStepChange={onStepChange}
        seekCount={seekCount}
      />

    </div>
  );
};

export default DiskVisualizer;