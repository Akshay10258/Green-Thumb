import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";

const Analytics = () => {
  // IoT Data States
  const [moisture, setMoisture] = useState(0);
  const [temperature, setTemperature] = useState(-10);
  const [humidity, setHumidity] = useState(0);
  const [pumpStatus, setPumpStatus] = useState(false);
  const [pumpTrigger, setPumpTrigger] = useState(20);
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(20);

  // Graph Data States
  const [moistureData, setMoistureData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1H");

  // Mock data for demonstration
  useEffect(() => {
    // Initialize with mock data
    const mockData = [
      { time: "08:00:00", moisture: 75 },
      { time: "08:30:00", moisture: 68 },
      { time: "09:00:00", moisture: 60 },
      { time: "09:30:00", moisture: 52 },
      { time: "10:00:00", moisture: 45 },
      { time: "10:30:00", moisture: 40 },
      { time: "11:00:00", moisture: 38 },
      { time: "11:30:00", moisture: 35 },
      { time: "12:00:00", moisture: 32 }
    ];
    
    setMoistureData(mockData);
    setMoisture(32); // Current value
    setTemperature(24);
    setHumidity(65);
    setPumpStatus(false);
    setPumpTrigger(20);
    setTempThreshold(20);

    // Simulate live data updates
    const interval = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString();
      const newMoisture = Math.max(0, moisture - Math.random() * 2);
      
      setMoisture(newMoisture);
      setMoistureData(prev => [...prev, { time: currentTime, moisture: newMoisture }].slice(-50));
      
      // Simulate pump triggering
      if (newMoisture < pumpTrigger) {
        setPumpStatus(true);
      } else {
        setPumpStatus(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [moisture, pumpTrigger]);

  // In a real app, this would communicate with Firebase
  const handleThresholdSubmit = () => {
    if (tempThreshold >= 0 && tempThreshold <= 100) {
      setPumpTrigger(parseInt(tempThreshold));
      setIsEditingThreshold(false);
      
      // In a real app:
      // db.ref('settings/moistureThreshold').set(parseInt(tempThreshold));
      console.log("Threshold updated to:", tempThreshold);
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    let filterTime = new Date();

    switch(selectedRange) {
      case "1H":
        filterTime.setHours(now.getHours() - 1);
        break;
      case "1D":
        filterTime.setDate(now.getDate() - 1);
        break;
      case "7D":
        filterTime.setDate(now.getDate() - 7);
        break;
      case "15D":
        filterTime.setDate(now.getDate() - 15);
        break;
      default:
        filterTime.setHours(now.getHours() - 1);
    }

    // For the demo, we'll return all the data regardless of time range
    return moistureData;
  };

  // Create data for gauge charts
  const createGaugeData = (value, max) => [
    { value: value, name: "Value" },
    { value: max - value, name: "Remaining" }
  ];

  const COLORS = {
    moisture: ["#00d1b2", "#444"],
    temperature: ["#ffcc00", "#444"],
    humidity: ["#00aaff", "#444"]
  };

  return (
    <div className="bg-black/30 backdrop-blur-md text-white min-h-screen m-10 mb-0 p-6">
      <h1 className="text-4xl ml-2 mb-4">IoT Sensor Dashboard</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h3 className="mb-2 text-2xl">Moisture Level</h3>
        <div className="flex space-x-4 mb-4 mt-4">
          {["1H", "1D", "7D", "15D"].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded ${
                selectedRange === range ? "bg-emerald-500" : "bg-gray-700"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getFilteredData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 0, 0.5)" />
              <XAxis 
                dataKey="time" 
                stroke="#fff"
              />
              <YAxis 
                stroke="#fff"
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: 'none',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="moisture" 
                stroke="#00d1b2" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Moisture Gauge */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl mb-2">Moisture</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={createGaugeData(moisture, 100)}
                  innerRadius={40}
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {createGaugeData(moisture, 100).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.moisture[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xl mt-2">{moisture.toFixed(1)}%</p>
        </div>

        {/* Temperature Gauge */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl mb-2">Temperature</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={createGaugeData(temperature, 50)}
                  innerRadius={40}
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {createGaugeData(temperature, 50).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.temperature[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xl mt-2">{temperature.toFixed(1)}°C</p>
        </div>

        {/* Humidity Gauge */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl mb-2">Humidity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={createGaugeData(humidity, 100)}
                  innerRadius={40}
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {createGaugeData(humidity, 100).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.humidity[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xl mt-2">{humidity.toFixed(1)}%</p>
        </div>

        {/* Pump Status */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl mb-16">Pump Status</h3>
          <div
            className={`w-24 h-24 mx-auto rounded-full ${
              pumpStatus ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <p className="text-center text-xl mt-2">{pumpStatus ? "ON" : "OFF"}</p>
        </div>

        {/* Threshold Control */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl mb-4">Threshold Level</h3>
          {isEditingThreshold ? (
            <div className="flex flex-col items-center space-y-4">
              <input
                type="number"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(e.target.value)}
                className="w-20 px-2 py-1 text-black rounded"
                min="0"
                max="100"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleThresholdSubmit}
                  className="bg-green-500 px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingThreshold(false);
                    setTempThreshold(pumpTrigger);
                  }}
                  className="bg-red-500 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xl mb-4">{pumpTrigger}%</p>
              <button
                onClick={() => setIsEditingThreshold(true)}
                className="bg-blue-500 px-4 py-2 rounded"
              >
                Edit
              </button>
            </div>
          )}
          <div className="mt-4 text-center text-xs text-gray-400">
            Auto-watering when moisture falls below threshold
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;