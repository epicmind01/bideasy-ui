"use client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLastIcon, Eye, EyeClosed } from "lucide-react";
import { useAuth } from "../../hooks/API/useAuth";

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // For demo purposes, use static credentials
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }


};

  return (
    
 <div className="flex flex-col bg-gradient-to-br from-slate-100/30 via-white to-blue-100/20 flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-sm text-slate-600 transition-all duration-200 hover:text-blue-600 font-medium"
    >
      <ChevronLastIcon  />
      Back to dashboard
    </Link>
  </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
         <div className="mb-6 max-w-md mx-auto text-left relative">
  <h1 className="mb-5 font-bold text-blue-400/80 text-3xl sm:text-4xl tracking-wide leading-tight">
    Sign In
  </h1>
  <div className="absolute left-0 top-10 w-7 h-1 rounded-full bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 opacity-70"></div>
  <p className="mt-3 text-gray-400 dark:text-gray-400 text-sm sm:text-base max-w-sm leading-relaxed font-medium">
    Enter your email and password to sign in!
  </p>
</div>

          <div>
           
            <div className="mb-2 relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Log Into Account
                </span>
              </div>
            </div>
      {error && (
  <div
    role="alert"
    className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 px-5 py-3 text-sm text-red-400 shadow-sm opacity-100 animate-[fadeIn_0.6s_ease-in-out]"
  >
    <svg
      className="h-6 w-6 flex-shrink-0 text-red-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
    <p className="flex-1 leading-relaxed font-semibold tracking-wide">{error}</p>
  </div>
)}


            <form onSubmit={handleSubmit}>
  <div className="space-y-6">
    <div>
      
      <label className="text-sm font-medium text-slate-500 mb-2 block">
        Email address<span className="ml-1 text-red-500">*</span>
      </label>
      <input 
        name="email"
        placeholder="info@gmail.com" 
        type="email" 
        required
        className="w-full px-4 py-4 border border-blue-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200/20 focus:border-blue-200 transition-all duration-300 bg-white/70 backdrop-blur-sm text-slate-900 placeholder-slate-400 shadow-sm hover:shadow-md  hover:border-slate-300/80 group-hover:bg-white/90"
      />
    </div>
    <div>
      <label className="text-sm font-medium text-slate-500 mb-2 block">
        Password<span className="ml-1 text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          required
          className="w-full px-4 py-4 border border-blue-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200/20 focus:border-blue-200 transition-all duration-300 bg-white/70 backdrop-blur-sm text-slate-900 placeholder-slate-400 shadow-sm hover:shadow-md  hover:border-slate-300/80 group-hover:bg-white/90"
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
        >
          {showPassword ? (
            <Eye  />
          ) : (
            <EyeClosed />
          )}
        </span>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="remember"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-slate-500 font-medium">
                  Remember Me
                </label>
              </div>
      <Link
        to="#"
        className="text-sm text-blue-400 hover:text-blue-500 dark:text-brand-400"
      >
        Forgot password?
      </Link>
    </div>
    <div>
      <button
  type="submit"
  disabled={loading}
  className="relative w-full px-7 py-4 text-md font-bold text-gray-500/70 bg-blue-200/70  rounded-2xl overflow-hidden backdrop-blur-md shadow-[0_8px_20px_rgba(125,211,252,0.3)]  hover:scale-[1.015] active:scale-100 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
>
  <span className="relative z-10">
    {loading ? 'Logging in…' : 'Log In'}
  </span>
  <span
    aria-hidden="true"
    className="absolute inset-0 z-0 bg-gradient-to-br from-blue-300/40 via-blue-100/30 to-white/20 opacity-60 blur-xl transition-all duration-700 group-hover:opacity-80"
  />
</button>

    </div>
  </div>
</form>


          <div className="mt-6">
  <p className="text-sm text-center sm:text-start text-gray-600 dark:text-gray-400">
    Don’t have an account?{" "}
    <Link
      to="/signup"
      className="relative ml-1 font-semibold text-blue-400 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
    >
      Sign Up
    </Link>
  </p>
</div>

          </div>
        </div>
      </div>
    </div>
  );
}