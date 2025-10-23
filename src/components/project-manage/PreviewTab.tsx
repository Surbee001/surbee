import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  ExternalLink,
  Edit2,
  Settings,
  Eye,
  Users,
  Clock,
  Globe,
  Code,
  Terminal,
  Type,
  Palette,
  Minus,
  Plus,
  MousePointer,
  Square,
  Circle,
  Triangle,
  Image,
  FileText,
  Layout,
  Grid3X3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  Heart,
  Smile,
  Frown,
  Zap,
  Wind,
  Waves,
  Flame,
  Sparkles,
  Eye as EyeIcon,
  EyeOff,
  Hand,
  Mouse,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  Layers,
  Download,
  Upload,
  Camera,
  Music,
  Video,
  Mic,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  MapPin,
  Clock as ClockIcon,
  User,
  Users as UsersIcon,
  ShoppingCart,
  CreditCard,
  Home,
  Building,
  Car,
  Plane,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Thermometer,
  Droplets,
  Leaf,
  TreePine,
  Mountain,
  Compass,
  Navigation,
  Wifi,
  Bluetooth,
  Battery,
  Power,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Headphones,
  Speaker,
  Radio,
  Tv,
  Monitor as MonitorIcon,
  Laptop,
  Smartphone as SmartphoneIcon,
  Tablet,
  Watch,
  Camera as CameraIcon,
  Printer,
  Keyboard,
  Cpu,
  HardDrive,
  Usb,
  Plug,
  Lightbulb,
  Lamp,
  Couch,
  Bed,
  Chair,
  Table,
  Utensils,
  Coffee,
  Pizza,
  Apple,
  Cookie,
  Cake,
  IceCream,
  Wine,
  Beer,
  Shirt,
  TShirt,
  Pants,
  Dress,
  Shoes,
  Watch as WatchIcon,
  Glasses,
  Hat,
  Bag,
  Backpack,
  Briefcase,
  Wallet,
  Key,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  Book,
  Newspaper,
  File,
  Folder,
  FolderOpen,
  Archive,
  Trash,
  Save,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Send,
  Share,
  Link,
  Unlink,
  Paperclip,
  Scissors,
  Edit3,
  Pen,
  Pencil,
  Highlighter,
  Eraser,
  Paintbrush,
  Palette as PaletteIcon,
  Color,
  Ruler,
  Compass as CompassIcon,
  Calculator,
  Abacus,
  Target,
  Crosshair,
  Radar,
  Satellite,
  Rocket,
  Telescope,
  Microscope,
  Atom,
  Dna,
  Pill,
  Stethoscope,
  HeartPulse,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  AreaChart,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  Coins,
  Banknote,
  Receipt,
  Ticket,
  Gift,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Star as StarIcon,
  StarOff,
  SunDim,
  Sunrise,
  Sunset,
  Eclipse,
  Moon as MoonIcon,
  Stars,
  CloudDrizzle,
  CloudLightning,
  Tornado,
  Wind as WindIcon,
  Snowflake,
  ThermometerSun,
  ThermometerSnow,
  Rainbow,
  Umbrella,
  Glasses as GlassesIcon,
  Sunglasses,
  Eye as EyeIcon2,
  EyeOff as EyeOffIcon,
  Ear,
  Nose,
  Mouth,
  Tongue,
  Tooth,
  Brain,
  Skull,
  Bone,
  Footprints,
  Baby,
  Child,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Users2,
  UserCircle,
  UserSquare,
  UsersCheck,
  UsersX,
  UsersPlus,
  UsersMinus,
  Group,
  Team,
  Network,
  Share2,
  Link2,
  Unlink2,
  Merge,
  Split,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitPush,
  GitCompare,
  Terminal as TerminalIcon,
  Command,
  Code2,
  Codepen,
  Codesandbox,
  Figma,
  Framer,
  Adobe,
  Sketch,
  Invision,
  Zeplin,
  Principle,
  Marvel,
  Axure,
  Balsamiq,
  Lucidchart,
  DrawIo,
  Miro,
  Mural,
  Notion,
  Coda,
  Airtable,
  Asana,
  Trello,
  Jira,
  Monday,
  Basecamp,
  Slack,
  Discord,
  Teams,
  Zoom,
  Meet,
  Skype,
  Whatsapp,
  Telegram,
  Signal,
  Viber,
  Wechat,
  Line,
  Kik,
  Messenger,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Tiktok,
  Linkedin,
  Github,
  Gitlab,
  Bitbucket,
  StackOverflow,
  Reddit,
  Twitch,
  Dribbble,
  Behance,
  Pinterest,
  Snapchat,
  Vimeo,
  Soundcloud,
  Spotify,
  AppleMusic,
  Deezer,
  Tidal,
  Amazon,
  Ebay,
  Etsy,
  Shopify,
  WooCommerce,
  Magento,
  Bigcommerce,
  Squarespace,
  Wix,
  Webflow,
  Bubble,
  Adalo,
  Glide,
  Zapier,
  Ifttt,
  Automate,
  Integromat,
  Parabola,
  Microsoft,
  Google,
  Apple,
  Android,
  Linux,
  Windows,
  Chrome,
  Firefox,
  Safari,
  Edge,
  Opera,
  Brave,
  Vivaldi,
  Tor,
  DuckDuckGo,
  Bing,
  Yahoo,
  Ask,
  Aol,
  Protonmail,
  Gmail,
  Outlook,
  Icloud,
  Fastmail,
  Zoho,
  Rackspace,
  Godaddy,
  Namecheap,
  Hover,
  Porkbun,
  Njalla,
  Epik,
  Hexonet,
  Openprovider,
  Registrar,
  Hosting,
  Server,
  Database,
  Cloud as CloudIcon,
  CloudUpload,
  CloudDownload,
  CloudSync,
  CloudShare,
  CloudLock,
  CloudCheck,
  CloudX,
  CloudAlert,
  CloudOff,
  CloudQueue,
  CloudDone,
  CloudError,
  CloudWarning,
  CloudInfo,
  CloudHelp,
  CloudQuestion,
  CloudSearch,
  CloudFilter,
  CloudSort,
  CloudRefresh,
  CloudHistory,
  CloudBackup,
  CloudRestore,
  CloudArchive,
  CloudUnarchive,
  CloudDelete,
  CloudRemove,
  CloudAdd,
  CloudMinus,
  CloudPlus,
  CloudUp,
  CloudDown,
  CloudLeft,
  CloudRight,
  CloudTop,
  CloudBottom,
  CloudCenter,
  CloudMiddle,
  CloudEdge,
  CloudCorner,
  CloudSide,
  CloudBorder,
  CloudFrame,
  CloudOutline,
  CloudFill,
  CloudGradient,
  CloudPattern,
  CloudTexture,
  CloudNoise,
  CloudGrain,
  CloudDots,
  CloudLines,
  CloudCurves,
  CloudShapes,
  CloudSymbols,
  CloudIcons,
  CloudEmoji,
  CloudStickers,
  CloudGifs,
  CloudImages,
  CloudVideos,
  CloudAudio,
  CloudMusic,
  CloudPodcasts,
  CloudRadio,
  CloudTv,
  CloudMovies,
  CloudSeries,
  CloudDocumentaries,
  CloudAnime,
  CloudCartoons,
  CloudComedy,
  CloudDrama,
  CloudAction,
  CloudAdventure,
  CloudAnimation,
  CloudBiography,
  CloudDocumentary,
  CloudEducational,
  CloudEntertainment,
  CloudFantasy,
  CloudFiction,
  CloudHistory as HistoryIcon,
  CloudHorror,
  CloudKids,
  CloudMusic as MusicIcon,
  CloudMystery,
  CloudNews,
  CloudReality,
  CloudRomance,
  CloudSciFi,
  CloudSports,
  CloudTalk,
  CloudTechnology,
  CloudThriller,
  CloudTravel,
  CloudWar,
  CloudWestern,
  CloudWildlife,
  CloudNature,
  CloudSpace,
  CloudScience,
  CloudArt,
  CloudBusiness,
  CloudEducation,
  CloudFashion,
  CloudFood,
  CloudHealth,
  CloudLifestyle,
  CloudPolitics,
  CloudReligion,
  CloudSociety,
  CloudWeather,
  CloudWorld,
  CloudLocal,
  CloudNational,
  CloudInternational,
  CloudGlobal,
  CloudUniversal,
  CloudCosmic,
  CloudGalactic,
  CloudPlanetary,
  CloudSolar,
  CloudStellar,
  CloudAstronomical,
  CloudCelestial,
  CloudTerrestrial,
  CloudAquatic,
  CloudAtmospheric,
  CloudGeological,
  CloudBiological,
  CloudChemical,
  CloudPhysical,
  CloudMathematical,
  CloudStatistical,
  CloudComputational,
  CloudAlgorithmic,
  CloudArtificial,
  CloudIntelligence,
  CloudMachine,
  CloudLearning,
  CloudDeep,
  CloudNeural,
  CloudCognitive,
  CloudRobotic,
  CloudAutonomous,
  CloudVirtual,
  CloudAugmented,
  CloudMixed,
  CloudExtended,
  CloudImmersive,
  CloudInteractive,
  CloudResponsive,
  CloudAdaptive,
  CloudPredictive,
  CloudPrescriptive,
  CloudDescriptive,
  CloudDiagnostic,
  CloudPrognostic,
  CloudTherapeutic,
  CloudPreventive,
  CloudCurative,
  CloudPalliative,
  CloudRehabilitative,
  CloudSupportive,
  CloudComplementary,
  CloudAlternative,
  CloudIntegrative,
  CloudHolistic,
  CloudWellness,
  CloudFitness,
  CloudNutrition,
  CloudMental,
  CloudEmotional,
  CloudSpiritual,
  CloudSocial,
  CloudEnvironmental,
  CloudEconomic,
  CloudPolitical,
  CloudCultural,
  CloudEthical,
  CloudLegal,
  CloudRegulatory,
  CloudCompliance,
  CloudGovernance,
  CloudManagement,
  CloudLeadership,
  CloudStrategy,
  CloudPlanning,
  CloudExecution,
  CloudMonitoring,
  CloudEvaluation,
  CloudAssessment,
  CloudAnalysis,
  CloudReporting,
  CloudDocumentation,
  CloudCommunication,
  CloudCollaboration,
  CloudCoordination,
  CloudCooperation,
  CloudIntegration,
  CloudInteroperability,
  CloudConnectivity,
  CloudCompatibility,
  CloudConsistency,
  CloudReliability,
  CloudAvailability,
  CloudScalability,
  CloudElasticity,
  CloudFlexibility,
  CloudAgility,
  CloudResilience,
  CloudRobustness,
  CloudDurability,
  CloudSustainability,
  CloudMaintainability,
  CloudUsability,
  CloudAccessibility,
  CloudInclusivity,
  CloudDiversity,
  CloudEquity,
  CloudEquality,
  CloudJustice,
  CloudFairness,
  CloudTransparency,
  CloudAccountability,
  CloudResponsibility,
  CloudSecurity,
  CloudPrivacy,
  CloudConfidentiality,
  CloudIntegrity,
  CloudAuthenticity,
  CloudValidity,
  CloudAccuracy,
  CloudPrecision,
  CloudRecall,
  CloudRelevance,
  CloudTimeliness,
  CloudCompleteness,
  CloudCorrectness,
  CloudConsistency as ConsistencyIcon,
  CloudCurrency,
  CloudRelevance as RelevanceIcon,
  CloudTimeliness as TimelinessIcon,
  CloudCompleteness as CompletenessIcon,
  CloudCorrectness as CorrectnessIcon,
  CloudConsistency as Consistency2,
  CloudCurrency as CurrencyIcon,
  CloudRelevance2,
  CloudTimeliness2,
  CloudCompleteness2,
  CloudCorrectness2,
  CloudConsistency3,
  CloudCurrency2,
  CloudRelevance3,
  CloudTimeliness3,
  CloudCompleteness3,
  CloudCorrectness3,
  CloudConsistency4,
  CloudCurrency3,
  CloudRelevance4,
  CloudTimeliness4,
  CloudCompleteness4,
  CloudCorrectness4,
  CloudConsistency5,
  CloudCurrency4,
  CloudRelevance5,
  CloudTimeliness5,
  CloudCompleteness5,
  CloudCorrectness5,
  CloudConsistency6,
  CloudCurrency5,
  CloudRelevance6,
  CloudTimeliness6,
  CloudCompleteness6,
  CloudCorrectness6,
  CloudConsistency7,
  CloudCurrency6,
  CloudRelevance7,
  CloudTimeliness7,
  CloudCompleteness7,
  CloudCorrectness7,
  CloudConsistency8,
  CloudCurrency7,
  CloudRelevance8,
  CloudTimeliness8,
  CloudCompleteness8,
  CloudCorrectness8,
  CloudConsistency9,
  CloudCurrency8,
  CloudRelevance9,
  CloudTimeliness9,
  CloudCompleteness9,
  CloudCorrectness9,
  CloudConsistency10,
  CloudCurrency9,
  CloudRelevance10,
  CloudTimeliness10,
  CloudCompleteness10,
  CloudCorrectness10,
  CloudConsistency11,
  CloudCurrency10,
  CloudRelevance11,
  CloudTimeliness11,
  CloudCompleteness11,
  CloudCorrectness11,
  CloudConsistency12,
  CloudCurrency11,
  CloudRelevance12,
  CloudTimeliness12,
  CloudCompleteness12,
  CloudCorrectness12,
  CloudConsistency13,
  CloudCurrency12,
  CloudRelevance13,
  CloudTimeliness13,
  CloudCompleteness13,
  CloudCorrectness13,
  CloudConsistency14,
  CloudCurrency13,
  CloudRelevance14,
  CloudTimeliness14,
  CloudCompleteness14,
  CloudCorrectness14,
  CloudConsistency15,
  CloudCurrency14,
  CloudRelevance15,
  CloudTimeliness15,
  CloudCompleteness15,
  CloudCorrectness15,
  CloudConsistency16,
  CloudCurrency15,
  CloudRelevance16,
  CloudTimeliness16,
  CloudCompleteness16,
  CloudCorrectness16,
  CloudConsistency17,
  CloudCurrency16,
  CloudRelevance17,
  CloudTimeliness17,
  CloudCompleteness17,
  CloudCorrectness17,
  CloudConsistency18,
  CloudCurrency17,
  CloudRelevance18,
  CloudTimeliness18,
  CloudCompleteness18,
  CloudCorrectness18,
  CloudConsistency19,
  CloudCurrency18,
  CloudRelevance19,
  CloudTimeliness19,
  CloudCompleteness19,
  CloudCorrectness19,
  CloudConsistency20,
  CloudCurrency19,
  CloudRelevance20,
  CloudTimeliness20,
  CloudCompleteness20,
  CloudCorrectness20,
  CloudConsistency21,
  CloudCurrency20,
  CloudRelevance21,
  CloudTimeliness21,
  CloudCompleteness21,
  CloudCorrectness21,
  CloudConsistency22,
  CloudCurrency21,
  CloudRelevance22,
  CloudTimeliness22,
  CloudCompleteness22,
  CloudCorrectness22,
  CloudConsistency23,
  CloudCurrency22,
  CloudRelevance23,
  CloudTimeliness23,
  CloudCompleteness23,
  CloudCorrectness23,
  CloudConsistency24,
  CloudCurrency23,
  CloudRelevance24,
  CloudTimeliness24,
  CloudCompleteness24,
  CloudCorrectness24,
  CloudConsistency25,
  CloudCurrency24,
  CloudRelevance25,
  CloudTimeliness25,
  CloudCompleteness25,
  CloudCorrectness25,
  CloudConsistency26,
  CloudCurrency25,
  CloudRelevance26,
  CloudTimeliness26,
  CloudCompleteness26,
  CloudCorrectness26,
  CloudConsistency27,
  CloudCurrency26,
  CloudRelevance27,
  CloudTimeliness27,
  CloudCompleteness27,
  CloudCorrectness27,
  CloudConsistency28,
  CloudCurrency27,
  CloudRelevance28,
  CloudTimeliness28,
  CloudCompleteness28,
  CloudCorrectness28,
  CloudConsistency29,
  CloudCurrency28,
  CloudRelevance29,
  CloudTimeliness29,
  CloudCompleteness29,
  CloudCorrectness29,
  CloudConsistency30,
  CloudCurrency29,
  CloudRelevance30,
  CloudTimeliness30,
  CloudCompleteness30,
  CloudCorrectness30,
  CloudConsistency31,
  CloudCurrency30,
  CloudRelevance31,
  CloudTimeliness31,
  CloudCompleteness31,
  CloudCorrectness31,
  CloudConsistency32,
  CloudCurrency31,
  CloudRelevance32,
  CloudTimeliness32,
  CloudCompleteness32,
  CloudCorrectness32,
  CloudConsistency33,
  CloudCurrency32,
  CloudRelevance33,
  CloudTimeliness33,
  CloudCompleteness33,
  CloudCorrectness33,
  CloudConsistency34,
  CloudCurrency33,
  CloudRelevance34,
  CloudTimeliness34,
  CloudCompleteness34,
  CloudCorrectness34,
  CloudConsistency35,
  CloudCurrency34,
  CloudRelevance35,
  CloudTimeliness35,
  CloudCompleteness35,
  CloudCorrectness35,
  CloudConsistency36,
  CloudCurrency35,
  CloudRelevance36,
  CloudTimeliness36,
  CloudCompleteness36,
  CloudCorrectness36,
  CloudConsistency37,
  CloudCurrency36,
  CloudRelevance37,
  CloudTimeliness37,
  CloudCompleteness37,
  CloudCorrectness37,
  CloudConsistency38,
  CloudCurrency37,
  CloudRelevance38,
  CloudTimeliness38,
  CloudCompleteness38,
  CloudCorrectness38,
  CloudConsistency39,
  CloudCurrency38,
  CloudRelevance39,
  CloudTimeliness39,
  CloudCompleteness39,
  CloudCorrectness39,
  CloudConsistency40,
  CloudCurrency39,
  CloudRelevance40,
  CloudTimeliness40,
  CloudCompleteness40,
  CloudCorrectness40,
  CloudConsistency41,
  CloudCurrency40,
  CloudRelevance41,
  CloudTimeliness41,
  CloudCompleteness41,
  CloudCorrectness41,
  CloudConsistency42,
  CloudCurrency41,
  CloudRelevance42,
  CloudTimeliness42,
  CloudCompleteness42,
  CloudCorrectness42,
  CloudConsistency43,
  CloudCurrency42,
  CloudRelevance43,
  CloudTimeliness43,
  CloudCompleteness43,
  CloudCorrectness43,
  CloudConsistency44,
  CloudCurrency43,
  CloudRelevance44,
  CloudTimeliness44,
  CloudCompleteness44,
  CloudCorrectness44,
  CloudConsistency45,
  CloudCurrency44,
  CloudRelevance45,
  CloudTimeliness45,
  CloudCompleteness45,
  CloudCorrectness45,
  CloudConsistency46,
  CloudCurrency45,
  CloudRelevance46,
  CloudTimeliness46,
  CloudCompleteness46,
  CloudCorrectness46,
  CloudConsistency47,
  CloudCurrency46,
  CloudRelevance47,
  CloudTimeliness47,
  CloudCompleteness47,
  CloudCorrectness47,
  CloudConsistency48,
  CloudCurrency47,
  CloudRelevance48,
  CloudTimeliness48,
  CloudCompleteness48,
  CloudCorrectness48,
  CloudConsistency49,
  CloudCurrency48,
  CloudRelevance49,
  CloudTimeliness49,
  CloudCompleteness49,
  CloudCorrectness49,
  CloudConsistency50,
  CloudCurrency49,
  CloudRelevance50,
  CloudTimeliness50,
  CloudCompleteness50,
  CloudCorrectness50
} from 'lucide-react';

interface PreviewTabProps {
  projectId: string;
  sandboxBundle?: {
    files: Record<string, string>;
    entry: string;
    dependencies?: string[];
    devDependencies?: string[];
  } | null;
}

type DeviceType = 'desktop' | 'mobile' | 'tablet';

interface SelectedElement {
  id: string;
  tag: string;
  text: string;
  styles: Record<string, string>;
  type: 'text' | 'image' | 'button' | 'input' | 'div' | 'other';
}

interface ElementCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  elements: ElementItem[];
}

interface ElementItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'text' | 'image' | 'button' | 'input' | 'div' | 'shape';
  preview: string;
}

interface CursorTemplate {
  id: string;
  name: string;
  preview: string;
  type: 'pointer' | 'text' | 'wait' | 'crosshair' | 'help' | 'move' | 'grab' | 'grabbing' | 'custom';
}

const ElementsSidebar: React.FC<{
  onElementAdd: (element: ElementItem) => void;
  onElementHover?: (element: ElementItem | null) => void;
}> = ({ onElementAdd, onElementHover }) => {
  const [categories, setCategories] = useState<ElementCategory[]>([
    {
      id: 'layout',
      name: 'Layout',
      icon: Layout,
      expanded: true,
      elements: [
        { id: 'div', name: 'Container', icon: Square, type: 'div', preview: 'div' },
        { id: 'section', name: 'Section', icon: Grid3X3, type: 'div', preview: 'section' },
        { id: 'header', name: 'Header', icon: AlignLeft, type: 'div', preview: 'header' },
        { id: 'footer', name: 'Footer', icon: AlignCenter, type: 'div', preview: 'footer' },
      ]
    },
    {
      id: 'text',
      name: 'Text',
      icon: Type,
      expanded: true,
      elements: [
        { id: 'heading', name: 'Heading', icon: Type, type: 'text', preview: 'h1' },
        { id: 'paragraph', name: 'Paragraph', icon: FileText, type: 'text', preview: 'p' },
        { id: 'span', name: 'Text Span', icon: Minus, type: 'text', preview: 'span' },
        { id: 'blockquote', name: 'Quote', icon: AlignLeft, type: 'text', preview: 'blockquote' },
      ]
    },
    {
      id: 'forms',
      name: 'Forms',
      icon: Edit3,
      expanded: false,
      elements: [
        { id: 'input', name: 'Text Input', icon: Edit3, type: 'input', preview: 'input' },
        { id: 'textarea', name: 'Text Area', icon: FileText, type: 'input', preview: 'textarea' },
        { id: 'select', name: 'Dropdown', icon: ChevronDown, type: 'input', preview: 'select' },
        { id: 'checkbox', name: 'Checkbox', icon: Square, type: 'input', preview: 'checkbox' },
        { id: 'radio', name: 'Radio', icon: Circle, type: 'input', preview: 'radio' },
        { id: 'button', name: 'Button', icon: Square, type: 'button', preview: 'button' },
      ]
    },
    {
      id: 'media',
      name: 'Media',
      icon: Image,
      expanded: false,
      elements: [
        { id: 'image', name: 'Image', icon: Image, type: 'image', preview: 'img' },
        { id: 'video', name: 'Video', icon: Video, type: 'image', preview: 'video' },
        { id: 'audio', name: 'Audio', icon: Music, type: 'image', preview: 'audio' },
      ]
    },
    {
      id: 'shapes',
      name: 'Shapes',
      icon: Triangle,
      expanded: false,
      elements: [
        { id: 'rectangle', name: 'Rectangle', icon: Square, type: 'shape', preview: 'rect' },
        { id: 'circle', name: 'Circle', icon: Circle, type: 'shape', preview: 'circle' },
        { id: 'triangle', name: 'Triangle', icon: Triangle, type: 'shape', preview: 'triangle' },
        { id: 'line', name: 'Line', icon: Minus, type: 'shape', preview: 'line' },
      ]
    },
    {
      id: 'interactive',
      name: 'Interactive',
      icon: MousePointer,
      expanded: false,
      elements: [
        { id: 'link', name: 'Link', icon: Link, type: 'button', preview: 'a' },
        { id: 'hover', name: 'Hover Area', icon: Mouse, type: 'div', preview: 'hover' },
        { id: 'click', name: 'Click Area', icon: Hand, type: 'button', preview: 'click' },
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    elements: category.elements.filter(element =>
      element.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.elements.length > 0 || searchTerm === '');

  return (
    <div className="framer-elements-sidebar">
      <div className="elements-header">
        <h2 className="elements-title">Elements</h2>
        <div className="elements-search">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="elements-content">
        {filteredCategories.map(category => (
          <div key={category.id} className="element-category">
            <button
              className="category-header"
              onClick={() => toggleCategory(category.id)}
            >
              <category.icon className="category-icon" />
              <span className="category-name">{category.name}</span>
              {category.expanded ? (
                <ChevronDown className="category-arrow" />
              ) : (
                <ChevronRight className="category-arrow" />
              )}
            </button>

            {category.expanded && (
              <div className="category-elements">
                {category.elements.map(element => (
                  <div
                    key={element.id}
                    className="element-item"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(element));
                    }}
                    onMouseEnter={() => onElementHover?.(element)}
                    onMouseLeave={() => onElementHover?.(null)}
                    onClick={() => onElementAdd(element)}
                  >
                    <div className="element-preview">
                      <element.icon className="element-icon" />
                    </div>
                    <span className="element-name">{element.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PropertiesPanel: React.FC<{
  selectedElement: SelectedElement | null;
  onElementUpdate: (updates: Record<string, string>) => void;
}> = ({ selectedElement, onElementUpdate }) => {
  const [activeSection, setActiveSection] = useState<'design' | 'layout' | 'effects' | 'cursor'>('design');

  // Cursor templates
  const cursorTemplates: CursorTemplate[] = [
    { id: 'pointer', name: 'Pointer', preview: 'default', type: 'pointer' },
    { id: 'text', name: 'Text', preview: 'text', type: 'text' },
    { id: 'crosshair', name: 'Crosshair', preview: 'crosshair', type: 'crosshair' },
    { id: 'grab', name: 'Grab', preview: 'grab', type: 'grab' },
    { id: 'help', name: 'Help', preview: 'help', type: 'help' },
    { id: 'wait', name: 'Wait', preview: 'wait', type: 'wait' },
    { id: 'move', name: 'Move', preview: 'move', type: 'move' },
  ];

  const predefinedEffects = [
    { id: 'fadeIn', name: 'Fade In', type: 'appear' },
    { id: 'slideUp', name: 'Slide Up', type: 'appear' },
    { id: 'slideDown', name: 'Slide Down', type: 'appear' },
    { id: 'slideLeft', name: 'Slide Left', type: 'appear' },
    { id: 'slideRight', name: 'Slide Right', type: 'appear' },
    { id: 'bounce', name: 'Bounce', type: 'appear' },
    { id: 'scale', name: 'Scale', type: 'appear' },
    { id: 'rotate', name: 'Rotate', type: 'appear' },
    { id: 'onPress', name: 'On Press', type: 'interaction' },
    { id: 'onHover', name: 'On Hover', type: 'interaction' },
    { id: 'onScroll', name: 'On Scroll', type: 'scroll' },
  ];

  if (!selectedElement) {
    return (
      <div className="framer-properties-panel">
        <div className="properties-header">
          <h2 className="properties-title">Properties</h2>
        </div>
        <div className="properties-empty">
          <div className="empty-icon">
            <MousePointer className="w-8 h-8 text-gray-400" />
          </div>
          <p className="empty-text">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="framer-properties-panel">
      <div className="properties-header">
        <h2 className="properties-title">Properties</h2>
        <div className="selected-element">
          {selectedElement.tag === 'div' ? (
            <Square className="element-type-icon" />
          ) : selectedElement.tag === 'button' ? (
            <Square className="element-type-icon" />
          ) : selectedElement.tag === 'input' ? (
            <Edit3 className="element-type-icon" />
          ) : selectedElement.tag === 'img' ? (
            <Image className="element-type-icon" />
          ) : (
            <FileText className="element-type-icon" />
          )}
          <span className="element-name">{selectedElement.text || selectedElement.tag}</span>
        </div>
      </div>

      <div className="properties-tabs">
        <button
          className={`properties-tab ${activeSection === 'design' ? 'active' : ''}`}
          onClick={() => setActiveSection('design')}
        >
          <Palette className="tab-icon" />
          Design
        </button>
        <button
          className={`properties-tab ${activeSection === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveSection('layout')}
        >
          <Layout className="tab-icon" />
          Layout
        </button>
        <button
          className={`properties-tab ${activeSection === 'effects' ? 'active' : ''}`}
          onClick={() => setActiveSection('effects')}
        >
          <Zap className="tab-icon" />
          Effects
        </button>
        <button
          className={`properties-tab ${activeSection === 'cursor' ? 'active' : ''}`}
          onClick={() => setActiveSection('cursor')}
        >
          <Mouse className="tab-icon" />
          Cursor
        </button>
      </div>

      <div className="properties-content">
        {activeSection === 'design' && (
          <div className="properties-section">
            {/* Typography for text elements */}
            {selectedElement.type === 'text' && (
              <>
                <div className="property-group">
                  <h3 className="property-group-title">Typography</h3>

                  <div className="property-row">
                    <label className="property-label">Font Size</label>
                    <div className="property-control">
                      <input
                        type="range"
                        min="8"
                        max="72"
                        defaultValue="16"
                        onChange={(e) => onElementUpdate({ fontSize: `${e.target.value}px` })}
                        className="property-slider"
                      />
                      <span className="property-value">16px</span>
                    </div>
                  </div>

                  <div className="property-row">
                    <label className="property-label">Font Weight</label>
                    <select
                      className="property-select"
                      onChange={(e) => onElementUpdate({ fontWeight: e.target.value })}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="lighter">Light</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="300">300</option>
                      <option value="400">400</option>
                      <option value="500">500</option>
                      <option value="600">600</option>
                      <option value="700">700</option>
                      <option value="800">800</option>
                      <option value="900">900</option>
                    </select>
                  </div>

                  <div className="property-row">
                    <label className="property-label">Color</label>
                    <div className="property-color">
                      <input
                        type="color"
                        defaultValue="#000000"
                        onChange={(e) => onElementUpdate({ color: e.target.value })}
                        className="property-color-picker"
                      />
                      <span className="property-color-value">#000000</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Background */}
            <div className="property-group">
              <h3 className="property-group-title">Background</h3>

              <div className="property-row">
                <label className="property-label">Background</label>
                <div className="property-color">
                  <input
                    type="color"
                    defaultValue="#ffffff"
                    onChange={(e) => onElementUpdate({ backgroundColor: e.target.value })}
                    className="property-color-picker"
                  />
                  <span className="property-color-value">#ffffff</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Opacity</label>
                <div className="property-control">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue="1"
                    onChange={(e) => onElementUpdate({ opacity: e.target.value })}
                    className="property-slider"
                  />
                  <span className="property-value">100%</span>
                </div>
              </div>
            </div>

            {/* Border */}
            <div className="property-group">
              <h3 className="property-group-title">Border</h3>

              <div className="property-row">
                <label className="property-label">Border Width</label>
                <div className="property-control">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    defaultValue="0"
                    onChange={(e) => onElementUpdate({ borderWidth: `${e.target.value}px` })}
                    className="property-slider"
                  />
                  <span className="property-value">0px</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Border Color</label>
                <div className="property-color">
                  <input
                    type="color"
                    defaultValue="#000000"
                    onChange={(e) => onElementUpdate({ borderColor: e.target.value })}
                    className="property-color-picker"
                  />
                  <span className="property-color-value">#000000</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Border Radius</label>
                <div className="property-control">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    defaultValue="0"
                    onChange={(e) => onElementUpdate({ borderRadius: `${e.target.value}px` })}
                    className="property-slider"
                  />
                  <span className="property-value">0px</span>
                </div>
              </div>
            </div>

            {/* Transform */}
            <div className="property-group">
              <h3 className="property-group-title">Transform</h3>

              <div className="property-row">
                <label className="property-label">Rotation</label>
                <div className="property-control">
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    defaultValue="0"
                    onChange={(e) => onElementUpdate({ transform: `rotate(${e.target.value}deg)` })}
                    className="property-slider"
                  />
                  <span className="property-value">0°</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Scale</label>
                <div className="property-control">
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    defaultValue="1"
                    onChange={(e) => onElementUpdate({ transform: `scale(${e.target.value})` })}
                    className="property-slider"
                  />
                  <span className="property-value">100%</span>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="property-group">
              <h3 className="property-group-title">Visibility</h3>

              <div className="property-row">
                <label className="property-label">Visible</label>
                <div className="property-toggle">
                  <button
                    className={`toggle-btn ${selectedElement.styles.visibility !== 'hidden' ? 'active' : ''}`}
                    onClick={() => onElementUpdate({
                      visibility: selectedElement.styles.visibility === 'hidden' ? 'visible' : 'hidden'
                    })}
                  >
                    <EyeIcon className="toggle-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'layout' && (
          <div className="properties-section">
            <div className="property-group">
              <h3 className="property-group-title">Position</h3>

              <div className="property-row">
                <label className="property-label">X Position</label>
                <div className="property-input-group">
                  <input
                    type="number"
                    placeholder="0"
                    onChange={(e) => onElementUpdate({ left: `${e.target.value}px` })}
                    className="property-input"
                  />
                  <span className="property-unit">px</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Y Position</label>
                <div className="property-input-group">
                  <input
                    type="number"
                    placeholder="0"
                    onChange={(e) => onElementUpdate({ top: `${e.target.value}px` })}
                    className="property-input"
                  />
                  <span className="property-unit">px</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Position Type</label>
                <select
                  className="property-select"
                  onChange={(e) => onElementUpdate({ position: e.target.value })}
                >
                  <option value="static">Static</option>
                  <option value="relative">Relative</option>
                  <option value="absolute">Absolute</option>
                  <option value="fixed">Fixed</option>
                  <option value="sticky">Sticky</option>
                </select>
              </div>
            </div>

            <div className="property-group">
              <h3 className="property-group-title">Size</h3>

              <div className="property-row">
                <label className="property-label">Width</label>
                <div className="property-input-group">
                  <input
                    type="number"
                    placeholder="100"
                    onChange={(e) => onElementUpdate({ width: `${e.target.value}px` })}
                    className="property-input"
                  />
                  <span className="property-unit">px</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Height</label>
                <div className="property-input-group">
                  <input
                    type="number"
                    placeholder="100"
                    onChange={(e) => onElementUpdate({ height: `${e.target.value}px` })}
                    className="property-input"
                  />
                  <span className="property-unit">px</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Size Type</label>
                <select
                  className="property-select"
                  onChange={(e) => {
                    const sizeType = e.target.value;
                    if (sizeType === 'fill') {
                      onElementUpdate({ width: '100%', height: '100%' });
                    } else if (sizeType === 'fit') {
                      onElementUpdate({ width: 'auto', height: 'auto' });
                    }
                  }}
                >
                  <option value="fixed">Fixed</option>
                  <option value="fill">Fill</option>
                  <option value="fit">Fit Content</option>
                </select>
              </div>
            </div>

            <div className="property-group">
              <h3 className="property-group-title">Alignment</h3>

              <div className="property-alignment">
                <div className="alignment-row">
                  <button className="alignment-btn" onClick={() => onElementUpdate({ textAlign: 'left' })}>
                    <AlignLeft className="alignment-icon" />
                  </button>
                  <button className="alignment-btn" onClick={() => onElementUpdate({ textAlign: 'center' })}>
                    <AlignCenter className="alignment-icon" />
                  </button>
                  <button className="alignment-btn" onClick={() => onElementUpdate({ textAlign: 'right' })}>
                    <AlignRight className="alignment-icon" />
                  </button>
                  <button className="alignment-btn" onClick={() => onElementUpdate({ textAlign: 'justify' })}>
                    <AlignJustify className="alignment-icon" />
                  </button>
                </div>
              </div>
            </div>

            <div className="property-group">
              <h3 className="property-group-title">Spacing</h3>

              <div className="property-row">
                <label className="property-label">Padding</label>
                <div className="property-input-group">
                  <input
                    type="number"
                    placeholder="0"
                    onChange={(e) => onElementUpdate({ padding: `${e.target.value}px` })}
                    className="property-input"
                  />
                  <span className="property-unit">px</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Margin</label>
                <div className="property-input-group">
                  <input
                    type="number"
                    placeholder="0"
                    onChange={(e) => onElementUpdate({ margin: `${e.target.value}px` })}
                    className="property-input"
                  />
                  <span className="property-unit">px</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'effects' && (
          <div className="properties-section">
            <div className="property-group">
              <h3 className="property-group-title">Animation Effects</h3>

              <div className="property-row">
                <label className="property-label">On Appear</label>
                <select
                  className="property-select"
                  onChange={(e) => onElementUpdate({ animation: e.target.value })}
                >
                  <option value="">None</option>
                  {predefinedEffects.filter(e => e.type === 'appear').map(effect => (
                    <option key={effect.id} value={effect.id}>{effect.name}</option>
                  ))}
                </select>
              </div>

              <div className="property-row">
                <label className="property-label">On Press</label>
                <select
                  className="property-select"
                  onChange={(e) => onElementUpdate({ pressEffect: e.target.value })}
                >
                  <option value="">None</option>
                  {predefinedEffects.filter(e => e.type === 'interaction').map(effect => (
                    <option key={effect.id} value={effect.id}>{effect.name}</option>
                  ))}
                </select>
              </div>

              <div className="property-row">
                <label className="property-label">On Scroll</label>
                <select
                  className="property-select"
                  onChange={(e) => onElementUpdate({ scrollEffect: e.target.value })}
                >
                  <option value="">None</option>
                  {predefinedEffects.filter(e => e.type === 'scroll').map(effect => (
                    <option key={effect.id} value={effect.id}>{effect.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="property-group">
              <h3 className="property-group-title">Animation Settings</h3>

              <div className="property-row">
                <label className="property-label">Duration</label>
                <div className="property-input-group">
                  <input
                    type="number"
                    placeholder="0.3"
                    step="0.1"
                    onChange={(e) => onElementUpdate({ animationDuration: `${e.target.value}s` })}
                    className="property-input"
                  />
                  <span className="property-unit">s</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Delay</label>
                <div className="property-input-group">
                  <input
                    type="number"
                    placeholder="0"
                    step="0.1"
                    onChange={(e) => onElementUpdate({ animationDelay: `${e.target.value}s` })}
                    className="property-input"
                  />
                  <span className="property-unit">s</span>
                </div>
              </div>

              <div className="property-row">
                <label className="property-label">Easing</label>
                <select
                  className="property-select"
                  onChange={(e) => onElementUpdate({ animationTimingFunction: e.target.value })}
                >
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In Out</option>
                  <option value="linear">Linear</option>
                  <option value="cubic-bezier(0.4, 0, 0.2, 1)">Material</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'cursor' && (
          <div className="properties-section">
            <div className="property-group">
              <h3 className="property-group-title">Cursor Templates</h3>

              <div className="cursor-grid">
                {cursorTemplates.map(cursor => (
                  <button
                    key={cursor.id}
                    className="cursor-template"
                    onClick={() => onElementUpdate({ cursor: cursor.preview })}
                    title={cursor.name}
                  >
                    <div
                      className="cursor-preview"
                      style={{ cursor: cursor.preview }}
                    >
                      <Mouse className="cursor-icon" />
                    </div>
                    <span className="cursor-name">{cursor.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="property-group">
              <h3 className="property-group-title">Custom Cursor</h3>

              <div className="property-row">
                <label className="property-label">Upload Image</label>
                <div className="property-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        onElementUpdate({ cursor: `url(${url}), auto` });
                      }
                    }}
                    className="file-input"
                    id="cursor-upload"
                  />
                  <label htmlFor="cursor-upload" className="file-upload-btn">
                    <Upload className="upload-icon" />
                    Upload Image
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PreviewTab: React.FC<PreviewTabProps> = ({ projectId, sandboxBundle }) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [sidebarView, setSidebarView] = useState<'preview' | 'code' | 'console'>('preview');
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ElementItem | null>(null);
  const [canvasElements, setCanvasElements] = useState<SelectedElement[]>([]);

  const handleElementAdd = (element: ElementItem) => {
    const newElement: SelectedElement = {
      id: `element-${Date.now()}`,
      tag: element.preview,
      text: element.name,
      styles: {},
      type: element.type,
    };

    setCanvasElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  };

  const handleElementUpdate = (updates: Record<string, string>) => {
    if (!selectedElement) return;

    setCanvasElements(prev =>
      prev.map(el =>
        el.id === selectedElement.id
          ? { ...el, styles: { ...el.styles, ...updates } }
          : el
      )
    );

    setSelectedElement(prev =>
      prev ? { ...prev, styles: { ...prev.styles, ...updates } } : null
    );
  };

  const handleElementSelect = (element: SelectedElement) => {
    setSelectedElement(element);
  };

  const handleOpenInNewTab = () => {
    window.open(`/project/${projectId}`, '_blank');
  };

  return (
    <div className="framer-preview-container">
      {/* Top Toolbar */}
      <div className="framer-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn primary" onClick={handleOpenInNewTab}>
            <Edit2 className="btn-icon" />
            Edit
          </button>

          <div className="toolbar-separator" />

          <div className="device-buttons">
            <button className="device-btn" onClick={() => setDevice('desktop')}>
              <Monitor className="device-icon" />
            </button>
            <button className="device-btn" onClick={() => setDevice('tablet')}>
              <Tablet className="device-icon" />
            </button>
            <button className="device-btn active" onClick={() => setDevice('mobile')}>
              <Smartphone className="device-icon" />
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button className="toolbar-btn secondary">
            <Settings className="btn-icon" />
          </button>
          <button className="toolbar-btn secondary">
            <Code className="btn-icon" />
          </button>
          <button className="toolbar-btn secondary">
            <Terminal className="btn-icon" />
          </button>
          <button className="toolbar-btn secondary">
            <Eye className="btn-icon" />
          </button>
        </div>
      </div>

      {/* Main Three-Column Layout */}
      <div className="framer-main-layout">
        {/* Left Sidebar - Elements */}
        <div className="framer-left-sidebar">
          <ElementsSidebar
            onElementAdd={handleElementAdd}
            onElementHover={setHoveredElement}
          />
        </div>

        {/* Center - Preview Canvas */}
        <div className="framer-canvas-container">
          <div className="canvas-header">
            <h3 className="canvas-title">Preview</h3>
            <div className="canvas-controls">
              <button className="canvas-control-btn">
                <ZoomIn className="control-icon" />
              </button>
              <button className="canvas-control-btn">
                <ZoomOut className="control-icon" />
              </button>
              <button className="canvas-control-btn">
                <RotateCcw className="control-icon" />
              </button>
              <span className="canvas-zoom">100%</span>
            </div>
          </div>

          <div className="canvas-area">
            <div className={`canvas-frame ${device}`}>
              {sandboxBundle ? (
                <div className="canvas-content">
                  <iframe
                    src={`/project/${projectId}?sandbox=1`}
                    className="canvas-iframe"
                    title="Survey Preview"
                  />

                  {/* Overlay canvas elements for visual editing */}
                  <div className="canvas-overlay">
                    {canvasElements.map(element => (
                      <div
                        key={element.id}
                        className={`canvas-element ${selectedElement?.id === element.id ? 'selected' : ''}`}
                        style={element.styles}
                        onClick={() => handleElementSelect(element)}
                      >
                        {element.type === 'text' && (
                          <span>{element.text}</span>
                        )}
                        {element.type === 'button' && (
                          <button className="element-button">{element.text}</button>
                        )}
                        {element.type === 'image' && (
                          <div className="element-image">
                            <Image className="image-icon" />
                          </div>
                        )}
                        {element.type === 'input' && (
                          <input
                            type="text"
                            placeholder={element.text}
                            className="element-input"
                          />
                        )}
                        {element.type === 'div' && (
                          <div className="element-container">
                            {element.text}
                          </div>
                        )}
                        {element.type === 'shape' && (
                          <div className="element-shape">
                            {element.tag === 'circle' && <Circle className="shape-icon" />}
                            {element.tag === 'rectangle' && <Square className="shape-icon" />}
                            {element.tag === 'triangle' && <Triangle className="shape-icon" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="canvas-empty">
                  <div className="empty-state">
                    <Layout className="empty-icon" />
                    <h3 className="empty-title">Start Building</h3>
                    <p className="empty-description">
                      Drag elements from the left sidebar to start creating your survey
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="framer-right-sidebar">
          <PropertiesPanel
            selectedElement={selectedElement}
            onElementUpdate={handleElementUpdate}
          />
        </div>
      </div>

      {/* Hover Preview */}
      {hoveredElement && (
        <div className="element-hover-preview">
          <div className="hover-preview-content">
            <hoveredElement.icon className="hover-preview-icon" />
            <span className="hover-preview-name">{hoveredElement.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};
