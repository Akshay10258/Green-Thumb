import React, { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, useFirebase } from "../context/Firebase";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Garden = () => {
  const firebase = useFirebase();
  const currentUser = firebase?.currentUser;

  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);

  const userDocRef = currentUser ? doc(db, "users", currentUser.uid) : null;

  const getUserPlants = async (newPlantData) => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, {
        plants: arrayUnion(newPlantData),
      });
      console.log("Plant added successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

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

  const identifyPlant = async () => {
    if (!currentUser) {
      alert("Please sign in to identify plants.");
      return;
    }

    if (!base64Image) {
      alert("Please upload an image first");
      return;
    }

    try {
      setLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Api-Key", "yHV9o1TvNbQUxpFNxy0CxRR3XiaB6Z205bSA7NEapSNvkUeCLH");
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        images: [base64Image],
        latitude: 49.207,
        longitude: 16.608,
        similar_images: true,
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch(
        "https://plant.id/api/v3/identification?details=common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,best_light_condition,best_soil_type,common_uses,cultural_significance,toxicity,best_watering&language=en",
        requestOptions
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resjson = await response.json();
      console.log("Full API Response:", resjson);

      if (resjson.result?.classification?.suggestions) {
        const plantResp = resjson.result.classification.suggestions[0];

        const newPlantData = {
          name: plantResp.name,
          probability: plantResp.probability,
          common_names: plantResp.details?.common_names || [],
          taxonomy: plantResp.details?.taxonomy || {},
          description: plantResp.details?.description?.value || "",
          image: plantResp.details?.image?.value || "",
          edible_parts: plantResp.details?.edible_parts || [],
          best_light_condition: plantResp.details?.best_light_condition || "",
          best_soil_type: plantResp.details?.best_soil_type || "",
          common_uses: plantResp.details?.common_uses || [],
          toxicity: plantResp.details?.toxicity || "",
          best_watering: plantResp.details?.best_watering || "",
        };

        setPlantData(newPlantData);
        await getUserPlants(newPlantData);
      } else {
        console.error("Invalid response structure:", resjson);
      }
    } catch (error) {
      console.error("Error in identifyPlant:", error);
      alert("Error identifying plant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full bg-black/55 backdrop-blur-md text-white p-8 font-mono text-sm mt-6">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-green-500 text-center font-smooch">
          Plant Identification
        </h1>
        <div className="flex flex-col lg:flex-row w-full gap-8">
          {/* Left Section: Image Upload and Identify Button */}
          <div className="w-full lg:w-1/4">
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full">
              <div className="aspect-square w-full bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <label className="text-gray-400 text-center w-full">
                    Upload or Capture Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <button
                onClick={identifyPlant}
                disabled={!base64Image || loading}
                className="w-full mt-4 px-4 py-2 rounded-full bg-yellow-500 text-black hover:bg-yellow-600 font-smooch text-lg"
              >
                {loading ? "Identifying..." : "Identify Plant"}
              </button>
            </div>
          </div>

          {/* Right Section: Plant Information */}
          <div className="w-full lg:w-3/4 flex items-center justify-center">
            {plantData ? (
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full">
                <h2 className="text-3xl font-bold mb-4 text-green-500 font-smooch">
                  {plantData.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Plant Image */}
                  <div className="aspect-square w-full">
                    {plantData.image && (
                      <img
                        src={plantData.image}
                        alt="Plant"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>

                  {/* Plant Details */}
                  <div className="space-y-4 w-full">
                    {Object.entries(plantData).map(([key, value]) => {
                      // Skip rendering the "name" and "image" fields since they are already displayed
                      if (key === "name" || key === "image") return null;

                      return (
                        <div key={key} className="mb-4 w-full">
                          <h3 className="text-xl font-semibold text-green-400 capitalize font-smooch">
                            {key.replace(/_/g, " ")}
                          </h3>
                          <p className="text-lg text-gray-300 font-smooch">
                            {Array.isArray(value)
                              ? value.join(", ") // Join arrays into a comma-separated string
                              : typeof value === "object" && value !== null
                              ? JSON.stringify(value, null, 2) // Format objects as JSON strings
                              : value || "N/A"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <p className="text-center text-gray-400 text-3xl font-smooch">
                  Upload a plant image to get detailed information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Garden;