import React, { useState } from 'react';
import { Search, Star, Users, FileText, Zap, TrendingUp, Clock, Tag } from 'lucide-react';
import { ImageKitProvider } from '@imagekit/next';
import { CommunitySurveyCard } from '@/components/community/CommunitySurveyCard';
import { CommunityTemplateCard } from '@/components/community/CommunityTemplateCard';

interface CommunitySurvey {
  id: string;
  title: string;
  description: string;
  category: string;
  responseCount: number;
  createdAt: string;
  previewImage?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

interface CommunityTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  remixCount: number;
  createdAt: string;
  previewImage?: string;
  tags: string[];
  framework: string;
}

export default function NotionMarketplace() {
  const [activeTab, setActiveTab] = useState<'surveys' | 'templates'>('surveys');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Sample data for surveys
  const sampleSurveys: CommunitySurvey[] = [
    {
      id: '1',
      title: 'Customer Satisfaction Survey',
      description: 'Comprehensive survey to measure customer satisfaction across multiple touchpoints',
      category: 'Business',
      responseCount: 1247,
      createdAt: '2024-01-15T10:00:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      difficulty: 'beginner',
      estimatedTime: '5 min'
    },
    {
      id: '2',
      title: 'Employee Engagement Assessment',
      description: 'Measure team engagement and identify areas for improvement',
      category: 'HR',
      responseCount: 892,
      createdAt: '2024-01-20T14:30:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      difficulty: 'intermediate',
      estimatedTime: '8 min'
    },
    {
      id: '3',
      title: 'Product Feedback Form',
      description: 'Collect detailed feedback on product features and user experience',
      category: 'Product',
      responseCount: 2156,
      createdAt: '2024-01-25T09:15:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      difficulty: 'beginner',
      estimatedTime: '6 min'
    },
    {
      id: '4',
      title: 'Market Research Study',
      description: 'Comprehensive market analysis and consumer behavior insights',
      category: 'Research',
      responseCount: 3421,
      createdAt: '2024-02-01T16:45:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      difficulty: 'advanced',
      estimatedTime: '12 min'
    },
    {
      id: '5',
      title: 'Event Feedback Survey',
      description: 'Post-event evaluation and attendee satisfaction measurement',
      category: 'Events',
      responseCount: 567,
      createdAt: '2024-02-05T11:20:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      difficulty: 'beginner',
      estimatedTime: '4 min'
    },
    {
      id: '6',
      title: 'Brand Perception Study',
      description: 'Deep dive into brand awareness and perception metrics',
      category: 'Marketing',
      responseCount: 1834,
      createdAt: '2024-02-10T13:10:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      difficulty: 'intermediate',
      estimatedTime: '10 min'
    }
  ];

  // Sample data for templates
  const sampleTemplates: CommunityTemplate[] = [
    {
      id: 't1',
      title: 'NPS Survey Template',
      description: 'Net Promoter Score survey with advanced analytics and follow-up questions',
      category: 'Customer Success',
      remixCount: 2847,
      createdAt: '2024-01-10T08:00:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      tags: ['NPS', 'Customer', 'Analytics'],
      framework: 'Customer Success'
    },
    {
      id: 't2',
      title: 'Employee Onboarding Framework',
      description: 'Complete onboarding experience with progress tracking and feedback loops',
      category: 'HR',
      remixCount: 1923,
      createdAt: '2024-01-12T10:30:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      tags: ['Onboarding', 'HR', 'Process'],
      framework: 'Human Resources'
    },
    {
      id: 't3',
      title: 'Product Launch Survey Kit',
      description: 'Comprehensive survey suite for product launches with A/B testing',
      category: 'Product',
      remixCount: 3456,
      createdAt: '2024-01-18T14:15:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      tags: ['Product', 'Launch', 'A/B Testing'],
      framework: 'Product Management'
    },
    {
      id: 't4',
      title: 'Customer Journey Mapping',
      description: 'Multi-touchpoint customer experience analysis framework',
      category: 'UX',
      remixCount: 1789,
      createdAt: '2024-01-22T16:45:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      tags: ['UX', 'Journey', 'Experience'],
      framework: 'User Experience'
    },
    {
      id: 't5',
      title: 'Market Research Toolkit',
      description: 'Complete market research framework with competitive analysis',
      category: 'Research',
      remixCount: 2134,
      createdAt: '2024-01-28T09:30:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      tags: ['Market Research', 'Competitive', 'Analysis'],
      framework: 'Market Research'
    },
    {
      id: 't6',
      title: 'Event Planning Survey Suite',
      description: 'End-to-end event planning with pre, during, and post-event surveys',
      category: 'Events',
      remixCount: 987,
      createdAt: '2024-02-02T12:20:00Z',
      previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png',
      tags: ['Events', 'Planning', 'Management'],
      framework: 'Event Management'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Business', label: 'Business' },
    { value: 'HR', label: 'HR' },
    { value: 'Product', label: 'Product' },
    { value: 'Research', label: 'Research' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Events', label: 'Events' },
    { value: 'Customer Success', label: 'Customer Success' },
    { value: 'UX', label: 'UX' }
  ];

  React.useEffect(() => {
    // Simulate loading
      const timer = setTimeout(() => {
        setLoading(false);
    }, 1000);
      return () => clearTimeout(timer);
  }, []);

  const filteredSurveys = sampleSurveys.filter(survey => {
    const matchesCategory = categoryFilter === 'all' || survey.category === categoryFilter;
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         survey.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredTemplates = sampleTemplates.filter(template => {
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleTakeSurvey = (surveyId: string) => {
    // Navigate to survey page
    window.location.href = `/survey/${surveyId}`;
  };

  const handleRemixTemplate = (templateId: string) => {
    // Navigate to dashboard with template remix
    window.location.href = `/dashboard?remixTemplate=${templateId}`;
  };

  if (loading) {
    return (
      <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
        <div className="flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </ImageKitProvider>
    );
  }

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <div className="projects-header" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>
          <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="projects-title">Community</h1>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              {/* Tab Navigation */}
              <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('surveys')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'surveys'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Surveys
                </div>
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'templates'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                  Templates
                </div>
                </button>
              </div>
              
              {/* Search and Filter */}
              <div className="flex items-center gap-4">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-gray-400"
                    style={{ 
                      borderColor: 'var(--surbee-border-accent)',
                      backgroundColor: '#141414',
                      color: 'var(--surbee-fg-primary)',
                      fontFamily: 'var(--font-inter), sans-serif'
                    }}
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                  style={{ 
                    borderColor: 'var(--surbee-border-accent)',
                    backgroundColor: '#141414',
                    color: 'var(--surbee-fg-primary)',
                    fontFamily: 'var(--font-inter), sans-serif'
                  }}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Divider Line */}
            <div className="w-full h-px" style={{ backgroundColor: 'var(--surbee-border-accent)' }}></div>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="projects-cards-container">
          <div className="projects-cards-content">
            <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">

              {/* Hero Section */}
              <div className="mt-8 mb-12">
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 px-8 rounded-2xl overflow-hidden">
                  <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <Users className="w-6 h-6 text-white" />
                      <span className="text-white/80 text-sm font-medium">Community</span>
              </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                      Discover & Create
                      <span className="block bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                        Together
                      </span>
                    </h1>
                    
                    <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                      Join thousands of creators sharing surveys and templates. Take surveys, remix frameworks, 
                      and build amazing experiences with our community.
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center justify-center gap-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-orange-400" />
                  </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-white">12.5K+</div>
                          <div className="text-white/60 text-xs">Active Surveys</div>
                      </div>
              </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                          <Zap className="w-5 h-5 text-pink-400" />
                  </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-white">3.2K+</div>
                          <div className="text-white/60 text-xs">Templates</div>
                </div>
              </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-white">98.7%</div>
                          <div className="text-white/60 text-xs">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
              </div>
            </div>
            
              {/* Content Sections */}
              {activeTab === 'surveys' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white">Take a Survey</h2>
                    <div className="text-white/60 text-sm">
                      {filteredSurveys.length} surveys available
            </div>
          </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSurveys.map(survey => (
                      <CommunitySurveyCard
                        key={survey.id}
                        survey={survey}
                        onTakeSurvey={handleTakeSurvey}
                      />
                    ))}
        </div>
      </div>
              )}

              {activeTab === 'templates' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white">Remix a Template</h2>
                    <div className="text-white/60 text-sm">
                      {filteredTemplates.length} templates available
                </div>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTemplates.map(template => (
                      <CommunityTemplateCard
                        key={template.id}
                        template={template}
                        onRemixTemplate={handleRemixTemplate}
                      />
                ))}
              </div>
            </div>
              )}

          </div>
        </div>
      </div>
    </div>
    </ImageKitProvider>
  );
}