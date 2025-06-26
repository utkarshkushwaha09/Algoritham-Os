import React, { useState } from 'react';

const InputForm = ({ onStartSimulation }) => {
  const [requests, setRequests] = useState('');
  const [startPosition, setStartPosition] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [error, setError] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  
  const algorithmDescriptions = {
  fcfs: {
    name: 'First Come First Served (FCFS)',
    description: 'The simplest disk scheduling algorithm that serves requests in the order they arrive.',
    advantages: [
      'Simple to implement',
      'Fair to all requests',
      'No starvation'
    ],
    disadvantages: [
      'High seek time',
      'Not optimized for performance',
      'No optimization for disk arm movement'
    ],
    example: 'If requests come in order: 95, 180, 34, 119, FCFS will serve them in exactly that order, regardless of head position.',
    bestCase: 'When requests are physically close to each other in the order they arrive.',
    worstCase: 'When requests are far apart and arrive in a random order.'
  },
  sstf: {
    name: 'Shortest Seek Time First (SSTF)',
    description: 'Selects the request that requires the least head movement from the current position.',
    advantages: [
      'Better performance than FCFS',
      'Minimizes seek time',
      'Good for systems with mostly random requests'
    ],
    disadvantages: [
      'Can cause starvation of some requests',
      'Not as fair as FCFS',
      'Overhead in finding closest request'
    ],
    example: 'If head at 50 and requests are: 95, 180, 34, 119, SSTF will choose 34 next as it\'s closest.',
    bestCase: 'When most requests are clustered around the same area.',
    worstCase: 'When new requests keep arriving closer to current head position, causing starvation of distant requests.'
  },
  scan: {
    name: 'SCAN (Elevator)',
    description: 'The disk arm moves in one direction serving requests until it reaches the end, then reverses direction.',
    advantages: [
      'Better performance than FCFS',
      'No starvation',
      'Good for high-load systems'
    ],
    disadvantages: [
      'May not be optimal for specific workloads',
      'Longer wait times for recently passed locations'
    ],
    example: 'If moving up and requests are: 95, 180, 34, 119, SCAN will serve 95, 119, 180 then reverse and get 34.',
    bestCase: 'When requests are evenly distributed across the disk.',
    worstCase: 'When most requests are in the opposite direction of arm movement.'
  },
  cscan: {
    name: 'Circular SCAN (C-SCAN)',
    description: 'Similar to SCAN, but only serves requests when moving in one direction. When reaching the end, it quickly returns to the beginning.',
    advantages: [
      'More uniform wait times than SCAN',
      'Good for systems with heavy loads',
      'Prevents clustering'
    ],
    disadvantages: [
      'Longer seek times than SCAN in some cases',
      'May not be optimal for light loads'
    ],
    example: 'If moving up and requests are: 95, 180, 34, 119, C-SCAN will serve 95, 119, 180 then jump to 0 and get 34.',
    bestCase: 'When requests are evenly distributed and mostly sequential.',
    worstCase: 'When requests are concentrated in the area just passed by the head.'
  },
  look: {
    name: 'LOOK',
    description: 'Similar to SCAN but only goes as far as the last request in each direction.',
    advantages: [
      'More efficient than SCAN',
      'Good balance of fairness and performance',
      'No unnecessary movements'
    ],
    disadvantages: [
      'More complex to implement than SCAN',
      'May not be optimal for all workloads'
    ],
    example: 'If moving up and requests are: 95, 180, 34, 119, LOOK will serve 95, 119, 180 then reverse to 34.',
    bestCase: 'When requests are clustered in specific regions.',
    worstCase: 'When new requests keep arriving just behind the head movement.'
  },
  clook: {
    name: 'C-LOOK',
    description: 'Similar to C-SCAN but only goes as far as the last request in each direction before quickly returning.',
    advantages: [
      'More efficient than C-SCAN',
      'Uniform wait times',
      'Good for high-load systems'
    ],
    disadvantages: [
      'More complex than LOOK',
      'May have higher seek times in some cases'
    ],
    example: 'If moving up and requests are: 95, 180, 34, 119, C-LOOK will serve 95, 119, 180 then jump to 34.',
    bestCase: 'When requests are mostly sequential with some backwards jumps.',
    worstCase: 'When requests are concentrated just behind the head position.'
  }
};

  const handleAlgorithmChange = (e) => {
    const selected = e.target.value;
    setAlgorithm(selected);
    setSelectedAlgorithm(selected);
  };

  const validateInput = () => {
    if (!requests.trim()) {
      setError('Please enter track requests');
      return false;
    }
    
    if (!startPosition.trim()) {
      setError('Please enter starting head position');
      return false;
    }
    
    const requestsArray = requests.split(',').map(req => req.trim());
    for (const req of requestsArray) {
      if (isNaN(parseInt(req))) {
        setError('Track requests must be numbers');
        return false;
      }
    }
    
    if (isNaN(parseInt(startPosition))) {
      setError('Starting head position must be a number');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateInput()) {
      return;
    }
    
    const requestsArray = requests.split(',').map(req => parseInt(req.trim()));
    const startPositionInt = parseInt(startPosition);
    
    onStartSimulation({
      requests: requestsArray,
      startPosition: startPositionInt,
      algorithm
    });
  };

  return (
    <div className="p-6 bg-linear-to-r from-green-200 via-teal-400 to-cyan-600 rounded-lg shadow-md">
      {/* <h2 className="text-2xl font-bold mb-4">Disk Scheduling Simulator</h2> */}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requests">
            Track Requests (comma separated numbers)
          </label>
          <input
            className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="requests"
            type="text"
            placeholder="e.g., 98, 183, 37, 122, 14, 124, 65, 67"
            value={requests}
            onChange={(e) => setRequests(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startPosition">
            Starting Head Position
          </label>
          <input
            className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="startPosition"
            type="text"
            placeholder="e.g., 53"
            value={startPosition}
            onChange={(e) => setStartPosition(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="algorithm">
            Algorithm
          </label>
          <select
            className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="algorithm"
            value={algorithm}
            onChange={handleAlgorithmChange}
          >
            <option value="" disabled>Select an algorithm</option>
            <option value="fcfs">First-Come, First-Served (FCFS)</option>
            <option value="sstf">Shortest Seek Time First (SSTF)</option>
            <option value="scan">SCAN (Elevator)</option>
            <option value="cscan">C-SCAN (Circular SCAN)</option>
            <option value="look">LOOK</option>
            <option value="clook">C-LOOK (Circular LOOK)</option>
          </select>
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Start Simulation
          </button>
        </div>
      </form>
      
     {/* {selectedAlgorithm && (
        <div className="bg-white p-4 rounded shadow-md border border-gray-300">
            <h2 className="text-lg font-semibold capitalize">{selectedAlgorithm} Description</h2>
            <p className="text-gray-700 mt-2">{algorithmDescriptions[selectedAlgorithm]}</p>
        </div>
        )} */}
      {algorithm && algorithmDescriptions[algorithm] && (
        <div className=" text-xl bg-linear-to-r from-cyan-100 via-blue-300 to-indigo-400 mt-6 p-6 rounded shadow border border-gray-300">
          <h2 className="text-xl font-bold mb-2">{algorithmDescriptions[algorithm].name}</h2>
          <p className="mb-4 text-gray-700">{algorithmDescriptions[algorithm].description}</p>
          
          <div className="mb-4">
            <h3 className="font-semibold">Advantages:</h3>
            <ul className="list-disc list-inside ml-4 text-green-700">
              {algorithmDescriptions[algorithm].advantages.map((adv, idx) => (
                <li key={idx}>{adv}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Disadvantages:</h3>
            <ul className="list-disc list-inside ml-4 text-red-700">
              {algorithmDescriptions[algorithm].disadvantages.map((dis, idx) => (
                <li key={idx}>{dis}</li>
              ))}
            </ul>
          </div>

          <div className="mb-2">
            <h3 className="font-semibold">Example:</h3>
            <p className="text-gray-700">{algorithmDescriptions[algorithm].example}</p>
          </div>

          <div className="mb-2">
            <h3 className="font-semibold">Best Case:</h3>
            <p className="text-gray-700">{algorithmDescriptions[algorithm].bestCase}</p>
          </div>

          <div>
            <h3 className="font-semibold">Worst Case:</h3>
            <p className="text-gray-700">{algorithmDescriptions[algorithm].worstCase}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default InputForm; 