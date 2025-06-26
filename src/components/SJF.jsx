import { useState, useEffect } from "react";

const processColors = {
  P1: "#FF5733",
  P2: "#33FF57",
  P3: "#3357FF",
  P4: "#FF33A8",
  P5: "#33FFF9",
  // Add more process colors as needed
};

const SJF = ({ processes }) => {
  const [pendingProcesses, setPendingProcesses] = useState([]);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [ganttChart, setGanttChart] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [comparingProcess, setComparingProcess] = useState(null);
  const [fadeOutProcess, setFadeOutProcess] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [arrivedQueue, setArrivedQueue] = useState([]);
  const [animatingTimeJump, setAnimatingTimeJump] = useState(false);
  const [timeJumpTarget, setTimeJumpTarget] = useState(null);
  const [highlightNewArrivals, setHighlightNewArrivals] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1); // 1 = normal, 0.5 = slow, 2 = fast

  // Initialize simulation
  const startSimulation = () => {
    // Initialize with processes sorted by arrival time
    const sortedByArrival = [...processes].sort((a, b) => 
      parseInt(a.arrivalTime) - parseInt(b.arrivalTime)
    );
    
    setPendingProcesses(sortedByArrival);
    setArrivedQueue([]);
    setCompletedProcesses([]);
    setGanttChart([]);
    setCurrentProcess(null);
    setComparingProcess(null);
    setFadeOutProcess(null);
    setCurrentTime(0);
    setAnimatingTimeJump(false);
    setTimeJumpTarget(null);
    setHighlightNewArrivals([]);
    setIsSimulating(true);
  };

  // Smoothly animate time changes
  useEffect(() => {
    if (!timeJumpTarget || !animatingTimeJump) return;
  
    const startTime = currentTime;
    const endTime = timeJumpTarget;
    const duration = 1000 / animationSpeed; // Animation duration based on speed
    const startTimestamp = performance.now();
  
    const animateTimeChange = (timestamp) => {
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
  
      // Apply cubic ease-out for smoother animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const newTime = Math.floor(startTime + (endTime - startTime) * easedProgress);
  
      if (newTime !== currentTime) {
        setCurrentTime(newTime);
      }
  
      if (progress < 1) {
        requestAnimationFrame(animateTimeChange);
      } else {
        setCurrentTime(endTime);
        setAnimatingTimeJump(false);
        setTimeJumpTarget(null);
      }
    };
  
    requestAnimationFrame(animateTimeChange);
  }, [timeJumpTarget, animatingTimeJump, animationSpeed]);
  

  // Update arrived queue based on current time
  useEffect(() => {
    if (!isSimulating || animatingTimeJump) return;
    
    // Move processes from pending to arrived queue if they've arrived by current time
    const newlyArrived = pendingProcesses.filter(
      p => parseInt(p.arrivalTime) <= currentTime
    );
    
    if (newlyArrived.length > 0) {
      setPendingProcesses(prev => 
        prev.filter(p => parseInt(p.arrivalTime) > currentTime)
      );
      
      // Highlight newly arrived processes
      setHighlightNewArrivals(newlyArrived.map(p => p.name));
      
      // Clear highlighting after animation
      setTimeout(() => {
        setHighlightNewArrivals([]);
      }, 1500 / animationSpeed);
      
      setArrivedQueue(prev => [...prev, ...newlyArrived]);
    }
  }, [currentTime, pendingProcesses, isSimulating, animatingTimeJump, animationSpeed]);

  // Handle simulation steps
  useEffect(() => {
    if (!isSimulating || animatingTimeJump || (pendingProcesses.length === 0 && arrivedQueue.length === 0 && !currentProcess)) {
      if (isSimulating && pendingProcesses.length === 0 && arrivedQueue.length === 0 && !currentProcess) {
        setIsSimulating(false);
      }
      return;
    }
    
    const simulationStep = async () => {
      // If no process is currently being executed and there are processes in the arrived queue
      if (!currentProcess && arrivedQueue.length > 0) {
        // Find process with shortest burst time in the arrived queue
        let nextProcess = await findShortestJob();
        
        // Process execution animation
        await new Promise(resolve => setTimeout(resolve, 500 / animationSpeed));
        
        // Start fade-out animation
        setFadeOutProcess(nextProcess.name);
        
        // Calculate process timing
        const startTime = currentTime;
        const endTime = startTime + parseInt(nextProcess.burstTime);
        
        // Add to Gantt chart with timing information
        const processWithTiming = {
          ...nextProcess,
          startTime,
          endTime
        };
        
        await new Promise(resolve => setTimeout(resolve, 800 / animationSpeed));
        
        // Update states
        setGanttChart(prev => [...prev, processWithTiming]);
        setCompletedProcesses(prev => [...prev, nextProcess]);
        setArrivedQueue(prev => prev.filter(p => p.name !== nextProcess.name));
        setCurrentProcess(null);
        setFadeOutProcess(null);
        
        // Animate time change to process completion
        setAnimatingTimeJump(true);
        setTimeJumpTarget(endTime);
      } else if (pendingProcesses.length > 0 && arrivedQueue.length === 0) {
        // If no processes have arrived yet, jump to the arrival time of the earliest process
        const earliestArrival = Math.min(...pendingProcesses.map(p => parseInt(p.arrivalTime)));
        
        // Animate time jump
        setAnimatingTimeJump(true);
        setTimeJumpTarget(earliestArrival);
      }
    };
    
    // Helper function to visualize finding the shortest job
    const findShortestJob = async () => {
      // Initialize with the first arrived process
      let shortestProcess = arrivedQueue[0];
      setCurrentProcess(shortestProcess);
      
      // Visual delay to show initial selected process
      await new Promise(resolve => setTimeout(resolve, 500 / animationSpeed));
      
      // Loop through all arrived processes to find the one with minimum burst time
      for (let i = 1; i < arrivedQueue.length; i++) {
        const processToCompare = arrivedQueue[i];
        
        // Set the current process being compared
        setComparingProcess(processToCompare);
        
        // Visual delay to show comparison
        await new Promise(resolve => setTimeout(resolve, 500 / animationSpeed));
        
        // If this process has shorter burst time, update shortestProcess
        if (parseInt(processToCompare.burstTime) < parseInt(shortestProcess.burstTime)) {
          shortestProcess = processToCompare;
          setCurrentProcess(shortestProcess);
          
          // Visual delay to show the new shortest
          await new Promise(resolve => setTimeout(resolve, 300 / animationSpeed));
        }
      }
      
      // Clear comparison highlighting
      setComparingProcess(null);
      
      return shortestProcess;
    };
    
    const timer = setTimeout(simulationStep, 500 / animationSpeed);
    return () => clearTimeout(timer);
  }, [pendingProcesses, arrivedQueue, currentProcess, currentTime, isSimulating, animatingTimeJump, animationSpeed]);

  useEffect(() => {
    if (ganttChart.length === 0) {
      setInstructions([]);
      return;
    }

    const newInstr = [];

    newInstr.push(
      <span key="start">
        Sort all processes by <strong>arrival time</strong>. Then, at each moment, choose the process with the <strong>shortest burst time</strong> among the ones that have arrived.
      </span>
    );

    ganttChart.forEach((p, i) => {
      const prevEnd = i === 0 ? 0 : ganttChart[i - 1].endTime;

      if (p.startTime > prevEnd) {
        newInstr.push(
          <span key={`idle-${i}`}>
            CPU is <strong className="text-yellow-300">idle</strong> from t={prevEnd} to t={p.startTime} because no process was available to execute.
          </span>
        );
      }

      newInstr.push(
        <span key={`exec-${i}`}>
          Process <strong style={{ color: "green" }}>{p.name}</strong> is selected (shortest burst among arrived) and executed from t={p.startTime} to t={p.endTime} (Burst Time = {p.endTime - p.startTime}).
        </span>
      );
    });

    newInstr.push(
      <span key="end">
        Finally, construct the Gantt chart based on the above execution order.
      </span>
    );

    setInstructions(newInstr);
  }, [ganttChart]);

  return (
    <div className="flex">

      {/* Left: Simulation Visualization */}
      <div className="w-3/4 pr-4 mt-10 mb-10 flex flex-col items-center p-6 bg-sky-400/50 rounded-lg border border-white text-white min-w-[60vw] mx-auto">
        {/* <div className="flex flex-col items-center p-6 bg-black rounded-lg border border-white text-white min-w-[80vw] mx-auto"> */}
          <h2 className="text-2xl font-bold mb-6">SJF Scheduling Visualization</h2>

          <div className="w-full flex justify-between items-center mb-8">
            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className={`px-6 py-3 rounded-lg border border-white font-bold transition-all duration-300 ${
                isSimulating 
                  ? "bg-lime-400/50 text-white cursor-not-allowed" 
                  : "bg-red-400 text-white hover:bg-red-300"
              }`}
            >
              {isSimulating ? "Simulation in Progress..." : "Start SJF Simulation"}
            </button>
            
            {/* Animation Speed Control */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">Animation Speed:</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setAnimationSpeed(0.5)} 
                  className={`px-3 py-1 rounded border transition-all duration-300 ${
                    animationSpeed === 0.5 ? "bg-purple-400/50 text-white" : "bg-white text-black"
                  }`}
                  disabled={isSimulating && !animatingTimeJump}
                >
                  0.5x
                </button>
                <button 
                  onClick={() => setAnimationSpeed(1)} 
                  className={`px-3 py-1 rounded border transition-all duration-300 ${
                    animationSpeed === 1 ? "bg-purple-400/50 text-white" : "bg-white text-black"
                  }`}
                  disabled={isSimulating && !animatingTimeJump}
                >
                  1x
                </button>
                <button 
                  onClick={() => setAnimationSpeed(2)} 
                  className={`px-3 py-1 rounded border transition-all duration-300 ${
                    animationSpeed === 2 ? "bg-purple-400/50 text-white" : "bg-white text-black"
                  }`}
                  disabled={isSimulating && !animatingTimeJump}
                >
                  2x
                </button>
              </div>
            </div>
          </div>

          {/* Current Time Display */}
          <div className="w-full mb-6 text-center">
            <div className="inline-block px-4 py-2 bg-purple-400/50 text-white rounded-lg border border-white overflow-hidden relative">
              <span className="font-semibold">Current Time:</span> 
              <span className={`inline-block min-w-[3ch] text-center ${animatingTimeJump ? "animate-pulse text-white" : ""}`}>
                {currentTime}
              </span>
              {animatingTimeJump && (
                <span className="text-xs text-white ml-2">
                  → {timeJumpTarget}
                </span>
              )}
            </div>
          </div>

          {/* Process Queue Visualization */}
          <div className="w-full flex flex-col gap-8 mb-8">
            {/* Not Yet Arrived Processes */}
            <div className="w-full bg-purple-400/50 p-4 rounded-lg border border-white">
              <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Not Yet Arrived</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {pendingProcesses.map((p) => (
                  <div
                    key={p.name}
                    className="p-4 rounded-lg  bg-yellow-300 border border-white text-center w-32 transition-all duration-500"
                    style={{
                      borderLeft: `5px solid ${processColors[p.name] || "#3498db"}`
                    }}
                  >
                    <p className="font-bold text-lg">{p.name}</p>
                    <div className="grid grid-cols-2 gap-1 mt-2 text-sm">
                      <p className="bg-sky-500 text-white rounded p-1">Arrival: {p.arrivalTime}</p>
                      <p className="bg-sky-500 text-white rounded p-1">Burst: {p.burstTime}</p>
                    </div>
                  </div>
                ))}
                {pendingProcesses.length === 0 && (
                  <p className="text-white-400 italic">All processes have arrived</p>
                )}
              </div>
            </div>

            {/* Ready Queue (Arrived Processes) */}
            <div className="w-full bg-purple-400/50 p-4 rounded-lg border border-white">
              <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Ready Queue (Sorting by Burst Time)</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {arrivedQueue.map((p) => (
                  <div
                    key={p.name}
                    className={`p-4 rounded-lg  bg-orange-300 border text-center transition-all duration-500 w-32 ${
                      fadeOutProcess === p.name
                        ? "opacity-0 scale-75 transform translate-y-4"
                        : currentProcess && currentProcess.name === p.name
                          ? "scale-110 border-yellow-500 border-2 bg-amber-500/[70.9%]  text-black bg-opacity-30"
                          : comparingProcess && comparingProcess.name === p.name
                            ? "scale-105 border-red-500 border-2 bg-orange-300  text-black bg-opacity-30"
                            : highlightNewArrivals.includes(p.name)
                              ? "scale-110 border-green-500 border-2 animate-pulse"
                              : "border-white"
                    }`}
                    style={{
                      borderLeft: `5px solid ${processColors[p.name] || "#3498db"}`,
                      transition: highlightNewArrivals.includes(p.name) 
                        ? "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" 
                        : "all 0.3s ease-in-out"
                    }}
                  >
                    <p className="font-bold text-lg">{p.name}</p>
                    <div className="grid grid-cols-2 gap-1 mt-2 text-sm">
                      <p className="bg-sky-500 text-white rounded p-1">Arrival: {p.arrivalTime}</p>
                      <p className="bg-sky-500 text-white rounded p-1">Burst: {p.burstTime}</p>
                    </div>
                  </div>
                ))}
                {arrivedQueue.length === 0 && (
                  <p className="text-gray-400 italic">No processes in ready queue</p>
                )}
              </div>
            </div>

            {/* Completed Processes */}
            <div className="w-full bg-purple-400/50 p-4 rounded-lg border border-white">
              <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Completed Processes</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {completedProcesses.map((p) => (
                  <div
                    key={p.name}
                    className="p-4 rounded-lg border border-white text-center w-32 animate-fadeIn bg-lime-300 text-black transition-all duration-500"
                    style={{ 
                      borderLeftColor: processColors[p.name] || "#3498db",
                      borderLeftWidth: "5px"
                    }}
                  >
                    <p className="font-bold text-lg">{p.name}</p>
                    <p className="text-sm mt-1">Completed</p>
                  </div>
                ))}
                {completedProcesses.length === 0 && (
                  <p className="text-gray-400 italic">No completed processes</p>
                )}
              </div>
            </div>
          </div>

          {/* Gantt Chart */}
          <div className="w-full bg-purple-400/50 p-4 rounded-lg border border-white">
            <h3 className="text-lg font-semibold mb-4 border-b border-white pb-2">Gantt Chart</h3>
            
            {ganttChart.length > 0 ? (
              <div className="relative">
                {/* Time Axis */}
                <div className="absolute left-0 right-0 bottom-0 h-8 border-t border-white"></div>
                
                {/* Process Blocks */}
                <div className="flex h-20 mb-12 relative">
                  {ganttChart.map((p, index) => {
                    // Calculate previous process end time
                    const prevEndTime = index > 0 ? ganttChart[index - 1].endTime : 0;
                    
                    // Calculate idle time gap if any
                    const idleTime = p.startTime - prevEndTime;
                    
                    // Calculate total timeline length for scaling
                    const totalTime = ganttChart[ganttChart.length - 1].endTime;
                    
                    // Calculate widths as percentages of total time
                    const idleWidth = (idleTime / totalTime) * 100;
                    const processWidth = ((p.endTime - p.startTime) / totalTime) * 100;
                    
                    return (
                      <div key={p.name} className="flex h-full group">
                        {/* Idle time block */}
                        {idleTime > 0 && (
                          <div 
                            className="h-full flex items-center justify-center bg-purple-400/30 border-r border-white"
                            style={{ 
                              width: `${idleWidth}%`,
                              minWidth: idleTime > 0 ? '30px' : '0'
                            }}
                          >
                            <span className="text-white-300 text-xs font-medium">Idle</span>
                          </div>
                        )}
                        
                        {/* Process block with gap */}
                        <div className="relative h-full px-1">
                          {/* Process box */}
                          <div
                            className="h-4/5 mt-2 flex items-center justify-center bg-yellow-300 text-black font-bold rounded-md shadow-md transition-all duration-300 hover:h-full hover:mt-0 hover:scale-105"
                            style={{
                              width: `${processWidth}%`,
                              // backgroundColor: processColors[p.name] || "#3498db",
                              minWidth: '50px'
                            }}
                          >
                            <div className="flex flex-col items-center text-black">
                              <span className="text-sm font-bold">{p.name}</span>
                              <span className="text-xs ">{p.endTime - p.startTime}u</span>
                            </div>
                          </div>
                          
                          {/* Vertical timeline connector */}
                          <div className="absolute left-1/2 -bottom-8 w-px h-8 bg-white transform -translate-x-1/2"></div>
                          
                          {/* Time labels with improved positioning */}
                          <div className="absolute left-0 -bottom-8 text-xs font-medium bg-purple-700 px-2 py-1 rounded-md transform -translate-x-1/2">
                            {p.startTime}
                          </div>
                          
                          {index === ganttChart.length - 1 && (
                            <div className="absolute right-0 -bottom-8 text-xs font-medium bg-purple-700 px-2 py-1 rounded-md transform translate-x-1/2">
                              {p.endTime}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Timeline base */}
                  <div className="absolute left-0 right-0 -bottom-8 h-px bg-white"></div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic text-center py-8">Gantt chart will appear here after simulation starts</p>
            )}
          </div>

          {/* Metrics Table (when simulation completes) */}
          {completedProcesses.length > 0 && completedProcesses.length === processes.length && (
            <div className="w-full bg-purple-400/50 p-4 rounded-lg border border-white mt-8">
              <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Performance Metrics</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-rose-400/50 text-white">
                  <thead>
                    <tr className="">
                      <th className="py-2 px-4 border border-white">Process</th>
                      <th className="py-2 px-4 border border-white">Arrival Time</th>
                      <th className="py-2 px-4 border border-white">Burst Time</th>
                      <th className="py-2 px-4 border border-white">Start Time</th>
                      <th className="py-2 px-4 border border-white">Completion Time</th>
                      <th className="py-2 px-4 border border-white">Turnaround Time</th>
                      <th className="py-2 px-4 border border-white">Waiting Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ganttChart.map(p => {
                      const turnaroundTime = p.endTime - parseInt(p.arrivalTime);
                      const waitingTime = p.startTime - parseInt(p.arrivalTime);
                      
                      return (
                        <tr key={p.name}>
                          <td className="py-2 px-4 border border-white font-medium ">{p.name}</td>
                          <td className="py-2 px-4 border border-white text-center">{p.arrivalTime}</td>
                          <td className="py-2 px-4 border border-white text-center">{p.burstTime}</td>
                          <td className="py-2 px-4 border border-white text-center">{p.startTime}</td>
                          <td className="py-2 px-4 border border-white text-center">{p.endTime}</td>
                          <td className="py-2 px-4 border border-white text-center">{turnaroundTime}</td>
                          <td className="py-2 px-4 border border-white text-center">{waitingTime}</td>
                        </tr>
                      );
                    })}
                    
                    {/* Average metrics row */}
                    {/* {ganttChart.length > 0 && (
                      <tr className="bg-gray-900 font-semibold">
                        <td className="py-2 px-4 border border-white text-right" colSpan="5">Average</td>
                        <td className="py-2 px-4 border border-white text-center">
                          {(ganttChart.reduce((sum, p) => sum + (p.endTime - parseInt(p.arrivalTime)), 0) / ganttChart.length).toFixed(2)}
                        </td>
                        <td className="py-2 px-4 border border-white text-center">
                          {(ganttChart.reduce((sum, p) => sum + (p.startTime - parseInt(p.arrivalTime)), 0) / ganttChart.length).toFixed(2)}
                        </td>
                      </tr>
                    )} */}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <p>Average turn around time : {(ganttChart.reduce((sum, p) => sum + (p.endTime - parseInt(p.arrivalTime)), 0) / ganttChart.length).toFixed(2)}</p>
                <p>Average waiting time : {(ganttChart.reduce((sum, p) => sum + (p.startTime - parseInt(p.arrivalTime)), 0) / ganttChart.length).toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Add CSS animations to <style> */}
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .animate-fadeIn {
              animation: fadeIn 0.5s ease-out forwards;
            }
            
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.6; }
              100% { opacity: 1; }
            }
            
            .animate-pulse {
              animation: pulse 1s infinite;
            }
          `}</style>
        {/* </div> */}
      </div>
      
      {/* Right: Process Details */}
      <div className="w-1/4 min-w-[30vw] pr-4 ml-5 my-10">
        {/* sticky rail */}
        <div className="
            sticky top-4        /* stays 16 px from top while scrolling */
            border border-white rounded-lg
            bg-sky-400/50 text-white
            p-6 h-[80vh]      /* gives it a tall box   */
            /*flex flex-col justify-center items-center*/
            
            overflow-y-auto    /* scrolls if content overflows */
          ">
          
          <h2 className="text-lg font-semibold mb-4 text-center">STEP-BY-STEP INSTRUCTION</h2>

          <ol className="space-y-2 list-decimal list-inside text-sm font-medium text-lg">
            {instructions.map((txt, idx) => (
              <li key={idx} className="leading-snug text-lg">
                {txt}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SJF;