import { useState, useEffect } from "react";
import ProcessForm from "./ProcessForm.jsx";
import SRJF from "./SRJF.jsx";
import FCFS from "./FCFS.jsx";
import RR from "./RR.jsx";
import PriorityNonPreemptive from "./PriorityNonPreemptive.jsx";
import PriorityScheduling from "./PriorityScheduling.jsx";
import ProcessDetails from "./ProcessDetails.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SJF from "./SJF.jsx";

const Scheduler = () => {

  const [algorithm, setAlgorithm] = useState("");
  const [processes, setProcesses] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", true);
  }, []);

  const addProcess = (process) => {
    setProcesses([...processes, process]);
  };
  
  // Descriptions for each algorithm
  const algorithmAbout = {
  FCFS: (
    <>
      <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">
        About First Come First Serve (FCFS)
      </h3>
      <div className="prose prose-invert max-w-none">
        <p>
          First Come First Serve (FCFS) is the simplest CPU scheduling algorithm.
          It schedules processes strictly in the order of their arrival in the ready queue.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Non-preemptive: Once a process starts executing, it runs until completion.</li>
          <li>Easy to understand and implement.</li>
          <li>Can result in poor performance if short processes wait behind long ones (convoy effect).</li>
        </ul>
      </div>
    </>
  ),

  SJF: (
    <>
      <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">
        About Shortest Job First (SJF)
      </h3>
      <div className="prose prose-invert max-w-none">
        <p>
          Shortest Job First (SJF) is a non-preemptive scheduling algorithm that selects the process with the
          shortest CPU burst time from the ready queue.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Minimizes average waiting time and turnaround time.</li>
          <li>Non-preemptive: Once a process starts, it cannot be interrupted.</li>
          <li>Can cause starvation for longer processes if short processes keep arriving.</li>
        </ul>
      </div>
    </>
  ),

  SRTF: (
    <>
      <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">
        About Shortest Remaining Time First (SRTF)
      </h3>
      <div className="prose prose-invert max-w-none">
        <p>
          Shortest Remaining Time First (SRTF) is the preemptive version of SJF.
          The CPU always executes the process with the least remaining burst time.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>If a new process arrives with a shorter remaining time, it preempts the current process.</li>
          <li>Provides optimal average waiting time but is complex to implement.</li>
          <li>High risk of starvation for longer processes.</li>
        </ul>
      </div>
    </>
  ),

  RR: (
    <>
      <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">
        About Round Robin (RR)
      </h3>
      <div className="prose prose-invert max-w-none">
        <p>
          Round Robin (RR) scheduling assigns each process a fixed time slice (quantum)
          and cycles through them in a circular queue.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Preemptive: A process is interrupted if it doesn't finish within its time quantum.</li>
          <li>Fair and responsive; suitable for time-sharing and interactive systems.</li>
          <li>Performance depends heavily on the choice of time quantum.</li>
        </ul>
      </div>
    </>
  ),

  "Priority (Non-Preemptive)": (
    <>
      <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">
        About Priority Scheduling (Non-Preemptive)
      </h3>
      <div className="prose prose-invert max-w-none">
        <p>
          In non-preemptive priority scheduling, each process is assigned a priority value.
          The CPU selects the highest priority process (lowest number) from the ready queue.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Non-preemptive: A running process cannot be interrupted.</li>
          <li>If two processes have the same priority, FCFS order is followed.</li>
          <li>Simple to implement but may lead to starvation of low-priority processes.</li>
          
        </ul>
        <p className="mt-3">
          <strong>Note: Lower the priority value means higher the priority</strong>
        </p>
      </div>
    </>
  ),

  "Priority (Preemptive)": (
    <>
      <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">
        About Priority Scheduling (Preemptive)
      </h3>
      <div className="prose prose-invert max-w-none">
        <p>
          In preemptive priority scheduling, processes are selected based on priority. If a new process
          with a higher priority arrives, it preempts the currently running process.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Improves responsiveness for high-priority tasks.</li>
          <li>More dynamic and responsive than the non-preemptive version.</li>
          <li>Risk of starvation for lower-priority processes, which can be mitigated using aging.</li>
        </ul>
        <p className="mt-3">
          <strong>Note: Lower the priority value means higher the priority</strong>
        </p>
      </div>
    </>
  ),
};




  return (
    <div className="flex flex-col items-center min-h-screen bg-orange-200/70   text-white transition-all p-6">
      <ToastContainer />
      
      {/* Title */}
      <div className="w-full max-w-6xl text-center text-black py-8 mb-6 border-b border-gray-700 font-poppins">
        <h1 className="text-6xl font-bold">CPU SCHEDULING SIMULATOR</h1>
        <p className="text-black mt-3 mb-3 text-lg">
          Visualize different CPU scheduling algorithms
        </p>
      </div>

      {/* Algorithm Selection */}
      <div className="flex flex-col items-center text-center mb-10">
        <label className="text-2xl font-medium font-serif mb-4 text-black">Select Algorithm:</label>
        <select
          className="border p-3 rounded bg-cyan-300 text-slate-600 text-center"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option value="" disabled>Select an algorithm</option>
          <option value="FCFS">First Come First Serve (FCFS)</option>
          <option value="SJF">Shortest Job First (SJF)</option>
          <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
          <option value="RR">Round Robin (RR)</option>
          <option value="Priority (Non-Preemptive)">Priority Scheduling (Non-Preemptive)</option>
          <option value="Priority (Preemptive)">Priority Scheduling (Preemptive)</option>
          {/* <option value="MLQ">Multilevel Queue (MLQ)</option>
          <option value="MLFQ">Multilevel Feedback Queue (MLFQ)</option> */}
        </select>

        {/* Algorithm Description */}
        {algorithm && (
          <div className="mt-6 p-4 border border-white rounded-lg shadow-md bg-red-400/70 text-white">
            {algorithmAbout[algorithm]}
          </div>
        )}
        
      </div>
      

      {/* Process Management */}
      <div className="w-full mx-auto">
        {/* Flexbox Container: Form on Left, Process Details on Right */}
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          {/* Left: Process Form */}
          <div className="w-1/2">
            <ProcessForm processes={processes} addProcess={addProcess} algorithm={algorithm} />
          </div>

          {/* Right: Process Details */}
          <div className="w-full">
            <ProcessDetails processes={processes} setProcesses={setProcesses} />
          </div>
        </div>
      </div>
      <div className="w-full mx-10">
        {algorithm === "FCFS" && <FCFS processes={processes} />}
        {algorithm === "SJF" && <SJF processes={processes} />}
        {algorithm === "SRTF" && <SRJF processes={processes} />}
        {algorithm === "RR" && <RR processes={processes} />}
        {algorithm === "Priority (Non-Preemptive)" && <PriorityNonPreemptive processes={processes} />}
        {algorithm === "Priority (Preemptive)" && <PriorityScheduling processes={processes} />}
      </div>

    </div>
  );
};

export default Scheduler;