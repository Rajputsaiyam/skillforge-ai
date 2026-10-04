// Master skill taxonomy used to (a) seed the Skill collection, (b) drive resume parsing,
// (c) build the interactive Skill Graph, and (d) compute skill gaps / roadmaps.
// category, difficulty, prerequisites & relatedSkills define the GRAPH EDGES.

const skillsTaxonomy = [
  { name: 'HTML', category: 'Frontend', difficulty: 'Beginner', aliases: ['HTML5'], prerequisites: [], relatedSkills: ['CSS'], marketDemand: 'Medium' },
  { name: 'CSS', category: 'Frontend', difficulty: 'Beginner', aliases: ['CSS3'], prerequisites: ['HTML'], relatedSkills: ['Tailwind CSS', 'Sass'], marketDemand: 'Medium' },
  { name: 'JavaScript', category: 'Frontend', difficulty: 'Beginner', aliases: ['JS', 'ECMAScript'], prerequisites: ['HTML', 'CSS'], relatedSkills: ['React', 'Node.js', 'TypeScript'], marketDemand: 'High' },
  { name: 'TypeScript', category: 'Frontend', difficulty: 'Intermediate', aliases: ['TS'], prerequisites: ['JavaScript'], relatedSkills: ['React', 'Node.js'], marketDemand: 'High' },
  { name: 'Tailwind CSS', category: 'Frontend', difficulty: 'Beginner', aliases: ['TailwindCSS'], prerequisites: ['CSS'], relatedSkills: ['React'], marketDemand: 'Medium' },
  { name: 'React', category: 'Frontend', difficulty: 'Intermediate', aliases: ['React.js', 'ReactJS'], prerequisites: ['JavaScript'], relatedSkills: ['Next.js', 'Redux', 'React Query'], marketDemand: 'High' },
  { name: 'Redux', category: 'Frontend', difficulty: 'Intermediate', aliases: [], prerequisites: ['React'], relatedSkills: ['React Query'], marketDemand: 'Medium' },
  { name: 'React Query', category: 'Frontend', difficulty: 'Intermediate', aliases: ['TanStack Query'], prerequisites: ['React'], relatedSkills: ['Redux'], marketDemand: 'Medium' },
  { name: 'Next.js', category: 'Frontend', difficulty: 'Intermediate', aliases: ['NextJS'], prerequisites: ['React'], relatedSkills: ['Node.js'], marketDemand: 'High' },
  { name: 'Node.js', category: 'Backend', difficulty: 'Intermediate', aliases: ['NodeJS', 'Node'], prerequisites: ['JavaScript'], relatedSkills: ['Express', 'MongoDB'], marketDemand: 'High' },
  { name: 'Express', category: 'Backend', difficulty: 'Intermediate', aliases: ['Express.js', 'ExpressJS'], prerequisites: ['Node.js'], relatedSkills: ['MongoDB', 'REST APIs'], marketDemand: 'High' },
  { name: 'REST APIs', category: 'Backend', difficulty: 'Intermediate', aliases: ['REST', 'RESTful APIs'], prerequisites: ['Node.js'], relatedSkills: ['Express', 'GraphQL'], marketDemand: 'High' },
  { name: 'GraphQL', category: 'Backend', difficulty: 'Advanced', aliases: [], prerequisites: ['REST APIs'], relatedSkills: ['Node.js'], marketDemand: 'Medium' },
  { name: 'MongoDB', category: 'Database', difficulty: 'Intermediate', aliases: ['Mongo'], prerequisites: ['Node.js'], relatedSkills: ['Mongoose', 'SQL'], marketDemand: 'High' },
  { name: 'Mongoose', category: 'Database', difficulty: 'Intermediate', aliases: [], prerequisites: ['MongoDB'], relatedSkills: [], marketDemand: 'Medium' },
  { name: 'SQL', category: 'Database', difficulty: 'Beginner', aliases: ['MySQL', 'PostgreSQL'], prerequisites: [], relatedSkills: ['MongoDB'], marketDemand: 'High' },
  { name: 'Python', category: 'Data/AI', difficulty: 'Beginner', aliases: [], prerequisites: [], relatedSkills: ['Pandas', 'TensorFlow', 'Scikit-learn'], marketDemand: 'High' },
  { name: 'Pandas', category: 'Data/AI', difficulty: 'Intermediate', aliases: [], prerequisites: ['Python'], relatedSkills: ['NumPy'], marketDemand: 'Medium' },
  { name: 'NumPy', category: 'Data/AI', difficulty: 'Intermediate', aliases: [], prerequisites: ['Python'], relatedSkills: ['Pandas'], marketDemand: 'Medium' },
  { name: 'Scikit-learn', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['sklearn'], prerequisites: ['Python', 'NumPy'], relatedSkills: ['TensorFlow'], marketDemand: 'Medium' },
  { name: 'TensorFlow', category: 'Data/AI', difficulty: 'Advanced', aliases: [], prerequisites: ['Python', 'NumPy'], relatedSkills: ['Scikit-learn', 'Data Science'], marketDemand: 'High' },
  { name: 'Data Science', category: 'Data/AI', difficulty: 'Advanced', aliases: [], prerequisites: ['Python', 'SQL'], relatedSkills: ['Pandas', 'TensorFlow'], marketDemand: 'High' },
  { name: 'Docker', category: 'DevOps', difficulty: 'Intermediate', aliases: [], prerequisites: ['Node.js'], relatedSkills: ['Kubernetes', 'AWS'], marketDemand: 'High' },
  { name: 'Kubernetes', category: 'DevOps', difficulty: 'Advanced', aliases: ['K8s'], prerequisites: ['Docker'], relatedSkills: ['AWS'], marketDemand: 'Medium' },
  { name: 'AWS', category: 'DevOps', difficulty: 'Advanced', aliases: ['Amazon Web Services'], prerequisites: ['Docker'], relatedSkills: ['Kubernetes', 'CI/CD'], marketDemand: 'High' },
  { name: 'CI/CD', category: 'DevOps', difficulty: 'Intermediate', aliases: ['CICD'], prerequisites: ['Docker'], relatedSkills: ['AWS', 'Git'], marketDemand: 'Medium' },
  { name: 'Git', category: 'DevOps', difficulty: 'Beginner', aliases: ['GitHub', 'Version Control'], prerequisites: [], relatedSkills: ['CI/CD'], marketDemand: 'High' },

  // --- AI/ML additions ---
  { name: 'Machine Learning', category: 'Data/AI', difficulty: 'Advanced', aliases: ['ML'], prerequisites: ['Python', 'NumPy'], relatedSkills: ['Scikit-learn', 'Deep Learning'], marketDemand: 'High' },
  { name: 'Deep Learning', category: 'Data/AI', difficulty: 'Advanced', aliases: ['DL'], prerequisites: ['Machine Learning'], relatedSkills: ['TensorFlow', 'PyTorch'], marketDemand: 'High' },
  { name: 'PyTorch', category: 'Data/AI', difficulty: 'Advanced', aliases: [], prerequisites: ['Python', 'Deep Learning'], relatedSkills: ['TensorFlow', 'Computer Vision'], marketDemand: 'High' },
  { name: 'Natural Language Processing', category: 'Data/AI', difficulty: 'Advanced', aliases: ['NLP'], prerequisites: ['Machine Learning'], relatedSkills: ['Large Language Models', 'Hugging Face Transformers'], marketDemand: 'High' },
  { name: 'Computer Vision', category: 'Data/AI', difficulty: 'Advanced', aliases: ['CV'], prerequisites: ['Deep Learning'], relatedSkills: ['PyTorch', 'TensorFlow'], marketDemand: 'Medium' },
  { name: 'Large Language Models', category: 'Data/AI', difficulty: 'Advanced', aliases: ['LLMs', 'LLM'], prerequisites: ['Natural Language Processing'], relatedSkills: ['Prompt Engineering', 'LangChain', 'Retrieval-Augmented Generation'], marketDemand: 'High' },
  { name: 'Prompt Engineering', category: 'Data/AI', difficulty: 'Intermediate', aliases: [], prerequisites: [], relatedSkills: ['Large Language Models'], marketDemand: 'High' },
  { name: 'Hugging Face Transformers', category: 'Data/AI', difficulty: 'Advanced', aliases: ['Transformers'], prerequisites: ['Python', 'Deep Learning'], relatedSkills: ['Natural Language Processing'], marketDemand: 'High' },
  { name: 'LangChain', category: 'Data/AI', difficulty: 'Advanced', aliases: [], prerequisites: ['Large Language Models'], relatedSkills: ['Retrieval-Augmented Generation', 'Vector Databases'], marketDemand: 'Medium' },
  { name: 'Retrieval-Augmented Generation', category: 'Data/AI', difficulty: 'Advanced', aliases: ['RAG'], prerequisites: ['Large Language Models'], relatedSkills: ['Vector Databases', 'LangChain'], marketDemand: 'High' },
  { name: 'Vector Databases', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['Pinecone', 'FAISS'], prerequisites: [], relatedSkills: ['Retrieval-Augmented Generation'], marketDemand: 'Medium' },
  { name: 'MLOps', category: 'Data/AI', difficulty: 'Advanced', aliases: [], prerequisites: ['Machine Learning', 'Docker'], relatedSkills: ['CI/CD'], marketDemand: 'High' },
  { name: 'Generative AI', category: 'Data/AI', difficulty: 'Advanced', aliases: ['GenAI'], prerequisites: ['Deep Learning'], relatedSkills: ['Large Language Models', 'Computer Vision'], marketDemand: 'High' },

  // --- Other domain additions (mobile, testing, extra cloud/backend) ---
  { name: 'React Native', category: 'Mobile', difficulty: 'Intermediate', aliases: [], prerequisites: ['React'], relatedSkills: ['TypeScript'], marketDemand: 'Medium' },
  { name: 'Flutter', category: 'Mobile', difficulty: 'Intermediate', aliases: [], prerequisites: [], relatedSkills: ['Dart'], marketDemand: 'Medium' },
  { name: 'Dart', category: 'Mobile', difficulty: 'Beginner', aliases: [], prerequisites: [], relatedSkills: ['Flutter'], marketDemand: 'Low' },
  { name: 'Jest', category: 'Testing', difficulty: 'Intermediate', aliases: [], prerequisites: ['JavaScript'], relatedSkills: ['React'], marketDemand: 'Medium' },
  { name: 'Cypress', category: 'Testing', difficulty: 'Intermediate', aliases: [], prerequisites: ['JavaScript'], relatedSkills: ['Jest'], marketDemand: 'Medium' },
  { name: 'GraphQL Federation', category: 'Backend', difficulty: 'Advanced', aliases: [], prerequisites: ['GraphQL'], relatedSkills: [], marketDemand: 'Low' },
  { name: 'Redis', category: 'Database', difficulty: 'Intermediate', aliases: [], prerequisites: [], relatedSkills: ['Node.js'], marketDemand: 'Medium' },
  { name: 'Terraform', category: 'DevOps', difficulty: 'Advanced', aliases: [], prerequisites: ['AWS'], relatedSkills: ['Docker'], marketDemand: 'Medium' },
  { name: 'System Design', category: 'Backend', difficulty: 'Advanced', aliases: [], prerequisites: ['REST APIs'], relatedSkills: ['AWS', 'Redis'], marketDemand: 'High' },
];

// Flat, deduplicated list of every known skill name + alias — used as the seed
// "known vocabulary" for the ML service's open-vocabulary skill discovery
// (extract-dynamic-skills), so the Skill Graph can recognize far more real-world
// skills than the smaller role-requirement list below, and can still discover
// skills that aren't even in this list via the novel-term detector.
const extendedSkillVocabulary = Array.from(
  new Set(
    skillsTaxonomy.flatMap((s) => [s.name, ...(s.aliases || [])])
  )
);

// Role -> required skills with target proficiency + priority weighting used by the gap engine
const roleRequirements = {
  'Full Stack Developer': [
    { skill: 'JavaScript', requiredLevel: 85, priority: 'Critical' },
    { skill: 'React', requiredLevel: 90, priority: 'High' },
    { skill: 'Node.js', requiredLevel: 85, priority: 'High' },
    { skill: 'Express', requiredLevel: 75, priority: 'Medium' },
    { skill: 'MongoDB', requiredLevel: 75, priority: 'High' },
    { skill: 'REST APIs', requiredLevel: 80, priority: 'Medium' },
    { skill: 'Docker', requiredLevel: 70, priority: 'Critical' },
    { skill: 'AWS', requiredLevel: 60, priority: 'Critical' },
    { skill: 'Git', requiredLevel: 70, priority: 'Medium' },
  ],
  'Frontend Developer': [
    { skill: 'HTML', requiredLevel: 90, priority: 'Medium' },
    { skill: 'CSS', requiredLevel: 90, priority: 'Medium' },
    { skill: 'JavaScript', requiredLevel: 90, priority: 'Critical' },
    { skill: 'React', requiredLevel: 90, priority: 'Critical' },
    { skill: 'TypeScript', requiredLevel: 70, priority: 'High' },
    { skill: 'Tailwind CSS', requiredLevel: 70, priority: 'Medium' },
    { skill: 'Next.js', requiredLevel: 60, priority: 'Medium' },
  ],
  'Backend Developer': [
    { skill: 'JavaScript', requiredLevel: 80, priority: 'High' },
    { skill: 'Node.js', requiredLevel: 90, priority: 'Critical' },
    { skill: 'Express', requiredLevel: 85, priority: 'High' },
    { skill: 'MongoDB', requiredLevel: 80, priority: 'High' },
    { skill: 'SQL', requiredLevel: 65, priority: 'Medium' },
    { skill: 'REST APIs', requiredLevel: 85, priority: 'High' },
    { skill: 'Docker', requiredLevel: 65, priority: 'Medium' },
  ],
  'Data Scientist': [
    { skill: 'Python', requiredLevel: 90, priority: 'Critical' },
    { skill: 'Pandas', requiredLevel: 85, priority: 'High' },
    { skill: 'NumPy', requiredLevel: 80, priority: 'High' },
    { skill: 'SQL', requiredLevel: 75, priority: 'High' },
    { skill: 'Scikit-learn', requiredLevel: 75, priority: 'High' },
    { skill: 'TensorFlow', requiredLevel: 65, priority: 'Medium' },
    { skill: 'Data Science', requiredLevel: 80, priority: 'Critical' },
  ],
  'DevOps Engineer': [
    { skill: 'Docker', requiredLevel: 90, priority: 'Critical' },
    { skill: 'Kubernetes', requiredLevel: 80, priority: 'Critical' },
    { skill: 'AWS', requiredLevel: 85, priority: 'Critical' },
    { skill: 'CI/CD', requiredLevel: 85, priority: 'High' },
    { skill: 'Git', requiredLevel: 80, priority: 'Medium' },
    { skill: 'Node.js', requiredLevel: 55, priority: 'Low' },
  ],
};

// A couple of extra role targets that make use of the new AI/ML skills above.
roleRequirements['Machine Learning Engineer'] = [
  { skill: 'Python', requiredLevel: 90, priority: 'Critical' },
  { skill: 'Machine Learning', requiredLevel: 85, priority: 'Critical' },
  { skill: 'Deep Learning', requiredLevel: 80, priority: 'High' },
  { skill: 'PyTorch', requiredLevel: 70, priority: 'High' },
  { skill: 'MLOps', requiredLevel: 60, priority: 'Medium' },
  { skill: 'SQL', requiredLevel: 65, priority: 'Medium' },
];
roleRequirements['AI/LLM Engineer'] = [
  { skill: 'Python', requiredLevel: 85, priority: 'Critical' },
  { skill: 'Large Language Models', requiredLevel: 85, priority: 'Critical' },
  { skill: 'Prompt Engineering', requiredLevel: 80, priority: 'High' },
  { skill: 'LangChain', requiredLevel: 65, priority: 'Medium' },
  { skill: 'Retrieval-Augmented Generation', requiredLevel: 65, priority: 'High' },
  { skill: 'Vector Databases', requiredLevel: 60, priority: 'Medium' },
];

module.exports = { skillsTaxonomy, roleRequirements, extendedSkillVocabulary };
