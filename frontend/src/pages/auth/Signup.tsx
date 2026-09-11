import { useState, useEffect } from "react";
import type { FC, ChangeEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type{ AxiosError, AxiosResponse } from "axios";
import axios from "axios";
import wall from "../../assets/SignBI.jpg";
import config from "../../config";

// TypeScript interfaces
interface SignupFormData {
  username: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
}

// interface CsrfTokenResponse {
//   csrfToken: string;
// }

interface SignupResponse {
  user?: {
    role: string;
  };
  userData?: {
    id: string;
    username: string;
    email: string;
    // role: string;
  };
  message?: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

axios.defaults.withCredentials = true;

const Signup: FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });

//   const [csrfToken, setCsrfToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Initialize user data if already logged in
  useEffect(() => {
    const userInfo = localStorage.getItem("user-info");
    if (userInfo) {
      navigate("/Dashboard");
    }
  }, [navigate]);

  // Fetch CSRF token on component mount
//   useEffect(() => {
//     const fetchCsrfToken = async (): Promise<void> => {
//       try {
//         const res: AxiosResponse<CsrfTokenResponse> = await axios.get(
//           `${config.apiUrl}/csrf-token`,
//           {  
//             withCredentials: true
//           }
//         );
//         setCsrfToken(res.data.csrfToken);
//       } catch (error) {
//         const err = error as AxiosError<ApiErrorResponse>;
//         console.error("Failed to fetch CSRF token", err.message);
//         setError("Failed to initialize security token. Please refresh the page.");
//       }
//     };

//     fetchCsrfToken();
//   }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    if (name === "role") {
      // Type assertion for role field
      setFormData(prev => ({
        ...prev,
        [name]: value as "USER" | "ADMIN"
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSignup = async (e?: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e?.preventDefault();
    
    // Validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    // if (!csrfToken) {
    //   setError("Security token not available. Please refresh the page.");
    //   return;
    // }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res: AxiosResponse<SignupResponse> = await axios.post(
        `${config.apiUrl}/signup`,
        formData,
        {
          headers: {
            // "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      console.log("Signup response:", res.data);
      
      // Store user data
      if (res.data.userData) {
        localStorage.setItem("userData", JSON.stringify(res.data.userData));
      }

      // Navigate based on role
      const userRole = res.data.user?.role;
      if (userRole === "ADMIN") {
        navigate("/admindashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      console.error("Signup Failed:", err.response?.data || err.message);
      
      // Handle specific errors
      if (err.response?.status === 403) {
        setError("Security token expired. Please refresh the page.");
      } else if (err.response?.status === 409) {
        setError("Username or email already exists.");
      } else if (err.response?.status === 400) {
        setError("Invalid input. Please check your details.");
      } else {
        setError(err.response?.data?.message || "Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <img
        src={wall}
        alt="Background"
        className="absolute w-full h-full object-cover opacity-100"
        loading="lazy"
      />

      {/* Navigation Bar */}
      <nav className="w-full bg-transparent p-4 flex justify-end relative z-10 border-b-2">
        <div className="flex flex-wrap items-center justify-end gap-2 md:gap-6">
          <button
            className="text-black font-bold text-sm md:text-base hover:text-cyan-700 transition-colors"
            onClick={() => handleNavigation("")}
          >
            About
          </button>
          <button
            className="bg-black hover:bg-cyan-700 text-white py-1 px-2 md:py-2 md:px-4 rounded font-medium text-sm md:text-base transition cursor-pointer disabled:opacity-50"
            onClick={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Sign up"}
          </button>
          <button
            className="bg-white hover:bg-cyan-700 text-black border border-b-white py-1 px-2 md:py-2 md:px-4 rounded font-medium text-sm md:text-base transition cursor-pointer hover:text-white"
            onClick={() => handleNavigation("/login")}
          >
            Log in
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center lg:justify-start p-4 relative z-10">
        <div className="w-full max-w-md lg:ml-80 bg-transparent bg-opacity-90 p-6 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-300">Create Account</h2>
            <p className="text-gray-400 mt-2">Welcome to our platform</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form className="space-y-4">
            <input
              type="text"
              name="username"
              className="w-full border border-b-white text-white rounded p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              required
            />

            <input
              type="email"
              name="email"
              className="w-full border border-b-white text-white rounded p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              required
            />

            <input
              type="password"
              name="password"
              className="w-full border border-b-white text-white rounded p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Create a password (min. 6 characters)"
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              minLength={6}
              required
            />
{/* 
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full border border-b-white text-white rounded p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-white"
              disabled={isLoading}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select> */}

            <div className="flex justify-center pt-4 gap-4">
              <button
                type="button"
                className="w-50 bg-gray-800 hover:bg-cyan-700 text-white py-2 px-4 rounded font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign up"}
              </button>
              <button
                type="button"
                className="w-50 bg-white hover:bg-cyan-700 text-black border border-b-white py-2 px-4 rounded font-medium transition cursor-pointer hover:text-white"
                onClick={() => handleNavigation("/login")}
                disabled={isLoading}
              >
                Log in
              </button>
            </div>

            {/* Terms and Conditions */}
            <div className="text-center text-sm text-gray-500 mt-6">
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-cyan-600 hover:underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-cyan-600 hover:underline">
                Privacy Policy
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
