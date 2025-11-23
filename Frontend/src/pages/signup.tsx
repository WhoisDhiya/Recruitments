import React, { useState } from "react";
// lucide-react icons for aesthetics
import { Lock, CheckCircle, XCircle, Briefcase, Building2, TrendingUp, Menu, User, Mail, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Define the backend API endpoint here. 
// IMPORTANT: Ensure your backend is running on this URL and has CORS enabled!
const BACKEND_API_URL = "http://localhost:3000/api/auth/signup";

/**
 * NOTE: The mockAxiosPost function has been removed. 
 * The code now uses the native 'fetch' API to send a request to the real backend server.
 */

interface StatCardProps {
    icon: LucideIcon;
    value: string;
    label: string;
    color: string;
}

const App = () => {
    // Common form fields
    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isAgreed, setIsAgreed] = useState<boolean>(false);
    const [userType, setUserType] = useState<string>('recruiter');
    
    // Candidate specific fields
    // CV and profile image upload removed per request
    
    // Recruiter specific fields
    const [companyName, setCompanyName] = useState<string>("");
    const [industry, setIndustry] = useState<string>("");
    const [companyDescription, setCompanyDescription] = useState<string>("");
    const [companyEmail, setCompanyEmail] = useState<string>("");
    const [companyAddress, setCompanyAddress] = useState<string>("");
    
    const [message, setMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Function to handle form submission
    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setIsSuccess(false);

        if (password !== confirmPassword) {
            setMessage("Passwords do not match. Please check both fields.");
            return;
        }

        if (!isAgreed) {
            setMessage("You must agree to the Terms of Services.");
            return;
        }

        setIsLoading(true);

        try {
            // --- START: DATA TRANSFORMATION TO MATCH BACKEND MODEL ---
            const nameParts = fullName.trim().split(/\s+/);
            const first_name = nameParts[0] || '';
            const last_name = nameParts.slice(1).join(' ') || '';
            
            // Construct the base payload
            const payload: Record<string, unknown> = {
                last_name: last_name,
                first_name: first_name,
                email: email,
                password: password,
                role: userType
            };

            // Add specific fields based on user type
            if (userType === 'candidate') {
                // Backend requires cv and image fields; send default placeholders
                payload.cv = 'default_cv.pdf';
                payload.image = 'default_image.jpg';
            } else if (userType === 'recruiter') {
                payload.company_name = companyName;
                payload.industry = industry;
                payload.description = companyDescription;
                payload.company_email = companyEmail;
                payload.company_address = companyAddress;
            }
            
            console.log("Sending Payload to Backend:", payload);
            // --- END: DATA TRANSFORMATION ---

            // --- START: REAL NETWORK REQUEST USING FETCH ---
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            // Read the response body (can be success data or an error object)
            const result = await response.json(); 

            if (!response.ok) {
                // If the server response is an error (e.g., 400, 500), throw an error.
                // We use result.message for specific backend error reporting.
                throw new Error(result.message || `HTTP error! Status: ${response.status}`);
            }

            // Success case: Extract the real userId from the backend response
            const userId = result.data.user_id; 

            // UPDATE MESSAGE TO SHOW USER ID:
            setMessage(`Account created successfully! User ID: ${userId}. Redirecting...`);
            setIsSuccess(true);
            
            // Optionally clear the form or redirect after a short delay
            setTimeout(() => {
                // window.location.href = '/login'; // Uncomment for real redirection
            }, 3000); 

        } catch (error) {
            // This catches network errors (e.g., server down) and thrown application errors (e.g., 400 bad request)
            console.error("Signup error details:", error);
            // Use error.message which contains the custom message from the backend or the network error message
            const errorMessage = error instanceof Error ? error.message : "A network error occurred or the server is unreachable.";
            setMessage(`Signup failed: ${errorMessage}`);
            setIsSuccess(false);

        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow text-sm";
    
    // Component for the stat cards on the right panel
    const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, color }) => (
        <div className="flex flex-col items-center bg-gray-900/40 p-4 rounded-xl backdrop-blur-sm transition-transform hover:scale-105 duration-300 cursor-default">
            <Icon className={`w-6 h-6 mb-2 ${color}`} />
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-300">{label}</div>
        </div>
    );
    
    // Main App Component structure
    return (
        <div className="min-h-screen flex items-stretch justify-center font-sans">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
                    body { font-family: 'Inter', sans-serif; }
                    /* Custom checkerboard background for the right panel */
                    .checkerboard-bg {
                        background-color: #0d1a29; /* Deep blue/dark gray */
                        background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05)),
                                         linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05));
                        background-size: 60px 60px; /* Size of the squares */
                    }
                `}
            </style>
            
            {/* Main Content Grid - Stacks on mobile, splits on large screens */}
            <div className="grid lg:grid-cols-2 w-full max-w-7xl shadow-2xl rounded-xl overflow-hidden my-4 lg:my-0 min-h-screen">

                {/* Left Panel: Signup Form */}
                <div className="flex flex-col p-8 sm:p-12 lg:p-16 bg-white overflow-y-auto">
                    
                    {/* Logo and Navigation (Top Left) - Like Login Page */}
                    <div className="absolute top-0 left-0 p-8 flex items-center">
                        <Menu className="w-6 h-6 text-blue-600 mr-2 lg:hidden" />
                        <div className="flex items-center">
                            <div className="text-2xl mr-2">💼</div>
                            <span className="text-xl font-bold text-gray-800">RecruPlus</span>
                        </div>
                    </div>

                    <div className="max-w-md w-full mx-auto">
                        
                        <div className="flex justify-end mb-8">
                            {/* User Type Selector - Improved Design */}
                            <div className="relative">
                                <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setUserType('recruiter')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                                            userType === 'recruiter'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-gray-600 hover:text-blue-600 hover:bg-white'
                                        }`}
                                    >
                                        <Building2 className="w-4 h-4 mr-2" />
                                        Recruiter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUserType('candidate')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                                            userType === 'candidate'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-gray-600 hover:text-blue-600 hover:bg-white'
                                        }`}
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        Candidate
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create account.</h2>
                               <p className="text-sm text-gray-500 mb-6">
                                   Already have an account?{" "}
                                   <a href="/signin" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors">
                                       Log in
                                   </a>
                               </p>

                        <form onSubmit={handleSignup} className="space-y-4">
                            
                            {/* Full Name */}
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)} 
                                className={inputClasses} 
                                required 
                            />

                            {/* Email */}
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className={inputClasses} 
                                required 
                            />

                            {/* Password */}
                            <div className="relative">
                                <input 
                                    type="password" 
                                    placeholder="Password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className={inputClasses + " pr-10"} 
                                    required 
                                />
                                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer" />
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <input 
                                    type="password" 
                                    placeholder="Confirm Password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className={inputClasses + " pr-10"} 
                                    required 
                                />
                                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer" />
                            </div>

                            {/* Conditional fields based on user type */}
                            {userType === 'candidate' ? (
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex items-center mb-6">
                                        <User className="w-6 h-6 text-blue-600 mr-3" />
                                        <h3 className="text-xl font-semibold text-gray-800">Candidate Information</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* File uploads removed per request */}
                                        <p className="text-sm text-gray-500">CV/Profile picture uploads are disabled. You can add these later from your account settings.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t pt-6 mt-6">
                                    <div className="flex items-center mb-6">
                                        <Building2 className="w-6 h-6 text-blue-600 mr-3" />
                                        <h3 className="text-xl font-semibold text-gray-800">Company Information</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Company Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Company Name *
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder="Enter your company name" 
                                                value={companyName} 
                                                onChange={(e) => setCompanyName(e.target.value)} 
                                                className={inputClasses} 
                                                maxLength={255}
                                                required 
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Maximum 255 characters</p>
                                        </div>

                                        {/* Industry */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Industry *
                                            </label>
                                            <select 
                                                value={industry} 
                                                onChange={(e) => setIndustry(e.target.value)} 
                                                className={inputClasses}
                                                required 
                                            >
                                                <option value="">Select your industry</option>
                                                <option value="Technology">Technology</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Education">Education</option>
                                                <option value="Manufacturing">Manufacturing</option>
                                                <option value="Retail">Retail</option>
                                                <option value="Consulting">Consulting</option>
                                                <option value="Media">Media</option>
                                                <option value="Real Estate">Real Estate</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Select the industry your company operates in</p>
                                        </div>

                                        {/* Company Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Company Description *
                                            </label>
                                            <textarea 
                                                placeholder="Describe your company, its mission, values, and what makes it unique..." 
                                                value={companyDescription} 
                                                onChange={(e) => setCompanyDescription(e.target.value)} 
                                                className={inputClasses + " h-24 resize-none"} 
                                                required 
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Provide a detailed description of your company</p>
                                        </div>

                                        {/* Company Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Company Email *
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type="email" 
                                                    placeholder="contact@yourcompany.com" 
                                                    value={companyEmail} 
                                                    onChange={(e) => setCompanyEmail(e.target.value)} 
                                                    className={inputClasses + " pl-10"} 
                                                    maxLength={255}
                                                    required 
                                                />
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Official company email address</p>
                                        </div>

                                        {/* Company Address */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Company Address *
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="123 Business Street, City, Country" 
                                                    value={companyAddress} 
                                                    onChange={(e) => setCompanyAddress(e.target.value)} 
                                                    className={inputClasses + " pl-10"} 
                                                    maxLength={255}
                                                    required 
                                                />
                                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Complete company address</p>
                                        </div>

                                        {/* Help Text */}
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>Note:</strong> All company information fields are required. 
                                                This information will be used to create your recruiter profile and will be visible to candidates.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Terms of Service Checkbox */}
                            <div className="flex items-center text-xs pt-2">
                                <input
                                    id="agreement"
                                    type="checkbox"
                                    checked={isAgreed}
                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    required
                                />
                                <label htmlFor="agreement" className="ml-2 text-gray-600">
                                    I've read and agree with your <a href="#" className="text-blue-600 hover:underline">Terms of Services</a>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white p-3 rounded-md font-semibold shadow-md shadow-blue-500/50 hover:bg-blue-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        Create Account <span className="ml-2">➔</span>
                                    </>
                                )}
                            </button>


                            {/* Message Display */}
                            {message && (
                                <div className={`p-3 rounded-lg text-sm flex items-center mt-4 ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {isSuccess ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                    <p className="font-medium">{message}</p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right Panel: Marketing and Stats */}
                <div className="checkerboard-bg hidden lg:flex flex-col justify-center items-center p-16 text-white relative">
                    <div className="relative z-10 text-center">
                        <h3 className="text-4xl font-extrabold leading-tight mb-10 max-w-sm">
                            Over 1,75,324 candidates waiting for good employees.
                        </h3>
                        
                        {/* Stat Cards Container */}
                        <div className="grid grid-cols-3 gap-6 max-w-sm mt-12">
                            
                            <StatCard 
                                icon={Briefcase} 
                                value="1,75,324" 
                                label="Live Jobs" 
                                color="text-sky-400"
                            />
                            <StatCard 
                                icon={Building2} 
                                value="97,354" 
                                label="Companies" 
                                color="text-teal-400"
                            />
                            <StatCard 
                                icon={TrendingUp} 
                                value="7,532" 
                                label="New Jobs" 
                                color="text-yellow-400"
                            />
                        </div>
                    </div>
                    {/* Subtle dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>
            </div>
        </div>
    );
};

export default App;
