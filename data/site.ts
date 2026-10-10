export const sitePalettes = {
  cobalt: { accent: '#2442ed', accent2: '#98b5ff', strong: '#142dc7', rgb: '36, 66, 237', accent2Rgb: '152, 181, 255', shadow: 'rgba(31, 60, 215, 0.3)' },
  coral: { accent: '#e86152', accent2: '#ffd0bf', strong: '#c63d35', rgb: '232, 97, 82', accent2Rgb: '255, 208, 191', shadow: 'rgba(186, 61, 53, 0.28)' },
  amber: { accent: '#d39a22', accent2: '#ffe0a0', strong: '#a86b0b', rgb: '211, 154, 34', accent2Rgb: '255, 224, 160', shadow: 'rgba(168, 107, 11, 0.26)' },
  jade: { accent: '#168b67', accent2: '#a0e5c6', strong: '#0a6247', rgb: '22, 139, 103', accent2Rgb: '160, 229, 198', shadow: 'rgba(10, 98, 71, 0.28)' },
  cyan: { accent: '#0d9cb8', accent2: '#9de8f3', strong: '#087790', rgb: '13, 156, 184', accent2Rgb: '157, 232, 243', shadow: 'rgba(8, 119, 144, 0.28)' },
  rose: { accent: '#d74d7d', accent2: '#ffc0d2', strong: '#a72c5c', rgb: '215, 77, 125', accent2Rgb: '255, 192, 210', shadow: 'rgba(167, 44, 92, 0.28)' },
  violet: { accent: '#7855d6', accent2: '#d0bbff', strong: '#5732b2', rgb: '120, 85, 214', accent2Rgb: '208, 187, 255', shadow: 'rgba(87, 50, 178, 0.28)' },
} as const;

export type SitePaletteId = keyof typeof sitePalettes;

export const experience = [
  {
    company: 'GE Vernova',
    role: 'UI Developer (Consultant)',
    period: 'June 2023 – Present',
    responsibilities: [
      'Developed and maintained React.js features for the Wind SCADA NXT platform, delivering UI functionality aligned with operational requirements.',
      'Integrated REST APIs and WebSocket data streams into React components to support real-time updates and efficient rendering.',
      'Built reusable higher-order components to standardize shared functionality across modules.',
      'Optimized component rendering and improved frontend responsiveness and stability.',
      'Modernized legacy application code to support updated Node.js packages and improve maintainability.',
    ],
  },
  {
    company: 'Belcan',
    role: 'Full-Stack Developer',
    period: 'March 2022 – June 2023',
    responsibilities: [
      'Built a web application from scratch using React.js for the frontend and Django for the backend.',
      'Developed and deployed a comprehensive HR onboarding application using Django.',
      'Used Django ORM to model employee data, documents, and workflows for complex business processes.',
      'Implemented robust REST APIs with Django REST Framework and built secure auth flows.',
      'Used Dash Plotly to visualize predicted data and create interactive, insight-rich web pages.',
    ],
  },
  {
    company: 'UIPRO',
    role: 'Mobile Developer Intern',
    period: 'July 2021 – December 2021',
    responsibilities: [
      'Developed cross-platform mobile apps compatible with Android and iOS using Flutter.',
      'Integrated APIs to enable seamless communication between mobile apps and backend services.',
      'Used Firebase to store user data and synchronize state efficiently.',
      'Managed application state with Provider for better performance and maintainability.',
    ],
  },
  {
    company: 'HostelOwner.com',
    role: 'Full-Stack Developer Intern',
    period: 'March 2021 – May 2021',
    responsibilities: [
      'Developed full-stack client web applications using Express.js and EJS templates.',
      'Built and maintained RESTful APIs for data collection and internal workflows.',
      'Delivered custom SaaS solutions for collecting and analyzing customer data across clients.',
    ],
  },
];

export type Project = {
  id: string;
  title: string;
  tech: string[];
  description: string;
  link: string;
  type: string;
  image?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: 'form-builder',
    title: 'Form Builder',
    tech: ['Express.js', 'MySQL', 'EJS'],
    description:
      'Full-stack form builder inspired by Google Forms, enabling users to dynamically create fields and share a public URL to collect responses.',
    link: 'https://github.com/ch-monish/FormBuilder',
    type: 'GitHub',
    image: '/assets/projects_formbuilder.png',
    featured: true,
  },
  {
    id: 'school-management',
    title: 'School Management app',
    tech: ['Flutter', 'Mobile App'],
    description:
      'Android-based school management application designed to centralize academic and student information so parents can track activity and updates efficiently.',
    link: 'https://github.com/ch-monish/schoolapp',
    type: 'GitHub',
    image: '/assets/projects_flutterapp.jpeg',
    featured: true,
  },
  {
    id: 'portfolio-website',
    title: 'Personal Portfolio Website',
    tech: ['Next.js', 'TypeScript', 'Three.js'],
    description:
      'Modern personal portfolio designed to showcase experience, projects, and technical strengths with an interactive Three.js hero and a polished responsive interface.',
    link: 'https://ch-monish.github.io/',
    type: 'Live Portfolio',
    image: '/assets/homeimage.jpeg',
    featured: true,
  },
  {
    id: 'grocer',
    title: 'Grocer',
    tech: ['Flutter', 'Dart'],
    description:
      'Cross-platform grocery shopping application for Android and iOS with product browsing, cart management, and application state handling.',
    link: 'https://github.com/ch-monish/groccer',
    type: 'GitHub',
  },
  {
    id: 'todo-app',
    title: 'Todo App',
    tech: ['React Native', 'Mobile App'],
    description:
      'Task tracking mobile application built to manage daily activities and keep personal planning organized on the go.',
    link: 'https://github.com/ch-monish/todo-list-app',
    type: 'GitHub',
    image: '/assets/projects_todo.png',
  },
  {
    id: 'code-editor',
    title: 'Code Editor application',
    tech: ['Visual Basic .NET', 'Editor'],
    description:
      'Standalone code editor application built for writing and editing source files with a simple desktop-first user experience.',
    link: 'https://github.com/ch-monish/notepad-application',
    type: 'GitHub',
    image: '/assets/projects_notepadapp.jpg',
  },
  {
    id: 'whatsapp-automation',
    title: 'WhatsApp automation',
    tech: ['Python', 'Selenium'],
    description:
      'Python-based automation script for sending scheduled WhatsApp messages to contacts using browser automation and Selenium.',
    link: 'https://github.com/ch-monish/whatsapp-automation-multisender',
    type: 'GitHub',
    image: '/assets/projects_whatsappbot.png',
  },
  {
    id: 'calculator-app',
    title: 'Calculator app',
    tech: ['Visual Basic .NET', 'Desktop UI'],
    description:
      'Standalone calculator application built for quick and reliable mathematical calculations in a desktop interface.',
    link: 'https://github.com/ch-monish/simple-calculator',
    type: 'GitHub',
    image: '/assets/projects_calc.jpeg',
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe app',
    tech: ['Visual Basic .NET', 'Desktop App'],
    description:
      'Classic Tic-Tac-Toe game created as a lightweight desktop application using Visual Basic .NET.',
    link: 'https://github.com/ch-monish/tic-tac-toe',
    type: 'GitHub',
    image: '/assets/projects_tiktactoe.jpeg',
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const moreProjects = projects.filter((project) => !project.featured);

export const skills = {
  Languages: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'SQL'],
  Frontend: ['React.js', 'React Hooks', 'Redux', 'HTML5', 'CSS3', 'Responsive UI'],
  Backend: ['Node.js', 'Express.js', 'Django', 'Django REST Framework', 'REST APIs'],
  'Real-Time & State': ['WebSockets', 'Redux-Saga', 'Async Data Handling'],
  Databases: ['PostgreSQL', 'MySQL'],
  Tools: ['Git', 'Postman', 'VS Code', 'Jenkins'],
  'Testing & Build': ['Jest', 'Vite', 'Webpack'],
};

export const stats = [
  { label: 'Years building products', value: '4+' },
  { label: 'Projects shipped', value: '15+' },
  { label: 'Domains worked in', value: '5+' },
  { label: 'Stack breadth', value: 'Full-Stack' },
];

export const education = {
  degree: 'Bachelor of Technology in Computer Science',
  school: 'ICFAI University',
  period: 'June 2018 – May 2022',
};

export const contact = {
  email: 'saimonish2000@gmail.com',
  phone: '+91 7036109138',
  phoneHref: 'tel:+917036109138',
  showPhone: true,
  linkedin: 'https://www.linkedin.com/in/sai-monish-cheruku-0005a6175/',
  github: 'https://github.com/ch-monish',
  resume: '/assets/Resume_Monish_2026.pdf',
  archive: '/2022',
};

export const certification = {
  title: 'HackerRank React Certification',
  date: '18th Nov 2022',
  href: 'https://www.hackerrank.com/certificates/e5c080b5211c',
};

export type CrossShape =
  | 'cross' | 'tetra' | 'octa' | 'icosa' | 'dodeca' | 'box' | 'sphere' | 'torus' | 'torusKnot' | 'planet'
  | 'capsule' | 'cone' | 'cylinder' | 'triPrism' | 'hexPrism' | 'pyramid' | 'star' | 'doubleTorus' | 'orbital' | 'helix'
  | 'barrel' | 'wireCube' | 'ringedSphere' | 'crystal' | 'octaFrame' | 'spindle' | 'diamond' | 'saturn' | 'plusCluster' | 'disc';

export type CrossLayout = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  paletteId: SitePaletteId;
  shape: CrossShape;
};

const fieldColumns = 18;
const fieldRows = 10;
const fieldShapes: CrossShape[] = [
  'cross', 'tetra', 'octa', 'icosa', 'dodeca', 'box', 'sphere', 'torus', 'torusKnot', 'planet',
  'capsule', 'cone', 'cylinder', 'triPrism', 'hexPrism', 'pyramid', 'star', 'doubleTorus', 'orbital', 'helix',
  'barrel', 'wireCube', 'ringedSphere', 'crystal', 'octaFrame', 'spindle', 'diamond', 'saturn', 'plusCluster', 'disc',
];
const fieldPalettes: SitePaletteId[] = ['cobalt', 'coral', 'amber', 'jade', 'cyan', 'rose', 'violet'];

export const crossLayout: CrossLayout[] = Array.from({ length: fieldColumns * fieldRows }, (_, index) => {
  const column = index % fieldColumns;
  const row = Math.floor(index / fieldColumns);
  const jitterX = ((index * 17) % 7 - 3) * 0.009;
  const jitterY = ((index * 11) % 7 - 3) * 0.009;

  return {
    position: [((column + 0.5) / fieldColumns - 0.5) * 1.88 + jitterX, (0.5 - (row + 0.5) / fieldRows) * 1.88 + jitterY, -1.5 - ((column * 3 + row * 5) % 8) * 0.48],
    rotation: [0.24 + index * 0.17, 0.42 + index * 0.11, -0.18 + index * 0.13],
    scale: 0.2 + (index % 4) * 0.027,
    paletteId: fieldPalettes[index % fieldPalettes.length],
    shape: fieldShapes[index % fieldShapes.length],
  };
});

export type HeroInteraction = {
  active: boolean;
  lastMove: number;
  x: number;
  y: number;
};
