

import { useState, useEffect } from "react";
import Input from "../component/Input";
import MapModal from "../component/MapModal";
import QRCodeModal from "../component/QRCodeModal";
import scheduleImg from "../../public/scheduleImg.jpg";
import logo from "../../public/trackAS.png";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const APP_URL = import.meta.env.VITE_APP_URL || "http://localhost:5173";

const ClassSchedule = () => {
  const { userDetails } = useUserDetails();

  const [formData, setFormData] = useState({
    courseTitle: "",
    courseCode: "",
    lectureVenue: "",
    time: "",
    date: "",
    note: "",
    thresholdMeters: 50,
  });

  const [selectedLocationCordinate, setSelectedLocationCordinate] = useState(null);
  const [qrData, setQrData] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const lecturerId = userDetails?.id;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "thresholdMeters") {
      const numValue = parseInt(value, 10);
      if (numValue < 20) {
        setFormData({ ...formData, [name]: 20 });
      } else if (numValue > 100) {
        setFormData({ ...formData, [name]: 100 });
      } else {
        setFormData({ ...formData, [name]: numValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLocationChange = (locationName, coordinate) => {
    setFormData({ ...formData, lectureVenue: locationName });
    setSelectedLocationCordinate(coordinate);
  };

  const generateQRCodeDataURL = (value) => {
    return new Promise((resolve) => {
      const svg = document.createElement("div");
      const qrCode = <QRCodeSVG value={value} size={256} />;
      import("react-dom/client").then((ReactDOM) => {
        ReactDOM.createRoot(svg).render(qrCode);
        setTimeout(() => {
          const svgString = new XMLSerializer().serializeToString(
            svg.querySelector("svg")
          );
          const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
          resolve(dataUrl);
        }, 0);
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    if (!lecturerId) {
      toast.error("Lecturer information not found");
      setIsGenerating(false);
      return;
    }

    if (!formData.courseTitle || !formData.courseCode || !formData.lectureVenue || !formData.time || !formData.date) {
      toast.error("Please fill in all required fields");
      setIsGenerating(false);
      return;
    }

    try {
      let locationGeography = null;
      if (selectedLocationCordinate) {
        locationGeography = `SRID=4326;POINT(${selectedLocationCordinate.lng} ${selectedLocationCordinate.lat})`;
      }

      const { courseTitle, courseCode, lectureVenue, time, date, note, thresholdMeters } = formData;

      const uniqueCourseId = `${courseCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const attendanceLink = `${APP_URL}/attendance?courseId=${encodeURIComponent(
        uniqueCourseId
      )}&time=${encodeURIComponent(time)}&courseCode=${encodeURIComponent(
        courseCode
      )}&lat=${selectedLocationCordinate?.lat}&lng=${
        selectedLocationCordinate?.lng
      }&threshold=${thresholdMeters}`;

      const qrCodeDataUrl = await generateQRCodeDataURL(attendanceLink);

      const { data, error } = await supabase
        .from("classes")
        .insert([
          {
            course_title: courseTitle,
            course_code: courseCode,
            time: new Date(`${date}T${time}`).toISOString(),
            date: new Date(date).toISOString(),
            location: locationGeography,
            note: note,
            qr_code: qrCodeDataUrl,
            lecturer_id: lecturerId,
            location_name: lectureVenue,
            course_id: uniqueCourseId,
            threshold_meters: thresholdMeters,
            attendees: []
          },
        ])
        .select("*");

      if (error) {
        toast.error(`Error creating class: ${error.message}`);
        setIsGenerating(false);
        return;
      }

      toast.success("Class schedule created successfully!");
      
      const generatedClass = data[0];
      const finalCourseId = generatedClass?.course_id || uniqueCourseId;
      
      const finalQRData = `${APP_URL}/attendance?courseId=${encodeURIComponent(
        finalCourseId
      )}&time=${encodeURIComponent(time)}&courseCode=${encodeURIComponent(
        courseCode
      )}&lat=${selectedLocationCordinate?.lat}&lng=${
        selectedLocationCordinate?.lng
      }&threshold=${thresholdMeters}`;

      setQrData(finalQRData);
      setIsQRModalOpen(true);
      
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row max-h-[100vh] bg-gray-100">
        <div className="w-full md:w-1/2 p-4 md:p-4 flex flex-col justify-center">
          <div className="mb-4">
            <Link to="/classDetails">
              <button className="btn btn-sm rounded-full bg-blue-500 border-none text-white">
                Back
              </button>
            </Link>
          </div>

          <div className="w-full max-w-2xl h-[90vh] overflow-y-auto">
            <div className="items-center flex self-center justify-center mb-4">
              <img src={logo} alt="logo" />
            </div>

            <form onSubmit={handleSubmit} className="py-0">
              <Input
                label="Course Title"
                name="courseTitle"
                type="text"
                onChange={handleInputChange}
                value={formData.courseTitle}
                required={true}
              />
              <Input
                label="Course Code"
                name="courseCode"
                type="text"
                onChange={handleInputChange}
                value={formData.courseCode}
                required={true}
              />

              <div className="relative mb-4">
                <Input
                  label="Lecture Venue"
                  name="lectureVenue"
                  type="text"
                  placeholder="Select location"
                  value={formData.lectureVenue}
                  readOnly
                  required={true}
                />
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="btn absolute right-0 top-9 px-3 bg-green-500 text-white rounded-r-md"
                >
                  Select
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance Threshold: {formData.thresholdMeters}m
                </label>
                <input
                  type="range"
                  name="thresholdMeters"
                  min="20"
                  max="100"
                  step="5"
                  value={formData.thresholdMeters}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  name="time"
                  type="time"
                  label="Time"
                  onChange={handleInputChange}
                  value={formData.time}
                  required={true}
                />
                <Input
                  name="date"
                  type="date"
                  label="Date"
                  onChange={handleInputChange}
                  value={formData.date}
                  required={true}
                />
              </div>

              <Input
                label="Note"
                name="note"
                type="text"
                onChange={handleInputChange}
                value={formData.note}
              />
              
              {selectedLocationCordinate && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Selected Location
                  </p>
                  <p className="text-xs text-gray-600">
                    Lat: {selectedLocationCordinate.lat.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Lng: {selectedLocationCordinate.lng.toFixed(6)}
                  </p>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full btn bg-blue-500 text-white hover:bg-blue-600 mt-4"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate QR Code"}
              </button>
            </form>
          </div>
        </div>

        <div className="hidden md:flex w-1/2 h-screen items-center justify-center overflow-hidden">
          <img
            src={scheduleImg}
            alt="Student"
            className="object-cover w-full h-full"
          />
        </div>

        {isMapModalOpen && (
          <MapModal
            onClose={() => setIsMapModalOpen(false)}
            onSelectLocation={handleLocationChange}
          />
        )}

        {isQRModalOpen && (
          <QRCodeModal
            qrData={qrData}
            onClose={() => setIsQRModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

 export default ClassSchedule;