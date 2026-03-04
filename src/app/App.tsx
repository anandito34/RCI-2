import { useState, useEffect } from 'react';
import { API_BASE } from './config/api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { FeaturedLawyers } from './components/FeaturedLawyers';
import { PlatformAdvantages } from './components/PlatformAdvantages';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { ConsultationView } from './components/ConsultationView';
import { AdvisorDashboard } from './components/AdvisorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { ClientDashboard } from './components/ClientDashboard';

interface UserProfile {
  full_name: string;
  email: string;
  role: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'consultation'>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        // Automatically redirect authenticated users to their dashboard
        setCurrentView('dashboard');
      } else {
        localStorage.removeItem("rci_token");
        localStorage.removeItem("rci_user_email");
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('rci_token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = async () => {
    const token = localStorage.getItem('rci_token');
    if (token) {
      await fetchUser(token);
    }
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('rci_token');
    localStorage.removeItem('rci_user_email');
    setUser(null);
    setCurrentView('home');

    if (window.location.pathname === '/admin') {
      window.location.href = '/';
    }
  };

  const handleHome = () => {
    setCurrentView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="size-8 rounded-full border-4 border-[#1A1C1E]/20 border-t-[#D4AF37] animate-spin mt-32 mx-auto"></div>
      </div>
    );
  }

  // Handle /admin route
  const currentPath = window.location.pathname;
  if (currentPath === '/admin') {
    if (user?.role === 'admin') {
      return <AdminDashboard userEmail={user?.email || ''} onLogout={handleLogout} />;
    }
    return <AdminLogin onAuthSuccess={handleAuthSuccess} />;
  }

  // Consultation View (Executive Hub - lawyer selection + chat)
  if (currentView === 'consultation') {
    return <ConsultationView userEmail={user?.email || ''} onBack={() => setCurrentView('dashboard')} />;
  }

  // Dashboard views for authenticated users
  if (currentView === 'dashboard' && user) {
    if (user.role === 'lawyer') {
      return <AdvisorDashboard userEmail={user.email} onBack={handleLogout} />;
    }
    // Client Dashboard
    return (
      <ClientDashboard
        userEmail={user.email}
        userName={user.full_name}
        onBack={handleLogout}
        onConsult={() => setCurrentView('consultation')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} loading={loading} onAuthSuccess={handleAuthSuccess} onLogout={handleLogout} onHome={handleHome} />
      <Hero user={user} onAuthSuccess={handleAuthSuccess} />
      <HowItWorks />
      <FeaturedLawyers />
      <PlatformAdvantages />
      <Testimonials />
      <Footer />
    </div>
  );
}
