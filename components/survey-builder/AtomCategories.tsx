import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Play,
  MessageSquare,
  Users,
  FileText,
  CheckSquare,
  Star,
  Settings,
  Home,
  Video,
  Type,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileVideo,
  Bot,
  HelpCircle,
  ChevronRight,
  Grid,
  Image,
  CheckCircle,
  FileCheck,
  Scale,
  TrendingUp,
  Hash,
  Calendar,
  CreditCard,
  Upload,
  FolderOpen,
  Clock,
  Save,
  Eye,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AtomCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  atoms: AtomItem[];
}

interface AtomItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isNew?: boolean;
  isPopular?: boolean;
}

const atomCategories: AtomCategory[] = [
  {
    id: 'recommended',
    title: 'Recommended',
    description: 'Most popular and versatile atoms',
    icon: Star,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    atoms: [
      {
        id: 'video-audio',
        name: 'Video/Audio',
        description: 'Embed videos or audio files',
        icon: Video,
        isPopular: true,
      },
      {
        id: 'short-text',
        name: 'Short Text',
        description: 'Single line text input',
        icon: Type,
        isPopular: true,
      },
      {
        id: 'multiple-choice',
        name: 'Multiple Choice',
        description: 'Select from predefined options',
        icon: CheckSquare,
        isPopular: true,
      },
    ],
  },
  {
    id: 'connect-apps',
    title: 'Connect to Apps',
    description: 'Integrate with external services',
    icon: Settings,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    atoms: [
      {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Connect to HubSpot CRM',
        icon: Users,
        isNew: true,
      },
      {
        id: 'browse-apps',
        name: 'Browse Apps',
        description: 'Explore available integrations',
        icon: Grid,
        isNew: true,
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'Collect contact information',
    icon: Users,
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    atoms: [
      {
        id: 'contact-info',
        name: 'Contact Info',
        description: 'Complete contact form',
        icon: Users,
      },
      {
        id: 'email',
        name: 'Email',
        description: 'Email address input',
        icon: Mail,
      },
      {
        id: 'phone',
        name: 'Phone',
        description: 'Phone number input',
        icon: Phone,
      },
      {
        id: 'address',
        name: 'Address',
        description: 'Full address input',
        icon: MapPin,
      },
      {
        id: 'website',
        name: 'Website',
        description: 'Website URL input',
        icon: Globe,
      },
    ],
  },
  {
    id: 'text-video',
    title: 'Text/Video',
    description: 'Content and media atoms',
    icon: FileText,
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    atoms: [
      {
        id: 'long-text',
        name: 'Long Text',
        description: 'Multi-line text area',
        icon: FileText,
      },
      {
        id: 'short-text',
        name: 'Short Text',
        description: 'Single line text input',
        icon: Type,
      },
      {
        id: 'video-audio',
        name: 'Video/Audio',
        description: 'Embed media content',
        icon: FileVideo,
      },
      {
        id: 'clarify-ai',
        name: 'Clarify AI',
        description: 'AI-powered clarification',
        icon: Bot,
        isNew: true,
      },
      {
        id: 'faq-ai',
        name: 'FAQ AI',
        description: 'AI-generated FAQs',
        icon: HelpCircle,
        isNew: true,
      },
    ],
  },
  {
    id: 'choice',
    title: 'Choice',
    description: 'Selection and decision atoms',
    icon: CheckSquare,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    atoms: [
      {
        id: 'multiple-choice',
        name: 'Multiple Choice',
        description: 'Select from options',
        icon: CheckSquare,
      },
      {
        id: 'dropdown',
        name: 'Dropdown',
        description: 'Dropdown selection',
        icon: ChevronDown,
      },
      {
        id: 'picture-choice',
        name: 'Picture Choice',
        description: 'Select with images',
        icon: Image,
      },
      {
        id: 'yes-no',
        name: 'Yes/No',
        description: 'Simple yes/no choice',
        icon: CheckCircle,
      },
      {
        id: 'legal',
        name: 'Legal',
        description: 'Terms and conditions',
        icon: FileCheck,
      },
      {
        id: 'checkbox',
        name: 'Checkbox',
        description: 'Multiple selections',
        icon: CheckSquare,
      },
    ],
  },
  {
    id: 'rating',
    title: 'Rating',
    description: 'Scales and evaluation atoms',
    icon: Star,
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    atoms: [
      {
        id: 'nps',
        name: 'NPS',
        description: 'Net Promoter Score',
        icon: TrendingUp,
      },
      {
        id: 'opinion-scale',
        name: 'Opinion Scale',
        description: 'Custom rating scale',
        icon: Scale,
      },
      {
        id: 'rating',
        name: 'Rating',
        description: 'Star or icon rating',
        icon: Star,
      },
      {
        id: 'ranking',
        name: 'Ranking',
        description: 'Order preferences',
        icon: Hash,
      },
      {
        id: 'matrix',
        name: 'Matrix',
        description: 'Grid-based questions',
        icon: Grid,
      },
    ],
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Specialized input atoms',
    icon: Settings,
    color: 'bg-gradient-to-r from-gray-500 to-slate-500',
    atoms: [
      {
        id: 'number',
        name: 'Number',
        description: 'Numeric input',
        icon: Hash,
      },
      {
        id: 'date',
        name: 'Date',
        description: 'Date picker',
        icon: Calendar,
      },
      {
        id: 'payment',
        name: 'Payment',
        description: 'Payment processing',
        icon: CreditCard,
      },
      {
        id: 'file-upload',
        name: 'File Upload',
        description: 'File upload field',
        icon: Upload,
      },
      {
        id: 'google-drive',
        name: 'Google Drive',
        description: 'Google Drive integration',
        icon: FolderOpen,
      },
      {
        id: 'calendly',
        name: 'Calendly',
        description: 'Calendar scheduling',
        icon: Clock,
      },
    ],
  },
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Form flow and navigation',
    icon: Home,
    color: 'bg-gradient-to-r from-teal-500 to-green-500',
    atoms: [
      {
        id: 'partial-submit',
        name: 'Partial Submit',
        description: 'Save progress',
        icon: Save,
      },
      {
        id: 'statement',
        name: 'Statement',
        description: 'Informational text',
        icon: Eye,
      },
      {
        id: 'question-group',
        name: 'Question Group',
        description: 'Group related questions',
        icon: Users,
      },
      {
        id: 'multi-page',
        name: 'Multi-Page',
        description: 'Multi-page form',
        icon: ArrowRight,
      },
      {
        id: 'end-screen',
        name: 'End Screen',
        description: 'Completion screen',
        icon: CheckCircle,
      },
      {
        id: 'redirect',
        name: 'Redirect',
        description: 'Redirect after submit',
        icon: ArrowRight,
      },
    ],
  },
];

interface AtomCategoriesProps {
  onSelectAtom: (atomType: string) => void;
  className?: string;
}

export function AtomCategories({
  onSelectAtom,
  className,
}: AtomCategoriesProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    'recommended',
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = atomCategories
    .map((category) => ({
      ...category,
      atoms: category.atoms.filter(
        (atom) =>
          atom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          atom.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.atoms.length > 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search atoms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader
                  className="cursor-pointer p-4"
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === category.id ? null : category.id,
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-white',
                          category.color,
                        )}
                      >
                        <category.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {category.title}
                        </CardTitle>
                        <p className="text-xs text-gray-500">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-gray-400 transition-transform',
                        expandedCategory === category.id && 'rotate-180',
                      )}
                    />
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {expandedCategory === category.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="p-0">
                        <div className="grid grid-cols-1 gap-1 p-4 pt-0">
                          {category.atoms.map((atom) => (
                            <motion.div
                              key={atom.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                variant="ghost"
                                className="w-full justify-start h-auto p-3 text-left hover:bg-gray-50"
                                onClick={() => onSelectAtom(atom.id)}
                              >
                                <div className="flex items-center space-x-3 w-full">
                                  <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                                    <atom.icon className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-medium truncate">
                                        {atom.name}
                                      </span>
                                      {atom.isNew && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          New
                                        </Badge>
                                      )}
                                      {atom.isPopular && (
                                        <Badge className="text-xs bg-purple-100 text-purple-700">
                                          Popular
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                      {atom.description}
                                    </p>
                                  </div>
                                  <Plus className="w-4 h-4 text-gray-400" />
                                </div>
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Search icon component
function Search({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
