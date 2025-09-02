import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatLKR } from '@/lib/lkr-formatter';
import { 
  BanknotesIcon, 
  UsersIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface DashboardMetrics {
  totalCollected: number;
  totalOutstanding: number;
  activeCustomers: number;
  defaulters: number;
  collectionRate: number;
  monthlyTarget: number;
  monthlyProgress: number;
}

interface AdminDashboardProps {
  className?: string;
}

/**
 * Admin Dashboard Component
 * 
 * Main dashboard for system administrators showing key business metrics,
 * collection performance, and system overview with bilingual support.
 * 
 * Features:
 * - Real-time metrics display
 * - Bilingual text support (Sinhala/English)
 * - Responsive design for desktop and tablet
 * - Interactive metric cards
 * - Quick action buttons
 * 
 * @example
 * <AdminDashboard className="p-6" />
 */
export function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const { t, language } = useLanguage();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadDashboardMetrics();
  }, [selectedPeriod]);

  const loadDashboardMetrics = async () => {
    setLoading(true);
    try {
      // Simulated API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        totalCollected: 850000,
        totalOutstanding: 1200000,
        activeCustomers: 245,
        defaulters: 12,
        collectionRate: 87.5,
        monthlyTarget: 1000000,
        monthlyProgress: 65
      });
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      title: language === 'sinhala' ? 'එකතු කරන ලද මුදල' : 
            language === 'english' ? 'Total Collected' : 
            'එකතු කරන ලද මුදල / Total Collected',
      value: formatLKR(metrics.totalCollected, { language }),
      icon: BanknotesIcon,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: language === 'sinhala' ? 'ඉතිරි ශේෂය' : 
            language === 'english' ? 'Outstanding Amount' : 
            'ඉතිරි ශේෂය / Outstanding Amount',
      value: formatLKR(metrics.totalOutstanding, { language }),
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      change: '-5%',
      changeType: 'positive' as const
    },
    {
      title: language === 'sinhala' ? 'සක්‍රීය ගනුම්කරුවන්' : 
            language === 'english' ? 'Active Customers' : 
            'සක්‍රීය ගනුම්කරුවන් / Active Customers',
      value: metrics.activeCustomers.toString(),
      icon: UsersIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      change: '+8',
      changeType: 'positive' as const
    },
    {
      title: language === 'sinhala' ? 'පැහැර ගියවුන්' : 
            language === 'english' ? 'Defaulters' : 
            'පැහැර ගියවුන් / Defaulters',
      value: metrics.defaulters.toString(),
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      change: '+2',
      changeType: 'negative' as const
    }
  ];

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-bilingual">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-600 mt-2 font-bilingual">
          {language === 'sinhala' ? 'ව්‍යාපාරයේ සාරාංශ දසුන' : 
           language === 'english' ? 'Business overview and key metrics' :
           'ව්‍යාපාරයේ සාරාංශ දසුන / Business overview and key metrics'}
        </p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {(['today', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors font-bilingual ${
                selectedPeriod === period
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period === 'today' && (language === 'sinhala' ? 'අද' : language === 'english' ? 'Today' : 'අද / Today')}
              {period === 'week' && (language === 'sinhala' ? 'සතිය' : language === 'english' ? 'Week' : 'සතිය / Week')}
              {period === 'month' && (language === 'sinhala' ? 'මාසය' : language === 'english' ? 'Month' : 'මාසය / Month')}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium ${card.textColor} font-bilingual`}>
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1 font-bilingual">
                    {language === 'sinhala' ? 'ගත සතියට වඩා' : 
                     language === 'english' ? 'from last week' :
                     'ගත සතියට වඩා / from last week'}
                  </span>
                </div>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collection Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-bilingual">
          {language === 'sinhala' ? 'මාසික ඉලක්කය' : 
           language === 'english' ? 'Monthly Target Progress' :
           'මාසික ඉලක්කය / Monthly Target Progress'}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 font-bilingual">
            {language === 'sinhala' ? 'ප්‍රගතිය' : 
             language === 'english' ? 'Progress' :
             'ප්‍රගතිය / Progress'}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {metrics.monthlyProgress}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${metrics.monthlyProgress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 font-bilingual">
          <span>
            {formatLKR(metrics.totalCollected, { language })}
          </span>
          <span>
            {formatLKR(metrics.monthlyTarget, { language })}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors font-bilingual">
          {language === 'sinhala' ? 'නව ගනුම්කරුවෙකු එකතු කරන්න' : 
           language === 'english' ? 'Add New Customer' :
           'නව ගනුම්කරුවෙකු එකතු කරන්න / Add New Customer'}
        </button>
        
        <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors font-bilingual">
          {language === 'sinhala' ? 'ගෙවීම් වාර්තාව' : 
           language === 'english' ? 'Payment Report' :
           'ගෙවීම් වාර්තාව / Payment Report'}
        </button>
        
        <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors font-bilingual">
          {language === 'sinhala' ? 'පැහැර ගියවුන් කළමනාකරණය' : 
           language === 'english' ? 'Manage Defaulters' :
           'පැහැර ගියවුන් කළමනාකරණය / Manage Defaulters'}
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;