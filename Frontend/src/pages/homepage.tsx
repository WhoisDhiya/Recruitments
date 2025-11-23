import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

// --- TYPE DEFINITIONS (Unchanged) ---
interface Stat {
  count: string;
  label: string;
  icon: 'jobs' | 'candidates' | 'employers' | 'internships';
}

interface Job {
  id: number;
  title: string;
  companyName: string;
  logoInitial: string;
  location: string;
  type: string;
}

interface Category {
  id: number;
  name: string;
  jobCount: number;
  iconInitial: string;
}

interface Company {
  id: number;
  name: string;
  logoInitial: string;
  jobsCount: number;
}

// --- STATIC DATA DEFINITIONS ---
const STATS_DATA: Stat[] = [
  { count: '1,73,234', label: 'Jobs Available', icon: 'jobs' },
  { count: '89,734', label: 'Candidates Registered', icon: 'candidates' },
  { count: '7,532', label: 'Companies Hiring', icon: 'employers' },
  { count: '9,712', label: 'Iinternships Offered', icon: 'internships' },
];

const FEATURED_JOBS: Job[] = [
  { id: 1, title: 'Senior UX Designer', companyName: 'Apple', logoInitial: 'A', location: 'Cupertino, CA', type: 'Design' },
  { id: 2, title: 'Software Engineer', companyName: 'Google', logoInitial: 'G', location: 'Mountain View, CA', type: 'Full-time' },
  { id: 3, title: 'Product Designer', companyName: 'Stripe', logoInitial: 'S', location: 'San Francisco, CA', type: 'Full-time' },
  { id: 4, title: 'Marketing Officer', companyName: 'Nike', logoInitial: 'N', location: 'Beaverton, OR', type: 'Full-time' },
  { id: 5, title: 'Interaction Designer', companyName: 'Netflix', logoInitial: 'N', location: 'Los Gatos, CA', type: 'Full-time' },
];

const POPULAR_CATEGORIES: Category[] = [
  { id: 101, name: 'Music & Audio', jobCount: 1250, iconInitial: 'MA' },
  { id: 102, name: 'UI & UX Design', jobCount: 890, iconInitial: 'UD' },
  { id: 103, name: 'Digital Marketing', jobCount: 1540, iconInitial: 'DM' },
  { id: 104, name: 'Health & Care', jobCount: 780, iconInitial: 'HC' },
  { id: 105, name: 'Data & Science', jobCount: 600, iconInitial: 'DS' },
];

const TOP_COMPANIES: Company[] = [
  { id: 201, name: 'Dropbox', logoInitial: 'D', jobsCount: 450 },
  { id: 202, name: 'Upwork', logoInitial: 'U', jobsCount: 890 },
  { id: 203, name: 'Slack', logoInitial: 'S', jobsCount: 1200 },
  { id: 204, name: 'Freepik', logoInitial: 'F', jobsCount: 320 },
];

// --- REUSABLE STATIC COMPONENTS ---
const IconPlaceholder: React.FC<{ initial: string, className?: string }> = ({ initial, className = 'h-5 w-5' }) => (
  <div className={`bg-blue-100 text-blue-600 rounded-full p-2 flex items-center justify-center font-bold ${className}`}>
    {initial}
  </div>
);

interface HeaderProps {
  user?: User;
  isAuthenticated: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/signin');
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold text-blue-600">RecruPlus</h1>
        <nav className="hidden md:flex space-x-6 text-sm text-gray-600">
          {['Home', 'Find Jobs', 'Resources', 'Support'].map(item => (
            <a key={item} href="#" className="hover:text-blue-600">{item}</a>
          ))}
        </nav>
        <div className="space-x-4 flex items-center">
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-gray-700 font-medium">
                {user.first_name} {user.last_name}
              </span>
              <button 
                onClick={handleDashboardClick}
                className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={handleLogoutClick}
                className="text-sm text-gray-600 font-medium hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleLoginClick}
                className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={handleSignUpClick}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const StatsBar: React.FC<{ stats: Stat[] }> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
    {stats.map((stat, index) => (
      <div
        key={index}
        className="flex items-center space-x-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
      >
        <IconPlaceholder initial={stat.icon[0].toUpperCase()} className="h-12 w-12 text-blue-600 bg-blue-100" />
        <div>
          <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
          <p className="text-sm text-gray-500 capitalize">{stat.label}</p>
        </div>
      </div>
    ))}
  </div>
);

const HowItWorks: React.FC = () => (
  <div className="py-12 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">How RecruPlus Works</h2>
      <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 md:space-x-8">
        {[
          { title: 'Upload CV/Resume', desc: 'Create account, upload CV, and set interests.' },
          { title: 'Find Suitable Jobs', desc: 'Find jobs that align with your skills.' },
          { title: 'Apply for Jobs', desc: 'Apply to your preferred job with one click.' },
        ].map((step, index) => (
          <div key={index} className="flex flex-col items-center p-4">
            <IconPlaceholder initial={`${index + 1}`} className="h-16 w-16 text-blue-600 bg-blue-100 mb-4 text-lg" />
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => (
  <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer">
    <IconPlaceholder initial={category.iconInitial} className="h-8 w-8 text-blue-600 bg-blue-100 text-xs" />
    <div>
      <p className="font-semibold text-gray-800">{category.name}</p>
      <p className="text-sm text-gray-500">{category.jobCount} opportunities</p>
    </div>
  </div>
);

const JobCard: React.FC<{ job: Job }> = ({ job }) => (
  <div className="flex justify-between items-center p-5 border-b hover:bg-gray-50 transition-all duration-200">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600">
        {job.logoInitial}
      </div>
      <div>
        <p className="font-semibold text-lg text-gray-800">{job.title} - {job.companyName}</p>
        <p className="text-sm text-gray-500">{job.location} · {job.type}</p>
      </div>
    </div>
    <button className="text-blue-600 border border-blue-600 px-4 py-2 text-sm rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200">
      Apply Now
    </button>
  </div>
);

const CompanyCard: React.FC<{ company: Company }> = ({ company }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col items-center text-center hover:shadow-md transition-all duration-200">
    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xl text-gray-600 mb-4">
      {company.logoInitial}
    </div>
    <p className="font-semibold text-lg text-gray-800">{company.name}</p>
    <p className="text-sm text-gray-500 mb-4">{company.jobsCount} Jobs</p>
    <button className="text-blue-600 border border-blue-600 px-4 py-2 text-sm rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200">
      Open Position
    </button>
  </div>
);

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white mt-16">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-gray-700 pb-8 mb-8">
        <div><h4 className="font-bold mb-3">Quick Links</h4><ul className="space-y-2 text-sm text-gray-400"><li>About Us</li><li>Contact</li></ul></div>
        <div><h4 className="font-bold mb-3">Candidates</h4><ul className="space-y-2 text-sm text-gray-400"><li>Browse Jobs</li><li>Resume</li></ul></div>
        <div><h4 className="font-bold mb-3">Employers</h4><ul className="space-y-2 text-sm text-gray-400"><li>Post a Job</li><li>Privacy Policy</li></ul></div>
        <div><h4 className="font-bold mb-3">Support</h4><ul className="space-y-2 text-sm text-gray-400"><li>Help Center</li><li>FAQ</li></ul></div>
      </div>
      <p className="text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} JobPilot. All rights reserved.
      </p>
    </div>
  </footer>
);

interface HomepageProps {
  user?: User;
  isAuthenticated: boolean;
  onLogout?: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ user, isAuthenticated, onLogout }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header user={user} isAuthenticated={isAuthenticated} onLogout={onLogout} />

      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="max-w-xl text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                  Find a job/internship that suits your interest & skills
                </h1>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 bg-white p-3 rounded-lg border border-gray-200 shadow-md">
                  <input
                    type="text"
                    placeholder="Job Title, Keyword, or Company"
                    className="p-3 flex-grow rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    className="p-3 w-full sm:w-1/3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 hidden sm:block"
                  />
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-200">
                    Find Job
                  </button>
                </div>
              </div>
              <div className="hidden md:block w-96 h-64 mt-8 md:mt-0 relative rounded-lg overflow-hidden">
              <img
                src="/recrutingpic.png"
                alt="Job Illustration"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for blending */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div> </div>
            <StatsBar stats={STATS_DATA} />
          </div>
        </section>

        {/* How JobPilot Works */}
        <HowItWorks />

        {/* Popular Category */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Popular Category</h2>
            <a href="#" className="text-blue-600 font-medium hover:underline">View all &gt;</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {POPULAR_CATEGORIES.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Opportunities */}
        <section className="py-16 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Featured opportunities</h2>
            <a href="#" className="text-blue-600 font-medium hover:underline">View all &gt;</a>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            {FEATURED_JOBS.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>

        {/* Top Companies */}
        <section className="py-16 bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Top companies</h2>
              <div className="flex space-x-2">
                <button className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-white">&lt;</button>
                <button className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-white">&gt;</button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {TOP_COMPANIES.map(company => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </div>
        </section>

        {/* Become a Candidate / Employer CTA */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-100 p-8 rounded-xl flex justify-between items-center hover:shadow-md transition-all duration-200">
            <h3 className="text-xl font-bold text-gray-800">Become a Candidate</h3>
            <button className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-200">
              Register Now
            </button>
          </div>
          <div className="bg-blue-600 p-8 rounded-xl flex justify-between items-center hover:shadow-md transition-all duration-200">
            <h3 className="text-xl font-bold text-white">Become an Employers</h3>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-200">
              Register Now
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Homepage;