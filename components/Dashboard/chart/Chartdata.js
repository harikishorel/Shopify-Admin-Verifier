import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const Chartdata = ({ monthlySales }) => {
  console.log("Sales", monthlySales);
  const chartRef = useRef();

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }

    // Extracting the last captured date from the response
    const lastCapturedDate = monthlySales[0]?.updatedAt;

    // Extracting month and year from the last captured date
    const lastCapturedMonth = new Date(lastCapturedDate).getMonth() + 1; // Adding 1 because getMonth() returns zero-based month
    const lastCapturedYear = new Date(lastCapturedDate).getFullYear();

    // Initializing an array to store the count of verified properties for each month
    const propertyCounts = Array(12).fill(0);

    // Counting the verified properties for each month
    monthlySales.forEach(sale => {
      const month = new Date(sale.updatedAt).getMonth();
      if (new Date(sale.updatedAt).getFullYear() === lastCapturedYear) {
        propertyCounts[month]++;
      }
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    chartRef.current.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthNames.slice(0, lastCapturedMonth), // Slicing to only include months up to the last captured month
        datasets: [
          {
            label: 'Verified Properties',
            data: propertyCounts.slice(0, lastCapturedMonth), // Slicing to only include counts up to the last captured month
            borderColor: 'black',
            backgroundColor: '#452B90',
            borderWidth: 1,
            barThickness: 50, // Set the bar thickness as needed
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            callback: (value) => `${value}`, // Display y-axis labels as integers
          },
        },
      },
    });
  }, [monthlySales]);

  return (
    <div className="mb-4 w-full md:w-[684px] mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full md:w-auto">
        <h3 className="text-xl bg15 font-bold mb-2">Total Monthly verified property</h3>
        <canvas ref={chartRef} width={200} height={100}></canvas>
      </div>
    </div>
  );
};

export default Chartdata;
