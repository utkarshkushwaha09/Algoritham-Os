import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProcessForm = ({ processes, addProcess, algorithm }) => {
  const [process, setProcess] = useState({
    name: "",
    burstTime: "",
    arrivalTime: "",
    priority: "",
    queueLevel: "",
    timeQuantum: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Ensure process name is unique & valid
    const trimmedName = process.name.trim();
    if (!trimmedName) {
      toast.error("Process name cannot be empty!", { position: "top-right", autoClose: 2000 });
      return;
    }
    if (processes.some((p) => p.name === trimmedName)) {
      toast.error("Process name must be unique!", { position: "top-right", autoClose: 2000 });
      return;
    }

    // Ensure numerical values are valid
    const burstTime = parseInt(process.burstTime);
    const arrivalTime = parseInt(process.arrivalTime);
    const priority = parseInt(process.priority);
    const queueLevel = parseInt(process.queueLevel);
    const timeQuantum = parseInt(process.timeQuantum);

    if (isNaN(burstTime) || burstTime <= 0 || isNaN(arrivalTime) || arrivalTime < 0) {
      toast.error("Please enter valid Burst Time and Arrival Time!", { position: "top-right", autoClose: 2000 });
      return;
    }

    if (["Priority (Preemptive)", "Priority (Non-Preemptive)"].includes(algorithm) && (isNaN(priority) || priority < 0)) {
      toast.error("Please enter a valid Priority!", { position: "top-right", autoClose: 2000 });
      return;
    }

    if (["MLQ", "MLFQ"].includes(algorithm) && (isNaN(queueLevel) || queueLevel < 1)) {
      toast.error("Queue Level must be at least 1!", { position: "top-right", autoClose: 2000 });
      return;
    }

    // if (["RR", "MLFQ"].includes(algorithm) && (isNaN(timeQuantum) || timeQuantum <= 0)) {
    //   toast.error("Time Quantum must be greater than 0!", { position: "top-right", autoClose: 2000 });
    //   return;
    // }

    // Add the process with trimmed name
    addProcess({ ...process, name: trimmedName });
    toast.success("Process added successfully!", { position: "top-right", autoClose: 1500 });

    // Reset form
    setProcess({
      name: "",
      burstTime: "",
      arrivalTime: "",
      priority: "",
      queueLevel: "",
      timeQuantum: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 mb-10 border border-white rounded-lg shadow-md transition-all bg-violet-400 text-white">
      <h2 className="text-2xl font-semibold mb-4 text-center">Add a Process</h2>

      <div className="flex flex-col gap-4 justify-center">
        {/* Process Name */}
        <input
          type="text"
          placeholder="Enter Process Name"
          value={process.name}
          onChange={(e) => setProcess({ ...process, name: e.target.value })}
          className="border p-3 rounded bg-white text-black w-full mt-1"
        />

        {/* Burst Time */}
        <input
          type="number"
          placeholder="Enter Burst Time"
          min="1"
          value={process.burstTime}
          onChange={(e) => setProcess({ ...process, burstTime: e.target.value })}
          className="border p-3 rounded bg-white text-black w-full mt-1"
        />

        {/* Arrival Time */}
        <input
          type="number"
          placeholder="Enter Arrival Time"
          min="0"
          value={process.arrivalTime}
          onChange={(e) => setProcess({ ...process, arrivalTime: e.target.value })}
          className="border p-3 rounded bg-white text-black w-full mt-1"
        />

        {/* Priority (For Priority Scheduling) */}
        {["Priority (Preemptive)", "Priority (Non-Preemptive)"].includes(algorithm) && (
          <input
            type="number"
            placeholder="Enter Priority"
            min="0"
            value={process.priority}
            onChange={(e) => setProcess({ ...process, priority: e.target.value })}
            className="border p-3 rounded bg-white text-black w-full mt-1"
          />
        )}

        {/* Queue Level (For MLQ & MLFQ) */}
        {/* {["MLQ", "MLFQ"].includes(algorithm) && (
          <input
            type="number"
            placeholder="Enter Queue Level"
            min="1"
            value={process.queueLevel}
            onChange={(e) => setProcess({ ...process, queueLevel: e.target.value })}
            className="border p-3 rounded bg-black text-white w-full mt-1"
          />
        )} */}

        {/* Time Quantum (For RR & MLFQ) */}
        {/* {["RR", "MLFQ"].includes(algorithm) && (
          <input
            type="number"
            placeholder="Enter Time Quantum"
            min="1"
            value={process.timeQuantum}
            onChange={(e) => setProcess({ ...process, timeQuantum: e.target.value })}
            className="border p-3 rounded bg-black text-white w-full mt-1"
          />
        )} */}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="mt-4 p-3 bg-white text-black rounded hover:bg-blue-400/70 hover:text-white transition-all flex items-center gap-2 mx-auto border border-white"
      >
        Add Process
      </button>
    </form>
  );
};

export default ProcessForm;