import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const Analytics = () => {
  const db = getDatabase();
  
  // IoT Data States
  const [moisture, setMoisture] = useState(0);
  const [temperature, setTemperature] = useState(-10);
  const [humidity, setHumidity] = useState(0);
  const [pumpStatus, setPumpStatus] = useState(false);
  
  // Updated to use two thresholds instead of one
  const [lowerThreshold, setLowerThreshold] = useState(30); // Turn ON when below this
  const [upperThreshold, setUpperThreshold] = useState(60); // Turn OFF when above this
  
  const [isAuto, setIsAuto] = useState(true); // Default: Auto Mode

  // Graph Data States
  const [moistureData, setMoistureData] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1H");

  useEffect(() => {
    // Set up real-time listener for database updates
    const monitorRef = ref(db, "monitor");
    const settingsRef = ref(db, "settings");
    
    // Initial check and set of settings
    onValue(ref(db, "settings"), (snapshot) => {
      const settings = snapshot.val();
      if (settings) {
        // Update to handle dual thresholds
        setLowerThreshold(settings.lowerMoistureThreshold || 30);
        setUpperThreshold(settings.upperMoistureThreshold || 60);
        
        // Only update isAuto if it's explicitly defined in Firebase
        if (settings.isAutoMode !== undefined) {
          setIsAuto(settings.isAutoMode);
        } else {
          // If isAutoMode is not defined in Firebase, set it to true (default)
          update(ref(db, "settings"), { isAutoMode: true })
            .then(() => console.log("Default Auto Mode set in Firebase"))
            .catch((error) => console.error("Error setting default mode:", error));
        }
      } else {
        // If no settings exist, create default settings with dual thresholds
        update(ref(db, "settings"), { 
          isAutoMode: true,
          lowerMoistureThreshold: 30,
          upperMoistureThreshold: 60
        })
          .then(() => console.log("ryefault settings created"))
          .catch((error) => console.error("Error creating default settings:", error));
      }
    }, { onlyOnce: true });
    
    const unsubscribeMonitor = onValue(monitorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const currentTime = new Date().toISOString();
        
        // Update current values directly from Firebase
        setMoisture(data.SoilMoisture);
        setTemperature(data.temp);
        setHumidity(data.humidity);

        // Only update pumpStatus if in Auto mode
        if (isAuto) {
          setPumpStatus(data.pumpStatus);
          
          // Implement dual threshold logic for auto mode
          // Only update pump status if we need to change it based on thresholds
          let newPumpStatus = data.pumpStatus;
          
          if (data.SoilMoisture <= lowerThreshold && !data.pumpStatus) {
            // Turn pump ON if moisture is below lower threshold and pump is currently OFF
            newPumpStatus = true;
            update(ref(db, "monitor"), { pumpStatus: true })
              .then(() => console.log("Auto-mode: Pump turned ON - moisture below lower threshold"))
              .catch((error) => console.error("Error updating pump status:", error));
          } 
          else if (data.SoilMoisture >= upperThreshold && data.pumpStatus) {
            // Turn pump OFF if moisture is above upper threshold and pump is currently ON
            newPumpStatus = false;
            update(ref(db, "monitor"), { pumpStatus: false })
              .then(() => console.log("Auto-mode: Pump turned OFF - moisture above upper threshold"))
              .catch((error) => console.error("Error updating pump status:", error));
          }
          
          setPumpStatus(newPumpStatus);
        }
        
        // Update historical data for the graph
        setMoistureData(prev => [...prev, { 
          time: currentTime, 
          value: data.SoilMoisture 
        }]);
        
        setTimeLabels(prev => [...prev, currentTime]);
      }
    });

    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      const settings = snapshot.val();
      if (settings) {
        // Update thresholds from Firebase
        if (settings.lowerMoistureThreshold !== undefined) {
          setLowerThreshold(settings.lowerMoistureThreshold);
        }
        
        if (settings.upperMoistureThreshold !== undefined) {
          setUpperThreshold(settings.upperMoistureThreshold);
        }
        
        // Update mode and handle status changes when mode changes
        if (settings.isAutoMode !== undefined && settings.isAutoMode !== isAuto) {
          setIsAuto(settings.isAutoMode);
          
          // If switching to manual mode, ensure pump is OFF
          if (!settings.isAutoMode) {
            setPumpStatus(false);
            update(ref(db, "monitor"), { pumpStatus: false })
              .then(() => console.log("Pump turned off when switching to manual mode"))
              .catch((error) => console.error("Error updating pump status:", error));
          } else {
            // If switching to auto mode, sync with current Firebase status
            onValue(ref(db, "monitor"), (snapshot) => {
              const data = snapshot.val();
              if (data && data.pumpStatus !== undefined) {
                setPumpStatus(data.pumpStatus);
              }
            }, { onlyOnce: true });
          }
        }
      }
    });
  
    return () => {
      unsubscribeMonitor();
      unsubscribeSettings();
    };
  }, [db, isAuto, lowerThreshold, upperThreshold]); // Added thresholds as dependencies

  const handleLowerThresholdChange = (e) => {
    const newValue = parseInt(e.target.value);
    // Ensure lower threshold stays below upper threshold
    if (newValue < upperThreshold) {
      setLowerThreshold(newValue);
      
      update(ref(db, "settings"), { lowerMoistureThreshold: newValue })
        .then(() => console.log("Lower threshold updated:", newValue))
        .catch((error) => console.error("Error updating lower threshold:", error));
    }
  };
  
  const handleUpperThresholdChange = (e) => {
    const newValue = parseInt(e.target.value);
    // Ensure upper threshold stays above lower threshold
    if (newValue > lowerThreshold) {
      setUpperThreshold(newValue);
      
      update(ref(db, "settings"), { upperMoistureThreshold: newValue })
        .then(() => console.log("Upper threshold updated:", newValue))
        .catch((error) => console.error("Error updating upper threshold:", error));
    }
  };
  
  const handleModeToggle = async () => {
    const newMode = !isAuto;
    
    // Update local state immediately for better UI response
    setIsAuto(newMode);
  
    if (!newMode) {
      // Switching to Manual Mode - Turn pump OFF
      setPumpStatus(false);
      
      // Update Firebase for both settings and pump status
      try {
        await update(ref(db, "settings"), { isAutoMode: newMode });
        await update(ref(db, "monitor"), { pumpStatus: false });
        console.log("Switched to Manual Mode - Pump turned OFF");
      } catch (error) {
        console.error("Error updating mode or pump status:", error);
      }
    } else {
      // Switching to Auto Mode
      try {
        await update(ref(db, "settings"), { isAutoMode: newMode });
        console.log("Switched to Auto Mode");
        
        // Let the Firebase listener handle pump status updates
      } catch (error) {
        console.error("Error updating mode:", error);
      }
    }
  };
  
  const handlePumpToggle = async () => {
    // Only allow toggling in manual mode
    if (isAuto) return; 
  
    const newPumpStatus = !pumpStatus;
    setPumpStatus(newPumpStatus); // Update local state immediately
  
    try {
      await update(ref(db, "monitor"), { pumpStatus: newPumpStatus });
      console.log("Pump manually toggled:", newPumpStatus);
    } catch (error) {
      console.error("Error updating pump status:", error);
      // Revert local state if Firebase update fails
      setPumpStatus(!newPumpStatus);
    }
  };

  // Filter Data Based on Selected Time Range
  const getFilteredData = () => {
    const now = new Date();
    let filterTime = new Date();

    if (selectedRange === "1H") filterTime.setHours(now.getHours() - 1);
    else if (selectedRange === "1D") filterTime.setDate(now.getDate() - 1);
    else if (selectedRange === "7D") filterTime.setDate(now.getDate() - 7);
    else if (selectedRange === "15D") filterTime.setDate(now.getDate() - 15);

    return moistureData.filter((data) => new Date(data.time) >= filterTime);
  };

  const filteredData = getFilteredData();

  // Graph Data
  const lineData = {
    labels: filteredData.map((d) => new Date(d.time).toLocaleTimeString()),
    datasets: [
      {
        label: "Moisture Level",
        data: filteredData.map((d) => d.value),
        borderColor: "#00d1b2",
        backgroundColor: "rgba(0, 209, 178, 0.2)",
        tension: 0.4,
        pointRadius: 3,
      },
      // Add threshold lines to the chart
      {
        label: "Lower Threshold",
        data: Array(filteredData.length).fill(lowerThreshold),
        borderColor: "rgba(255, 0, 0, 0.5)",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      {
        label: "Upper Threshold",
        data: Array(filteredData.length).fill(upperThreshold),
        borderColor: "rgba(0, 255, 0, 0.5)",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(0, 255, 0, 0.5)",
          lineWidth: 1,
        },
        ticks: {
          color: "#fff",
        },
      },
      y: {
        grid: {
          color: "rgba(0, 255, 0, 0.5)",
          lineWidth: 1,
        },
        ticks: {
          color: "#fff",
        },
      },
    },
  };

  return (
    <>
    <Navbar/>

    <div className="bg-black/30 backdrop-blur-md text-white min-h-screen m-10 mb-0 p-6">
      <h1 className="text-4xl ml-2 mb-4 font-smooch">IoT Sensor Dashboard</h1>

      {/* First Row: Moisture Level Chart */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 font-smooch">
        <h3 className="mb-2 text-2xl">Moisture Level</h3>
        <div className="flex space-x-4 mb-4 mt-4">
          {["1H", "1D", "7D", "15D"].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded hidden ${
                selectedRange === range ? "bg-emerald-500" : "bg-gray-700"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="h-64">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Second Row: Moisture, Temperature, Humidity, Pump Status, Threshold Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 font-smooch">
        {/* Moisture Gauge */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl mb-2">Moisture</h3>
          <Doughnut
            data={{
              datasets: [
                {
                  data: [moisture, 100 - moisture],
                  backgroundColor: ["#00d1b2", "#444"],
                },
              ],
            }}
          />
          <p className="text-center text-xl mt-2">{moisture}%</p>
        </div>

        {/* Temperature Gauge */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md font-smooch">
          <h3 className="text-2xl mb-2">Temperature</h3>
          <Doughnut
            data={{
              datasets: [
                {
                  data: [temperature, 50 - temperature],
                  backgroundColor: ["#ffcc00", "#444"],
                },
              ],
            }}
          />
          <p className="text-center text-xl mt-2">{temperature}°C</p>
        </div>

        {/* Humidity Gauge */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md font-smooch">
          <h3 className="text-2xl mb-2">Humidity</h3>
          <Doughnut
            data={{
              datasets: [
                {
                  data: [humidity, 100 - humidity],
                  backgroundColor: ["#00aaff", "#444"],
                },
              ],
            }}
          />
          <p className="text-center text-xl mt-2">{humidity}%</p>
        </div>

        {/* Pump Status */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md font-smooch">
          <h3 className="text-2xl mb-6">Pump Status</h3>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-lg">{isAuto ? "Auto Mode" : "Manual Mode"}</span>
            <button
              className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                isAuto ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={handleModeToggle}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${
                  isAuto ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>   
          
          <div
            className={`w-24 h-24 mx-auto rounded-full ${
              pumpStatus ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={!isAuto ? handlePumpToggle : undefined}
            style={{ cursor: !isAuto ? "pointer" : "default" }}
          ></div>
          <p className="text-center text-xl mt-2">{pumpStatus ? "ON" : "OFF"}</p>
          {!isAuto && <p className="text-center text-sm mt-1">(Click to toggle)</p>}
          {isAuto && <p className="text-center text-sm mt-1">(Auto-controlled)</p>}
        </div>

        {/* Dual Threshold Controls */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md font-smooch">
          <h2 className="text-xl font-semibold mb-2">
            {isAuto ? "Auto Thresholds" : "Thresholds (Disabled)"}
          </h2>
          
          {/* Lower Threshold */}
          <div className="mb-6">
            <h3 className="text-lg mb-2">ON Threshold (Lower)</h3>
            <p className="text-center text-2xl">{lowerThreshold}%</p>
            <div className="text-center mt-2">
              <input 
                className={`cursor-${isAuto ? "pointer" : "not-allowed"} w-full`} 
                disabled={!isAuto} 
                type="range" 
                name="lowerTrigger" 
                value={lowerThreshold} 
                onChange={handleLowerThresholdChange} 
                min={0} 
                max={70}
              />
            </div>
            {isAuto && (
              <p className="text-xs mt-1">
                Pump turns ON when moisture falls below {lowerThreshold}%
              </p>
            )}
          </div>
          
          {/* Upper Threshold */}
          <div>
            <h3 className="text-lg mb-2">OFF Threshold (Upper)</h3>
            <p className="text-center text-2xl">{upperThreshold}%</p>
            <div className="text-center mt-2">
              <input 
                className={`cursor-${isAuto ? "pointer" : "not-allowed"} w-full`} 
                disabled={!isAuto} 
                type="range" 
                name="upperTrigger" 
                value={upperThreshold} 
                onChange={handleUpperThresholdChange} 
                min={lowerThreshold + 5} 
                max={95}
              />
            </div>
            {isAuto && (
              <p className="text-xs mt-1">
                Pump turns OFF when moisture rises above {upperThreshold}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};
s
export default Analytics;