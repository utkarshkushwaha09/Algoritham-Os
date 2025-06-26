const ProcessDetails = ({ processes, setProcesses }) => {
  const clearProcesses = () => {
    setProcesses([]);
  }

  return (
    <div className="p-6 border border-black dark:border-white rounded-lg shadow-md bg-sky-300 text-white dark:bg-cyan-500 dark:text-white transition-all min-h-89.5">
      <h2 className="text-xl font-semibold mb-4 text-center">Process Details</h2>

      {processes.length === 0 ? (
        <p className="text-gray-400 dark:text-white text-center">No processes added yet.</p>
      ) : (
        <div className="flex gap-4 justify-center flex-wrap">
          {processes.map((p, index) => (
            <div
              key={index}
              className="w-48 h-auto flex flex-col justify-center items-center p-4 border border-black dark:border-white rounded-lg shadow-lg bg-orange-400/[97.9%] text-black dark:bg-orange dark:text-black hover:scale-105 transition-all"
            >
              <p className="font-semibold text-lg">{p.name}</p>
              <p className="text-sm"><strong>Burst Time:</strong> {p.burstTime}</p>
              <p className="text-sm"><strong>Arrival Time:</strong> {p.arrivalTime}</p>
              
              {/* Show Priority if applicable */}
              {p.priority !== "" && (
                <p className="text-sm"><strong>Priority:</strong> {p.priority}</p>
              )}

              {/* Show Queue Level if applicable */}
              {p.queueLevel !== "" && (
                <p className="text-sm"><strong>Queue Level:</strong> {p.queueLevel}</p>
              )}

              {/* Show Time Quantum if applicable */}
              {p.timeQuantum !== "" && (
                <p className="text-sm"><strong>Time Quantum:</strong> {p.timeQuantum}</p>
              )}
            </div>
          ))}
          <button
            onClick={clearProcesses}
            className="mt-6 w-full py-2 bg-white text-black rounded hover:bg-red-400 hover:text-white transition-all  items-center gap-2 mx-auto border border-white"
          >
            Clear All Processes
          </button>
        </div>

        
      )}
    </div>
  );
};

export default ProcessDetails;