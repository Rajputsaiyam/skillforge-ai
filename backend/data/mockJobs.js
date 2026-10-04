// Clearly-isolated MOCK development data (source: 'mock').
// Once a real provider (e.g. an authorized LinkedIn/job-data API) is connected via
// services/jobProviderService.js, real jobs will carry source: 'linkedin' / 'other'
// and this file becomes unnecessary in production.

const mockJobs = [
  {
    source: 'mock', externalJobId: 'MOCK-1001', externalUrl: 'https://example-careers.com/jobs/1001',
    title: 'Full Stack Developer', company: 'Nimbus Cloud Technologies', location: 'Delhi, India',
    workMode: 'Hybrid', employmentType: 'Full-time', experienceRequired: '0-2 years', salaryRange: '₹6L - ₹10L',
    description: 'Build and maintain customer-facing web applications using the MERN stack. Collaborate with product and design to ship features end-to-end.',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'REST APIs'],
    preferredSkills: ['Docker', 'AWS', 'TypeScript'],
    postedDate: new Date(Date.now() - 2 * 86400000),
  },
  {
    source: 'mock', externalJobId: 'MOCK-1002', externalUrl: 'https://example-careers.com/jobs/1002',
    title: 'Frontend Engineer', company: 'Bluepeak Softworks', location: 'Bengaluru, India',
    workMode: 'Remote', employmentType: 'Full-time', experienceRequired: '1-3 years', salaryRange: '₹8L - ₹14L',
    description: 'Own the frontend architecture for our flagship analytics dashboard, working closely with design systems and performance budgets.',
    requiredSkills: ['React', 'JavaScript', 'CSS', 'Tailwind CSS'],
    preferredSkills: ['TypeScript', 'Next.js', 'Redux'],
    postedDate: new Date(Date.now() - 5 * 86400000),
  },
  {
    source: 'mock', externalJobId: 'MOCK-1003', externalUrl: 'https://example-careers.com/jobs/1003',
    title: 'Backend Engineer (Node.js)', company: 'Vertex Systems', location: 'Pune, India',
    workMode: 'On-site', employmentType: 'Full-time', experienceRequired: '2-4 years', salaryRange: '₹10L - ₹16L',
    description: 'Design and scale REST APIs and services that power our fintech platform, with a strong focus on data integrity and security.',
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
    preferredSkills: ['Docker', 'AWS', 'SQL'],
    postedDate: new Date(Date.now() - 1 * 86400000),
  },
  {
    source: 'mock', externalJobId: 'MOCK-1004', externalUrl: 'https://example-careers.com/jobs/1004',
    title: 'Junior Data Scientist', company: 'Insightloop Analytics', location: 'Hyderabad, India',
    workMode: 'Hybrid', employmentType: 'Full-time', experienceRequired: '0-1 years', salaryRange: '₹7L - ₹11L',
    description: 'Work on predictive models for customer churn and demand forecasting using Python and modern ML tooling.',
    requiredSkills: ['Python', 'Pandas', 'NumPy', 'SQL'],
    preferredSkills: ['Scikit-learn', 'TensorFlow', 'Data Science'],
    postedDate: new Date(Date.now() - 3 * 86400000),
  },
  {
    source: 'mock', externalJobId: 'MOCK-1005', externalUrl: 'https://example-careers.com/jobs/1005',
    title: 'DevOps Engineer', company: 'Corestack Infra', location: 'Gurugram, India',
    workMode: 'On-site', employmentType: 'Full-time', experienceRequired: '2-5 years', salaryRange: '₹12L - ₹20L',
    description: 'Own our CI/CD pipelines and container orchestration across staging and production environments on AWS.',
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    preferredSkills: ['Node.js', 'Git'],
    postedDate: new Date(Date.now() - 6 * 86400000),
  },
  {
    source: 'mock', externalJobId: 'MOCK-1006', externalUrl: 'https://example-careers.com/jobs/1006',
    title: 'MERN Stack Developer', company: 'Orbitly Labs', location: 'Remote (India)',
    workMode: 'Remote', employmentType: 'Contract', experienceRequired: '1-3 years', salaryRange: '₹9L - ₹15L',
    description: 'Join a small product team building a B2B SaaS tool end-to-end using React, Node.js and MongoDB.',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    preferredSkills: ['TypeScript', 'Docker', 'Redux'],
    postedDate: new Date(Date.now() - 4 * 86400000),
  },
];

module.exports = mockJobs;
