import React,{useState} from "react";
import { Link } from "react-router-dom";
import   { fcfsAlgorithm, sstfAlgorithm, scanAlgorithm, cscanAlgorithm, lookAlgorithm, clookAlgorithm } from "../utils/diskAlgoritm";
import InputForm from "./InputForm";
import DiskVisualizer from "./DiskVisualizer";
import Comparison from "./Comparison";

function DiskSimulator() {

   const [simulationData, setSimulationData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
//   const [totalTracks] = useState(200);
//   const [currentTrack, setCurrentTrack] = useState(0);
//   const [requests, setRequests] = useState([]);
//   const [headMovements, setHeadMovements] = useState([{ track: 0 }]);
//   const [accessHistory, setAccessHistory] = useState([]);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [isRunning, setIsRunning] = useState(false);
//   const [algorithm, setAlgorithm] = useState('sstf');
//   const [direction, setDirection] = useState('up');

// const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

// const algorithmDescriptions = {
//   fcfs: "FCFS (First-Come, First-Served): Services disk requests in the order they arrive. Simple but may lead to long seek times.",
//   sstf: "SSTF (Shortest Seek Time First): Services the request closest to the current head position, reducing average seek time.",
//   scan: "SCAN (Elevator Algorithm): Head moves in one direction and services requests, then reverses direction.",
//   cscan: "C-SCAN (Circular SCAN): Similar to SCAN but only moves in one direction, jumping to the start when it reaches the end.",
//   look: "LOOK: Like SCAN but the head only goes as far as the last request in each direction before reversing.",
//   clook: "C-LOOK: Like C-SCAN, but the head only goes as far as the last request and jumps back to the beginning."
// };

//   useEffect(() => {
//     const initializeFileSystem = () => {
//       const newFileSystem = new FileSystem(400);
//       const files = [
//         new File('document.txt', 3, [10, 11, 12]),
//         new File('image.jpg', 4, [20, 21, 45, 46]),
//         new File('video.mp4', 5, [50, 51, 80, 81, 82]),
//         new File('fragmented.dat', 4, [15, 30, 60, 90]),
//         new File('large_file.iso', 6, [200, 201, 202, 203, 204, 205]),
//         new File('backup.zip', 5, [300, 301, 302, 350, 351]),
//         new File('newfile.zip', 5, [2, 20, 200, 30, 33])
//       ];
//       files.forEach(file => newFileSystem.addFile(file));
//       setFileSystem(newFileSystem);
//     };
    
//     initializeFileSystem();
//   }, []);

  const handleStartSimulation = (data) => {
    const { requests, startPosition, algorithm } = data;
    let result;
    
   // setSelectedAlgorithm(algorithm);


    switch (algorithm) {
      case 'fcfs':
        result = fcfsAlgorithm(requests, startPosition);
        break;
      case 'sstf':
        result = sstfAlgorithm(requests, startPosition);
        break;
      case 'scan':
        result = scanAlgorithm(requests, startPosition, 'up', 400);
        break;
      case 'cscan':
        result = cscanAlgorithm(requests, startPosition);
        break;
      case 'look':
        result = lookAlgorithm(requests, startPosition,'up');
        break;
      case 'clook':
        result = clookAlgorithm(requests, startPosition);
        break;
      default:
        result = fcfsAlgorithm(requests, startPosition);
    }
    
    console.log('Simulation Result:', result);

    setSimulationData({
      requests,
      startPosition,
      algorithm,
      path: result.path,
      seekCount: result.seekCount
    });
    setCurrentStep(0);
    setShowComparison(false);
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
    if (simulationData && step === simulationData.path.length - 1) {
      setShowComparison(true);
    } else {
      setShowComparison(false);
    }
  };

//   const processNextRequest = () => {
//     if (!requests || requests.length === 0) {
//       setIsRunning(false);
//       return;
//     }
//     // ...rest of the function
//   };

//   useEffect(() => {
//     let animationFrame;
//     if (isRunning) {
//       animationFrame = setTimeout(() => {
//         processNextRequest();
//       }, 1000);
//     }
//     return () => clearTimeout(animationFrame);
//   }, [isRunning, currentTrack, requests, currentTime]);

  return (
    <div className="min-h-screen bg-linear-to-r from-lime-200 via-green-400 to-emerald-600 py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-100">Disk Scheduling Algorithm Simulator</h1>
              </div>

            <div className="grid grid-cols-1 gap-6">
                <InputForm onStartSimulation={handleStartSimulation} />
                
                
                {simulationData && (
                  <>
                    <DiskVisualizer
                      path={simulationData.path}
                      diskSize={400}
                      currentStep={currentStep}
                      onStepChange={handleStepChange}
                      seekCount={simulationData.seekCount}
                    />
                    {showComparison && (
                      <Comparison
                        requests={simulationData.requests}
                        startPosition={simulationData.startPosition}
                        currentAlgorithm={simulationData.algorithm}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
  );
}

export default DiskSimulator;
