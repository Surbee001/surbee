export interface JobRole {
  slug: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string[];
  responsibilities: string[];
  requirements: string[];
  about: string[];
}

export const jobRoles: JobRole[] = [
  {
    slug: "community-support-engineer",
    title: "Community Support Engineer",
    department: "User Ops",
    type: "Full-time",
    location: "Remote",
    description: [
      "We're looking for a Community Support Engineer who thrives in solving complex technical challenges and delivering an exceptional user experience. You'll be the first line of defense for our users on our developer forums, debugging tricky issues, building automations to streamline workflows, and ensuring every interaction with Cursor is smooth and impactful. You'll partner closely with product and engineering to champion the voice of the customer and shape how AI-powered developer support scales."
    ],
    responsibilities: [
      "Provide in-depth technical support on our developer forum and other community channels, resolving complex user-reported issues and ensuring high-quality community interactions.",
      "Debug, reproduce, and troubleshoot software bugs and usability problems.",
      "Design and build internal tools and automations to scale support operations.",
      "Represent Anysphere in technical conversations with developers on forums, Reddit, and other community channels, especially for high-stakes bugs and issues.",
      "Partner with Product and Engineering to escalate critical issues and feed insights into the roadmap.",
      "Maintain and expand user-facing documentation and internal knowledge bases to empower both customers and teammates."
    ],
    requirements: [
      "<strong>Hands-on experience with Cursor as a user</strong> - familiarity with advanced features and common workflows preferred.",
      "Experience in community forum support, software engineering, or a related user-facing technical role.",
      "Strong understanding of software development workflows; experience with IDEs, LLMs, and building with AI.",
      "Strong debugging skills and a passion for digging deep into technical problems.",
      "Clear, concise communication skills to explain complex concepts to technical and non‑technical audiences.",
      "Self-starter with curiosity, creativity, and a bias for action."
    ],
    about: [
      "We're Anysphere, the team behind <a href=\"http://cursor.com/\" rel=\"noopener noreferrer nofollow\" target=\"_blank"><u>Cursor</u></a>.",
      "Our mission is to automate coding. The first step in our journey is to build the best tool for professional programmers, using a combination of inventive research, design, and engineering.",
      "We're a group of engineers and scientists who've built well-known products, created large OSS projects, started productive businesses, won olympiad medals, and published significant research.",
      "We're in-person with cozy offices in North Beach, San Francisco and Manhattan, New York, replete with well-stocked libraries. Our investors include Andreessen Horowitz, OpenAI, Jeff Dean, John Schulman, and the founders of Stripe and Github."
    ]
  },
  {
    slug: "frontend-engineer",
    title: "Frontend Engineer",
    department: "Engineering",
    type: "Full-time",
    location: "San Francisco / New York",
    description: [
      "We are looking for a creative and detail-oriented Frontend Engineer to help us build the future of coding interfaces. You will work on the core Cursor editor, creating smooth, intuitive, and responsive experiences that developers use every day."
    ],
    responsibilities: [
      "Design and implement new features for the Cursor editor using React and Electron.",
      "Optimize performance to ensure a buttery smooth experience even with large codebases.",
      "Collaborate with design and product teams to refine user interactions."
    ],
    requirements: [
      "Expertise in React, TypeScript, and modern CSS.",
      "Experience with Electron or building complex desktop applications is a plus.",
      "A keen eye for design and user experience."
    ],
    about: [
      "We're Anysphere, the team behind <a href=\"http://cursor.com/\" rel=\"noopener noreferrer nofollow\" target=\"_blank"><u>Cursor</u></a>."
    ]
  }
];
