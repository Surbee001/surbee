export interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  tags?: string[];
  type: 'feature' | 'fix' | 'enhancement' | 'announcement';
}

export const changelogEntries: ChangelogEntry[] = [
  {
    id: 'lyra-launch',
    date: '2025-01-15',
    title: 'Introducing Surbee Lyra - AI-Powered Survey Creation',
    description: 'We are thrilled to announce the launch of Surbee Lyra, our revolutionary AI-powered survey creation tool. Lyra helps you craft PhD-grade questions that eliminate bias and encourage thoughtful responses. With intelligent suggestions and real-time optimization, creating professional surveys has never been easier.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    tags: ['AI', 'Survey Creation', 'Launch'],
    type: 'announcement'
  },
  {
    id: 'accuracy-checker',
    date: '2024-12-10',
    title: 'Advanced Accuracy Checker Now Live',
    description: 'Our new Accuracy Checker uses machine learning to analyze response patterns, detect rushed answers, and identify suspicious behavior. Each response now gets a quality score, ensuring you only get reliable data for your research and decision-making.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    tags: ['Quality Assurance', 'Machine Learning', 'Data Integrity'],
    type: 'feature'
  },
  {
    id: 'credit-network',
    date: '2024-11-20',
    title: 'Credit Network Beta Launch',
    description: 'Introducing our community-powered Credit Network! Earn credits by thoughtfully answering other researchers\' surveys, then spend them to get high-quality responses for your own. This creates a fair ecosystem where quality participation is rewarded.',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
    tags: ['Community', 'Beta', 'Distribution'],
    type: 'feature'
  },
  {
    id: 'mobile-optimization',
    date: '2024-10-05',
    title: 'Enhanced Mobile Experience',
    description: 'We\'ve completely redesigned our mobile interface for better survey creation and response collection on mobile devices. The new responsive design ensures your surveys look perfect on any screen size and provide an optimal user experience.',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    tags: ['Mobile', 'UI/UX', 'Responsive'],
    type: 'enhancement'
  }
];

export const getEntriesByYear = () => {
  const entriesByYear: { [year: string]: ChangelogEntry[] } = {};
  
  changelogEntries.forEach(entry => {
    const year = new Date(entry.date).getFullYear().toString();
    if (!entriesByYear[year]) {
      entriesByYear[year] = [];
    }
    entriesByYear[year].push(entry);
  });
  
  // Sort entries within each year by date (newest first)
  Object.keys(entriesByYear).forEach(year => {
    entriesByYear[year].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  
  return entriesByYear;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getTypeColor = (type: ChangelogEntry['type']): string => {
  switch (type) {
    case 'feature':
      return 'bg-green-500';
    case 'enhancement':
      return 'bg-blue-500';
    case 'fix':
      return 'bg-orange-500';
    case 'announcement':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

export const getTypeBadgeColor = (type: ChangelogEntry['type']): string => {
  switch (type) {
    case 'feature':
      return 'bg-green-100 text-green-800';
    case 'enhancement':
      return 'bg-blue-100 text-blue-800';
    case 'fix':
      return 'bg-orange-100 text-orange-800';
    case 'announcement':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};