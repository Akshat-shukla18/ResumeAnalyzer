import { useState } from "react";

const AuthForm = ({ onClose, onSignIn }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setError("");
    setIsSignup(!isSignup);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const url = isSignup ? `${backendBaseUrl}/api/auth/signup` : `${backendBaseUrl}/api/auth/signin`;
    const payload = isSignup
      ? { username: formData.username, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Authentication failed");
        setLoading(false);
        return;
      }

      // Save token to localStorage or handle as needed
      localStorage.setItem("token", data.token);
      setLoading(false);
      if (onSignIn) {
        onSignIn(data.user || { username: formData.username });
      }
      onClose();
      alert(isSignup ? "Signup successful!" : "Signin successful!");
    } catch (err) {
      setError("Server error");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="relative w-[28rem] max-w-full rounded-xl bg-white p-10 shadow-lg">
        {/* Animated glowing background */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 opacity-70 blur-3xl animate-animateGlow"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">{isSignup ? "Create Account" : "Sign In"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            {isSignup && (
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md py-3 font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
            >
              {loading ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={toggleMode} className="text-indigo-600 font-semibold hover:underline">
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-2xl font-bold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
