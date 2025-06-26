import { useState, useEffect } from "react";

const processColors = {
  P1: "#FF5733",
  P2: "#33FF57",
  P3: "#3357FF",
  P4: "#FF33A8",
  P5: "#33FFF9",
};

const SRJF = ({ processes }) => {
  const [pendingProcesses, setPendingProcesses] = useState([]);
  const [activeProcesses, setActiveProcesses] = useState([]);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [comparingProcess, setComparingProcess] = useState(null);
  const [ganttChart, setGanttChart] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [animatingTimeJump, setAnimatingTimeJump] = useState(false);
  const [timeJumpTarget, setTimeJumpTarget] = useState(0);
  const [preemption, setPreemption] = useState(null);

  // Initialize simulation
  const startSimulation = () => {
    console.log("Starting simulation...");

    // Create a deep copy of processes with remaining time
    const processesWithRemaining = processes.map((p, index) => {
      const newProcess = {
        ...p,
        remainingTime: parseInt(p.burstTime),
        originalBurstTime: parseInt(p.burstTime),
        id: `${p.name}-${index}` // Add a unique ID to each process
      };
      console.log(`Process ${index}:`, newProcess);
      return newProcess;
    });

    console.log("Initial pending processes:", processesWithRemaining);

    setPendingProcesses(processesWithRemaining);
    setActiveProcesses([]);
    setCompletedProcesses([]);
    setGanttChart([]);
    setCurrentProcess(null);
    setComparingProcess(null);
    setCurrentTime(0);
    setPreemption(null);
    setAnimatingTimeJump(false);
    setTimeJumpTarget(0);
    setIsSimulating(true);

    console.log("State variables reset.");
    console.log("Simulation started.");
  };

  // Calculate delay based on animation speed
  const getAnimationDelay = (baseDelay) => {
    if (animationSpeed === 0) {
      console.warn("Warning: animationSpeed is 0, preventing division by zero.");
      return Infinity; // Handle division by zero gracefully
    }

    const calculatedDelay = baseDelay / animationSpeed;
    return calculatedDelay;
  };

  // Main simulation logic
  useEffect(() => {
    if (!isSimulating) return;

    console.log(`--- Simulation Step at time ${currentTime} ---`);
    console.log("Pending Processes:", pendingProcesses);
    console.log("Active Processes:", activeProcesses);

    // Simulation termination condition
    if (pendingProcesses.length === 0 && activeProcesses.length === 0) {
      console.log("No pending or active processes left. Stopping simulation.");
      setIsSimulating(false);
      return;
    }

    const simulationStep = async () => {
      console.log(`Checking newly arrived processes at time ${currentTime}...`);

      // Step 1: Move arrived processes from pending to active
      const newlyArrived = pendingProcesses.filter(p => parseInt(p.arrivalTime) <= currentTime);
      
      if (newlyArrived.length > 0) {
        console.log("Newly arrived processes:", newlyArrived);
        // Fix: Make sure we're not adding duplicate processes
        setPendingProcesses(prev => prev.filter(p => parseInt(p.arrivalTime) > currentTime));
        
        // Add only processes that don't already exist in active processes
        const existingIds = activeProcesses.map(p => p.id);
        const uniqueNewProcesses = newlyArrived.filter(p => !existingIds.includes(p.id));
        
        if (uniqueNewProcesses.length > 0) {
          setActiveProcesses(prev => [...prev, ...uniqueNewProcesses]);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
        }
      }

      // Step 2: Handle time jumps if no active process
      if (activeProcesses.length === 0 && pendingProcesses.length > 0) {
        const nextArrivalTime = Math.min(...pendingProcesses.map(p => parseInt(p.arrivalTime)));
        console.log(`No active processes. Jumping to time ${nextArrivalTime}`);

        setAnimatingTimeJump(true);
        setTimeJumpTarget(nextArrivalTime);

        for (let t = currentTime + 1; t <= nextArrivalTime; t++) {
          console.log(`Time increment: ${t}`);
          setCurrentTime(t);
        }

        setAnimatingTimeJump(false);
        return;
      }

      // Step 3: Select process with shortest remaining time
      console.log("Active processes:", activeProcesses);
      let shortestProcess = null;
      let shortestTime = Infinity;

      console.log("Selecting shortest remaining time process...");
      for (const process of activeProcesses) {
        console.log(`Comparing process ${process.name} with remaining time ${process.remainingTime}`);
        setComparingProcess(process);
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));

        if (process.remainingTime < shortestTime) {
          shortestProcess = process;
          shortestTime = process.remainingTime;
          setCurrentProcess(shortestProcess);
          console.log(`Selected process: ${shortestProcess.name}`);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(200)));
        }
      }

      setComparingProcess(null);

      // Step 4: Check for preemption
      const lastGanttItem = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1] : null;
      const isPreemption = lastGanttItem &&
        lastGanttItem.name !== shortestProcess.name &&
        !lastGanttItem.completed;

      if (isPreemption) {
        console.log(`Preempting process ${lastGanttItem.name} for ${shortestProcess.name}`);
        setPreemption(lastGanttItem.name);
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay(500)));
        setPreemption(null);

        setGanttChart(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            endTime: currentTime,
            completed: false
          };
          return updated;
        });
      }

      // Step 5: Create new Gantt chart entry
      if(ganttChart.length>0 && ganttChart[ganttChart.length-1].name === shortestProcess.name){
        console.log("Process already in Gantt chart");
      }
      else{
      const newGanttItem = {
        name: shortestProcess.name,
        startTime: currentTime,
        endTime: null,
        completed: false,
        arrivalTime: shortestProcess.arrivalTime,
        burstTime: shortestProcess.originalBurstTime,
        remainingBefore: shortestProcess.remainingTime
      };
      setGanttChart(prev => [...prev, newGanttItem]);
      console.log(`Adding ${shortestProcess.name} to Gantt chart.`);
    }


      // Step 6: Execute process until completion or preemption
      let shouldContinue = true;
      let nextTime = currentTime;
      
      while (shouldContinue) {
        shouldContinue = false;
        nextTime++;
        console.log(`Executing process ${shortestProcess.name} at time ${nextTime}`);
        setCurrentTime(nextTime);
        setAnimatingTimeJump(true);
        setTimeJumpTarget(nextTime);
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
        setAnimatingTimeJump(false);

        // Update remaining time for current process
        const updatedActiveProcesses = activeProcesses.map(p =>
          p.id === shortestProcess.id
            ? { ...p, remainingTime: p.remainingTime - 1 }
            : p
        );

        // Get the updated process
        // Fix: Use id to find the process instead of name
        const updatedProcess = updatedActiveProcesses.find(p => p.id === shortestProcess.id);

        // Check if process is complete
        if (updatedProcess.remainingTime === 0) {
          console.log(`Process ${updatedProcess.name} completed at time ${nextTime}`);
          setCompletedProcesses(prev => [...prev, { ...updatedProcess, remainingTime: 0 }]);
          // Fix: Use id to filter out the completed process
          setActiveProcesses(updatedActiveProcesses.filter(p => p.id !== updatedProcess.id));

          setGanttChart(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              endTime: nextTime,
              completed: true,
              remainingAfter: 0
            };
            return updated;
          });

          shouldContinue = false;
          break;
        } else {
          setActiveProcesses(updatedActiveProcesses);
        }

        // Check for new arrivals at this time
        const newArrivals = pendingProcesses.filter(p => parseInt(p.arrivalTime) === nextTime);

        if (newArrivals.length > 0) {
          console.log(`New process arrivals at ${nextTime}:`, newArrivals);
          setPendingProcesses(prev => prev.filter(p => parseInt(p.arrivalTime) > nextTime));
          
          // Add only processes that don't already exist in active processes
          const existingIds = activeProcesses.map(p => p.id);
          const uniqueNewProcesses = newArrivals.filter(p => !existingIds.includes(p.id));
          
          if (uniqueNewProcesses.length > 0) {
            setActiveProcesses(prev => [...prev, ...uniqueNewProcesses]);
          }

          // Preempt if needed
          const shortestNewArrival = newArrivals.reduce(
            (shortest, current) => parseInt(current.burstTime) < parseInt(shortest.burstTime) ? current : shortest,
            newArrivals[0]
          );

          if (parseInt(shortestNewArrival.burstTime) < updatedProcess.remainingTime) {
            console.log(`Preempting ${updatedProcess.name} for ${shortestNewArrival.name} at time ${nextTime}`);

            setGanttChart(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                endTime: nextTime,
                completed: false,
                remainingAfter: updatedProcess.remainingTime
              };
              return updated;
            });

            shouldContinue = false;
            break;
          }
        }

        // Check if any other process has shorter remaining time
        // Fix: Need to check all processes except the current one
        const shorterProcess = updatedActiveProcesses.find(p =>
          p.id !== shortestProcess.id && p.remainingTime < updatedProcess.remainingTime
        );

        if (shorterProcess) {
          console.log(`Preempting ${updatedProcess.name} for ${shorterProcess.name} at time ${nextTime}`);

          setGanttChart(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              endTime: nextTime,
              completed: false,
              remainingAfter: updatedProcess.remainingTime
            };
            return updated;
          });

          shouldContinue = false;
          break;
        }
      }

      console.log(`Ending execution cycle at time ${nextTime}`);
      setCurrentProcess(null);
    };

    const timer = setTimeout(simulationStep, getAnimationDelay(500));
    return () => clearTimeout(timer);
  }, [isSimulating, pendingProcesses, activeProcesses, currentTime, animationSpeed]);
  

  useEffect(() => {
    if (ganttChart.length === 0) {
      setInstructions([]);
      return;
    }

    const newInstr = [];

    // Initial explanation of SRTF
    newInstr.push(
      <span key="start">
        Sort all processes by <strong>arrival time</strong>. At every unit of time, select the process with the <strong>shortest remaining time</strong> among those that have arrived. If a new process arrives with a shorter remaining time, <strong>preempt</strong> the current one.
      </span>
    );

    ganttChart.forEach((p, i) => {
  const prevEnd = i === 0 ? 0 : ganttChart[i - 1]?.endTime ?? 0;

  // Only push idle if times are valid
  if (
    typeof p.startTime === "number" &&
    typeof prevEnd === "number" &&
    p.startTime > prevEnd
  ) {
    newInstr.push(
      <span key={`idle-${i}`}>
        CPU is <strong className="text-yellow-300">idle</strong> from t={prevEnd} to t={p.startTime} because no process was available to execute.
      </span>
    );
  }

  // Handle missing or invalid times gracefully
  if (
    typeof p.startTime === "number" &&
    typeof p.endTime === "number" &&
    typeof p.name === "string"
  ) {
    newInstr.push(
      <span key={`exec-${i}`}>
        Process <strong style={{ color: "purple" }}>{p.name}</strong> is executed from t={p.startTime} to t={p.endTime}. Remaining Time during this slice:{" "}
        <strong>{p.endTime - p.startTime}</strong>.
        {i > 0 && p.name !== ganttChart[i - 1]?.name && (
          <> It <strong>preempts</strong> the previous process.</>
        )}
      </span>
    );
  }
});


    // Final note
    newInstr.push(
      <span key="end">
        Finally, construct the Gantt chart based on the above execution sequence, showing process switches due to preemption.
      </span>
    );

    setInstructions(newInstr);
  }, [ganttChart]);


  // Calculate process metrics
  const calculateMetrics = () => {
    const metrics = {};

    processes.forEach(proc => {
      const processName = proc.name;
      const arrivalTime = parseInt(proc.arrivalTime);

      // Find all gantt chart segments for this process
      const segments = ganttChart.filter(item => item.name === processName);

      if (segments.length === 0) return;

      // Find completion time (end time of the last segment)
      const completionTime = Math.max(...segments.map(s => s.endTime));

      // Calculate turnaround time
      const turnaroundTime = completionTime - arrivalTime;

      // Calculate waiting time (turnaround time - burst time)
      const burstTime = parseInt(proc.burstTime);
      const waitingTime = turnaroundTime - burstTime;

      // Calculate response time (start time of first segment - arrival time)
      const responseTime = segments[0].startTime - arrivalTime;

      metrics[processName] = {
        arrivalTime,
        burstTime,
        completionTime,
        turnaroundTime,
        waitingTime,
        responseTime
      };
    });

    return metrics;
  };

  const metrics = ganttChart.length > 0 ? calculateMetrics() : {};



  return (
    <div className="flex">
       
      <div className="w-3/4 pr-4 mt-10 mb-10 flex flex-col items-center p-6 bg-sky-400/50 rounded-lg border border-white text-white min-w-[60vw] mx-auto">
        {/* <div className="flex flex-col items-center p-6 bg-black rounded-lg border border-white text-white min-w-[80vw] mx-auto"> */}
          <h2 className="text-2xl font-bold mb-6">SRJF Scheduling Visualization</h2>

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
              {isSimulating ? "Simulation in Progress..." : "Start SRJF Simulation"}
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
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Pending Processes */}
            <div className="bg-purple-400/50 p-4 rounded-lg border border-white">
              <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2 ">Pending Processes</h3>
              <div className="flex flex-wrap gap-4 justify-center ">
                {pendingProcesses.map((p) => (
                  <div
                    key={p.name}
                    className="p-3 rounded-lg border border-white text-center w-28 bg-yellow-300"
                    style={{
                      borderLeft: `5px solid ${processColors[p.name] || "#3498db"}`
                    }}
                  >
                    <p className="font-bold text-lg">{p.name}</p>
                    <div className="grid grid-cols-1 gap-1 mt-2 text-xs">
                      <p className="bg-sky-500 text-white rounded p-1">Arrival: {p.arrivalTime}</p>
                      <p className="bg-sky-500 text-white rounded p-1">Burst: {p.burstTime}</p>
                    </div>
                  </div>
                ))}
                {pendingProcesses.length === 0 && (
                  <p className="text-white italic">No pending processes</p>
                )}
              </div>
            </div>

            {/* Active Processes */}
            <div className="bg-purple-400/50 p-4 rounded-lg border border-white">
              <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Active Processes</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {activeProcesses.map((p) => (
                  <div
                    key={p.name}
                    className={`p-3 rounded-lg border  bg-orange-300 text-center w-28 transition-all duration-300 ${
                      currentProcess && currentProcess.name === p.name
                        ? "scale-110 border-yellow-500 border-2 bg-orange-500 bg-opacity-30"
                        : comparingProcess && comparingProcess.name === p.name
                          ? "scale-105 border-red-500 border-2 bg-orange-400 bg-opacity-30"
                          : preemption === p.name
                            ? "scale-95 border-blue-500 border-2 bg-orange-400/70 bg-opacity-30"
                            : "border-white"
                    }`}
                    style={{
                      borderLeft: `5px solid ${processColors[p.name] || "#3498db"}`
                    }}
                  >
                    <p className="font-bold text-lg">{p.name}</p>
                    <div className="grid grid-cols-1 gap-1 mt-2 text-xs">
                      <p className="bg-sky-500 rounded p-1">Remaining: {p.remainingTime}</p>
                      <div className="bg-sky-500 rounded p-1 mt-1">
                        <div className="w-full bg-sky-500 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-sky-500 h-full"
                            style={{
                              width: `${(p.remainingTime / p.originalBurstTime) * 100}%`,
                              backgroundColor: processColors[p.name] || "yellow"
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {activeProcesses.length === 0 && (
                  <p className="text-white italic">No active processes</p>
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
          {Object.keys(metrics).length > 0 && completedProcesses.length === processes.length && (
            <div className="w-full bg-purple-400/50 p-4 rounded-lg border border-white">
              <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Performance Metrics</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-rose-400/50">
                  <thead>
                    <tr className="bg-rose-400/50">
                      <th className="py-2 px-4 border border-white">Process</th>
                      <th className="py-2 px-4 border border-white">Arrival Time</th>
                      <th className="py-2 px-4 border border-white">Burst Time</th>
                      <th className="py-2 px-4 border border-white">Completion Time</th>
                      <th className="py-2 px-4 border border-white">Turnaround Time</th>
                      <th className="py-2 px-4 border border-white">Waiting Time</th>
                      <th className="py-2 px-4 border border-white">Response Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics).map(([processName, data]) => (
                      <tr key={processName}>
                        <td className="py-2 px-4 border border-white font-medium" style={{color: processColors[processName] || "white"}}>{processName}</td>
                        <td className="py-2 px-4 border border-white text-center">{data.arrivalTime}</td>
                        <td className="py-2 px-4 border border-white text-center">{data.burstTime}</td>
                        <td className="py-2 px-4 border border-white text-center">{data.completionTime}</td>
                        <td className="py-2 px-4 border border-white text-center">{data.turnaroundTime}</td>
                        <td className="py-2 px-4 border border-white text-center">{data.waitingTime}</td>
                        <td className="py-2 px-4 border border-white text-center">{data.responseTime}</td>
                      </tr>
                    ))}
                    
                    {/* Average metrics row */}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-white">
                {Object.keys(metrics).length > 0 && (
                  <div className="space-y-2 p-4 rounded-xl shadow">
                    <p>
                      <span className="font-semibold">Average Turnaround Time:</span>{' '}
                      {(Object.values(metrics).reduce((sum, data) => sum + data.turnaroundTime, 0) / Object.keys(metrics).length).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold">Average Waiting Time:</span>{' '}
                      {(Object.values(metrics).reduce((sum, data) => sum + data.waitingTime, 0) / Object.keys(metrics).length).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold">Average Response Time:</span>{' '}
                      {(Object.values(metrics).reduce((sum, data) => sum + data.responseTime, 0) / Object.keys(metrics).length).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>


            </div>
          )}
        {/* </div> */}
      </div>
      
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

export default SRJF;