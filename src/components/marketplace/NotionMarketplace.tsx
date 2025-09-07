import React, { useState } from 'react';
import { ChevronDown, Search, Star, TrendingUp, Briefcase, GraduationCap, Heart, Calendar, DollarSign, Target, BookOpen, List, Lightbulb, Users, Folder, PenTool, Rocket, Home, BarChart3, FileText } from 'lucide-react';
import HorizontalScroller from '@/components/ui/HorizontalScroller';
import { SkeletonHeroCard, SkeletonCard, SkeletonAvatar, SkeletonText } from '@/components/ui/skeleton';

// Image constants - replace these with your actual image URLs
const img6B8F021A90728209476Afbe585471C29Png = "/api/placeholder/825/300";
const imgVickyChris = "/api/placeholder/120/120";
const imgDesktopJpg = "/api/placeholder/400/250";
const imgSentele = "/api/placeholder/22/22";
const imgDesktopJpg1 = "/api/placeholder/400/250";
const imgOli = "/api/placeholder/22/22";
const imgDesktopJpg2 = "/api/placeholder/400/250";
const imgDesktopJpg3 = "/api/placeholder/400/250";
const imgDesktopJpg4 = "/api/placeholder/400/250";
const imgEaslo = "/api/placeholder/22/22";
const imgDesktopPng = "/api/placeholder/400/250";
const imgNotion = "/api/placeholder/22/22";
const imgDesktopJpg5 = "/api/placeholder/252/180";
const imgDesktopJpg6 = "/api/placeholder/252/180";
const imgDesktopJpg7 = "/api/placeholder/252/180";
const imgDesktopJpg8 = "/api/placeholder/252/180";
const imgDesktopPng1 = "/api/placeholder/252/180";
const imgSimpleContentPlannerPalashLalwaniDesktopPng = "/api/placeholder/252/180";
const imgProfessionalResumeNotionDesktopPng = "/api/placeholder/252/180";
const imgD02C3Ec8357Bbaa790B06243De09Ab4DPng = "/api/placeholder/327/298";
const img6708Add48658A0B793977A2154F325E6Png = "/api/placeholder/327/298";
const imgDesktopJpg9 = "/api/placeholder/400/250";
const imgDesktopJpg10 = "/api/placeholder/400/250";
const imgProfileCoverImage = "/api/placeholder/60/60";
const imgTtoki = "/api/placeholder/60/60";
const imgRodro = "/api/placeholder/60/60";
const imgSheNotions = "/api/placeholder/60/60";
const imgTristan = "/api/placeholder/60/60";
const imgProfileCoverImage1 = "/api/placeholder/60/60";
const imgJade = "/api/placeholder/60/60";
const imgProfileCoverImage2 = "/api/placeholder/60/60";
const imgDelusional = "/api/placeholder/60/60";
const imgLeBureau = "/api/placeholder/60/60";
const imgProfileCoverImage3 = "/api/placeholder/60/60";
const imgMoniasoup = "/api/placeholder/60/60";
const imgDesktopJpg11 = "/api/placeholder/400/250";
const imgBrookeProductivity = "/api/placeholder/22/22";
const imgDesktopJpg12 = "/api/placeholder/400/250";
const imgAntonioMarroffino = "/api/placeholder/22/22";
const imgDesktopJpg13 = "/api/placeholder/400/250";
const imgNoFi = "/api/placeholder/22/22";
const imgDesktopJpg14 = "/api/placeholder/400/250";
const imgAshley = "/api/placeholder/22/22";
const imgDesktopJpg15 = "/api/placeholder/400/250";
const imgShepherd = "/api/placeholder/22/22";
const imgDesktopJpg16 = "/api/placeholder/400/250";
const imgMadeByJacob = "/api/placeholder/22/22";
const img525417Ca19463D2B07Ca1C95375F6A02Png = "/api/placeholder/22/22";
const imgDesktopJpg17 = "/api/placeholder/400/250";
const imgAbdullahs = "/api/placeholder/22/22";
const imgDesktopJpg18 = "/api/placeholder/400/250";
const imgMyHueDesigns = "/api/placeholder/22/22";
const imgDesktopJpg19 = "/api/placeholder/400/250";
const imgDesktopJpg20 = "/api/placeholder/400/250";
const imgByMrnm = "/api/placeholder/22/22";
const imgDesktopJpg21 = "/api/placeholder/400/250";
const imgYusufSolmaz = "/api/placeholder/22/22";
const imgDesktopJpg22 = "/api/placeholder/400/250";
const imgSadatSayem = "/api/placeholder/22/22";
const imgDesktopJpg23 = "/api/placeholder/400/250";
const imgDesktopJpg24 = "/api/placeholder/400/250";
const imgDesktopJpg25 = "/api/placeholder/400/250";
const imgDesktopJpg26 = "/api/placeholder/400/250";
const imgDesktopJpg27 = "/api/placeholder/400/250";
const imgResonanceAtelier = "/api/placeholder/22/22";
const imgDesktopJpg28 = "/api/placeholder/400/250";
const imgDesktopJpg29 = "/api/placeholder/400/250";
const imgVasco = "/api/placeholder/22/22";
const imgDesktopJpg30 = "/api/placeholder/400/250";
const imgStructra = "/api/placeholder/22/22";
const imgDesktopJpg31 = "/api/placeholder/400/250";
const imgTestAce = "/api/placeholder/22/22";
const imgDesktopJpg32 = "/api/placeholder/400/250";
const imgAriadneAdresteia = "/api/placeholder/22/22";
const imgDesktopJpg33 = "/api/placeholder/400/250";
const imgMilesDobrenski = "/api/placeholder/22/22";
const imgBecomeCreatorDarkPng = "/api/placeholder/400/300";

export default function NotionMarketplace() {
  const [viewAll, setViewAll] = useState<null | 'featured' | 'collections' | 'popular'>(null);
  const [loading, setLoading] = useState(true);

  // Only show loading on first visit, not on navigation
  React.useEffect(() => {
    const hasLoaded = sessionStorage.getItem('dashboard_loaded');
    if (hasLoaded) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('dashboard_loaded', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Skeleton loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <div className="projects-header" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>
          <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="projects-title">Community</h1>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-5">
                <div className="text-[16px] font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                  Discover
                </div>
                <div className="text-[16px] font-medium opacity-60" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Templates
                </div>
              </div>
              
              {/* Search Skeleton */}
              <div className="relative">
                <div className="skeleton-form-input" style={{ width: '296px', height: '2.5rem' }}></div>
              </div>
            </div>

            {/* Divider Line */}
            <div className="w-full h-px bg-gray-200/10"></div>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="projects-cards-container">
          <div className="projects-cards-fade"></div>
          
          <div className="projects-cards-content">
            <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">

              {/* Hero Section Skeleton */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SkeletonHeroCard />
                </div>
                <div className="w-full">
                  <SkeletonHeroCard />
                </div>
              </div>

              {/* Featured Templates Section Skeleton */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-11">
                  <div className="flex items-center">
                    <div className="w-3.5 h-3.5 mr-2 skeleton-base" style={{ borderRadius: '50%' }}></div>
                    <SkeletonText width="120px" height="0.75rem" />
                  </div>
                  <SkeletonText width="60px" height="0.75rem" />
                </div>
                
                <HorizontalScroller>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="w-[260px] md:w-[280px] flex-shrink-0 group cursor-pointer">
                      <div className="relative h-[220px] md:h-[240px] rounded-xl overflow-hidden">
                        <div className="skeleton-image w-full h-full"></div>
                      </div>
                      <div className="mt-3 flex items-start gap-2">
                        <div className="skeleton-circle" style={{ width: '22px', height: '22px' }}></div>
                        <div className="flex-1">
                          <SkeletonText height="0.875rem" className="mb-1" />
                          <div className="flex items-center gap-1">
                            <div className="skeleton-circle" style={{ width: '10px', height: '10px' }}></div>
                            <SkeletonText width="30px" height="0.75rem" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </HorizontalScroller>
              </div>

              {/* Survey Collections Section Skeleton */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-11">
                  <div className="flex items-center">
                    <div className="w-3.5 h-3.5 mr-2 skeleton-base" style={{ borderRadius: '50%' }}></div>
                    <SkeletonText width="100px" height="0.75rem" />
                  </div>
                  <SkeletonText width="70px" height="0.75rem" />
                </div>
                
                <HorizontalScroller>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="w-[240px] md:w-[252px] flex-shrink-0 bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden">
                      <div className="skeleton-image h-24"></div>
                      <div className="p-4">
                        <SkeletonText height="0.875rem" className="mb-2" />
                        <div className="flex items-center gap-1">
                          <div className="skeleton-circle" style={{ width: '16px', height: '16px' }}></div>
                          <SkeletonText width="60px" height="0.75rem" />
                        </div>
                      </div>
                    </div>
                  ))}
                </HorizontalScroller>
              </div>

              {/* Popular This Week Skeleton */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-11">
                  <div className="flex items-center">
                    <div className="w-3.5 h-3.5 mr-2 skeleton-base" style={{ borderRadius: '50%' }}></div>
                    <SkeletonText width="110px" height="0.75rem" />
                  </div>
                  <SkeletonText width="60px" height="0.75rem" />
                </div>
                
                <HorizontalScroller>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="w-[260px] md:w-[280px] flex-shrink-0 group cursor-pointer">
                      <div className="relative h-[220px] md:h-[240px] rounded-xl overflow-hidden">
                        <div className="skeleton-image w-full h-full"></div>
                      </div>
                      <div className="mt-3 flex items-start gap-2">
                        <div className="skeleton-circle" style={{ width: '22px', height: '22px' }}></div>
                        <div className="flex-1">
                          <SkeletonText height="0.875rem" className="mb-1" />
                          <div className="flex items-center gap-1">
                            <div className="skeleton-circle" style={{ width: '10px', height: '10px' }}></div>
                            <SkeletonText width="30px" height="0.75rem" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </HorizontalScroller>
              </div>

              {/* Top Survey Creators Skeleton */}
              <div className="mt-10 mb-20">
                <div className="flex items-center justify-between mb-11">
                  <div className="flex items-center">
                    <div className="w-3.5 h-3.5 mr-2 skeleton-base" style={{ borderRadius: '50%' }}></div>
                    <SkeletonText width="130px" height="0.75rem" />
                  </div>
                  <SkeletonText width="60px" height="0.75rem" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-[22.67px] gap-y-8">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="text-center cursor-pointer">
                      <div className="w-[60px] h-[60px] mx-auto mb-3 skeleton-circle"></div>
                      <SkeletonText height="0.875rem" className="mb-1" />
                      <SkeletonText width="80%" height="0.75rem" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="projects-header" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>
        <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="projects-title">
              Community
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-5">
              <div className="text-[16px] font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                Discover
              </div>
              <div className="text-[16px] font-medium hover:text-[#EA6E5F] transition-colors cursor-pointer" style={{ color: 'var(--surbee-fg-muted)' }}>
                Templates
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surbee-input-placeholder)' }} />
              <input 
                type="text" 
                placeholder="Search community surveys..." 
                className="search-input"
                style={{ paddingLeft: '2.5rem', width: '296px' }}
              />
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full h-px bg-gray-200/10"></div>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="projects-cards-container">
        {/* Top Fade Effect */}
        <div className="projects-cards-fade"></div>
        
        <div className="projects-cards-content">
          <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">

            {/* Hero Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured Survey Templates card */}
              <div className="lg:col-span-2 h-[220px] md:h-[260px] theme-card rounded-2xl relative overflow-hidden">
                <div className="p-[29px] relative z-10">
                  <div className="flex items-center gap-1.5 mb-7">
                    <Star className="w-4 h-4 text-theme-muted" />
                    <span className="text-[12px] font-semibold text-theme-muted">Featured</span>
                  </div>
                  <h2 className="text-[30px] font-semibold text-theme-primary leading-9 mb-4">
                    Popular Community Surveys
                  </h2>
                  <p className="text-[14px] text-theme-primary leading-5">
                    Discover surveys created and shared<br />
                    by the Surbee community.
                  </p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-[413px] bg-theme-secondary rounded-r-2xl hidden md:block">
                  <div className="w-full h-full rounded-r-2xl theme-card" />
                </div>
              </div>

              {/* Top creator card */}
              <div className="w-full h-[220px] md:h-[260px] theme-card rounded-2xl relative">
                <div className="p-[29px]">
                  <div className="flex items-center gap-1.5 mb-7">
                    <TrendingUp className="w-4 h-4 text-theme-muted" />
                    <span className="text-[12px] font-semibold text-theme-muted">Top creator</span>
                  </div>
                  <h2 className="text-[30px] font-semibold text-theme-primary leading-9 mb-4">
                    Sarah Johnson
                  </h2>
                  <p className="text-[14px] text-theme-primary leading-5">
                    Expert in customer satisfaction surveys<br />
                    and market research templates
                  </p>
                </div>
                <div className="absolute bottom-[23px] right-[29px] w-[120px] h-[120px] rounded-full theme-card border border-theme-primary">
                  <div className="w-full h-full rounded-full theme-card" />
                </div>
              </div>
            </div>

            {/* Featured Templates Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-11">
                <div className="flex items-center">
                  <Lightbulb className="w-3.5 h-3.5 mr-2" />
                  <span className="text-[12px] font-semibold text-theme-muted">Featured community surveys</span>
                </div>
                <button onClick={() => setViewAll(viewAll === 'featured' ? null : 'featured')} className="text-[12px] font-semibold text-theme-muted hover:text-theme-secondary flex items-center gap-1">
                  See more
                  <ChevronDown className="w-3 h-3 -rotate-90" />
                </button>
              </div>
              {viewAll === 'featured' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { image: imgDesktopJpg, avatar: imgSentele, title: "Customer Satisfaction Survey", rating: "4.9", price: "Free", category: "Customer" },
                    { image: imgDesktopJpg1, avatar: imgOli, title: "Employee Feedback Form", rating: "5.0", price: "Free", category: "HR" },
                    { image: imgDesktopJpg2, avatar: imgOli, title: "Market Research Survey", rating: "5.0", price: "Free", category: "Research" },
                    { image: imgDesktopJpg3, avatar: imgVickyChris, title: "Product Feedback Quiz", rating: "4.9", price: "Free", category: "Product" },
                    { image: imgDesktopJpg4, avatar: imgEaslo, title: "Event Registration Form", rating: "4.8", price: "Free", category: "Events" },
                    { image: imgDesktopPng, avatar: imgNotion, title: "Training Assessment", rating: "4.8", price: "Free", category: "Training" },
                    { image: imgDesktopJpg11, avatar: imgBrookeProductivity, title: "Course Evaluation Survey", rating: "4.7", price: "Free", category: "Education" },
                    { image: imgDesktopJpg12, avatar: imgAntonioMarroffino, title: "Brand Awareness Study", rating: "4.6", price: "Free", category: "Marketing" },
                  ].map((template, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="relative h-[220px] md:h-[240px] rounded-xl overflow-hidden theme-card">
                        <div className="w-full h-full theme-card" />
                        <div className="absolute bottom-3 right-3 theme-card backdrop-blur-lg rounded-md px-2 py-1">
                          <span className="text-[14px] font-semibold text-theme-muted">{template.price}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-start gap-2">
                        <div className="w-[22px] h-[22px] rounded-full theme-card flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-[14px] font-semibold text-theme-primary">{template.title}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-2.5 h-2.5 fill-current text-yellow-500" />
                            <span className="text-[12px] font-semibold text-theme-muted">{template.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <HorizontalScroller>
                  {[
                    { image: imgDesktopJpg, avatar: imgSentele, title: "Customer Satisfaction Survey", rating: "4.9", price: "Free", category: "Customer" },
                    { image: imgDesktopJpg1, avatar: imgOli, title: "Employee Feedback Form", rating: "5.0", price: "Free", category: "HR" },
                    { image: imgDesktopJpg2, avatar: imgOli, title: "Market Research Survey", rating: "5.0", price: "Free", category: "Research" },
                    { image: imgDesktopJpg3, avatar: imgVickyChris, title: "Product Feedback Quiz", rating: "4.9", price: "Free", category: "Product" },
                    { image: imgDesktopJpg4, avatar: imgEaslo, title: "Event Registration Form", rating: "4.8", price: "Free", category: "Events" },
                    { image: imgDesktopPng, avatar: imgNotion, title: "Training Assessment", rating: "4.8", price: "Free", category: "Training" },
                    { image: imgDesktopJpg11, avatar: imgBrookeProductivity, title: "Course Evaluation Survey", rating: "4.7", price: "Free", category: "Education" },
                    { image: imgDesktopJpg12, avatar: imgAntonioMarroffino, title: "Brand Awareness Study", rating: "4.6", price: "Free", category: "Marketing" },
                  ].map((template, index) => (
                    <div key={index} className="w-[260px] md:w-[280px] flex-shrink-0 group cursor-pointer">
                      <div className="relative h-[220px] md:h-[240px] rounded-xl overflow-hidden theme-card">
                        <div className="w-full h-full theme-card" />
                        <div className="absolute bottom-3 right-3 theme-card backdrop-blur-lg rounded-md px-2 py-1">
                          <span className="text-[14px] font-semibold text-theme-muted">{template.price}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-start gap-2">
                        <div className="w-[22px] h-[22px] rounded-full bg-neutral-700" />
                        <div className="flex-1">
                          <h3 className="text-[14px] font-semibold text-theme-primary">{template.title}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-2.5 h-2.5 fill-current text-yellow-500" />
                            <span className="text-[12px] font-semibold text-theme-muted">{template.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </HorizontalScroller>
              )}
            </div>

            {/* Survey Collections Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-11">
                <div className="flex items-center">
                  <Folder className="w-3.5 h-3.5 mr-2" />
                  <span className="text-[12px] font-semibold text-theme-muted">Survey collections</span>
                </div>
                <button onClick={() => setViewAll(viewAll === 'collections' ? null : 'collections')} className="text-[12px] font-semibold text-theme-muted hover:text-theme-secondary flex items-center gap-1">
                  Browse all
                  <ChevronDown className="w-3 h-3 -rotate-90" />
                </button>
              </div>
              {viewAll === 'collections' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Customer Experience Pack", count: "12 surveys", color: "#2a2a2a", image: imgDesktopJpg5 },
                    { title: "Employee Engagement Suite", count: "8 surveys", color: "#2a2a2a", image: imgDesktopJpg6 },
                    { title: "Market Research Toolkit", count: "15 surveys", color: "#2a2a2a", image: imgDesktopJpg7 },
                    { title: "Academic Research Forms", count: "10 surveys", color: "#2a2a2a", image: imgDesktopJpg8 },
                    { title: "Event Feedback Collection", count: "6 surveys", color: "#2a2a2a", image: imgDesktopPng1 },
                    { title: "Health & Wellness Surveys", count: "9 surveys", color: "#2a2a2a", image: imgSimpleContentPlannerPalashLalwaniDesktopPng },
                    { title: "Training Assessment Suite", count: "7 surveys", color: "#2a2a2a", image: imgProfessionalResumeNotionDesktopPng },
                    { title: "Customer Experience Pack 2", count: "10 surveys", color: "#2a2a2a", image: imgDesktopJpg5 },
                  ].map((collection, index) => (
                    <div key={index} className="w-full theme-card rounded-xl overflow-hidden cursor-pointer group">
                      <div className="h-24 theme-card" />
                      <div className="p-4 border-t border-theme-primary">
                        <h3 className="text-[14px] font-semibold text-theme-primary mb-2 line-clamp-2">
                          {collection.title}
                        </h3>
                        <div className="flex items-center gap-1 text-[12px] text-theme-muted">
                          <Folder className="w-4 h-4" />
                          <span>{collection.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <HorizontalScroller>
                  {[
                    { title: "Customer Experience Pack", count: "12 surveys", color: "#2a2a2a", image: imgDesktopJpg5 },
                    { title: "Employee Engagement Suite", count: "8 surveys", color: "#2a2a2a", image: imgDesktopJpg6 },
                    { title: "Market Research Toolkit", count: "15 surveys", color: "#2a2a2a", image: imgDesktopJpg7 },
                    { title: "Academic Research Forms", count: "10 surveys", color: "#2a2a2a", image: imgDesktopJpg8 },
                    { title: "Event Feedback Collection", count: "6 surveys", color: "#2a2a2a", image: imgDesktopPng1 },
                    { title: "Health & Wellness Surveys", count: "9 surveys", color: "#2a2a2a", image: imgSimpleContentPlannerPalashLalwaniDesktopPng },
                    { title: "Training Assessment Suite", count: "7 surveys", color: "#2a2a2a", image: imgProfessionalResumeNotionDesktopPng },
                  ].map((collection, index) => (
                    <div key={index} className="w-[240px] md:w-[252px] flex-shrink-0 bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden cursor-pointer group">
                      <div className="h-24 bg-neutral-800" />
                      <div className="p-4 border-t border-theme-primary">
                        <h3 className="text-[14px] font-semibold text-theme-primary mb-2 line-clamp-2">
                          {collection.title}
                        </h3>
                        <div className="flex items-center gap-1 text-[12px] text-theme-muted">
                          <Folder className="w-4 h-4" />
                          <span>{collection.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </HorizontalScroller>
              )}
            </div>

            {/* Popular This Week */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-11">
                <div className="flex items-center">
                  <Rocket className="w-3.5 h-3.5 mr-2" />
                  <span className="text-[12px] font-semibold text-theme-muted">Popular this week</span>
                </div>
                <button onClick={() => setViewAll(viewAll === 'popular' ? null : 'popular')} className="text-[12px] font-semibold text-theme-muted hover:text-theme-secondary flex items-center gap-1">
                  See more
                  <ChevronDown className="w-3 h-3 -rotate-90" />
                </button>
              </div>
              {viewAll === 'popular' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { image: imgDesktopJpg8, title: "Net Promoter Score Survey", avatar: imgNotion, rating: "4.8", price: "Free" },
                    { image: imgDesktopJpg9, title: "Exit Interview Form", avatar: imgNotion, rating: "4.8", price: "Free" },
                    { image: imgDesktopJpg10, title: "Product Launch Feedback", avatar: imgNotion, rating: "4.9", price: "Free" },
                    { image: imgDesktopJpg11, title: "Course Evaluation Survey", avatar: imgBrookeProductivity, rating: "4.7", price: "Free" },
                    { image: imgDesktopJpg12, title: "Brand Awareness Study", avatar: imgAntonioMarroffino, rating: "4.6", price: "Free" },
                    { image: imgDesktopJpg8, title: "Net Promoter Score Survey 2", avatar: imgNotion, rating: "4.8", price: "Free" },
                    { image: imgDesktopJpg9, title: "Exit Interview Form 2", avatar: imgNotion, rating: "4.8", price: "Free" },
                    { image: imgDesktopJpg10, title: "Product Launch Feedback 2", avatar: imgNotion, rating: "4.9", price: "Free" },
                  ].map((template, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="relative h-[220px] md:h-[240px] rounded-xl overflow-hidden theme-card">
                        <div className="w-full h-full theme-card" />
                        <div className="absolute bottom-3 right-3 theme-card backdrop-blur-lg rounded-md px-2 py-1">
                          <span className="text-[14px] font-semibold text-theme-muted">{template.price}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-start gap-2">
                        <div className="w-[22px] h-[22px] rounded-full theme-card flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-[14px] font-semibold text-theme-primary">{template.title}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-2.5 h-2.5 fill-current text-yellow-500" />
                            <span className="text-[12px] font-semibold text-theme-muted">{template.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <HorizontalScroller>
                  {[
                    { image: imgDesktopJpg8, title: "Net Promoter Score Survey", avatar: imgNotion, rating: "4.8", price: "Free" },
                    { image: imgDesktopJpg9, title: "Exit Interview Form", avatar: imgNotion, rating: "4.8", price: "Free" },
                    { image: imgDesktopJpg10, title: "Product Launch Feedback", avatar: imgNotion, rating: "4.9", price: "Free" },
                    { image: imgDesktopJpg11, title: "Course Evaluation Survey", avatar: imgBrookeProductivity, rating: "4.7", price: "Free" },
                    { image: imgDesktopJpg12, title: "Brand Awareness Study", avatar: imgAntonioMarroffino, rating: "4.6", price: "Free" },
                  ].map((template, index) => (
                    <div key={index} className="w-[260px] md:w-[280px] flex-shrink-0 group cursor-pointer">
                      <div className="relative h-[220px] md:h-[240px] rounded-xl overflow-hidden theme-card">
                        <div className="w-full h-full theme-card" />
                        <div className="absolute bottom-3 right-3 theme-card backdrop-blur-lg rounded-md px-2 py-1">
                          <span className="text-[14px] font-semibold text-theme-muted">{template.price}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-start gap-2">
                        <div className="w-[22px] h-[22px] rounded-full theme-card flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-[14px] font-semibold text-theme-primary">{template.title}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-2.5 h-2.5 fill-current text-yellow-500" />
                            <span className="text-[12px] font-semibold text-theme-muted">{template.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </HorizontalScroller>
              )}
            </div>

            {/* Top Survey Creators Section */}
            <div className="mt-10 mb-20">
              <div className="flex items-center justify-between mb-11">
                <div className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-2" />
                  <span className="text-[12px] font-semibold text-theme-muted">Top survey creators</span>
                </div>
                <button className="text-[12px] font-semibold text-theme-muted hover:text-theme-secondary">
                  See more
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-[22.67px] gap-y-8">
                {[
                  { avatar: imgProfileCoverImage, name: "Sarah Johnson", followers: "142K followers" },
                  { avatar: imgTtoki, name: "Mike Chen", followers: "53K followers" },
                  { avatar: imgRodro, name: "Lisa Rodriguez", followers: "52K followers" },
                  { avatar: imgSheNotions, name: "Emma Wilson", followers: "48K followers" },
                  { avatar: imgTristan, name: "David Kim", followers: "37K followers" },
                  { avatar: imgProfileCoverImage1, name: "Anna Foster", followers: "36K followers" },
                  { avatar: imgJade, name: "Tom Green", followers: "32K followers" },
                  { avatar: imgProfileCoverImage2, name: "Maya Patel", followers: "31K followers" },
                  { avatar: imgDelusional, name: "Alex Rivera", followers: "31K followers" },
                  { avatar: imgLeBureau, name: "Le Bureau", followers: "30K followers" },
                  { avatar: imgProfileCoverImage3, name: "Izzy Simpson", followers: "30K followers" },
                  { avatar: imgMoniasoup, name: "Monica Soup", followers: "28K followers" },
                ].map((creator, index) => (
                  <div key={index} className="text-center cursor-pointer group">
                    <div className="w-[60px] h-[60px] mx-auto mb-3 rounded-full overflow-hidden border-2 border-transparent group-hover:border-theme-muted transition-all">
                      <div className="w-full h-full theme-card" />
                    </div>
                    <h4 className="text-[14px] font-semibold text-theme-primary mb-1">{creator.name}</h4>
                    <p className="text-[12px] text-theme-muted">{creator.followers}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}