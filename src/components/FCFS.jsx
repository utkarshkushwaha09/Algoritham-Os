import { useState, useEffect } from "react";

const processColors = {
  P1: "#FF5733",
  P2: "#33FF57",
  P3: "#3357FF",
  P4: "#FF33A8",
  P5: "#33FFF9",
  // Add more process colors as needed
};

const FCFS = ({ processes }) => {
  const [pendingProcesses, setPendingProcesses] = useState([]);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [ganttChart, setGanttChart] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [comparingProcess, setComparingProcess] = useState(null);
  const [fadeOutProcess, setFadeOutProcess] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [animatingTimeJump, setAnimatingTimeJump] = useState(false);
  const [timeJumpTarget, setTimeJumpTarget] = useState(0);

  // Initialize simulation
  const startSimulation = () => {
    // No sorting - just use processes as they are
    setPendingProcesses([...processes]);
    setCompletedProcesses([]);
    setGanttChart([]);
    setCurrentProcess(null);
    setComparingProcess(null);
    setFadeOutProcess(null);
    setCurrentTime(0);
    setAnimatingTimeJump(false);
    setTimeJumpTarget(0);
    setIsSimulating(true);
  };

  // Calculate delay based on animation speed
  const getAnimationDelay = (baseDelay) => {
    return baseDelay / animationSpeed;
  };

  // Handle simulation steps
  useEffect(() => {
    if (!isSimulating || pendingProcesses.length === 0) return;
    
    const simulationStep = async () => {
      // Get processes that have arrived by the current time
      const arrivedProcesses = pendingProcesses;
      
      // Initialize minProcess with the first process
      let minProcess = arrivedProcesses[0];
      setCurrentProcess(minProcess);
      
      // Visual delay to show initial minimum process
      await new Promise(resolve => setTimeout(resolve, getAnimationDelay(500)));
      
      // Loop through all arrived processes to find the one with minimum arrival time
      for (let i = 1; i < arrivedProcesses.length; i++) {
        const processToCompare = arrivedProcesses[i];
        
        // Set the current process being compared in red
        setComparingProcess(processToCompare);
        
        // Visual delay to show comparison
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay(500)));
        
        // If this process has earlier arrival time, update minProcess
        if (parseInt(processToCompare.arrivalTime) < parseInt(minProcess.arrivalTime)) {
          minProcess = processToCompare;
          setCurrentProcess(minProcess);
          
          // Visual delay to show the new minimum
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
        }
      }
      
      // Clear comparison highlighting
      setComparingProcess(null);
      
      // Select the process with minimum arrival time
      const nextProcess = minProcess;
      
      // Process execution animation
      await new Promise(resolve => setTimeout(resolve, getAnimationDelay(500)));
      
      // Start fade-out animation
      setFadeOutProcess(nextProcess.name);
      
      // Calculate process timing
      const startTime = Math.max(currentTime, parseInt(minProcess.arrivalTime));
      const endTime = startTime + parseInt(minProcess.burstTime);
      
      // Add to Gantt chart with timing information
      const processWithTiming = {
        ...nextProcess,
        startTime,
        endTime
      };
      
      // Animate time jump if necessary
      if (startTime > currentTime) {
        // Show time jump animation
        setAnimatingTimeJump(true);
        setTimeJumpTarget(startTime);
        
        // Animate the time increment
        const incrementTime = async () => {
          for (let t = currentTime + 1; t <= startTime; t++) {
            setCurrentTime(t);
            await new Promise(resolve => setTimeout(resolve, getAnimationDelay(100)));
          }
          setAnimatingTimeJump(false);
        };
        
        await incrementTime();
      }
      
      // Animate process execution
      setAnimatingTimeJump(true);
      setTimeJumpTarget(endTime);
      
      const executeProcess = async () => {
        for (let t = startTime + 1; t <= endTime; t++) {
          setCurrentTime(t);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(100)));
        }
        setAnimatingTimeJump(false);
      };
      
      await executeProcess();
      
      // Update states
      setGanttChart(prev => [...prev, processWithTiming]);
      setCompletedProcesses(prev => [...prev, nextProcess]);
      setPendingProcesses(prev => prev.filter(p => p.name !== nextProcess.name));
      setCurrentProcess(null);
      setFadeOutProcess(null);
    };
    
    const timer = setTimeout(simulationStep, getAnimationDelay(500));
    return () => clearTimeout(timer);
  }, [pendingProcesses, currentTime, isSimulating, animationSpeed]);
  
  // Calculate metrics when simulation ends
  useEffect(() => {
      if (isSimulating && pendingProcesses.length === 0) {
        setIsSimulating(false);
      }
    }, [pendingProcesses, isSimulating]);
    
  // Generate instructions for Gantt chart drawing
  // This effect runs when ganttChart changes
  useEffect(() => {
    if (ganttChart.length === 0) {
      setInstructions([]);
      return;
    }

    const newInstr = [];
    newInstr.push(
      <span key="start">
         Sort all processes in order of their arrival time (First Come First Serve).
      </span>
    );

    ganttChart.forEach((p, i) => {
      const prevEnd = i === 0 ? 0 : ganttChart[i - 1].endTime;

      if (p.startTime > prevEnd) {
        newInstr.push(
          <span key={`idle-${i}`}>
             CPU is <strong className="text-yellow-300">idle</strong> from t={prevEnd} to t={p.startTime} due to no process being ready.
          </span>
        );
      }

      newInstr.push(
        <span key={`exec-${i}`}>
           Process <strong style={{ color: "green" }}>{p.name}</strong> is executed from t={p.startTime} to t={p.endTime} (Burst Time = {p.endTime - p.startTime}).
        </span>
      );
    });

    newInstr.push(
      <span key="end">
         Finally, draw the Gantt chart based on the above execution sequence.
      </span>
    );

    setInstructions(newInstr);
  }, [ganttChart]);



  return (
    // Instructions List
    <div className="flex ">
      {/* LEFT side – your existing Gantt JSX */}
      <div className="w-3/4 pr-4 mt-10 mb-10 flex flex-col items-center p-6 bg-sky-400/50 rounded-lg border border-white text-white min-w-[60vw] mx-auto">
        {/* …your <div className="w-full bg-black …"> code unchanged … */}
         <h2 className="text-2xl font-bold mb-6">FCFS Scheduling Visualization</h2>

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
              {isSimulating ? "Simulation in Progress..." : "Start FCFS Simulation"}
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
              <span className={`inline-block min-w-[3ch] text-center ${animatingTimeJump ? "animate-pulse text-white-300" : ""}`}>
                {currentTime}
              </span>
              {animatingTimeJump && (
                <span className="text-xs text-white-300 ml-2">
                  → {timeJumpTarget}
                </span>
              )}
            </div>
          </div>

          {/* Process Queue Visualization */}
          <div className="w-full flex flex-col gap-8 mb-8">
            {/* Pending Processes */}
            <div className="w-full bg-purple-400/50 p-4 rounded-lg border border-white">
              <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Pending Processes</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {pendingProcesses.map((p) => (
                  <div
                    key={p.name}
                    className={`p-4 rounded-lg border bg-yellow-200/50 text-center transition-all duration-500 w-32 ${
                      fadeOutProcess === p.name
                        ? "opacity-0 scale-75 transform translate-y-4"
                        : currentProcess && currentProcess.name === p.name
                          ? "scale-110 border-yellow-500 border-2 bg-yellow-300  text-black bg-opacity-30"
                          : comparingProcess && comparingProcess.name === p.name
                            ? "scale-105 border-red-500 border-2 bg-yellow-300  text-black bg-opacity-30"
                            : "border-white"
                    }`}
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
                {pendingProcesses.length === 0 && !isSimulating && (
                  <p className="text-white-400 italic">No pending processes</p>
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
                    className="p-4 rounded-lg border border-white text-center w-32 bg-lime-300 text-black"
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
      </div>

      {/* RIGHT side – instruction list */}
      {/* wrapper lives in a two-column layout */}
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

export default FCFS;