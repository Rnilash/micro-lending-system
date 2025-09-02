import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated and redirect
    const checkAuth = async () => {
      // This will be implemented with auth state management
      // For now, just show the landing page
    };
    
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary-600">
                  Micro Lending System
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Digital Micro-Lending
              <span className="block text-primary-600">Management System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A comprehensive web-based micro-lending management system tailored for 
              Sri Lankan micro-finance businesses. Streamline your operations with 
              weekly collection cycles, field operations, and bilingual support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login" className="btn btn-primary btn-lg">
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/demo" className="btn btn-secondary btn-lg">
                View Demo
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="👥"
              title="Customer Management"
              description="Complete KYC, contact information, and document management with advanced search capabilities."
            />
            <FeatureCard
              icon="💰"
              title="Loan Management"
              description="Streamlined application processing, multiple interest calculation methods, and approval workflows."
            />
            <FeatureCard
              icon="📊"
              title="Payment System"
              description="Weekly collections, payment history tracking, and automated balance calculations."
            />
            <FeatureCard
              icon="📈"
              title="Analytics & Reports"
              description="Performance metrics, customer analytics, and comprehensive financial reporting."
            />
            <FeatureCard
              icon="🌐"
              title="Bilingual Support"
              description="Complete Sinhala and English language support with local formatting conventions."
            />
            <FeatureCard
              icon="📱"
              title="Mobile Optimized"
              description="Responsive design optimized for tablets and smartphones with offline capabilities."
            />
          </div>

          {/* Technology Stack */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Built with Modern Technology
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <TechBadge name="Next.js" />
              <TechBadge name="TypeScript" />
              <TechBadge name="Firebase" />
              <TechBadge name="Tailwind CSS" />
              <TechBadge name="React Query" />
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Micro Lending System</h3>
            <p className="text-gray-400 mb-4">
              Built with ❤️ for Sri Lankan micro-finance businesses
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/docs" className="text-gray-400 hover:text-white">
                Documentation
              </Link>
              <Link href="/support" className="text-gray-400 hover:text-white">
                Support
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-6 text-center hover:shadow-medium transition-shadow duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TechBadge({ name }: { name: string }) {
  return (
    <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
      {name}
    </span>
  );
}
