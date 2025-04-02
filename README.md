# Green-Thumb

A Digital Plant Care Assistant + IoT

## Description
Green-Thumb is a React web-app providing useful features for gardeners and plant enthusiasts. It combines plant care knowledge with IoT technology to help users maintain healthy plants.

## Features
- Provides general plant care tips based on plant type
- Features plant and disease identification through photo analysis (plant.id)
- Includes a community platform for sharing tips and experiences
- Integrates IoT for real-time monitoring of temperature, humidity, and moisture levels
- Manual and auto mode for watering of plants with option to set the threshold moisture values 
- Built using React, Firebase- Realtime DB and Firestore, ESP32 WiFi module, and sensors
- Tried Connecting it to a webhook to get current status via voice commands via google assisstant
## Technologies
- React.js
- Firebase (Realtime Database & Firestore)
- ESP32 WiFi module
- Various sensors (temperature, humidity, moisture)

## Installation

### Web Application
```
git clone https://github.com/yourusername/green-thumb.git
cd green-thumb
npm install
npm run dev
```

### IoT Configuration
1. Set up your ESP32 with Arduino IDE
2. Connect temperature, humidity, and moisture sensors
3. Flash the provided code to your ESP32
4. Connect to your home WiFi network

