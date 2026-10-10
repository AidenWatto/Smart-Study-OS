import { motion } from "framer-motion";
import {
  Code2,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Globe,
  Calendar,
  Award,
  Briefcase,
  GraduationCap,
} from "lucide-react";

const dev = {
  name: "Aranya Vij",

  role: "Student Researcher • United States",

  specialization: "Creator of Smart StudyOS",

  about:
    "Aranya Vij is a high-school student and independent researcher from the United States. Driven by a passion for solving real student challenges, he created Smart StudyOS to help students improve productivity, build better study habits, stay focused, and achieve their academic goals. His work combines research, experimentation, and practical problem-solving to design tools that make learning more organized, effective, and engaging.",

  skills: [
    "Student Productivity",
    "Academic Planning",
    "Learning Systems",
    "Research & Innovation",
    "Habit Building",
    "Focus Management",
    "Goal Tracking",
    "Educational Technology",
  ],

  links: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "developer@smartstudyos.com",
    portfolio: "https://portfolio.dev",
  },

  experience: [
    {
      year: "2022",
      title: "Understanding Student Challenges",
      description:
        "Started exploring common academic challenges faced by students, including procrastination, poor time management, lack of consistency, and study-related stress.",
      type: "education",
    },

    {
      year: "2023",
      title: "Research & Experimentation",
      description:
        "Studied productivity systems, learning techniques, habit formation strategies, and motivation frameworks to better understand how students learn and perform.",
      type: "education",
    },

    {
      year: "2024",
      title: "Building Smart StudyOS",
      description:
        "Developed Smart StudyOS as an all-in-one platform that combines planning, focus tools, progress tracking, and productivity systems into a single student-focused experience.",
      type: "project",
    },

    {
      year: "2025",
      title: "Continuous Improvement",
      description:
        "Continues refining Smart StudyOS through ongoing research, testing, and feedback to create a more effective learning and productivity environment for students.",
      type: "project",
    },
  ],
};

export default function Developer() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Developer
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          The mind behind Smart StudyOS
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 overflow-hidden relative"
      >
        {/* Background gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 gradient-primary opacity-10" />

        <div className="relative">
          {/* Avatar & Name */}
          <div className="flex items-start gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0">
              <Code2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                {dev.name}
              </h2>
              <p className="text-sm text-primary-500 font-medium">{dev.role}</p>
              <p className="text-xs text-surface-400 mt-1">
                {dev.specialization}
              </p>
            </div>
          </div>

          {/* About */}
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 mb-6">
            <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase mb-2">
              About
            </h3>
            <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
              {dev.about}
            </p>
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase mb-3">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {dev.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap gap-3 mb-6">
            <a
              href={dev.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-sm hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a
              href={dev.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-sm hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
            <a
              href={`mailto:${dev.links.email}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-sm hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <Mail className="w-4 h-4" /> Email
            </a>
            <a
              href={dev.links.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-sm hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <Globe className="w-4 h-4" /> Portfolio
            </a>
          </div>
        </div>
      </motion.div>

      {/* Experience Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary-500" /> Experience &
          Projects
        </h3>
        <div className="relative pl-6 border-l-2 border-surface-200 dark:border-surface-700 space-y-6">
          {dev.experience.map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary-500 border-2 border-white dark:border-surface-900" />
              <div className="flex items-center gap-2 mb-1">
                {exp.type === "project" ? (
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5 text-primary-500" />
                )}
                <span className="text-xs text-surface-400">{exp.year}</span>
              </div>
              <h4 className="text-sm font-medium text-surface-900 dark:text-white">
                {exp.title}
              </h4>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                {exp.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-accent-500" /> Built With
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Student Research", desc: "Problem Discovery" },
            { name: "Learning Science", desc: "Study Methods" },
            { name: "Product Design", desc: "User Experience" },
            { name: "Innovation", desc: "Solution Building" },
            { name: "Productivity Systems", desc: "Focus & Planning" },
            { name: "Habit Formation", desc: "Consistency" },
            { name: "Academic Tools", desc: "Student Success" },
            { name: "Smart StudyOS", desc: "Integrated Platform" },
          ].map((tech) => (
            <div
              key={tech.name}
              className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50"
            >
              <p className="text-sm font-medium text-surface-900 dark:text-white">
                {tech.name}
              </p>
              <p className="text-[10px] text-surface-400">{tech.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
