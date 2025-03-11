import React, { useState } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Disease = () => {
  const [diseaseData, setDiseaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);

  const generalTreatmentSuggestions = [
    "Regularly inspect plants for early signs of disease",
    "Ensure proper air circulation between plants",
    "Maintain optimal watering schedule",
    "Consider organic fungicides if applicable",
    "Remove affected leaves or plant parts",
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setImagePreview(reader.result);
        setBase64Image(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const identifyDisease = async () => {
    if (!base64Image) {
      alert("Please upload an image first");
      return;
    }

    try {
      setLoading(true);

      const apiKey = "yHV9o1TvNbQUxpFNxy0CxRR3XiaB6Z205bSA7NEapSNvkUeCLH";
      const apiUrl = "https://api.plant.id/v3/health_assessment";

      const headers = {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      };

      const requestBody = {
        images: [base64Image],
        similar_images: true,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("API Error Response:", errorResponse);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.result?.disease?.suggestions) {
        const diseaseResp = data.result.disease.suggestions[0];
        const plantDetails = data.result.classification?.suggestions?.[0] || {};

        const apiTreatmentSuggestions = diseaseResp.details?.treatment || [];

        const newDiseaseData = {
          name: diseaseResp.name,
          probability: diseaseResp.probability,
          similarImages: diseaseResp.similar_images,
          healthStatus: {
            isHealthy: diseaseResp.probability < 0.3,
            confidence: (diseaseResp.probability * 100).toFixed(2),
            severity: diseaseResp.probability < 0.3 ? "Low" : diseaseResp.probability < 0.7 ? "Medium" : "High"
          },
          cropIdentification: {
            commonName: plantDetails.name,
          },
          treatmentSuggestions: apiTreatmentSuggestions.length > 0 
            ? apiTreatmentSuggestions 
            : generalTreatmentSuggestions,
          isTreatmentFromApi: apiTreatmentSuggestions.length > 0
        };

        setDiseaseData(newDiseaseData);
      }
    } catch (error) {
      console.error("Error in identifyDisease:", error);
      alert("Error identifying disease. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black/55 backdrop-blur-md text-white p-8 w-full mx-auto font-mono text-sm mt-6">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-green-500 text-center font-smooch">
          E-Garden Disease Detection
        </h1>
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Left Section - Image Upload */}
          <div className="w-full lg:w-1/4">
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full">
              <div className="mb-4">
                <div className="relative w-full pt-[100%] bg-gray-800 rounded-lg overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  ) : (
                    <label className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-400 cursor-pointer">
                      <span>Upload / Capture</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
              <button
                onClick={identifyDisease}
                disabled={!base64Image || loading}
                className="w-full px-4 py-2 rounded-full bg-yellow-500 text-black hover:bg-yellow-600"
              >
                {loading ? "Identifying..." : "Identify Disease"}
              </button>
            </div>
          </div>

          {/* Right Section - Disease Information */}
          <div className="w-full lg:w-3/4 font-smooch text-xl">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            ) : diseaseData ? (
              <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-green-500">
                  Disease Information
                </h2>
                <div className="space-y-4">
                  {/* Health Status */}
                  <div>
                    <h3 className="text-xl font-bold text-green-500 mb-2">Health Status</h3>
                    <p className="text-lg">Status: {diseaseData.healthStatus.isHealthy ? "Healthy" : "Requires Attention"}</p>
                    <p className="text-lg">Confidence: {diseaseData.healthStatus.confidence}%</p>
                    <p className="text-lg">Severity: {diseaseData.healthStatus.severity}</p>
                  </div>

                  {/* Crop Identification */}
                  <div>
                    <h3 className="text-xl font-bold text-green-500 mb-2">Crop Identification</h3>
                    <p className="text-lg">Plant Type: {diseaseData.cropIdentification.commonName || "Not identified"}</p>
                  </div>

                  {/* Disease Information */}
                  <div>
                    <h3 className="text-xl font-bold text-green-500 mb-2">Disease Information</h3>
                    <p className="text-lg">Disease Name: {diseaseData.name || "Not detected"}</p>
                    <p className="text-lg">Probability: {(diseaseData.probability * 100).toFixed(2)}%</p>
                  </div>

                  {/* Treatment Suggestions */}
                  <div>
                    <h3 className="text-xl font-bold text-green-500 mb-2">
                      Treatment Suggestions
                      {!diseaseData.isTreatmentFromApi && (
                        <span className="text-sm font-normal text-gray-400 ml-2">(General recommendations)</span>
                      )}
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {diseaseData.treatmentSuggestions.map((suggestion, index) => (
                        <li key={index} className="text-lg">{suggestion}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Similar Images */}
                  <div>
                    <h3 className="text-xl font-bold text-green-500 mb-2">Similar Cases</h3>
                    <div className="flex gap-4 mt-2 overflow-x-auto">
                      {diseaseData.similarImages?.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`Similar ${index}`}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center text-3xl items-center h-[calc(100vh-200px)]">
                <p className="text-center text-gray-400">Upload a plant image to get detailed disease information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Disease;