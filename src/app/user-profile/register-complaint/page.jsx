"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  MapPin, 
  FileText, 
  Camera, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  X,
  RotateCcw
} from "lucide-react";

export default function Page() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    assignedDepartment: "",
    latitude: "",
    longitude: "",
    address: ""
  });
  
  // File and UI state
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  // Issue types and departments
  // const issueTypes = [
  //   { value: "pothole", label: "Pothole" },
  //   { value: "streetlight_broken", label: "Street Light" },
  //   { value: "garbage_dumping", label: "Garbage Collection" },
  //   { value: "water_supply", label: "Water Supply" },
  //   { value: "sewage", label: "Sewage Problem" },
  //   { value: "road_damage", label: "Road Damage" },
  //   { value: "traffic_signal", label: "Traffic Signal" },
  //   { value: "illegal_construction", label: "Illegal Construction" },
  //   { value: "noise_pollution", label: "Noise Pollution" },
  //   { value: "other", label: "Other" }
  // ];
  const issueTypes = "pothole";

  // const departments = [
  //   { value: "PWD", label: "Public Works Department (PWD)" },
  //   { value: "NRDA", label: "Naya Raipur Development Authority (NRDA)" },
  //   { value: "NRMC", label: "Naya Raipur Municipal Corporation (NRMC)" },
  //   { value: "Electricity", label: "Electricity Department" },
  //   { value: "Water", label: "Water Supply Department" },
  //   { value: "Traffic", label: "Traffic Police" },
  //   { value: "Environment", label: "Environment Department" },
  //   { value: "", label: "Auto-assign based on issue type" }
  // ];

  const departments = "PWD";

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
        setError("");
      } else {
        setError("Please select a valid image file");
      }
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        try {
          setFormData(prev => ({
            ...prev,
            address: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        } catch (error) {
          console.log("Error getting address:", error);
        }
        
        setLocationLoading(false);
      },
      (error) => {
        setError("Unable to retrieve your location");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError("Please upload an image of the issue");
      return;
    }
    
    if (!formData.description.trim()) {
      setError("Please provide a description of the issue");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const submitData = new FormData();
      submitData.append("file", selectedFile);
      submitData.append("issue-type", "pothole");
      submitData.append("description", formData.description);
      submitData.append("assigned-dept", "PWD");
      
      if (formData.latitude && formData.longitude) {
        submitData.append("latitude", formData.latitude);
        submitData.append("longitude", formData.longitude);
      }
      
      if (formData.address) {
        submitData.append("address", formData.address);
      }

      const response = await axios.post("/api/users/register-complaint", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          router.push(`/user-profile/track-complaint`);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setError(
        error.response?.data?.message || 
        "Failed to submit complaint. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-cyan-100 mb-2">
              Complaint Submitted Successfully!
            </h1>
            <p className="text-cyan-400">
              Your complaint has been registered and will be processed soon.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800 text-sm">
              You will be redirected to the tracking page in a few seconds...
            </p>
          </div>
          
          <button
            onClick={() => router.push("/user-profile/track-complaint")}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Track Your Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-4 md:p-6 text-cyan-50 font-mono">
      {/* Holographic Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2 uppercase tracking-widest drop-shadow-[0_0_8px_currentColor]">
            Register New Complaint
          </h1>
          <p className="text-cyan-50 text-lg">
            Report an issue in your area and help improve your community
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError("")} className="ml-auto">
              <X className="text-red-400 hover:text-red-600" size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] p-6">
            <h2 className="text-xl font-bold text-cyan-300 mb-4 flex items-center tracking-widest uppercase">
              <Camera className="mr-2 text-cyan-500" size={24} />
              Upload Image
            </h2>
            
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cyan-500/50 rounded-xl p-8 text-center hover:border-cyan-400 hover:bg-cyan-950/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer"
              >
                <Upload className="mx-auto text-cyan-600 mb-4" size={48} />
                <p className="text-cyan-100 font-bold mb-2">Click to upload an image of the issue</p>
                <p className="text-sm text-cyan-600">Supports: JPG, PNG, GIF (Max 10MB)</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Issue Details */}
          <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] p-6">
            <h2 className="text-xl font-bold text-cyan-300 mb-4 flex items-center tracking-widest uppercase">
              <FileText className="mr-2 text-cyan-500" size={24} />
              Issue Details
            </h2>
            
            <div className="space-y-4">
              {/* Issue Type */}
              

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-cyan-400 mb-2 tracking-widest uppercase">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full px-4 py-3 bg-black border border-cyan-500/50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none text-cyan-50 placeholder-cyan-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] p-6">
            <h2 className="text-xl font-bold text-cyan-300 mb-4 flex items-center tracking-widest uppercase">
              <MapPin className="mr-2 text-cyan-500" size={24} />
              Location Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center justify-center space-x-2 bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold uppercase tracking-widest text-xs px-4 py-3 rounded-xl hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-500 disabled:shadow-none transition-all"
                >
                  {locationLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <MapPin size={20} />
                  )}
                  <span>
                    {locationLoading ? "Acquiring Fix..." : "Get GPS Fix"}
                  </span>
                </button>
              </div>

              {/* Manual Location Input */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-cyan-400 mb-2 tracking-widest uppercase">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="any"
                    placeholder="e.g., 21.205726"
                    className="w-full px-4 py-3 bg-black border border-cyan-500/50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-cyan-50 placeholder-cyan-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-cyan-400 mb-2 tracking-widest uppercase">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    step="any"
                    placeholder="e.g., 81.824707"
                    className="w-full px-4 py-3 bg-black border border-cyan-500/50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-cyan-50 placeholder-cyan-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-cyan-400 mb-2 tracking-widest uppercase">
                  Address / Vector Details
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g., Area 51 Main Gate"
                  className="w-full px-4 py-3 bg-black border border-cyan-500/50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-cyan-50 placeholder-cyan-800"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.1)] p-6">
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile || !formData.description.trim()}
              className="w-full bg-cyan-500/10 border border-cyan-400 text-cyan-300 font-bold uppercase tracking-widest text-sm py-4 px-6 rounded-xl hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-500 disabled:shadow-none transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Transmitting Data...</span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>Submit Data Log</span>
                </>
              )}
            </button>
            
            <p className="text-sm text-cyan-500 text-center mt-3">
              * Image and description are required fields
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}