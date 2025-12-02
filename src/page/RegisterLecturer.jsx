
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Input from "../component/Input";
import Logo from "/trackAS.png";
import registerImg from "/registerImg.jpg";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "../component/Footer";

const RegisterLecturer = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!fullName || !email || !phoneNumber) {
      alert("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      // Sign up lecturer without email verification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if auth user was created
      if (!authData.user) {
        throw new Error("User creation failed. No user ID returned.");
      }

      // After successful signup, insert lecturer details into the 'lecturers' table
      const { data: insertData, error: insertError } = await supabase
        .from("lecturers")
        .insert([
          {
            auth_user_id: authData.user.id, // ✅ MUST ADD THIS LINE
            fullName: fullName,
            email: email,
            phone_number: phoneNumber,
            department: "Computer Science", // Optional field
          }
        ]);

      if (insertError) throw insertError;

      toast.success("Registration successful!");
      navigate("/loginLecturer");
    } catch (error) {
      console.error("Registration error:", error);
      
      // Show user-friendly error
      if (error.message.includes("auth_user_id")) {
        alert("Registration error: Could not link user account. Please try again.");
      } else if (error.message.includes("duplicate key")) {
        alert("This email is already registered.");
      } else if (error.message.includes("null value")) {
        alert("Missing required information. Please check all fields.");
      } else {
        alert(`Registration failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-[100vh]">
      <div className="grid md:grid-cols-2">
        <form
          onSubmit={handleRegister}
          className="px-6 lg:px-[133px] overflow-scroll h-[100vh]"
        >
          <div className="flex flex-col items-center">
            <img src={Logo} alt="logo" className="w-32 mt-8" />
            <h2 className="text-[#000D46] font-bold text-2xl mt-1 mb-2">
              Create Account
            </h2>
          </div>
          <div className="grid gap-y-4">
            <Input
              type="text"
              label="Full Name"
              placeholder="Enter your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Input
              type="tel"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn bg-[#000D46] font-bold text-base text-white btn-block mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="my-4 text-[#1E1E1E] text-center">
            Already have an account?{" "}
            <Link
              className="text-[#000D46] font-semibold"
              to={"/loginLecturer"}
            >
              Login
            </Link>
          </p>
        </form>

        <div className="max-[100%] hidden md:block">
          <img
            src={registerImg}
            alt="register hero image"
            className="h-[100vh] w-full object-cover"
          />
        </div>
      </div>
      <Footer />
    </section>
  );
};

 export default RegisterLecturer;