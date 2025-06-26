import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
//import { fcfsAlgorithm, sstfAlgorithm, scanAlgorithm, cscanAlgorithm, lookAlgorithm, clookAlgorithm } from "../utils/diskAlgorithm";
import { fcfsAlgorithm, sstfAlgorithm, scanAlgorithm, cscanAlgorithm, lookAlgorithm, clookAlgorithm } from '../utils/diskAlgoritm';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Comparison = ({ requests, startPosition, currentAlgorithm }) => {
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    if (requests && requests.length && startPosition !== undefined) {
      const fcfs = fcfsAlgorithm(requests, startPosition);
      const sstf = sstfAlgorithm(requests, startPosition);
      const scan = scanAlgorithm(requests, startPosition);
      const cscan = cscanAlgorithm(requests, startPosition);
      const look = lookAlgorithm(requests, startPosition);
      const clook = clookAlgorithm(requests, startPosition);

      const labels = ['FCFS', 'SSTF', 'SCAN', 'C SCAN', 'LOOK', 'C LOOK'];
      const seekCounts = [fcfs.seekCount, sstf.seekCount, scan.seekCount, cscan.seekCount, look.seekCount, clook.seekCount];

      const backgroundColor = labels.map(label =>
        label.toLowerCase() === currentAlgorithm ? 'rgba(54, 162, 235, 0.8)' : 'rgba(54, 162, 235, 0.4)'
      );

      const minSeekCount = Math.min(...seekCounts);
      const borderColor = seekCounts.map(count =>
        count === minSeekCount ? 'rgba(75, 192, 192, 1)' : 'rgba(54, 162, 235, 0.8)'
      );
      const borderWidth = seekCounts.map(count =>
        count === minSeekCount ? 2 : 1
      );

      setComparisonData({
        labels,
        datasets: [
          {
            label: 'Total Seek Distance',
            data: seekCounts,
            backgroundColor,
            borderColor,
            borderWidth
          }
        ]
      });
    }
  }, [requests, startPosition, currentAlgorithm]);

  if (!comparisonData) return null;

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Disk Scheduling Algorithms Comparison' },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Seek Distance: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Total Seek Distance' }
      }
    }
  };

  return (
    <div className="p-6 bg-orange-100 rounded-lg shadow-md my-4">
      <h3 className="text-xl font-bold mb-4">Algorithm Comparison</h3>
      <div className="h-80">
        <Bar data={comparisonData} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <span className="inline-block w-4 h-4 bg-blue-400 mr-2"></span>
          Current algorithm
        </p>
        <p>
          <span className="inline-block w-4 h-4 border-2 border-green-500 mr-2"></span>
          Algorithm with minimum seek distance
        </p>
      </div>
    </div>
  );
};

export default Comparison;