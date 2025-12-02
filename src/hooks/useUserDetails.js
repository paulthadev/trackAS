


import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session && session.user) {
          // FIRST: Try to fetch by auth_user_id (new registration method)
          const { data: userData, error: userError } = await supabase
            .from("lecturers")
            .select("*")
            .eq("auth_user_id", session.user.id)
            .single();

          if (userError) {
            // If not found by auth_user_id, try by email (backward compatibility)
            if (userError.code === "PGRST116") {
              console.log("Trying to fetch by email as fallback...");
              
              const { data: emailData, error: emailError } = await supabase
                .from("lecturers")
                .select("*")
                .eq("email", session.user.email)
                .single();

              if (emailError) {
                if (emailError.code === "PGRST116") {
                  setError("Lecturer profile not found. Please complete your registration.");
                } else {
                  throw emailError;
                }
              } else if (emailData) {
                setUserDetails(emailData);
              }
            } else {
              throw userError;
            }
          } else if (userData) {
            setUserDetails(userData);
          }
        } else {
          setError("User is not logged in.");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error(
          `${`${
            error.message === "TypeError: Failed to fetch"
              ? "Please, check your Internet connection"
              : error.message
          }`}`
        );
        setError(
          `${
            error.message === "TypeError: Failed to fetch"
              ? "Please, check your Internet connection"
              : error.message
          }`
        );
      }
    };

    fetchUserDetails();
  }, []);

  return { userDetails, userDetailsError: error };
};

 export default useUserDetails;