// Login.jsx - Component for user authentication login

// Import necessary hooks and utilities
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  // State management for form fields and UI states
  const [email, setEmail] = useState(""); // User email input
  const [password, setPassword] = useState(""); // User password input
  const [error, setError] = useState(""); // Error message display
  const [loading, setLoading] = useState(false); // Loading state for submission

  // Hooks for navigation and context
  const navigate = useNavigate();
  const { login } = useAuth(); // Authentication context
  const { isDarkMode } = useTheme(); // Theme context

  const backgroundImage = "images/bg-pic4.jpg";

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(""); // Clear any existing errors
      setLoading(true); // Start loading state
      await login(email, password); // Attempt login
      navigate("/dashboard"); // Redirect on success
    } catch (error) {
      setError("Failed to login. Please check your credentials.");
    }
    setLoading(false); // End loading state
  };

  return (
    <div
      // Main container with theme-aware background and background image
      className={`min-h-screen flex items-center justify-center transition-colors duration-200  ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md px-6">
        <div
          className={`rounded-2xl shadow-xl overflow-hidden transition-colors duration-200 ${
            isDarkMode ? "bg-gray-800/90" : "bg-white/90"
          }`}
        >
          {/* Header Section */}
          <div
            className={`px-8 py-6 ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-600/95 to-blue-500/95"
                : "bg-gradient-to-r from-blue-500/95 to-blue-400/95"
            }`}
          >
            {/* Card container with theme-aware styling */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome Back!
              </h1>
              <p className={`${isDarkMode ? "text-blue-100" : "text-blue-50"}`}>
                Sign in to continue to DeTask
              </p>
            </div>
          </div>

          {/* Rest of the component remains the same */}
          {/* Form Section */}
          <div className="p-8 backdrop-blur-sm">
            {error && (
              <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email input field */}
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password input field */}
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Submit button with loading state */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Sign up link */}
            <div className="mt-6 text-center">
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className={`font-medium transition duration-200 ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
