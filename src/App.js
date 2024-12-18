import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';
const App = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [error, setError] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Webcam, 3: Review
  const webcamRef = useRef(null);
  const url ="";

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models"; // Ensure models are stored in public/models directory
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL); // Load SSD MobileNet model
        console.log("FaceAPI models loaded successfully");
      } catch (error) {
        console.error("Error loading face-api models:", error);
      }
    };
    loadModels();
  }, []);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const idRegex = /^\d+$/;
   
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email.");
      return false;
    }
    if (emailRegex.test(email)) {
      setError(null);
      // return true;
    }
    if (!idRegex.test(id)) {
      setError("Please enter a valid id.");
      return false;
    }
    if (idRegex.test(email)) {
      setError(null);
      // return true;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmpassword){
      setError("password dont match !!")
      return false ;
    }
    if (password === confirmpassword){
      setError(null)
      // return true ;
    }
    setError("");
    return true;
  };

  const handleNext = (event) => {
    event.preventDefault()
    if (validateForm()) {
      setStep(2);
    }
  };
  const handlefinal = (event) => {
    event.preventDefault()
    if (validateForm()) {
      setStep(3);
    }
  };

  const capturePhoto = async (event) => {
    event.preventDefault();
    const image = webcamRef.current.getScreenshot();
    setImageSrc(image);

    // Perform face detection with higher confidence threshold and options
    const detections = await faceapi.detectAllFaces(
      webcamRef.current.video,
      new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.5, // Lower confidence threshold (0.5 is often a good middle ground)
        maxResults: 1, // We only want to detect one face at a time
      })
    );

    console.log("Detections:", detections); // Log detections for debugging

    // If detections found, check if the face is clear and centered
    if (detections.length > 0) {
      const face = detections[0]; // Assuming the first detected face is the desired one

      // Center check (this is optional but ensures it's a clear, centered face)
      const { box } = face;
      const faceCenterX = box.x + box.width / 2;
      const faceCenterY = box.y + box.height / 2;
      const videoCenterX = webcamRef.current.video.videoWidth / 2;
      const videoCenterY = webcamRef.current.video.videoHeight / 2;

      const threshold = 0.2; // Margin for centering

      if (
        Math.abs(faceCenterX - videoCenterX) < videoCenterX * threshold &&
        Math.abs(faceCenterY - videoCenterY) < videoCenterY * threshold
      ) {
        setIsFaceDetected(true);
        setStep(3);
      } else {
        alert("Please face the camera directly.");
        setIsFaceDetected(false);
      }
    } else {
      alert("No face detected. Please ensure you're facing the camera clearly.");
      setIsFaceDetected(false);
    }
  };
  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (file) {
      const reader = new FileReader(); // Create a FileReader instance

      reader.onload = () => {
        setImageSrc(reader.result); // Set the image src after reading
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  const saveReg = (event) => {
    const regData = {
      name,
      email,
      id,
      password,
      photo: imageSrc,
    };
    console.log("Registration Data:", regData);
    alert("Registration saved successfully!");
    event.preventDefault()
  };
  const submit= (e) => {
    e.preventDefault();
    Axios.post(url,{
      name : name,
      email :email,
      id : id,
      password : password,
      photo : imageSrc
    })
  };

  return (
    <form onSubmit={(e)=>submit(e)} >
    <div className="app-container">
      {step === 1 && (
        <div className="form-container">
          <h2 className="header">Registeration</h2>
          <div>
            <label>*Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="name"
              required
            />
          </div>
          <div>
            <label>*Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {setEmail(e.target.value)}}
              required
              placeholder="email"
            />
          </div>
          <div>
            <label>*ID:</label>
            <input
              type="text"
              value={id}
              onChange={(e) =>{setId(e.target.value)}}
              required
              placeholder="id"
            />
          </div>
          <div>
            <label>*Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {setPassword(e.target.value)}}
              required
              placeholder="password"
            />
          </div>
          <div>
            <label>*Confirm Password:</label>
            <input
              type="password"
              value={confirmpassword}
              onChange={(e) => {setConfirmpassword(e.target.value)}}
              required
              placeholder="confirm password"
            />
          </div>
          <div>
            <label>Your photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange= {handleImageUpload}
            />
            {imageSrc && <img src={imageSrc} alt="Uploaded Preview" style={{ width: "400px",height:"400px" ,marginTop: "20px" }} />}
          </div>

          
          {error && <p className="error-message">{error}</p>}
          <div className="submitContainer">
          <button type="button" className="cap" onClick={handleNext}>capture photo</button>
          <button type="button" className="upload" onClick={handlefinal}>upload done</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="webcam-container">
          <h2>Take a Photo</h2>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam"
            videoConstraints={{
              facingMode: "user",  // Ensure front-facing camera
              width: 1280,  // Higher resolution for better detection
              height: 720,  // Higher resolution
            }}
          />
          <button onClick={capturePhoto}>Capture Photo</button>
        </div>
      )}

      {step === 3 && (
        <div className="review-container">
          <h2>Review Your Details</h2>
          <p>Name: {name}</p>
          <p>ID: {id}</p>
          <p>Email: {email}</p>
          <p>Password: *******</p>
          <div>
            <h3>Your Photo:</h3>
            <img src={imageSrc} alt="Captured" className="captured-image" />
          </div>
          <button onClick={saveReg}>submit </button>
        </div>
      )}
    </div>
    </form>
  );
};

export default App;
