

/* this one feature1-theshould code */

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { calculateDistance } from "../utils/distanceCalculation";
import Input from "../component/Input";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";
import Spinner from "../component/Spinner";
import dayjs from "dayjs";
import logo from "../../public/trackAS.png";
//everything 
const StudentLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [isLoading, setIsLoading] = useState(false);

  const [userDistance, setUserDistance] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [classDetails, setClassDetails] = useState(null);
  const [matricNumber, setMatricNumber] = useState("");
  const [name, setName] = useState("");
  const [thresholdMeters, setThresholdMeters] = useState(50);
  const [locationStatus, setLocationStatus] = useState(""); 

  const courseId = queryParams.get("courseId");
  const courseCode = queryParams.get("courseCode");
  const lat = parseFloat(queryParams.get("lat"));
  const lng = parseFloat(queryParams.get("lng"));
  const thresholdFromURL = parseInt(queryParams.get("threshold")) || 50;

  useEffect(() => {
    const fetchClassDetails = async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("course_id", courseId)
        .single();

      if (error) {
        console.error("Error fetching class details:", error);
      } else {
        setClassDetails(data);
        //  Use threshold from database if available, otherwise from URL
        const dbThreshold = data?.threshold_meters || thresholdFromURL;
        setThresholdMeters(dbThreshold);
        console.log("Threshold set to:", dbThreshold);
      }
    };

    fetchClassDetails();
  }, [courseId, thresholdFromURL]);

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            const distance = calculateDistance(userLat, userLng, lat, lng);
            setUserDistance(distance);

            // UPDATED: Check if the distance is within threshold
            const withinRange = distance <= thresholdMeters;
            setIsWithinRange(withinRange);
            
            //  NEW: Set status message
            if (withinRange) {
              setLocationStatus(` You are within ${thresholdMeters}m range (${distance.toFixed(1)}m)`);
            } else {
              setLocationStatus(` You are ${(distance - thresholdMeters).toFixed(1)}m outside ${thresholdMeters}m range`);
            }
          },
          (error) => {
            toast.error(`Error getting user location., ${error.message}`);
            setLocationStatus(" Failed to get your location");
          }
        );
      } else {
        toast.error("Geolocation is not supported by this browser.");
        setLocationStatus("Geolocation not supported");
      }
    };

    getUserLocation();
  }, [lat, lng, thresholdMeters]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!matricNumber) {
      toast.error("Matriculation number is required.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from("classes")
      .select("attendees")
      .eq("course_id", courseId)
      .single();

    if (error) {
      toast.error(`Error fetching class data: ${error.message}`);
      setIsLoading(false);
      return;
    }

    const { attendees = [] } = data;

    // Check if the matriculation number already exists
    const matricNumberExists = attendees.some(
      (attendee) => attendee.matric_no === matricNumber.trim().toUpperCase()
    );

    if (matricNumberExists) {
      toast.error("This matriculation number has already been registered.");
      setIsLoading(false);
      return;
    }

    const newAttendee = {
      matric_no: matricNumber.trim().toUpperCase(),
      name: name.toUpperCase(),
      timestamp: new Date().toISOString(),
      distance: userDistance?.toFixed(1), //  NEW: Store distance in attendance record
      within_threshold: isWithinRange, //  NEW: Store if within threshold
      threshold_used: thresholdMeters //  NEW: Store threshold used
    };

    const updatedAttendees = [...attendees, newAttendee];

    const { error: updateError } = await supabase
      .from("classes")
      .update({ attendees: updatedAttendees })
      .eq("course_id", courseId);

    if (updateError) {
      toast.error(`Error marking attendance: ${updateError.message}`);
    } else {
      toast.success("Attendance marked successfully.");

      // Clear input fields
      setMatricNumber("");
      setName("");
      setIsLoading(false);

      // Redirect to success page
      navigate("/success", { replace: true });
    }
  };

  return (
    <section className="studentLogin h-screen grid place-items-center ">
      <div className="bg-white px-6 py-4 md:px-16 max-w-3xl rounded-xl">
        <div className="items-center flex self-center justify-center">
          <img src={logo} alt="logo" />
        </div>
        <h2 className="text-[2.5rem] text-[#000D46] text-center font-bold mb-2">
          TrackAS
        </h2>
        {classDetails && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#000D46] font-bold">
                Title: {classDetails.course_title}
              </p>
              <p className="text-[#000D46] font-bold">Code: {courseCode}</p>
              <p className="text-[#000D46] font-bold">
                Venue: {classDetails.location_name}
              </p>
              <p className="text-[#000D46] font-bold">
                Date: {dayjs(classDetails.date).format("DD MMMM, YYYY")}
              </p>
              <p className="text-[#000D46] font-bold">
                Time:{" "}
                {new Date(classDetails.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <p className="text-[#000D46] mb-2 text-lg font-bold">
                Note: {classDetails.note}
              </p>
              
              {/*  UPDATED: Distance information with threshold */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-[#000D46] font-bold">
                  📍 Location Verification
                </p>
                <p className="text-sm">
                  Distance to venue:{" "}
                  <span className="font-bold">
                    {userDistance ? `${userDistance.toFixed(2)} meters` : "Calculating..."}
                  </span>
                </p>
                <p className="text-sm">
                  Allowed threshold:{" "}
                  <span className="font-bold">{thresholdMeters} meters</span>
                </p>
                <p className={`text-sm font-bold ${isWithinRange ? 'text-green-600' : 'text-red-600'}`}>
                  {locationStatus || "Checking location..."}
                </p>
                
                {/*  NEW: Visual indicator */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>0m</span>
                    <span>Threshold: {thresholdMeters}m</span>
                    <span>100m+</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${isWithinRange ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ 
                        width: `${Math.min((userDistance || 0) / 100 * 100, 100)}%`,
                        maxWidth: '100%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleRegister}>
          <Input
            type="text"
            name="name"
            label="Name"
            placeholder={"Enter your name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="text"
            name="matricNumber"
            label="Matriculation Number"
            placeholder={"Your matriculation number"}
            value={matricNumber}
            onChange={(e) => setMatricNumber(e.target.value)}
          />

          {isWithinRange ? (
            <button className="btn my-5 btn-block text-lg" type="submit">
              {isLoading ? <Spinner /> : "Mark Attendance"}
            </button>
          ) : (
            <div className="p-3 bg-red-50 rounded-lg mt-3">
              <p className="text-red-600 font-bold">
                 Cannot Mark Attendance
              </p>
              <p className="text-sm text-red-500">
                You must be within {thresholdMeters} meters of the lecture venue to register.
                {userDistance && (
                  <span className="block">
                    Current distance: {userDistance.toFixed(1)}m
                    ({Math.abs(userDistance - thresholdMeters).toFixed(1)}m outside range)
                  </span>
                )}
              </p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

 export default StudentLogin;