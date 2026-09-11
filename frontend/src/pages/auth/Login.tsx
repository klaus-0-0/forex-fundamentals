import { useState, useEffect } from "react";
import type { FC, ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";
import wall from "../../assets/loginBI.png";
import config from "../../config";

// TypeScript Interfaces
interface LoginFormData {
  email: string;
  password: string;
}

// interface CsrfTokenResponse {
//   csrfToken: string;
// }

interface LoginResponse {
  user?: {
    role: string;
    id: string;
    email: string;
    username: string;
  };
  token?: string;
  message?: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

axios.defaults.withCredentials = true;

const Login: FC = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  // const [csrfToken, setCsrfToken] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const userRole = parsedData.role;

        if (userRole === "ADMIN") {
          navigate("/admindashboard");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("userData");
      }
    }
  }, [navigate]);

  // Fetch CSRF Token
  // useEffect(() => {
  //   const fetchCsrfToken = async (): Promise<void> => {
  //     try {
  //       const res: AxiosResponse<CsrfTokenResponse> = await axios.get(
  //         `${config.apiUrl}/csrf-token`
  //       );
  //       setCsrfToken(res.data.csrfToken);
  //     } catch (error) {
  //       const err = error as AxiosError<ApiErrorResponse>;
  //       console.error("Failed to fetch CSRF token:", err.message);
  //       setError("Failed to initialize security. Please refresh the page.");
  //     }
  //   };

  //   fetchCsrfToken();
  // }, []);

  // Handle Input Changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (error) setError("");
  };

  // Handle Form Submission
  const handleLogin = async (): Promise<void> => {
    // Validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    // if (!csrfToken) {
    //   setError("Security token not loaded. Please refresh the page.");
    //   return;
    // }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res: AxiosResponse<LoginResponse> = await axios.post(
        `${config.apiUrl}/login`,
        formData,
        {
          headers: {
            // "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      // Store user data in localStorage
      if (res.data.user) {
        localStorage.setItem("userData", JSON.stringify(res.data.user));
      }

      // Store token if available
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
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
      console.error("Login Error:", err.response?.data || err.message);

      // Handle specific error cases
      if (err.response?.status === 403) {
        setError("Session expired. Please refresh and try again.");
      } else if (err.response?.status === 404) {
        setError("User not found. Please check your email.");
      } else if (err.response?.status === 401) {
        setError("Invalid credentials. Please try again.");
      } else if (err.response?.status === 400) {
        setError("Bad request. Please check your input.");
      } else if (err.response?.status === 429) {
        setError("Too many attempts. Please try again later.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter Key Press
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  // Handle Navigation
  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  // Toggle Password Visibility
  const togglePasswordVisibility = (): void => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <img
        src={wall}
        alt="Login Background"
        className="absolute w-full h-full object-cover opacity-100"
        loading="lazy"
      />

      {/* Navigation Bar */}
      <nav className="w-full bg-transparent p-4 flex justify-end relative z-10">
        <div className="flex flex-wrap items-center justify-end gap-2 md:gap-6">
          <button
            className="text-white font-bold text-sm md:text-base hover:text-gray-300 transition-colors"
            onClick={() => handleNavigation("")}
            disabled={loading}
          >
            About
          </button>
          <button
            className="bg-black hover:bg-gray-800 text-white py-1 px-2 md:py-2 md:px-4 rounded font-medium text-sm md:text-base transition cursor-pointer disabled:opacity-50"
            onClick={() => handleNavigation("/signup")}
            disabled={loading}
          >
            Sign up
          </button>
          <button
            className="bg-white hover:bg-gray-200 text-black border border-black py-1 px-2 md:py-2 md:px-4 rounded font-medium text-sm md:text-base transition cursor-pointer disabled:opacity-50"
            onClick={() => handleNavigation("/login")}
            disabled={loading}
          >
            Log in
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center lg:justify-start p-4 relative z-10">
        <div className="w-full max-w-md lg:ml-60 bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black">Welcome Back</h2>
            <p className="text-black mt-2">Sign in to your account</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => handleNavigation("/forgot-password")}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <button
                className="w-full bg-pink-600 hover:bg-pink-900 text-white py-3 px-4 rounded font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleLogin}
                // disabled={loading || !csrfToken}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-700 text-sm">
              Don't have an account?{" "}
              <button
                className="text-pink-600 hover:text-pink-800 font-semibold cursor-pointer hover:underline"
                onClick={() => handleNavigation("/signup")}
                disabled={loading}
              >
                Sign up here
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login Options (Optional) */}
            <div className="mt-4 flex justify-center gap-4">
              <button
                className="p-2 border rounded hover:bg-gray-50"
                disabled={loading}
                aria-label="Login with Google"
              >
                G
              </button>
              <button
                className="p-2 border rounded hover:bg-gray-50"
                disabled={loading}
                aria-label="Login with Facebook"
              >
                f
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;