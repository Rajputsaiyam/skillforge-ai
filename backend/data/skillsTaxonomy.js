// Master skill taxonomy used to (a) seed the Skill collection, (b) drive resume parsing,
// (c) build the interactive Skill Graph, and (d) compute skill gaps / roadmaps.
// category, difficulty, prerequisites & relatedSkills define the GRAPH EDGES.

const skillsTaxonomy = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FRONTEND
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'HTML', category: 'Frontend', difficulty: 'Beginner', aliases: ['HTML5'], prerequisites: [], relatedSkills: ['CSS'], marketDemand: 'Medium' },
  { name: 'CSS', category: 'Frontend', difficulty: 'Beginner', aliases: ['CSS3'], prerequisites: ['HTML'], relatedSkills: ['Tailwind CSS', 'Sass/SCSS'], marketDemand: 'Medium' },
  { name: 'JavaScript', category: 'Frontend', difficulty: 'Beginner', aliases: ['JS', 'ECMAScript'], prerequisites: ['HTML', 'CSS'], relatedSkills: ['React', 'Node.js', 'TypeScript'], marketDemand: 'High' },
  { name: 'TypeScript', category: 'Frontend', difficulty: 'Intermediate', aliases: ['TS'], prerequisites: ['JavaScript'], relatedSkills: ['React', 'Node.js', 'Angular'], marketDemand: 'High' },
  { name: 'Tailwind CSS', category: 'Frontend', difficulty: 'Beginner', aliases: ['TailwindCSS'], prerequisites: ['CSS'], relatedSkills: ['React', 'Responsive Design'], marketDemand: 'Medium' },
  { name: 'Sass/SCSS', category: 'Frontend', difficulty: 'Beginner', aliases: ['Sass', 'SCSS', 'LESS'], prerequisites: ['CSS'], relatedSkills: ['Tailwind CSS', 'Responsive Design'], marketDemand: 'Medium' },
  { name: 'React', category: 'Frontend', difficulty: 'Intermediate', aliases: ['React.js', 'ReactJS'], prerequisites: ['JavaScript'], relatedSkills: ['Next.js', 'Redux', 'React Query', 'Zustand'], marketDemand: 'High' },
  { name: 'Redux', category: 'Frontend', difficulty: 'Intermediate', aliases: ['Redux Toolkit', 'RTK'], prerequisites: ['React'], relatedSkills: ['React Query', 'Zustand', 'MobX'], marketDemand: 'Medium' },
  { name: 'React Query', category: 'Frontend', difficulty: 'Intermediate', aliases: ['TanStack Query'], prerequisites: ['React'], relatedSkills: ['Redux'], marketDemand: 'Medium' },
  { name: 'Zustand', category: 'Frontend', difficulty: 'Intermediate', aliases: [], prerequisites: ['React'], relatedSkills: ['Redux', 'MobX'], marketDemand: 'Medium' },
  { name: 'MobX', category: 'Frontend', difficulty: 'Intermediate', aliases: [], prerequisites: ['React'], relatedSkills: ['Redux', 'Zustand'], marketDemand: 'Low' },
  { name: 'Next.js', category: 'Frontend', difficulty: 'Intermediate', aliases: ['NextJS'], prerequisites: ['React'], relatedSkills: ['Node.js', 'Remix', 'Vercel'], marketDemand: 'High' },
  { name: 'Vue.js', category: 'Frontend', difficulty: 'Intermediate', aliases: ['Vue', 'VueJS'], prerequisites: ['JavaScript'], relatedSkills: ['React', 'Angular', 'Vite'], marketDemand: 'High' },
  { name: 'Angular', category: 'Frontend', difficulty: 'Intermediate', aliases: ['Angular.js', 'AngularJS'], prerequisites: ['TypeScript'], relatedSkills: ['React', 'Vue.js'], marketDemand: 'High' },
  { name: 'Svelte', category: 'Frontend', difficulty: 'Intermediate', aliases: ['SvelteKit', 'Svelte.js'], prerequisites: ['JavaScript'], relatedSkills: ['React', 'Vue.js', 'Vite'], marketDemand: 'Medium' },
  { name: 'Astro', category: 'Frontend', difficulty: 'Intermediate', aliases: ['Astro.js'], prerequisites: ['JavaScript', 'HTML'], relatedSkills: ['Next.js', 'Remix', 'Vite'], marketDemand: 'Medium' },
  { name: 'Remix', category: 'Frontend', difficulty: 'Intermediate', aliases: ['Remix.run'], prerequisites: ['React'], relatedSkills: ['Next.js', 'Astro'], marketDemand: 'Medium' },
  { name: 'Webpack', category: 'Frontend', difficulty: 'Intermediate', aliases: [], prerequisites: ['JavaScript'], relatedSkills: ['Vite', 'Node.js'], marketDemand: 'Medium' },
  { name: 'Vite', category: 'Frontend', difficulty: 'Intermediate', aliases: ['ViteJS'], prerequisites: ['JavaScript'], relatedSkills: ['Webpack', 'Svelte', 'Vue.js'], marketDemand: 'Medium' },
  { name: 'Storybook', category: 'Frontend', difficulty: 'Intermediate', aliases: [], prerequisites: ['React'], relatedSkills: ['Design Systems', 'Material UI', 'Chakra UI'], marketDemand: 'Medium' },
  { name: 'Responsive Design', category: 'Frontend', difficulty: 'Beginner', aliases: ['Mobile-First Design', 'RWD'], prerequisites: ['CSS'], relatedSkills: ['Tailwind CSS', 'Sass/SCSS', 'Web Accessibility'], marketDemand: 'Medium' },
  { name: 'Web Accessibility', category: 'Frontend', difficulty: 'Intermediate', aliases: ['a11y', 'Accessibility', 'WCAG', 'ARIA'], prerequisites: ['HTML', 'CSS'], relatedSkills: ['Responsive Design', 'UI/UX Design'], marketDemand: 'Medium' },
  { name: 'Progressive Web Apps', category: 'Frontend', difficulty: 'Intermediate', aliases: ['PWA', 'PWAs'], prerequisites: ['JavaScript', 'HTML'], relatedSkills: ['React', 'Service Workers'], marketDemand: 'Medium' },
  { name: 'Material UI', category: 'Frontend', difficulty: 'Intermediate', aliases: ['MUI', 'Material Design'], prerequisites: ['React'], relatedSkills: ['Chakra UI', 'Storybook', 'Design Systems'], marketDemand: 'Medium' },
  { name: 'Chakra UI', category: 'Frontend', difficulty: 'Intermediate', aliases: [], prerequisites: ['React'], relatedSkills: ['Material UI', 'Storybook', 'Design Systems'], marketDemand: 'Medium' },
  { name: 'Framer Motion', category: 'Frontend', difficulty: 'Intermediate', aliases: ['Motion'], prerequisites: ['React'], relatedSkills: ['Three.js', 'CSS'], marketDemand: 'Low' },
  { name: 'Three.js', category: 'Frontend', difficulty: 'Advanced', aliases: ['ThreeJS'], prerequisites: ['JavaScript'], relatedSkills: ['WebGL', 'Framer Motion'], marketDemand: 'Low' },
  { name: 'WebGL', category: 'Frontend', difficulty: 'Advanced', aliases: [], prerequisites: ['JavaScript'], relatedSkills: ['Three.js'], marketDemand: 'Low' },
  { name: 'D3.js', category: 'Frontend', difficulty: 'Advanced', aliases: ['D3', 'Data-Driven Documents'], prerequisites: ['JavaScript'], relatedSkills: ['Three.js', 'Data Science'], marketDemand: 'Medium' },

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKEND
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Node.js', category: 'Backend', difficulty: 'Intermediate', aliases: ['NodeJS', 'Node'], prerequisites: ['JavaScript'], relatedSkills: ['Express', 'MongoDB', 'REST APIs'], marketDemand: 'High' },
  { name: 'Express', category: 'Backend', difficulty: 'Intermediate', aliases: ['Express.js', 'ExpressJS'], prerequisites: ['Node.js'], relatedSkills: ['MongoDB', 'REST APIs'], marketDemand: 'High' },
  { name: 'REST APIs', category: 'Backend', difficulty: 'Intermediate', aliases: ['REST', 'RESTful APIs'], prerequisites: ['Node.js'], relatedSkills: ['Express', 'GraphQL', 'API Design'], marketDemand: 'High' },
  { name: 'GraphQL', category: 'Backend', difficulty: 'Advanced', aliases: [], prerequisites: ['REST APIs'], relatedSkills: ['Node.js', 'GraphQL Federation'], marketDemand: 'Medium' },
  { name: 'GraphQL Federation', category: 'Backend', difficulty: 'Advanced', aliases: [], prerequisites: ['GraphQL'], relatedSkills: ['Microservices'], marketDemand: 'Low' },
  { name: 'FastAPI', category: 'Backend', difficulty: 'Intermediate', aliases: [], prerequisites: ['Python'], relatedSkills: ['Django', 'Flask', 'REST APIs'], marketDemand: 'High' },
  { name: 'Django', category: 'Backend', difficulty: 'Intermediate', aliases: ['Django REST Framework', 'DRF'], prerequisites: ['Python'], relatedSkills: ['Flask', 'FastAPI'], marketDemand: 'High' },
  { name: 'Flask', category: 'Backend', difficulty: 'Intermediate', aliases: [], prerequisites: ['Python'], relatedSkills: ['Django', 'FastAPI'], marketDemand: 'Medium' },
  { name: 'Spring Boot', category: 'Backend', difficulty: 'Advanced', aliases: ['Spring', 'Spring Framework'], prerequisites: ['Java'], relatedSkills: ['Microservices', 'REST APIs'], marketDemand: 'High' },
  { name: 'Java', category: 'Backend', difficulty: 'Intermediate', aliases: ['JDK', 'JVM'], prerequisites: [], relatedSkills: ['Spring Boot', 'Kotlin'], marketDemand: 'High' },
  { name: 'Go', category: 'Backend', difficulty: 'Intermediate', aliases: ['Golang', 'Go lang'], prerequisites: [], relatedSkills: ['Microservices', 'gRPC', 'Docker'], marketDemand: 'High' },
  { name: 'Rust', category: 'Backend', difficulty: 'Advanced', aliases: [], prerequisites: [], relatedSkills: ['C++', 'Go', 'System Design'], marketDemand: 'Medium' },
  { name: 'C#/.NET', category: 'Backend', difficulty: 'Intermediate', aliases: ['C#', '.NET', 'ASP.NET', 'dotnet'], prerequisites: [], relatedSkills: ['Java', 'REST APIs'], marketDemand: 'High' },
  { name: 'C++', category: 'Backend', difficulty: 'Advanced', aliases: ['CPP'], prerequisites: [], relatedSkills: ['Rust', 'System Design'], marketDemand: 'Medium' },
  { name: 'Ruby on Rails', category: 'Backend', difficulty: 'Intermediate', aliases: ['Rails', 'Ruby', 'RoR'], prerequisites: [], relatedSkills: ['Django', 'Node.js'], marketDemand: 'Medium' },
  { name: 'PHP/Laravel', category: 'Backend', difficulty: 'Intermediate', aliases: ['PHP', 'Laravel'], prerequisites: [], relatedSkills: ['Node.js', 'REST APIs'], marketDemand: 'Medium' },
  { name: 'Elixir', category: 'Backend', difficulty: 'Advanced', aliases: ['Phoenix', 'Elixir/Phoenix'], prerequisites: [], relatedSkills: ['Rust', 'Go'], marketDemand: 'Low' },
  { name: 'Haskell', category: 'Backend', difficulty: 'Advanced', aliases: [], prerequisites: [], relatedSkills: ['Elixir', 'Rust'], marketDemand: 'Low' },
  { name: 'gRPC', category: 'Backend', difficulty: 'Advanced', aliases: ['Protocol Buffers', 'Protobuf'], prerequisites: ['REST APIs'], relatedSkills: ['Go', 'Microservices'], marketDemand: 'Medium' },
  { name: 'WebSocket', category: 'Backend', difficulty: 'Intermediate', aliases: ['Socket.io', 'WebSockets', 'WS'], prerequisites: ['Node.js'], relatedSkills: ['REST APIs', 'Express'], marketDemand: 'Medium' },
  { name: 'Microservices', category: 'Backend', difficulty: 'Advanced', aliases: ['Microservice Architecture'], prerequisites: ['REST APIs', 'Docker'], relatedSkills: ['Kubernetes', 'gRPC', 'Apache Kafka', 'Event-Driven Architecture'], marketDemand: 'High' },
  { name: 'Apache Kafka', category: 'Backend', difficulty: 'Advanced', aliases: ['Kafka'], prerequisites: ['Microservices'], relatedSkills: ['RabbitMQ', 'Event-Driven Architecture'], marketDemand: 'High' },
  { name: 'RabbitMQ', category: 'Backend', difficulty: 'Intermediate', aliases: ['AMQP'], prerequisites: ['Node.js'], relatedSkills: ['Apache Kafka', 'Celery', 'Microservices'], marketDemand: 'Medium' },
  { name: 'Celery', category: 'Backend', difficulty: 'Intermediate', aliases: [], prerequisites: ['Python'], relatedSkills: ['RabbitMQ', 'Django'], marketDemand: 'Medium' },
  { name: 'Nginx', category: 'Backend', difficulty: 'Intermediate', aliases: [], prerequisites: ['Linux'], relatedSkills: ['Apache', 'Docker'], marketDemand: 'Medium' },
  { name: 'Apache', category: 'Backend', difficulty: 'Intermediate', aliases: ['Apache HTTP', 'httpd'], prerequisites: ['Linux'], relatedSkills: ['Nginx'], marketDemand: 'Low' },
  { name: 'API Design', category: 'Backend', difficulty: 'Intermediate', aliases: ['API Architecture'], prerequisites: ['REST APIs'], relatedSkills: ['GraphQL', 'gRPC', 'System Design'], marketDemand: 'High' },
  { name: 'System Design', category: 'Backend', difficulty: 'Advanced', aliases: ['Systems Architecture', 'System Architecture'], prerequisites: ['REST APIs'], relatedSkills: ['AWS', 'Redis', 'Microservices', 'Clean Architecture'], marketDemand: 'High' },

  // ═══════════════════════════════════════════════════════════════════════════
  // DATABASE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'MongoDB', category: 'Database', difficulty: 'Intermediate', aliases: ['Mongo'], prerequisites: ['Node.js'], relatedSkills: ['Mongoose', 'SQL'], marketDemand: 'High' },
  { name: 'Mongoose', category: 'Database', difficulty: 'Intermediate', aliases: [], prerequisites: ['MongoDB'], relatedSkills: ['Prisma'], marketDemand: 'Medium' },
  { name: 'SQL', category: 'Database', difficulty: 'Beginner', aliases: ['MySQL', 'PostgreSQL', 'Postgres'], prerequisites: [], relatedSkills: ['MongoDB', 'Prisma', 'Sequelize'], marketDemand: 'High' },
  { name: 'Redis', category: 'Database', difficulty: 'Intermediate', aliases: ['Redis Cache'], prerequisites: [], relatedSkills: ['Node.js', 'Elasticsearch'], marketDemand: 'High' },
  { name: 'Elasticsearch', category: 'Database', difficulty: 'Advanced', aliases: ['Elastic', 'ELK Stack', 'OpenSearch'], prerequisites: [], relatedSkills: ['Redis', 'MongoDB'], marketDemand: 'Medium' },
  { name: 'DynamoDB', category: 'Database', difficulty: 'Intermediate', aliases: ['AWS DynamoDB'], prerequisites: ['AWS'], relatedSkills: ['MongoDB', 'Cassandra'], marketDemand: 'Medium' },
  { name: 'Cassandra', category: 'Database', difficulty: 'Advanced', aliases: ['Apache Cassandra'], prerequisites: ['SQL'], relatedSkills: ['DynamoDB', 'MongoDB'], marketDemand: 'Medium' },
  { name: 'Neo4j', category: 'Database', difficulty: 'Advanced', aliases: ['Graph Database', 'Cypher'], prerequisites: ['SQL'], relatedSkills: ['MongoDB', 'Elasticsearch'], marketDemand: 'Low' },
  { name: 'SQLite', category: 'Database', difficulty: 'Beginner', aliases: [], prerequisites: ['SQL'], relatedSkills: ['SQL', 'Prisma'], marketDemand: 'Low' },
  { name: 'MariaDB', category: 'Database', difficulty: 'Intermediate', aliases: [], prerequisites: ['SQL'], relatedSkills: ['SQL', 'CockroachDB'], marketDemand: 'Low' },
  { name: 'CockroachDB', category: 'Database', difficulty: 'Advanced', aliases: ['CRDB'], prerequisites: ['SQL'], relatedSkills: ['SQL', 'MariaDB'], marketDemand: 'Low' },
  { name: 'Prisma', category: 'Database', difficulty: 'Intermediate', aliases: ['Prisma ORM'], prerequisites: ['SQL', 'Node.js'], relatedSkills: ['Sequelize', 'TypeORM', 'Drizzle ORM'], marketDemand: 'High' },
  { name: 'Sequelize', category: 'Database', difficulty: 'Intermediate', aliases: [], prerequisites: ['SQL', 'Node.js'], relatedSkills: ['Prisma', 'TypeORM'], marketDemand: 'Medium' },
  { name: 'TypeORM', category: 'Database', difficulty: 'Intermediate', aliases: [], prerequisites: ['SQL', 'TypeScript'], relatedSkills: ['Prisma', 'Sequelize'], marketDemand: 'Medium' },
  { name: 'Drizzle ORM', category: 'Database', difficulty: 'Intermediate', aliases: ['Drizzle'], prerequisites: ['SQL', 'TypeScript'], relatedSkills: ['Prisma', 'TypeORM'], marketDemand: 'Medium' },
  { name: 'Supabase', category: 'Database', difficulty: 'Intermediate', aliases: [], prerequisites: ['SQL'], relatedSkills: ['Firebase', 'Prisma'], marketDemand: 'Medium' },
  { name: 'Firebase', category: 'Database', difficulty: 'Intermediate', aliases: ['Firestore', 'Firebase/Firestore'], prerequisites: ['JavaScript'], relatedSkills: ['Supabase', 'MongoDB'], marketDemand: 'High' },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEVOPS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Docker', category: 'DevOps', difficulty: 'Intermediate', aliases: ['Containers', 'Containerization'], prerequisites: ['Linux'], relatedSkills: ['Kubernetes', 'AWS'], marketDemand: 'High' },
  { name: 'Kubernetes', category: 'DevOps', difficulty: 'Advanced', aliases: ['K8s'], prerequisites: ['Docker'], relatedSkills: ['AWS', 'Helm', 'Istio'], marketDemand: 'High' },
  { name: 'CI/CD', category: 'DevOps', difficulty: 'Intermediate', aliases: ['CICD', 'Continuous Integration', 'Continuous Deployment'], prerequisites: ['Git'], relatedSkills: ['GitHub Actions', 'Jenkins', 'Docker'], marketDemand: 'High' },
  { name: 'Git', category: 'DevOps', difficulty: 'Beginner', aliases: ['GitHub', 'GitLab', 'Version Control', 'Bitbucket'], prerequisites: [], relatedSkills: ['CI/CD', 'GitHub Actions'], marketDemand: 'High' },
  { name: 'GitHub Actions', category: 'DevOps', difficulty: 'Intermediate', aliases: ['GHA'], prerequisites: ['Git'], relatedSkills: ['CI/CD', 'Jenkins', 'ArgoCD'], marketDemand: 'High' },
  { name: 'Terraform', category: 'DevOps', difficulty: 'Advanced', aliases: ['TF', 'HashiCorp Terraform'], prerequisites: ['AWS'], relatedSkills: ['Pulumi', 'CloudFormation', 'Ansible'], marketDemand: 'High' },
  { name: 'Ansible', category: 'DevOps', difficulty: 'Intermediate', aliases: [], prerequisites: ['Linux'], relatedSkills: ['Terraform', 'Vagrant'], marketDemand: 'Medium' },
  { name: 'Helm', category: 'DevOps', difficulty: 'Advanced', aliases: ['Helm Charts'], prerequisites: ['Kubernetes'], relatedSkills: ['ArgoCD', 'Istio'], marketDemand: 'Medium' },
  { name: 'Prometheus', category: 'DevOps', difficulty: 'Advanced', aliases: ['PromQL'], prerequisites: ['Kubernetes'], relatedSkills: ['Grafana', 'Datadog'], marketDemand: 'Medium' },
  { name: 'Grafana', category: 'DevOps', difficulty: 'Intermediate', aliases: [], prerequisites: ['Prometheus'], relatedSkills: ['Prometheus', 'Datadog'], marketDemand: 'Medium' },
  { name: 'Linux', category: 'DevOps', difficulty: 'Beginner', aliases: ['Ubuntu', 'Debian', 'CentOS', 'RHEL'], prerequisites: [], relatedSkills: ['Bash/Shell Scripting', 'Docker'], marketDemand: 'High' },
  { name: 'Bash/Shell Scripting', category: 'DevOps', difficulty: 'Intermediate', aliases: ['Bash', 'Shell', 'Shell Scripting', 'Zsh'], prerequisites: ['Linux'], relatedSkills: ['Linux', 'Git'], marketDemand: 'Medium' },
  { name: 'Jenkins', category: 'DevOps', difficulty: 'Intermediate', aliases: [], prerequisites: ['CI/CD'], relatedSkills: ['GitHub Actions', 'Docker'], marketDemand: 'Medium' },
  { name: 'ArgoCD', category: 'DevOps', difficulty: 'Advanced', aliases: ['Argo CD', 'GitOps'], prerequisites: ['Kubernetes', 'Helm'], relatedSkills: ['GitHub Actions', 'Helm'], marketDemand: 'Medium' },
  { name: 'Datadog', category: 'DevOps', difficulty: 'Intermediate', aliases: ['DD'], prerequisites: ['Docker'], relatedSkills: ['Prometheus', 'Grafana', 'New Relic'], marketDemand: 'Medium' },
  { name: 'New Relic', category: 'DevOps', difficulty: 'Intermediate', aliases: [], prerequisites: [], relatedSkills: ['Datadog', 'Prometheus'], marketDemand: 'Medium' },
  { name: 'CloudFormation', category: 'DevOps', difficulty: 'Advanced', aliases: ['AWS CloudFormation', 'CFN'], prerequisites: ['AWS'], relatedSkills: ['Terraform', 'Pulumi'], marketDemand: 'Medium' },
  { name: 'Pulumi', category: 'DevOps', difficulty: 'Advanced', aliases: [], prerequisites: ['TypeScript'], relatedSkills: ['Terraform', 'CloudFormation'], marketDemand: 'Medium' },
  { name: 'Vagrant', category: 'DevOps', difficulty: 'Intermediate', aliases: [], prerequisites: ['Linux'], relatedSkills: ['Docker', 'Ansible'], marketDemand: 'Low' },
  { name: 'Istio', category: 'DevOps', difficulty: 'Advanced', aliases: ['Service Mesh'], prerequisites: ['Kubernetes'], relatedSkills: ['Envoy', 'Helm'], marketDemand: 'Medium' },
  { name: 'Envoy', category: 'DevOps', difficulty: 'Advanced', aliases: ['Envoy Proxy'], prerequisites: ['Kubernetes'], relatedSkills: ['Istio', 'Nginx'], marketDemand: 'Low' },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLOUD
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'AWS', category: 'Cloud', difficulty: 'Advanced', aliases: ['Amazon Web Services'], prerequisites: ['Docker'], relatedSkills: ['Kubernetes', 'Terraform', 'AWS Lambda'], marketDemand: 'High' },
  { name: 'Google Cloud Platform', category: 'Cloud', difficulty: 'Advanced', aliases: ['GCP', 'Google Cloud'], prerequisites: ['Docker'], relatedSkills: ['AWS', 'Azure', 'BigQuery'], marketDemand: 'High' },
  { name: 'Azure', category: 'Cloud', difficulty: 'Advanced', aliases: ['Microsoft Azure', 'Azure DevOps'], prerequisites: ['Docker'], relatedSkills: ['AWS', 'Google Cloud Platform'], marketDemand: 'High' },
  { name: 'DigitalOcean', category: 'Cloud', difficulty: 'Intermediate', aliases: ['DO'], prerequisites: ['Linux'], relatedSkills: ['AWS', 'Heroku'], marketDemand: 'Medium' },
  { name: 'Heroku', category: 'Cloud', difficulty: 'Beginner', aliases: [], prerequisites: ['Git'], relatedSkills: ['DigitalOcean', 'Vercel'], marketDemand: 'Low' },
  { name: 'Vercel', category: 'Cloud', difficulty: 'Beginner', aliases: [], prerequisites: ['Next.js'], relatedSkills: ['Netlify', 'Heroku'], marketDemand: 'Medium' },
  { name: 'Netlify', category: 'Cloud', difficulty: 'Beginner', aliases: [], prerequisites: ['Git'], relatedSkills: ['Vercel', 'Heroku'], marketDemand: 'Medium' },
  { name: 'Cloudflare Workers', category: 'Cloud', difficulty: 'Intermediate', aliases: ['Cloudflare', 'CF Workers'], prerequisites: ['JavaScript'], relatedSkills: ['Vercel', 'Netlify', 'AWS Lambda'], marketDemand: 'Medium' },
  { name: 'AWS Lambda', category: 'Cloud', difficulty: 'Intermediate', aliases: ['Lambda', 'Serverless'], prerequisites: ['AWS'], relatedSkills: ['Cloudflare Workers', 'S3'], marketDemand: 'High' },
  { name: 'S3', category: 'Cloud', difficulty: 'Beginner', aliases: ['AWS S3', 'Amazon S3'], prerequisites: ['AWS'], relatedSkills: ['EC2', 'AWS Lambda'], marketDemand: 'Medium' },
  { name: 'EC2', category: 'Cloud', difficulty: 'Intermediate', aliases: ['AWS EC2', 'Amazon EC2'], prerequisites: ['AWS', 'Linux'], relatedSkills: ['S3', 'ECS'], marketDemand: 'Medium' },
  { name: 'ECS', category: 'Cloud', difficulty: 'Intermediate', aliases: ['AWS ECS', 'Elastic Container Service'], prerequisites: ['AWS', 'Docker'], relatedSkills: ['EKS', 'EC2'], marketDemand: 'Medium' },
  { name: 'EKS', category: 'Cloud', difficulty: 'Advanced', aliases: ['AWS EKS', 'Elastic Kubernetes Service'], prerequisites: ['AWS', 'Kubernetes'], relatedSkills: ['ECS', 'Helm'], marketDemand: 'Medium' },

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA / AI / ML
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Python', category: 'Data/AI', difficulty: 'Beginner', aliases: ['Python3'], prerequisites: [], relatedSkills: ['Pandas', 'TensorFlow', 'Scikit-learn'], marketDemand: 'High' },
  { name: 'Pandas', category: 'Data/AI', difficulty: 'Intermediate', aliases: [], prerequisites: ['Python'], relatedSkills: ['NumPy', 'Data Science'], marketDemand: 'Medium' },
  { name: 'NumPy', category: 'Data/AI', difficulty: 'Intermediate', aliases: [], prerequisites: ['Python'], relatedSkills: ['Pandas', 'Scikit-learn'], marketDemand: 'Medium' },
  { name: 'Scikit-learn', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['sklearn'], prerequisites: ['Python', 'NumPy'], relatedSkills: ['TensorFlow', 'XGBoost'], marketDemand: 'Medium' },
  { name: 'TensorFlow', category: 'Data/AI', difficulty: 'Advanced', aliases: ['TF'], prerequisites: ['Python', 'NumPy'], relatedSkills: ['Keras', 'PyTorch', 'Deep Learning'], marketDemand: 'High' },
  { name: 'Keras', category: 'Data/AI', difficulty: 'Intermediate', aliases: [], prerequisites: ['Python', 'TensorFlow'], relatedSkills: ['TensorFlow', 'PyTorch'], marketDemand: 'Medium' },
  { name: 'Data Science', category: 'Data/AI', difficulty: 'Advanced', aliases: [], prerequisites: ['Python', 'SQL'], relatedSkills: ['Pandas', 'TensorFlow', 'Machine Learning'], marketDemand: 'High' },
  { name: 'Machine Learning', category: 'Data/AI', difficulty: 'Advanced', aliases: ['ML'], prerequisites: ['Python', 'NumPy'], relatedSkills: ['Scikit-learn', 'Deep Learning', 'XGBoost'], marketDemand: 'High' },
  { name: 'Deep Learning', category: 'Data/AI', difficulty: 'Advanced', aliases: ['DL'], prerequisites: ['Machine Learning'], relatedSkills: ['TensorFlow', 'PyTorch', 'Computer Vision'], marketDemand: 'High' },
  { name: 'PyTorch', category: 'Data/AI', difficulty: 'Advanced', aliases: [], prerequisites: ['Python', 'Deep Learning'], relatedSkills: ['TensorFlow', 'Computer Vision', 'Keras'], marketDemand: 'High' },
  { name: 'Natural Language Processing', category: 'Data/AI', difficulty: 'Advanced', aliases: ['NLP'], prerequisites: ['Machine Learning'], relatedSkills: ['Large Language Models', 'Hugging Face Transformers'], marketDemand: 'High' },
  { name: 'Computer Vision', category: 'Data/AI', difficulty: 'Advanced', aliases: ['CV'], prerequisites: ['Deep Learning'], relatedSkills: ['PyTorch', 'OpenCV', 'YOLO'], marketDemand: 'Medium' },
  { name: 'Large Language Models', category: 'Data/AI', difficulty: 'Advanced', aliases: ['LLMs', 'LLM'], prerequisites: ['Natural Language Processing'], relatedSkills: ['Prompt Engineering', 'LangChain', 'Retrieval-Augmented Generation', 'GPT'], marketDemand: 'High' },
  { name: 'Prompt Engineering', category: 'Data/AI', difficulty: 'Intermediate', aliases: [], prerequisites: [], relatedSkills: ['Large Language Models', 'GPT', 'Claude API'], marketDemand: 'High' },
  { name: 'Hugging Face Transformers', category: 'Data/AI', difficulty: 'Advanced', aliases: ['Transformers', 'HuggingFace'], prerequisites: ['Python', 'Deep Learning'], relatedSkills: ['Natural Language Processing', 'Fine-tuning'], marketDemand: 'High' },
  { name: 'LangChain', category: 'Data/AI', difficulty: 'Advanced', aliases: [], prerequisites: ['Large Language Models'], relatedSkills: ['Retrieval-Augmented Generation', 'Vector Databases'], marketDemand: 'Medium' },
  { name: 'Retrieval-Augmented Generation', category: 'Data/AI', difficulty: 'Advanced', aliases: ['RAG'], prerequisites: ['Large Language Models'], relatedSkills: ['Vector Databases', 'LangChain', 'Embeddings'], marketDemand: 'High' },
  { name: 'Vector Databases', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['Pinecone', 'FAISS', 'Chroma', 'Weaviate'], prerequisites: [], relatedSkills: ['Retrieval-Augmented Generation', 'Embeddings'], marketDemand: 'Medium' },
  { name: 'MLOps', category: 'Data/AI', difficulty: 'Advanced', aliases: [], prerequisites: ['Machine Learning', 'Docker'], relatedSkills: ['CI/CD', 'Weights & Biases', 'MLflow'], marketDemand: 'High' },
  { name: 'Generative AI', category: 'Data/AI', difficulty: 'Advanced', aliases: ['GenAI'], prerequisites: ['Deep Learning'], relatedSkills: ['Large Language Models', 'Stable Diffusion', 'DALL-E'], marketDemand: 'High' },
  { name: 'OpenAI API', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['OpenAI'], prerequisites: ['Python'], relatedSkills: ['GPT', 'Large Language Models', 'Claude API'], marketDemand: 'High' },
  { name: 'Stable Diffusion', category: 'Data/AI', difficulty: 'Advanced', aliases: ['SD', 'Diffusion Models'], prerequisites: ['Deep Learning'], relatedSkills: ['DALL-E', 'Generative AI', 'Computer Vision'], marketDemand: 'Medium' },
  { name: 'DALL-E', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['DALLE'], prerequisites: ['OpenAI API'], relatedSkills: ['Stable Diffusion', 'Generative AI'], marketDemand: 'Medium' },
  { name: 'GPT', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['GPT-4', 'GPT-3', 'ChatGPT API'], prerequisites: ['OpenAI API'], relatedSkills: ['Large Language Models', 'Prompt Engineering'], marketDemand: 'High' },
  { name: 'Claude API', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['Anthropic API', 'Claude'], prerequisites: ['Python'], relatedSkills: ['OpenAI API', 'Prompt Engineering'], marketDemand: 'Medium' },
  { name: 'Embeddings', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['Word Embeddings', 'Text Embeddings'], prerequisites: ['Natural Language Processing'], relatedSkills: ['Vector Databases', 'Retrieval-Augmented Generation'], marketDemand: 'Medium' },
  { name: 'Fine-tuning', category: 'Data/AI', difficulty: 'Advanced', aliases: ['Model Fine-tuning', 'Transfer Learning'], prerequisites: ['Deep Learning'], relatedSkills: ['Hugging Face Transformers', 'Large Language Models'], marketDemand: 'Medium' },
  { name: 'ONNX', category: 'Data/AI', difficulty: 'Advanced', aliases: ['ONNX Runtime'], prerequisites: ['Deep Learning'], relatedSkills: ['Model Optimization', 'TensorFlow'], marketDemand: 'Low' },
  { name: 'Model Optimization', category: 'Data/AI', difficulty: 'Advanced', aliases: ['Quantization', 'Pruning', 'Model Compression'], prerequisites: ['Deep Learning'], relatedSkills: ['ONNX', 'MLOps'], marketDemand: 'Medium' },
  { name: 'Reinforcement Learning', category: 'Data/AI', difficulty: 'Advanced', aliases: ['RL'], prerequisites: ['Machine Learning'], relatedSkills: ['Deep Learning', 'PyTorch'], marketDemand: 'Medium' },
  { name: 'Bayesian Methods', category: 'Data/AI', difficulty: 'Advanced', aliases: ['Bayesian Statistics', 'Bayesian Inference'], prerequisites: ['Machine Learning'], relatedSkills: ['Scikit-learn', 'Data Science'], marketDemand: 'Low' },
  { name: 'XGBoost', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['Extreme Gradient Boosting'], prerequisites: ['Machine Learning'], relatedSkills: ['LightGBM', 'CatBoost', 'Scikit-learn'], marketDemand: 'Medium' },
  { name: 'LightGBM', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['LGBM'], prerequisites: ['Machine Learning'], relatedSkills: ['XGBoost', 'CatBoost'], marketDemand: 'Medium' },
  { name: 'CatBoost', category: 'Data/AI', difficulty: 'Intermediate', aliases: [], prerequisites: ['Machine Learning'], relatedSkills: ['XGBoost', 'LightGBM'], marketDemand: 'Low' },
  { name: 'OpenCV', category: 'Data/AI', difficulty: 'Advanced', aliases: ['CV2'], prerequisites: ['Python', 'Computer Vision'], relatedSkills: ['YOLO', 'Deep Learning'], marketDemand: 'Medium' },
  { name: 'YOLO', category: 'Data/AI', difficulty: 'Advanced', aliases: ['YOLOv5', 'YOLOv8', 'Ultralytics'], prerequisites: ['Computer Vision'], relatedSkills: ['OpenCV', 'PyTorch'], marketDemand: 'Medium' },
  { name: 'Weights & Biases', category: 'Data/AI', difficulty: 'Intermediate', aliases: ['W&B', 'WandB', 'Weights and Biases'], prerequisites: ['Machine Learning'], relatedSkills: ['MLflow', 'MLOps'], marketDemand: 'Medium' },
  { name: 'MLflow', category: 'Data/AI', difficulty: 'Intermediate', aliases: [], prerequisites: ['Machine Learning'], relatedSkills: ['Weights & Biases', 'MLOps'], marketDemand: 'Medium' },

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA ENGINEERING
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Apache Spark', category: 'Data Engineering', difficulty: 'Advanced', aliases: ['Spark', 'PySpark'], prerequisites: ['Python', 'SQL'], relatedSkills: ['Hadoop', 'Airflow', 'Data Warehousing'], marketDemand: 'High' },
  { name: 'Airflow', category: 'Data Engineering', difficulty: 'Advanced', aliases: ['Apache Airflow'], prerequisites: ['Python'], relatedSkills: ['Apache Spark', 'ETL Pipelines', 'dbt'], marketDemand: 'High' },
  { name: 'dbt', category: 'Data Engineering', difficulty: 'Intermediate', aliases: ['dbt Core', 'dbt Cloud', 'data build tool'], prerequisites: ['SQL'], relatedSkills: ['Snowflake', 'BigQuery', 'Data Warehousing'], marketDemand: 'High' },
  { name: 'Snowflake', category: 'Data Engineering', difficulty: 'Intermediate', aliases: [], prerequisites: ['SQL'], relatedSkills: ['BigQuery', 'Redshift', 'dbt'], marketDemand: 'High' },
  { name: 'BigQuery', category: 'Data Engineering', difficulty: 'Intermediate', aliases: ['Google BigQuery', 'BQ'], prerequisites: ['SQL', 'Google Cloud Platform'], relatedSkills: ['Snowflake', 'Redshift', 'dbt'], marketDemand: 'High' },
  { name: 'Redshift', category: 'Data Engineering', difficulty: 'Intermediate', aliases: ['AWS Redshift', 'Amazon Redshift'], prerequisites: ['SQL', 'AWS'], relatedSkills: ['Snowflake', 'BigQuery'], marketDemand: 'Medium' },
  { name: 'Data Warehousing', category: 'Data Engineering', difficulty: 'Advanced', aliases: ['DWH', 'Data Warehouse'], prerequisites: ['SQL'], relatedSkills: ['Snowflake', 'BigQuery', 'ETL Pipelines'], marketDemand: 'High' },
  { name: 'ETL Pipelines', category: 'Data Engineering', difficulty: 'Intermediate', aliases: ['ETL', 'ELT', 'Data Pipelines'], prerequisites: ['SQL', 'Python'], relatedSkills: ['Airflow', 'Apache Spark', 'Data Warehousing'], marketDemand: 'High' },
  { name: 'Hadoop', category: 'Data Engineering', difficulty: 'Advanced', aliases: ['Apache Hadoop', 'HDFS', 'MapReduce'], prerequisites: ['Linux'], relatedSkills: ['Apache Spark', 'Hive'], marketDemand: 'Medium' },
  { name: 'Hive', category: 'Data Engineering', difficulty: 'Advanced', aliases: ['Apache Hive', 'HiveQL'], prerequisites: ['SQL', 'Hadoop'], relatedSkills: ['Hadoop', 'Apache Spark'], marketDemand: 'Medium' },

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTING
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Jest', category: 'Testing', difficulty: 'Intermediate', aliases: [], prerequisites: ['JavaScript'], relatedSkills: ['React Testing Library', 'Vitest'], marketDemand: 'Medium' },
  { name: 'Cypress', category: 'Testing', difficulty: 'Intermediate', aliases: [], prerequisites: ['JavaScript'], relatedSkills: ['Playwright', 'Selenium'], marketDemand: 'Medium' },
  { name: 'Selenium', category: 'Testing', difficulty: 'Intermediate', aliases: ['Selenium WebDriver'], prerequisites: ['JavaScript'], relatedSkills: ['Cypress', 'Playwright'], marketDemand: 'Medium' },
  { name: 'Playwright', category: 'Testing', difficulty: 'Intermediate', aliases: [], prerequisites: ['JavaScript'], relatedSkills: ['Cypress', 'Selenium'], marketDemand: 'Medium' },
  { name: 'Mocha', category: 'Testing', difficulty: 'Intermediate', aliases: [], prerequisites: ['JavaScript'], relatedSkills: ['Chai', 'Jest'], marketDemand: 'Low' },
  { name: 'Chai', category: 'Testing', difficulty: 'Intermediate', aliases: [], prerequisites: ['JavaScript'], relatedSkills: ['Mocha'], marketDemand: 'Low' },
  { name: 'Pytest', category: 'Testing', difficulty: 'Intermediate', aliases: ['py.test'], prerequisites: ['Python'], relatedSkills: ['Jest'], marketDemand: 'Medium' },
  { name: 'Vitest', category: 'Testing', difficulty: 'Intermediate', aliases: [], prerequisites: ['JavaScript', 'Vite'], relatedSkills: ['Jest', 'React Testing Library'], marketDemand: 'Medium' },
  { name: 'React Testing Library', category: 'Testing', difficulty: 'Intermediate', aliases: ['RTL', 'Testing Library'], prerequisites: ['React', 'Jest'], relatedSkills: ['Jest', 'Vitest'], marketDemand: 'Medium' },
  { name: 'Postman', category: 'Testing', difficulty: 'Beginner', aliases: ['Insomnia'], prerequisites: ['REST APIs'], relatedSkills: ['API Design'], marketDemand: 'Medium' },
  { name: 'k6', category: 'Testing', difficulty: 'Intermediate', aliases: ['Grafana k6'], prerequisites: ['JavaScript'], relatedSkills: ['Artillery', 'Postman'], marketDemand: 'Low' },
  { name: 'Artillery', category: 'Testing', difficulty: 'Intermediate', aliases: [], prerequisites: ['JavaScript'], relatedSkills: ['k6', 'Postman'], marketDemand: 'Low' },
  { name: 'JUnit', category: 'Testing', difficulty: 'Intermediate', aliases: ['JUnit5'], prerequisites: ['Java'], relatedSkills: ['Spring Boot', 'Jest'], marketDemand: 'Medium' },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOBILE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'React Native', category: 'Mobile', difficulty: 'Intermediate', aliases: ['RN'], prerequisites: ['React'], relatedSkills: ['Expo', 'TypeScript', 'Flutter'], marketDemand: 'High' },
  { name: 'Flutter', category: 'Mobile', difficulty: 'Intermediate', aliases: [], prerequisites: ['Dart'], relatedSkills: ['React Native', 'Dart'], marketDemand: 'High' },
  { name: 'Dart', category: 'Mobile', difficulty: 'Beginner', aliases: [], prerequisites: [], relatedSkills: ['Flutter'], marketDemand: 'Low' },
  { name: 'Swift', category: 'Mobile', difficulty: 'Intermediate', aliases: ['SwiftUI'], prerequisites: [], relatedSkills: ['Xcode', 'Kotlin'], marketDemand: 'Medium' },
  { name: 'Kotlin', category: 'Mobile', difficulty: 'Intermediate', aliases: ['Kotlin/Android'], prerequisites: ['Java'], relatedSkills: ['Android Studio', 'Swift'], marketDemand: 'Medium' },
  { name: 'Xcode', category: 'Mobile', difficulty: 'Intermediate', aliases: [], prerequisites: ['Swift'], relatedSkills: ['Swift', 'React Native'], marketDemand: 'Low' },
  { name: 'Android Studio', category: 'Mobile', difficulty: 'Intermediate', aliases: [], prerequisites: ['Kotlin'], relatedSkills: ['Kotlin', 'Flutter'], marketDemand: 'Low' },
  { name: 'Expo', category: 'Mobile', difficulty: 'Intermediate', aliases: ['Expo SDK'], prerequisites: ['React Native'], relatedSkills: ['React Native', 'Capacitor'], marketDemand: 'Medium' },
  { name: 'Capacitor', category: 'Mobile', difficulty: 'Intermediate', aliases: ['Capacitor.js'], prerequisites: ['JavaScript'], relatedSkills: ['Ionic', 'Expo'], marketDemand: 'Low' },
  { name: 'Ionic', category: 'Mobile', difficulty: 'Intermediate', aliases: ['Ionic Framework'], prerequisites: ['JavaScript', 'Angular'], relatedSkills: ['Capacitor', 'React Native'], marketDemand: 'Low' },

  // ═══════════════════════════════════════════════════════════════════════════
  // DESIGN
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Figma', category: 'Design', difficulty: 'Beginner', aliases: [], prerequisites: [], relatedSkills: ['UI/UX Design', 'Adobe XD', 'Wireframing'], marketDemand: 'High' },
  { name: 'Adobe XD', category: 'Design', difficulty: 'Beginner', aliases: ['XD'], prerequisites: [], relatedSkills: ['Figma', 'Sketch'], marketDemand: 'Medium' },
  { name: 'Sketch', category: 'Design', difficulty: 'Beginner', aliases: [], prerequisites: [], relatedSkills: ['Figma', 'Adobe XD'], marketDemand: 'Low' },
  { name: 'UI/UX Design', category: 'Design', difficulty: 'Intermediate', aliases: ['UI Design', 'UX Design', 'User Experience', 'User Interface'], prerequisites: ['Figma'], relatedSkills: ['Wireframing', 'Design Systems', 'Web Accessibility'], marketDemand: 'High' },
  { name: 'Wireframing', category: 'Design', difficulty: 'Beginner', aliases: ['Wireframes', 'Prototyping'], prerequisites: ['Figma'], relatedSkills: ['UI/UX Design', 'Design Systems'], marketDemand: 'Medium' },
  { name: 'Design Systems', category: 'Design', difficulty: 'Intermediate', aliases: ['Component Libraries'], prerequisites: ['Figma', 'CSS'], relatedSkills: ['UI/UX Design', 'Storybook', 'Material UI'], marketDemand: 'Medium' },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'OAuth', category: 'Security', difficulty: 'Intermediate', aliases: ['OAuth 2.0', 'OAuth2'], prerequisites: ['REST APIs'], relatedSkills: ['JWT', 'Identity Access Management'], marketDemand: 'High' },
  { name: 'JWT', category: 'Security', difficulty: 'Intermediate', aliases: ['JSON Web Tokens', 'JSON Web Token'], prerequisites: ['REST APIs'], relatedSkills: ['OAuth', 'API Security'], marketDemand: 'High' },
  { name: 'OWASP', category: 'Security', difficulty: 'Intermediate', aliases: ['OWASP Top 10'], prerequisites: [], relatedSkills: ['Penetration Testing', 'API Security'], marketDemand: 'Medium' },
  { name: 'Penetration Testing', category: 'Security', difficulty: 'Advanced', aliases: ['Pen Testing', 'PenTest', 'Ethical Hacking'], prerequisites: ['OWASP', 'Linux'], relatedSkills: ['OWASP', 'SSL/TLS'], marketDemand: 'Medium' },
  { name: 'SSL/TLS', category: 'Security', difficulty: 'Intermediate', aliases: ['SSL', 'TLS', 'HTTPS'], prerequisites: [], relatedSkills: ['CORS', 'API Security'], marketDemand: 'Medium' },
  { name: 'CORS', category: 'Security', difficulty: 'Beginner', aliases: ['Cross-Origin Resource Sharing'], prerequisites: ['REST APIs'], relatedSkills: ['CSRF', 'SSL/TLS'], marketDemand: 'Medium' },
  { name: 'CSRF', category: 'Security', difficulty: 'Intermediate', aliases: ['Cross-Site Request Forgery', 'XSRF'], prerequisites: ['REST APIs'], relatedSkills: ['CORS', 'OWASP'], marketDemand: 'Medium' },
  { name: 'API Security', category: 'Security', difficulty: 'Intermediate', aliases: [], prerequisites: ['REST APIs'], relatedSkills: ['OAuth', 'JWT', 'OWASP'], marketDemand: 'High' },
  { name: 'Identity Access Management', category: 'Security', difficulty: 'Advanced', aliases: ['IAM', 'RBAC', 'Access Control'], prerequisites: ['OAuth'], relatedSkills: ['JWT', 'API Security'], marketDemand: 'High' },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOFTWARE ENGINEERING
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'Agile/Scrum', category: 'Software Engineering', difficulty: 'Beginner', aliases: ['Agile', 'Scrum', 'Kanban', 'Agile Methodology'], prerequisites: [], relatedSkills: ['Jira', 'Technical Writing'], marketDemand: 'High' },
  { name: 'Jira', category: 'Software Engineering', difficulty: 'Beginner', aliases: ['Atlassian Jira'], prerequisites: [], relatedSkills: ['Agile/Scrum', 'Confluence'], marketDemand: 'Medium' },
  { name: 'Confluence', category: 'Software Engineering', difficulty: 'Beginner', aliases: ['Atlassian Confluence'], prerequisites: [], relatedSkills: ['Jira', 'Technical Writing'], marketDemand: 'Low' },
  { name: 'Technical Writing', category: 'Software Engineering', difficulty: 'Intermediate', aliases: ['Tech Writing', 'Documentation'], prerequisites: [], relatedSkills: ['Agile/Scrum', 'Confluence'], marketDemand: 'Medium' },
  { name: 'Data Structures & Algorithms', category: 'Software Engineering', difficulty: 'Intermediate', aliases: ['DSA', 'Algorithms', 'Data Structures'], prerequisites: ['JavaScript'], relatedSkills: ['System Design', 'Design Patterns'], marketDemand: 'High' },
  { name: 'Design Patterns', category: 'Software Engineering', difficulty: 'Intermediate', aliases: ['GoF Patterns', 'Software Design Patterns'], prerequisites: ['JavaScript'], relatedSkills: ['Clean Architecture', 'Data Structures & Algorithms'], marketDemand: 'Medium' },
  { name: 'Clean Architecture', category: 'Software Engineering', difficulty: 'Advanced', aliases: ['Hexagonal Architecture', 'Onion Architecture'], prerequisites: ['Design Patterns'], relatedSkills: ['Domain-Driven Design', 'System Design'], marketDemand: 'Medium' },
  { name: 'Domain-Driven Design', category: 'Software Engineering', difficulty: 'Advanced', aliases: ['DDD'], prerequisites: ['Design Patterns'], relatedSkills: ['Clean Architecture', 'Event-Driven Architecture', 'Microservices'], marketDemand: 'Medium' },
  { name: 'Event-Driven Architecture', category: 'Software Engineering', difficulty: 'Advanced', aliases: ['EDA'], prerequisites: ['Microservices'], relatedSkills: ['Apache Kafka', 'Domain-Driven Design', 'CQRS'], marketDemand: 'Medium' },
  { name: 'CQRS', category: 'Software Engineering', difficulty: 'Advanced', aliases: ['Command Query Responsibility Segregation'], prerequisites: ['Domain-Driven Design'], relatedSkills: ['Event-Driven Architecture', 'Microservices'], marketDemand: 'Low' },
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
    { skill: 'SQL', requiredLevel: 70, priority: 'Medium' },
    { skill: 'REST APIs', requiredLevel: 80, priority: 'Medium' },
    { skill: 'TypeScript', requiredLevel: 75, priority: 'High' },
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
    { skill: 'Web Accessibility', requiredLevel: 65, priority: 'Medium' },
    { skill: 'Responsive Design', requiredLevel: 75, priority: 'Medium' },
    { skill: 'Jest', requiredLevel: 60, priority: 'Medium' },
  ],
  'Backend Developer': [
    { skill: 'JavaScript', requiredLevel: 80, priority: 'High' },
    { skill: 'Node.js', requiredLevel: 90, priority: 'Critical' },
    { skill: 'Express', requiredLevel: 85, priority: 'High' },
    { skill: 'MongoDB', requiredLevel: 80, priority: 'High' },
    { skill: 'SQL', requiredLevel: 75, priority: 'High' },
    { skill: 'REST APIs', requiredLevel: 85, priority: 'High' },
    { skill: 'Docker', requiredLevel: 65, priority: 'Medium' },
    { skill: 'Redis', requiredLevel: 60, priority: 'Medium' },
    { skill: 'System Design', requiredLevel: 65, priority: 'Medium' },
  ],
  'Data Scientist': [
    { skill: 'Python', requiredLevel: 90, priority: 'Critical' },
    { skill: 'Pandas', requiredLevel: 85, priority: 'High' },
    { skill: 'NumPy', requiredLevel: 80, priority: 'High' },
    { skill: 'SQL', requiredLevel: 75, priority: 'High' },
    { skill: 'Scikit-learn', requiredLevel: 75, priority: 'High' },
    { skill: 'TensorFlow', requiredLevel: 65, priority: 'Medium' },
    { skill: 'Data Science', requiredLevel: 80, priority: 'Critical' },
    { skill: 'Machine Learning', requiredLevel: 75, priority: 'High' },
  ],
  'DevOps Engineer': [
    { skill: 'Docker', requiredLevel: 90, priority: 'Critical' },
    { skill: 'Kubernetes', requiredLevel: 80, priority: 'Critical' },
    { skill: 'AWS', requiredLevel: 85, priority: 'Critical' },
    { skill: 'CI/CD', requiredLevel: 85, priority: 'High' },
    { skill: 'Git', requiredLevel: 80, priority: 'Medium' },
    { skill: 'Terraform', requiredLevel: 75, priority: 'High' },
    { skill: 'Linux', requiredLevel: 85, priority: 'Critical' },
    { skill: 'Bash/Shell Scripting', requiredLevel: 70, priority: 'Medium' },
    { skill: 'Prometheus', requiredLevel: 60, priority: 'Medium' },
    { skill: 'Helm', requiredLevel: 60, priority: 'Medium' },
  ],
  'Mobile Developer': [
    { skill: 'React Native', requiredLevel: 85, priority: 'Critical' },
    { skill: 'TypeScript', requiredLevel: 75, priority: 'High' },
    { skill: 'React', requiredLevel: 80, priority: 'High' },
    { skill: 'Expo', requiredLevel: 65, priority: 'Medium' },
    { skill: 'REST APIs', requiredLevel: 70, priority: 'Medium' },
    { skill: 'Git', requiredLevel: 70, priority: 'Medium' },
    { skill: 'Firebase', requiredLevel: 60, priority: 'Medium' },
  ],
  'Data Engineer': [
    { skill: 'Python', requiredLevel: 85, priority: 'Critical' },
    { skill: 'SQL', requiredLevel: 90, priority: 'Critical' },
    { skill: 'Apache Spark', requiredLevel: 80, priority: 'High' },
    { skill: 'Airflow', requiredLevel: 75, priority: 'High' },
    { skill: 'dbt', requiredLevel: 70, priority: 'Medium' },
    { skill: 'Snowflake', requiredLevel: 70, priority: 'Medium' },
    { skill: 'ETL Pipelines', requiredLevel: 80, priority: 'High' },
    { skill: 'Data Warehousing', requiredLevel: 75, priority: 'High' },
    { skill: 'Docker', requiredLevel: 60, priority: 'Medium' },
  ],
  'Security Engineer': [
    { skill: 'OWASP', requiredLevel: 85, priority: 'Critical' },
    { skill: 'Penetration Testing', requiredLevel: 75, priority: 'High' },
    { skill: 'OAuth', requiredLevel: 80, priority: 'High' },
    { skill: 'JWT', requiredLevel: 80, priority: 'High' },
    { skill: 'API Security', requiredLevel: 80, priority: 'High' },
    { skill: 'SSL/TLS', requiredLevel: 75, priority: 'Medium' },
    { skill: 'Identity Access Management', requiredLevel: 70, priority: 'High' },
    { skill: 'Linux', requiredLevel: 70, priority: 'Medium' },
  ],
  'UI/UX Designer': [
    { skill: 'Figma', requiredLevel: 90, priority: 'Critical' },
    { skill: 'UI/UX Design', requiredLevel: 90, priority: 'Critical' },
    { skill: 'Wireframing', requiredLevel: 85, priority: 'High' },
    { skill: 'Design Systems', requiredLevel: 75, priority: 'High' },
    { skill: 'Web Accessibility', requiredLevel: 65, priority: 'Medium' },
    { skill: 'Responsive Design', requiredLevel: 70, priority: 'Medium' },
  ],
};

// A couple of extra role targets that make use of the AI/ML skills.
roleRequirements['Machine Learning Engineer'] = [
  { skill: 'Python', requiredLevel: 90, priority: 'Critical' },
  { skill: 'Machine Learning', requiredLevel: 85, priority: 'Critical' },
  { skill: 'Deep Learning', requiredLevel: 80, priority: 'High' },
  { skill: 'PyTorch', requiredLevel: 70, priority: 'High' },
  { skill: 'TensorFlow', requiredLevel: 65, priority: 'Medium' },
  { skill: 'MLOps', requiredLevel: 60, priority: 'Medium' },
  { skill: 'SQL', requiredLevel: 65, priority: 'Medium' },
  { skill: 'Docker', requiredLevel: 60, priority: 'Medium' },
];
roleRequirements['AI/LLM Engineer'] = [
  { skill: 'Python', requiredLevel: 85, priority: 'Critical' },
  { skill: 'Large Language Models', requiredLevel: 85, priority: 'Critical' },
  { skill: 'Prompt Engineering', requiredLevel: 80, priority: 'High' },
  { skill: 'LangChain', requiredLevel: 65, priority: 'Medium' },
  { skill: 'Retrieval-Augmented Generation', requiredLevel: 65, priority: 'High' },
  { skill: 'Vector Databases', requiredLevel: 60, priority: 'Medium' },
  { skill: 'OpenAI API', requiredLevel: 70, priority: 'High' },
  { skill: 'Fine-tuning', requiredLevel: 60, priority: 'Medium' },
];
roleRequirements['Cloud Architect'] = [
  { skill: 'AWS', requiredLevel: 90, priority: 'Critical' },
  { skill: 'Docker', requiredLevel: 85, priority: 'Critical' },
  { skill: 'Kubernetes', requiredLevel: 80, priority: 'High' },
  { skill: 'Terraform', requiredLevel: 80, priority: 'High' },
  { skill: 'System Design', requiredLevel: 85, priority: 'Critical' },
  { skill: 'Microservices', requiredLevel: 75, priority: 'High' },
  { skill: 'CI/CD', requiredLevel: 70, priority: 'Medium' },
  { skill: 'Linux', requiredLevel: 75, priority: 'Medium' },
];

module.exports = { skillsTaxonomy, roleRequirements, extendedSkillVocabulary };
