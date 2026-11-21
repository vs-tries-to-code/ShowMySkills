import swaggerJSDoc from 'swagger-jsdoc';

const port = process.env.PORT || 5000;
const localBaseUrl = `http://localhost:${port}`;

// Ensure server URLs do not contain a trailing /api since route annotations specify /api/*
const envApiUrl = process.env.API_BASE_URL || '';
const cleanEnvUrl = envApiUrl.replace(/\/api\/?$/, '');

const servers = [
  {
    url: '/',
    description: 'Current Origin / Reverse Proxy (Default)',
  },
  {
    url: cleanEnvUrl || localBaseUrl,
    description: 'Local Development Server',
  },
  {
    url: 'https://showmyskills.xyphx.com',
    description: 'Production Server',
  },
];

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShowMySkills Platform REST API',
      version: '1.0.0',
      description: `
### ShowMySkills — Student Skills Verification & Internship Marketplace API

An open-source, production-grade Express REST API powering the ShowMySkills platform.
Features role-based access control (Student, Company, College, Admin), ATS job applications, skill benchmark challenge assessments, real-time messaging, and multi-tier security.

---

### Core Highlights:
- **Authentication**: JWT Bearer tokens with 6-digit OTP verification & password recovery
- **Candidate ATS Pipeline**: Complete workflow from application submission to interview & hiring
- **Launchpad**: Curated top-tier opportunities with click telemetry
- **Multi-Layer Defense**: Rate limiting, NoSQL injection stripping, XSS protection, and HPP defense
- **Swagger UI**: Interactive playground with live test calls and token persistence
      `,
      contact: {
        name: 'ShowMySkills Engineering Team',
        url: 'https://showmyskills.xyphx.com',
        email: 'support@showmyskills.xyphx.com',
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers,
    tags: [
      {
        name: 'Authentication',
        description: 'Account registration, JWT credential login, email OTP verification, and password recovery.',
      },
      {
        name: 'Users & Directory',
        description: 'Candidate talent discovery, student directory search, public profiles, and account settings.',
      },
      {
        name: 'Internships',
        description: 'Internship discovery feed, location/mode filtering, and recruiter posting management.',
      },
      {
        name: 'Internship Actions',
        description: 'Candidate feed swipe gestures and decision actions (accept, reject, save, unsave).',
      },
      {
        name: 'Applications & ATS',
        description: 'Candidate internship applications and recruiter applicant tracking pipeline management.',
      },
      {
        name: 'Launchpad',
        description: 'Curated top-tech opportunities and programs with redirect tracking telemetry.',
      },
      {
        name: 'Skill Assessments',
        description: 'Technical competency challenge assessments, automated question evaluation, and verified badge issuance.',
      },
      {
        name: 'Chats & Messaging',
        description: 'Direct 1-on-1 messaging between candidates, recruiters, and platform peers.',
      },
      {
        name: 'Bookmarks & Saved Items',
        description: 'Saved internship bookmarks and recruiter starred candidate profiles.',
      },
      {
        name: 'Verification',
        description: 'Student college ID card, degree, and enrollment document verification requests.',
      },
      {
        name: 'Admin Portal',
        description: 'Platform executive KPIs, student role tags (Maintainer, Ambassador), internship moderation, and analytics.',
      },
      {
        name: 'Admin Application',
        description: 'Multi-step email OTP verification and credential application workflow for authorized admin access.',
      },
      {
        name: 'File Uploads',
        description: 'Secure file upload endpoints for profile avatars, resumes, certificates, and logos.',
      },
      {
        name: 'Support & FAQ',
        description: 'Helpdesk support ticket submissions and searchable platform knowledge base FAQs.',
      },
      {
        name: 'Monitoring',
        description: 'Real-time telemetry, memory usage, RPS metrics, and live SSE event streaming.',
      },
      {
        name: 'System',
        description: 'Health check, service diagnostics, and telemetry endpoints.',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token retrieved from `/api/auth/login` or `/api/auth/register`.',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'BadRequest' },
            message: { type: 'string', example: 'Invalid input parameters provided' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 142 },
            totalPages: { type: 'integer', example: 8 },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67bb8e7d206f4a38b9c1d001' },
            name: { type: 'string', example: 'Alex Morgan' },
            email: { type: 'string', example: 'alex.morgan@university.edu' },
            phone: { type: 'string', example: '+1-555-0199' },
            role: {
              type: 'string',
              enum: ['student', 'company', 'college', 'admin'],
              example: 'student',
            },
            roleTag: {
              type: 'string',
              enum: ['Admin', 'Maintainer', 'Promoter', 'Contributor', 'Ambassador', 'Regular'],
              example: 'Maintainer',
            },
            headline: { type: 'string', example: 'Full Stack Engineer & Open Source Contributor' },
            bio: { type: 'string', example: 'Computer Science student passionate about distributed systems.' },
            college: { type: 'string', example: 'National Institute of Technology' },
            branch: { type: 'string', example: 'Computer Science & Engineering' },
            graduationYear: { type: 'integer', example: 2026 },
            collegeId: { type: 'string', example: 'UNI-2022-CS-042' },
            collegeIdVerified: { type: 'boolean', example: true },
            emailVerified: { type: 'boolean', example: true },
            profileIcon: { type: 'string', example: 'http://localhost:5000/uploads/avatars/avatar-1.jpg' },
            resumeUrl: { type: 'string', example: 'http://localhost:5000/uploads/resumes/resume-1.pdf' },
            reputationScore: { type: 'integer', example: 92 },
            skills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'React' },
                  level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'], example: 'advanced' },
                  endorsedCount: { type: 'integer', example: 14 },
                },
              },
            },
            projects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Decentralized Task Ledger' },
                  description: { type: 'string', example: 'Fast distributed task runner with WebSockets' },
                  tags: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'MongoDB', 'React'] },
                  verified: { type: 'boolean', example: true },
                  repoUrl: { type: 'string', example: 'https://github.com/example/ledger' },
                },
              },
            },
          },
        },
        Internship: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67bb8e7d206f4a38b9c1d010' },
            role: { type: 'string', example: 'Full Stack Engineering Intern' },
            company: { type: 'string', example: 'Acme Technologies' },
            location: { type: 'string', example: 'Bengaluru, India' },
            mode: { type: 'string', enum: ['remote', 'onsite', 'hybrid'], example: 'remote' },
            department: { type: 'string', example: 'Engineering' },
            track: { type: 'string', example: 'Development' },
            stipend: { type: 'string', example: '₹25,000 / month' },
            compensationType: { type: 'string', enum: ['paid', 'unpaid', 'skill-based', 'flexible'], example: 'paid' },
            stipendMode: { type: 'string', enum: ['fixed', 'range'], example: 'range' },
            stipendMin: { type: 'number', example: 25000 },
            stipendMax: { type: 'number', example: 35000 },
            duration: { type: 'string', example: '6 Months' },
            description: { type: 'string', example: 'Work directly on high-scale microservices and responsive dashboards.' },
            skills: { type: 'array', items: { type: 'string' }, example: ['React', 'Node.js', 'PostgreSQL'] },
            status: { type: 'string', enum: ['active', 'paused', 'closed'], example: 'active' },
            isVerified: { type: 'boolean', example: true },
            isFeatured: { type: 'boolean', example: true },
            applicantsCount: { type: 'integer', example: 38 },
            postedBy: { type: 'string', example: '67bb8e7d206f4a38b9c1d002' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Application: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67bb8e7d206f4a38b9c1d020' },
            internship: { type: 'string', example: '67bb8e7d206f4a38b9c1d010' },
            student: { type: 'string', example: '67bb8e7d206f4a38b9c1d001' },
            company: { type: 'string', example: '67bb8e7d206f4a38b9c1d002' },
            roleTitle: { type: 'string', example: 'Full Stack Engineering Intern' },
            companyName: { type: 'string', example: 'Acme Technologies' },
            status: {
              type: 'string',
              enum: ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewing', 'rejected', 'hired', 'accepted'],
              example: 'shortlisted',
            },
            notes: { type: 'string', example: 'Strong portfolio and high assessment score.' },
            candidateSnapshot: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Alex Morgan' },
                email: { type: 'string', example: 'alex.morgan@university.edu' },
                phone: { type: 'string', example: '+1-555-0199' },
                college: { type: 'string', example: 'National Institute of Technology' },
                score: { type: 'integer', example: 92 },
                resumeUrl: { type: 'string', example: 'http://localhost:5000/uploads/resumes/resume.pdf' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        LaunchpadItem: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67bb8e7d206f4a38b9c1d030' },
            position: { type: 'string', example: 'Software Engineering Fellowship 2026' },
            company: { type: 'string', example: 'Tech Innovations' },
            location: { type: 'string', example: 'Global / Remote' },
            stipend: { type: 'string', example: '$3,000 - $6,000 USD' },
            batchYear: { type: 'string', example: '2026' },
            applyUrl: { type: 'string', example: 'https://example.com/apply' },
            skills: { type: 'array', items: { type: 'string' }, example: ['Git', 'Python', 'C++'] },
            featured: { type: 'boolean', example: true },
            clickCount: { type: 'integer', example: 1840 },
          },
        },
        SkillAssessment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67bb8e7d206f4a38b9c1d040' },
            title: { type: 'string', example: 'React & Modern Frontend Architecture' },
            category: {
              type: 'string',
              enum: ['Frontend', 'Backend', 'UI/UX Design', 'AI & Machine Learning', 'Cloud & DevOps'],
              example: 'Frontend',
            },
            durationMinutes: { type: 'integer', example: 25 },
            questionCount: { type: 'integer', example: 15 },
            passingScore: { type: 'integer', example: 75 },
            badgeTitle: { type: 'string', example: 'Certified React Specialist' },
          },
        },
        ChatMessage: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67bb8e7d206f4a38b9c1d050' },
            conversationId: { type: 'string', example: '67bb8e7d206f4a38b9c1d060' },
            sender: { type: 'string', example: '67bb8e7d206f4a38b9c1d001' },
            receiver: { type: 'string', example: '67bb8e7d206f4a38b9c1d002' },
            text: { type: 'string', example: 'Hi! Thank you for reviewing my application.' },
            status: { type: 'string', enum: ['sent', 'delivered', 'read'], example: 'read' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67bb8e7d206f4a38b9c1d070' },
            user: { type: 'string', example: '67bb8e7d206f4a38b9c1d001' },
            title: { type: 'string', example: 'Application Shortlisted!' },
            message: { type: 'string', example: 'Partner Company has shortlisted your application for Full Stack Engineering Intern.' },
            type: { type: 'string', example: 'application_update' },
            unread: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SupportTicket: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67bb8e7d206f4a38b9c1d080' },
            name: { type: 'string', example: 'Alex Morgan' },
            email: { type: 'string', example: 'alex.morgan@university.edu' },
            category: { type: 'string', example: 'General Inquiry' },
            subject: { type: 'string', example: 'Question regarding college ID verification' },
            message: { type: 'string', example: 'I uploaded my ID document yesterday and wanted to verify review timeline.' },
            status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'], example: 'open' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        VerificationRequest: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67bb8e7d206f4a38b9c1d090' },
            user: { type: 'string', example: '67bb8e7d206f4a38b9c1d001' },
            role: { type: 'string', example: 'student' },
            type: { type: 'string', example: 'College ID Document' },
            institution: { type: 'string', example: 'National Institute of Technology' },
            department: { type: 'string', example: 'Computer Science & Engineering' },
            docName: { type: 'string', example: 'Student_ID_Card.pdf' },
            docUrl: { type: 'string', example: 'http://localhost:5000/uploads/college-ids/student-id.pdf' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/app.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
