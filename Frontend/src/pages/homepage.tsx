import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { User, Offer } from '../types';
import { apiService } from '../services/api';

// Composant pour afficher une carte d'offre d'emploi
const JobCard: React.FC<{ job: Offer; onClick: (id: number) => void }> = ({ job, onClick }) => (
  <div 
    onClick={() => onClick(job.id)}
    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
          {job.title ? job.title[0].toUpperCase() : 'J'}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
        <p className="text-sm text-gray-500">{job.company_name || 'Entreprise non spécifiée'}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {job.employment_type || 'Temps plein'}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {job.location || 'Lieu non spécifié'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Composant pour le header simplifié
const Header: React.FC<{ user?: User; isAuthenticated: boolean; onLogout?: () => void }> = ({ user, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">RecruPlus</h1>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700">Bonjour, {user?.first_name || 'Utilisateur'}</span>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Tableau de bord
              </button>
              <button 
                onClick={onLogout}
                className="text-gray-700 hover:text-blue-600"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/signin')}
                className="text-gray-700 hover:text-blue-600"
              >
                Connexion
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                S'inscrire
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// Composant pour l'accueil
const Homepage: React.FC<{ user?: User; isAuthenticated: boolean; onLogout?: () => void }> = ({ user, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les offres d'emploi
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        const jobs = await apiService.getOffers();
        // Filtrer les offres actives (non expirées)
        const activeJobs = jobs.filter(job => {
          if (!job.date_expiration) return true;
          return new Date(job.date_expiration) > new Date();
        });
        setFeaturedJobs(activeJobs.slice(0, 4)); // Prendre les 4 premières offres
      } catch (err) {
        console.error('Erreur lors du chargement des offres:', err);
        setError('Impossible de charger les offres. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleJobClick = (jobId: number) => {
    navigate(`/job-details/${jobId}`);
  };

  const handleViewAllJobs = () => {
    navigate('/find-jobs');
  };

  const handleFindJobsClick = () => {
    navigate('/find-jobs');
  };

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
                  <button onClick={handleFindJobsClick} className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-200">
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
              </div>
            </div>
          </div>
        </section>

        {/* Featured Opportunities */}
        <section className="py-16 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Featured opportunities</h2>
            <button onClick={handleViewAllJobs} className="text-blue-600 font-medium hover:underline">View all &gt;</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
            {isLoading ? (
              <div className="col-span-2 text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Chargement des offres...</p>
              </div>
            ) : featuredJobs.length > 0 ? (
              featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={handleJobClick} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-600">Aucune offre disponible pour le moment</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">RecruPlus</h3>
              <p className="text-gray-400">La plateforme de recrutement qui simplifie votre recherche d'emploi.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Accueil</Link></li>
                <li><Link to="/find-jobs" className="text-gray-400 hover:text-white">Offres d'emploi</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">À propos</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Entreprises</h4>
              <ul className="space-y-2">
                <li><Link to="/employers" className="text-gray-400 hover:text-white">Publier une offre</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white">Tarifs</Link></li>
                <li><Link to="/solutions" className="text-gray-400 hover:text-white">Solutions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
              <address className="not-italic text-gray-400">
                <p>123 Rue de la Paix</p>
                <p>75000 Paris, France</p>
                <p className="mt-2">contact@recruplus.com</p>
                <p>+33 1 23 45 67 89</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p> 2023 RecruPlus. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;