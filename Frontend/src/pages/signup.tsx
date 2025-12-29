import React, { useState, useEffect } from "react";
// lucide-react icons for aesthetics
import { CheckCircle, XCircle, Briefcase, Building2, TrendingUp, Menu, User, Mail, MapPin, Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiService } from '../services/api';

// Using apiService which uses VITE_API_URL from environment variables

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
    
    // Validation states for real-time feedback
    const [emailError, setEmailError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [passwordStrength, setPasswordStrength] = useState<{ valid: boolean; message: string }>({ valid: false, message: '' });
    const [companyEmailError, setCompanyEmailError] = useState<string>("");
    
    // Password visibility states
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    
    // Pack selection state (for recruiters) - Always show packs for recruiters
    const [packs, setPacks] = useState<any[]>([]);
    const [selectedPack, setSelectedPack] = useState<number | null>(null);
    const [isLoadingPacks, setIsLoadingPacks] = useState<boolean>(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
    // When recruiter chooses payment before finalizing account, keep the form payload here
    const [pendingRecruiterPayload, setPendingRecruiterPayload] = useState<Record<string, any> | null>(null);
    const [pendingRecruiterId, setPendingRecruiterId] = useState<number | null>(null);

    // Validation functions
    const validateEmail = (email: string): boolean => {
        // Email regex: doit avoir au moins 2 caractères après le point final (ex: .com, .fr, .org)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailRegex.test(email.trim());
    };

    const validatePassword = (password: string): { valid: boolean; message: string } => {
        if (password.length < 8) {
            return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
        }
        if (!/[a-z]/.test(password)) {
            return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
        }
        if (!/\d/.test(password)) {
            return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
        }
        return { valid: true, message: '' };
    };

    // Function to handle form submission
    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setIsSuccess(false);

        // Validate required fields first
        if (!fullName || !fullName.trim()) {
            setMessage("Le nom complet est requis.");
            return;
        }

        if (!email || !email.trim()) {
            setMessage("L'email est requis.");
            return;
        }

        // Validate email format
        if (!validateEmail(email)) {
            setMessage("Format d'email invalide. Veuillez entrer un email valide (ex: exemple@gmail.com).");
            return;
        }

        if (!password || !password.trim()) {
            setMessage("Le mot de passe est requis.");
            return;
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            setMessage(passwordValidation.message);
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas. Veuillez vérifier les deux champs.");
            return;
        }

        if (!isAgreed) {
            setMessage("Vous devez accepter les conditions d'utilisation.");
            return;
        }

        setIsLoading(true);

        try {
            // --- START: DATA TRANSFORMATION TO MATCH BACKEND MODEL ---

            // Split full name into first_name and last_name
            const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
            let first_name = nameParts[0] || fullName.trim();
            let last_name = nameParts.slice(1).join(' ') || '';
            
            // If last_name is empty (only one word provided), use first_name as last_name
            // This ensures both fields are always populated
            if (!last_name || last_name.trim() === '') {
                last_name = first_name;
            }
            
            // Construct the base payload
            const payload: Record<string, unknown> = {
                last_name: last_name,
                first_name: first_name,
                email: email.trim().toLowerCase(),
                password: password,
                role: userType
            };

            // Add specific fields based on user type
            if (userType === 'candidate') {
                // Backend requires cv and image fields; send default placeholders
                payload.cv = 'default_cv.pdf';
                payload.image = 'default_image.jpg';
            } else if (userType === 'recruiter') {
                // Validation de l'email de l'entreprise
                if (!companyEmail || !companyEmail.trim()) {
                    setMessage("L'email de l'entreprise est requis.");
                    return;
                }
                
                if (!validateEmail(companyEmail)) {
                    setMessage("Format d'email de l'entreprise invalide. Veuillez entrer un email valide (ex: contact@company.com).");
                    setCompanyEmailError("Format d'email invalide");
                    return;
                }
                
                payload.company_name = companyName;
                payload.industry = industry;
                payload.description = companyDescription;
                payload.company_email = companyEmail.trim().toLowerCase();
                payload.company_address = companyAddress;
            }
            
            console.log("Sending Payload to Backend:", payload);
            // --- END: DATA TRANSFORMATION ---

            // For recruiters, we just validate and store the payload
            // The packs are already visible on the same page
            if (userType === 'recruiter') {
                // Store the payload for later use when pack is selected
                setPendingRecruiterPayload(payload);
                setMessage('Please select a subscription plan below to complete your registration.');
                setIsSuccess(true);
                setIsLoading(false);
                // Scroll to packs section
                setTimeout(() => {
                    document.getElementById('packs-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
                return;
            } else {
                // --- START: REAL NETWORK REQUEST USING apiService (candidates) ---
                const result = await apiService.signup(payload as {
                    last_name: string;
                    first_name: string;
                    email: string;
                    password: string;
                    role: 'recruiter' | 'candidate' | 'admin';
                    cv?: string;
                    image?: string;
                });

                // Success case: Extract the real userId from the backend response
                const userId = result.user.id; 
                console.log('User created with ID:', userId);

                // For candidates, redirect to sign in
                setMessage(`Account created successfully! Redirecting to login...`);
                setIsSuccess(true);
                setTimeout(() => {
                    window.location.href = '/signin';
                }, 2000);
                // --- END: candidate flow ---
            }

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

    // Load available packs on component mount for recruiters
    useEffect(() => {
        if (userType === 'recruiter') {
            loadPacks();
        }
    }, [userType]);

    // Load available packs
    const loadPacks = async () => {
        try {
            setIsLoadingPacks(true);
            
            const packsData = await apiService.getPacks();
            console.log('Packs loaded:', packsData);
            
            if (!packsData || packsData.length === 0) {
                return;
            }
            
            // Sort packs: basic, standard, premium
            const sortedPacks = packsData.sort((a: any, b: any) => {
                const order: Record<string, number> = { basic: 1, standard: 2, premium: 3 };
                return (order[a.name] || 999) - (order[b.name] || 999);
            });
            setPacks(sortedPacks);
        } catch (err: any) {
            console.error('Error loading packs:', err);
        } finally {
            setIsLoadingPacks(false);
        }
    };

    // Handle pack selection and payment
    const handlePackSelection = async (packId: number) => {
        // Check if we have recruiter information
        if (!pendingRecruiterPayload && !pendingRecruiterId) {
            setMessage('Error: Please fill out the form above first.');
            return;
        }

        if (isProcessingPayment) return;

        try {
            setIsProcessingPayment(true);
            setSelectedPack(packId);
            setMessage(null);

            // If we already have a pending_id, use it; otherwise create a new pending recruiter
            let sessionArg: any = null;
            
            if (pendingRecruiterId) {
                // If we already have a pending_id, use it
                console.log('Using existing pending_id:', pendingRecruiterId);
                sessionArg = { pending_id: pendingRecruiterId };
            } else if (pendingRecruiterPayload) {
                // Create pending recruiter now (when pack is selected)
                console.log('Creating pending recruiter...');
                try {
                    const { pending_id } = await apiService.createPendingRecruiter(pendingRecruiterPayload as any);
                    setPendingRecruiterId(pending_id);
                    (window as any).__pending_recruiter_id = pending_id;
                    sessionArg = { pending_id: pending_id };
                    console.log('Pending recruiter created with ID:', pending_id);
                } catch (err: any) {
                    console.error('Failed to create pending recruiter:', err);
                    let errorMessage = err?.message || 'Failed to prepare registration. Please try again.';
                    
                    // Vérifier si c'est une erreur d'unicité du company_email
                    if (err?.message && (
                        err.message.includes('email d\'entreprise') || 
                        err.message.includes('déjà utilisé') ||
                        err.message.includes('already used')
                    )) {
                        setCompanyEmailError(err.message);
                        errorMessage = err.message;
                    }
                    
                    setMessage(errorMessage);
                    setIsProcessingPayment(false);
                    setSelectedPack(null);
                    return;
                }
            } else {
                setMessage('Error: Recruiter information missing. Please re-fill the form.');
                setIsProcessingPayment(false);
                setSelectedPack(null);
                return;
            }

            // Create Stripe checkout session
            console.log('Creating checkout session with:', sessionArg, 'pack_id:', packId);
            const { url } = await apiService.createCheckoutSession(sessionArg as any, packId);
            
            // Redirect to Stripe checkout
            console.log('Redirecting to Stripe checkout:', url);
            if (!url) {
                throw new Error('No payment URL received from server');
            }
            window.location.href = url;
        } catch (err: any) {
            console.error('Error creating checkout session:', err);
            setIsSuccess(false);
            
            // Messages d'erreur spécifiques selon le type d'erreur
            let errorMessage = 'Failed to initiate payment. Please try again.';
            if (err.message) {
                if (err.message.includes('Payments are temporarily disabled') || 
                    err.message.includes('Stripe is not configured') ||
                    err.message.includes('UNAVAILABLE')) {
                    errorMessage = 'Les paiements ne sont pas activés. Veuillez configurer Stripe sur le serveur. Contactez l\'administrateur.';
                } else if (err.message.includes('Pack introuvable')) {
                    errorMessage = 'Le pack sélectionné est introuvable. Veuillez réessayer.';
                } else {
                    errorMessage = err.message;
                }
            }
            
            setMessage(errorMessage);
            setIsProcessingPayment(false);
            setSelectedPack(null);
            
            // Scroll to top to show error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getPackFeatures = (pack: any) => {
        const features = [];
        
        if (pack.job_limit === 999 || pack.job_limit >= 100) {
            features.push({ icon: '💼', text: 'Unlimited Job Postings' });
        } else {
            features.push({ icon: '💼', text: `${pack.job_limit} Job Postings` });
        }

        if (pack.candidate_limit >= 1000) {
            features.push({ icon: '👥', text: `${pack.candidate_limit} Candidate Views` });
        } else if (pack.candidate_limit >= 100) {
            features.push({ icon: '👥', text: `${pack.candidate_limit} Candidate Views` });
        } else {
            features.push({ icon: '👥', text: `${pack.candidate_limit} Candidate Views` });
        }

        features.push({ icon: '📅', text: `${pack.visibility_days} Days Visibility` });
        features.push({ icon: '✅', text: 'Priority Support' });

        return features;
    };

    const getPackDescription = (packName: string) => {
        const descriptions: Record<string, string> = {
            basic: 'Pack Basic: 3 offres, visibilité 30 jours',
            standard: 'Pack Standard: 10 offres, visibilité 60 jours, plus de candidats',
            premium: 'Pack Premium: Illimité pendant 1 an'
        };
        return descriptions[packName.toLowerCase()] || '';
    };

    const getPackBadge = (packName: string) => {
        const badges: Record<string, { text: string; color: string }> = {
            standard: { text: 'RECOMMENDED', color: 'blue' },
            premium: { text: 'MOST POPULAR', color: 'orange' }
        };
        return badges[packName.toLowerCase()];
    };

    const getButtonColor = (packName: string) => {
        const colors: Record<string, string> = {
            basic: 'purple',
            standard: 'blue',
            premium: 'orange'
        };
        return colors[packName.toLowerCase()] || 'blue';
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
            <div className={`grid ${userType === 'recruiter' ? 'w-full' : 'lg:grid-cols-2'} w-full max-w-7xl mx-auto shadow-2xl rounded-xl overflow-hidden my-4 lg:my-0 min-h-screen`}>

                {/* Left Panel: Signup Form */}
                <div className={`flex flex-col p-8 sm:p-12 lg:p-16 bg-white overflow-y-auto ${userType === 'recruiter' ? 'w-full' : ''}`}>
                    
                    {/* Logo and Navigation (Top Left) - Like Login Page */}
                    <div className="absolute top-0 left-0 p-4 sm:p-8 flex items-center z-10">
                        <Menu className="w-6 h-6 text-blue-600 mr-2 lg:hidden" />
                        <div className="flex items-center">
                            <div className="text-2xl mr-2">💼</div>
                            <span className="text-xl font-bold text-gray-800">RecruPlus</span>
                        </div>
                    </div>

                    <div className={`${userType === 'recruiter' ? 'w-full max-w-6xl mx-auto' : 'max-w-md w-full mx-auto'}`}>
                        
                        <div className="flex justify-end mb-8">
                            {/* User Type Selector - Improved Design */}
                            <div className="relative">
                                <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUserType('recruiter');
                                            if (userType !== 'recruiter') {
                                                loadPacks();
                                            }
                                        }}
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
                        
                        <div>
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
                            <div>
                                <input 
                                    type="email" 
                                    placeholder="Email address (ex: exemple@gmail.com)" 
                                    value={email} 
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setEmail(value);
                                        if (value && !validateEmail(value)) {
                                            setEmailError("Format d'email invalide. Exemple: exemple@gmail.com");
                                        } else {
                                            setEmailError("");
                                        }
                                    }} 
                                    onBlur={(e) => {
                                        if (e.target.value && !validateEmail(e.target.value)) {
                                            setEmailError("Format d'email invalide. Exemple: exemple@gmail.com");
                                        } else {
                                            setEmailError("");
                                        }
                                    }}
                                    className={`${inputClasses} ${emailError ? 'border-red-500' : ''}`}
                                    required 
                                />
                                {emailError && (
                                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Mot de passe (min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre)" 
                                        value={password} 
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setPassword(value);
                                            if (value) {
                                                const validation = validatePassword(value);
                                                setPasswordStrength(validation);
                                                setPasswordError(validation.valid ? "" : validation.message);
                                            } else {
                                                setPasswordStrength({ valid: false, message: '' });
                                                setPasswordError("");
                                            }
                                        }} 
                                        className={`${inputClasses} pr-10 ${passwordError ? 'border-red-500' : password && passwordStrength.valid ? 'border-green-500' : ''}`}
                                        required 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                                )}
                                {password && passwordStrength.valid && (
                                    <p className="mt-1 text-sm text-green-600">✓ Mot de passe valide</p>
                                )}
                                {password && !passwordStrength.valid && (
                                    <div className="mt-1 text-xs text-gray-600">
                                        <p>Le mot de passe doit contenir :</p>
                                        <ul className="list-disc list-inside ml-2">
                                            <li className={password.length >= 8 ? 'text-green-600' : ''}>Au moins 8 caractères</li>
                                            <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>Une minuscule</li>
                                            <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>Une majuscule</li>
                                            <li className={/\d/.test(password) ? 'text-green-600' : ''}>Un chiffre</li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Confirm Password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className={inputClasses + " pr-10"} 
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
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
                                                    onChange={(e) => {
                                                        setCompanyEmail(e.target.value);
                                                        // Validation en temps réel
                                                        if (e.target.value && !validateEmail(e.target.value)) {
                                                            setCompanyEmailError("Format d'email invalide (ex: contact@company.com)");
                                                        } else {
                                                            setCompanyEmailError("");
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        // Validation au blur
                                                        if (e.target.value && !validateEmail(e.target.value)) {
                                                            setCompanyEmailError("Format d'email invalide (ex: contact@company.com)");
                                                        } else {
                                                            setCompanyEmailError("");
                                                        }
                                                    }}
                                                    className={`${inputClasses} ${companyEmailError ? 'border-red-500' : ''} pl-10`}
                                                    maxLength={255}
                                                    required 
                                                />
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            </div>
                                            {companyEmailError && (
                                                <p className="mt-1 text-sm text-red-600">{companyEmailError}</p>
                                            )}
                                            {companyEmail && !companyEmailError && validateEmail(companyEmail) && (
                                                <p className="mt-1 text-sm text-green-600">✓ Email valide</p>
                                            )}
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
                                <div className={`p-4 rounded-lg text-sm flex items-start mt-4 shadow-md ${isSuccess ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                                    {isSuccess ? <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" /> : <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />}
                                    <p className="font-medium">{message}</p>
                                </div>
                            )}
                        </form>

                        {/* Packs Section - Only show for recruiters */}
                        {userType === 'recruiter' && (
                            <div id="packs-section" className="mt-12 pt-12 border-t border-gray-200">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                                        Choose Your Subscription Plan
                                    </h2>
                                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                                        Select a plan to complete your registration. Your account will be created after successful payment.
                                    </p>
                                </div>

                                {isLoadingPacks ? (
                                    <div className="text-center py-16">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                                        <p className="mt-6 text-lg text-gray-600">Loading subscription plans...</p>
                                    </div>
                                ) : packs.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
                                        {packs.map((pack) => {
                                            const badge = getPackBadge(pack.name);
                                            const buttonColor = getButtonColor(pack.name);
                                            const features = getPackFeatures(pack);
                                            const description = getPackDescription(pack.name);
                                            const rawPrice = typeof pack.price === 'number' ? pack.price : parseFloat(String(pack.price));
                                            const price = Number.isFinite(rawPrice) ? rawPrice : 0;
                                            const isStandard = pack.name.toLowerCase() === 'standard';
                                            const isPremium = pack.name.toLowerCase() === 'premium';

                                            return (
                                                <div 
                                                    key={pack.id} 
                                                    className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden ${
                                                        isStandard ? 'border-2 border-blue-500 ring-2 ring-blue-200' : 
                                                        isPremium ? 'border-2 border-orange-500 ring-2 ring-orange-200' : 
                                                        'border border-gray-200'
                                                    }`}
                                                >
                                                    {badge && (
                                                        <div className={`absolute top-0 left-0 right-0 py-2 text-center text-xs font-bold text-white ${
                                                            badge.color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'
                                                        }`}>
                                                            {badge.text}
                                                        </div>
                                                    )}
                                                    
                                                    <div className={`p-6 sm:p-8 ${badge ? 'pt-12 sm:pt-14' : 'pt-6 sm:pt-8'}`}>
                                                        <div className="text-center mb-6">
                                                            <h3 className={`text-2xl sm:text-3xl font-extrabold mb-4 ${
                                                                isStandard ? 'text-blue-600' : 
                                                                isPremium ? 'text-orange-600' : 
                                                                'text-gray-900'
                                                            }`}>
                                                                {pack.name.toUpperCase()}
                                                            </h3>
                                                            <div className="mb-4 flex items-baseline justify-center">
                                                                <span className={`text-4xl sm:text-5xl font-extrabold ${
                                                                    isStandard ? 'text-blue-600' : 
                                                                    isPremium ? 'text-orange-600' : 
                                                                    'text-gray-900'
                                                                }`}>
                                                                    ${price.toFixed(2)}
                                                                </span>
                                                                <span className="text-gray-600 ml-2 text-lg">/month</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                                                        </div>

                                                        <div className="space-y-4 mb-8 min-h-[200px]">
                                                            {features.map((feature, index) => (
                                                                <div key={index} className="flex items-start">
                                                                    <span className="text-2xl mr-3 flex-shrink-0">{feature.icon}</span>
                                                                    <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{feature.text}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                handlePackSelection(pack.id);
                                                                // Scroll to top after a short delay to show any error messages
                                                                setTimeout(() => {
                                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                }, 100);
                                                            }}
                                                            disabled={isProcessingPayment || selectedPack === pack.id || !pendingRecruiterPayload}
                                                            className={`w-full py-4 rounded-xl font-semibold text-white text-base sm:text-lg transition-all shadow-lg hover:shadow-xl ${
                                                                buttonColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                                                                buttonColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                                                'bg-orange-600 hover:bg-orange-700'
                                                            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg`}
                                                        >
                                                            {!pendingRecruiterPayload ? 'Remplissez le formulaire ci-dessus d\'abord' :
                                                            isProcessingPayment && selectedPack === pack.id ? (
                                                                <span className="flex items-center justify-center">
                                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Traitement...
                                                                </span>
                                                            ) : (
                                                                'S\'abonner maintenant'
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <p className="text-lg text-gray-600">No subscription plans available. Please contact support.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Marketing and Stats (hidden for recruiters) */}
                {userType !== 'recruiter' && (
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
                )}
            </div>
        </div>
    );
};

export default App;
