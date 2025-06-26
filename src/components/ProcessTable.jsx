const ProcessTable = ({ processes }) => (
    <table className="w-full mb-10 border-collapse border border-gray-300 dark:border-gray-700 shadow-md dark:shadow-gray-800 transition-all">
      <thead className="bg-black transition-all">
        <tr>
          <th className="p-2 border">Process</th>
          <th className="p-2 border">Burst Time</th>
        </tr>
      </thead>
      <tbody>
        {processes.map((p, index) => (
          <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <td className="p-2 border">{p.name}</td>
            <td className="p-2 border">{p.burstTime}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  
  export default ProcessTable;  