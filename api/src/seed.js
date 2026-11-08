import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), 'api/.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Internship from './models/Internship.js';
import Application from './models/Application.js';
import LaunchpadItem from './models/LaunchpadItem.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import VerificationRequest from './models/VerificationRequest.js';
import Notification from './models/Notification.js';
import SkillAssessment from './models/SkillAssessment.js';
import SkillSubmission from './models/SkillSubmission.js';
import Bookmark from './models/Bookmark.js';

const DEFAULT_MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/showmyskills';

export const seedSingleDatabase = async (targetUri) => {
  try {
    console.log(`\n======================================================`);
    console.log(`Connecting to MongoDB: ${targetUri}`);
    await mongoose.connect(targetUri);
    const dbName = mongoose.connection.name;
    console.log(`✅ Connected successfully to Database: "${dbName}"`);
    console.log(`======================================================\n`);

    console.log('🧹 Clearing previous collections...');
    await Promise.all([
      User.deleteMany({}),
      Internship.deleteMany({}),
      Application.deleteMany({}),
      LaunchpadItem.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      VerificationRequest.deleteMany({}),
      Notification.deleteMany({}),
      SkillAssessment.deleteMany({}),
      SkillSubmission.deleteMany({}),
      Bookmark.deleteMany({}),
    ]);

    const defaultHashedPassword = await bcrypt.hash('Password@123', 10);
    const studentHashedPassword = await bcrypt.hash('student@123', 10);
    const companyHashedPassword = await bcrypt.hash('company@123', 10);
    const adminHashedPassword = await bcrypt.hash('admin@123', 10);
    const collegeHashedPassword = await bcrypt.hash('college@123', 10);

    // ──────────────────────────────────────────────────────────
    // 1. Core Platform Administrators
    // ──────────────────────────────────────────────────────────
    console.log('👤 Creating administrators & staff...');
    const xyphxAdmin = await User.create({
      name: 'Platform Super Admin',
      email: 'admin@xyphx.com',
      phone: '+91 98000 00002',
      password: adminHashedPassword,
      role: 'admin',
      roleTag: 'Admin',
      headline: 'System Administrator & Platform Governance Lead',
      emailVerified: true,
      college: 'ShowMySkills Platform Operations',
      location: 'Bengaluru, Karnataka',
    });

    const adminUser = await User.create({
      name: 'Jordan Hayes',
      email: 'admin@showmyskills.com',
      phone: '+91 98480 00001',
      password: defaultHashedPassword,
      role: 'admin',
      roleTag: 'Admin',
      headline: 'Core Platform Administrator & Ecosystem Governance',
      emailVerified: true,
      college: 'College of Engineering Trivandrum',
      location: 'Trivandrum, Kerala',
    });

    // ──────────────────────────────────────────────────────────
    // 2. Company Recruiter Profiles
    // ──────────────────────────────────────────────────────────
    console.log('🏢 Creating verified enterprise companies...');
    const xyphxCompany = await User.create({
      name: 'Xyphx Technologies',
      email: 'company@xyphx.com',
      phone: '+91 80 9999 8888',
      password: companyHashedPassword,
      role: 'company',
      headline: 'Campus Recruiting & Engineering Talent Lead at Xyphx',
      emailVerified: true,
      companyProfile: {
        companyName: 'Xyphx Technologies',
        tagline: 'Engineering the next wave of developer ecosystems',
        aboutCompany: 'Xyphx Technologies builds intelligent talent assessment systems, open-source benchmarking engines, and developer platforms.',
        establishedYear: 2022,
        industryType: 'Software Development',
        companySize: '51-200',
        website: 'https://xyphx.com',
        linkedin: 'https://linkedin.com/company/xyphx',
        isVerified: true,
      },
    });

    const websharkCompany = await User.create({
      name: 'WebShark Web Services Pvt Ltd',
      email: 'recruitment@webshark.io',
      phone: '+91 80 4123 9870',
      password: defaultHashedPassword,
      role: 'company',
      headline: 'Early Careers Talent Acquisition at WebShark Web Services',
      emailVerified: true,
      companyProfile: {
        companyName: 'WebShark Web Services Pvt Ltd',
        tagline: 'Pioneering intelligent fintech & web architecture systems',
        aboutCompany: 'WebShark is an engineering-first organization building high-scale SaaS products, distributed backend engines, and modern React design systems.',
        establishedYear: 2021,
        industryType: 'Technology',
        companySize: '51-200',
        website: 'https://webshark.io',
        linkedin: 'https://linkedin.com/company/webshark',
        isVerified: true,
        awards: [
          { name: 'Top Emerging Tech Employer 2025', receivedYear: 2025, category: 'Workplace' },
          { name: 'ISO 27001 Certified Security Standards', receivedYear: 2024, category: 'Industry' },
        ],
      },
    });

    const technovaCompany = await User.create({
      name: 'TechNova Solutions',
      email: 'careers@technova.io',
      phone: '+91 80 8765 4321',
      password: defaultHashedPassword,
      role: 'company',
      headline: 'Global University Recruiting at TechNova Solutions',
      emailVerified: true,
      companyProfile: {
        companyName: 'TechNova Solutions',
        tagline: 'Building the next generation of cloud developer tooling',
        aboutCompany: 'TechNova builds developer-first cloud primitives and serverless workflow orchestrators used by 100k+ engineers worldwide.',
        establishedYear: 2020,
        industryType: 'Software Development',
        companySize: '201-500',
        website: 'https://technova.io',
        linkedin: 'https://linkedin.com/company/technova-io',
        isVerified: true,
      },
    });

    const razorpayCompany = await User.create({
      name: 'Razorpay Software Pvt Ltd',
      email: 'campus@razorpay.com',
      phone: '+91 80 6789 1234',
      password: defaultHashedPassword,
      role: 'company',
      headline: 'University Talent Acquisition at Razorpay',
      emailVerified: true,
      companyProfile: {
        companyName: 'Razorpay Software Pvt Ltd',
        tagline: 'The Converged Payments Platform for Modern Internet Businesses',
        aboutCompany: 'Razorpay powers payments, banking, and credit for over 10 million Indian businesses.',
        establishedYear: 2014,
        industryType: 'FinTech',
        companySize: '1000+',
        website: 'https://razorpay.com',
        isVerified: true,
      },
    });

    // ──────────────────────────────────────────────────────────
    // 3. College Placement Representatives
    // ──────────────────────────────────────────────────────────
    console.log('🎓 Creating college institution representatives...');
    const xyphxCollege = await User.create({
      name: 'Xyphx University Relations & Placement',
      email: 'college@xyphx.com',
      phone: '+91 80 9876 5432',
      password: collegeHashedPassword,
      role: 'college',
      headline: 'Placement & Career Guidance Unit at Xyphx Partner Institutions',
      emailVerified: true,
      collegeProfile: {
        collegeName: 'Xyphx Institute of Technology',
        institutionCode: 'XYPHX-EDU-01',
        establishedYear: 2018,
        location: 'Bengaluru, Karnataka, India',
        accreditation: 'NAAC A++ / Autonomous',
        officialWebsite: 'https://xyphx.edu.in',
        contactEmail: 'placements@xyphx.edu.in',
        activeStudentsCount: 3500,
        placementRatePercent: 96,
        isVerified: true,
      },
    });

    await User.create({
      name: 'CET Career Guidance & Placement Unit',
      email: 'placement@cet.ac.in',
      phone: '+91 471 259 8122',
      password: defaultHashedPassword,
      role: 'college',
      headline: 'Career Guidance & Placement Unit (CGPU) at CET Trivandrum',
      emailVerified: true,
      collegeProfile: {
        collegeName: 'College of Engineering Trivandrum',
        institutionCode: 'CET-KER-001',
        establishedYear: 1939,
        location: 'Trivandrum, Kerala, India',
        accreditation: 'NAAC A+ / NBA Accredited',
        officialWebsite: 'https://www.cet.ac.in',
        contactEmail: 'cgpu@cet.ac.in',
        activeStudentsCount: 4200,
        placementRatePercent: 94,
        isVerified: true,
      },
    });

    // ──────────────────────────────────────────────────────────
    // 4. Exact Star Student Candidates
    // ──────────────────────────────────────────────────────────
    console.log('💻 Creating verified student candidates with exact attributes...');

    // 0. Demo Student (student@xyphx.com)
    const xyphxStudent = await User.create({
      displayOrder: 99,
      name: 'Demo Student',
      email: 'student@xyphx.com',
      phone: '+91 98765 43210',
      password: studentHashedPassword,
      role: 'student',
      roleTag: 'Maintainer',
      headline: 'Full-Stack Developer | React & Node.js',
      college: 'Xyphx Institute of Technology',
      course: 'B.Tech',
      branch: 'Computer Science and Engineering',
      graduationYear: 2026,
      location: 'Bengaluru, India',
      profileIcon: 'https://api.builder.io/api/v1/image/assets/TEMP/5a82e47de052e6b1e8a0daf000f4c7f2631701fe?width=180',
      reputationScore: 92,
      topPercentile: 'Top 1% in Full Stack',
      completionPercentage: 100,
      emailVerified: true,
      collegeIdVerified: true,
      bio: 'Passionate software engineering student with proven skills in Next.js, Node.js, TypeScript, and MongoDB. Open source contributor at ShowMySkills.',
      primarySkills: ['React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript', 'Tailwind CSS'],
      skills: [
        { name: 'React', level: 'expert', endorsedCount: 45 },
        { name: 'Next.js', level: 'expert', endorsedCount: 42 },
        { name: 'Node.js', level: 'advanced', endorsedCount: 38 },
        { name: 'MongoDB', level: 'advanced', endorsedCount: 35 },
      ],
      projects: [
        {
          id: 'demo-p1',
          title: 'ShowMySkills Benchmark Engine',
          description: 'Distributed coding skill benchmark platform with containerized sandboxing.',
          tags: ['Next.js', 'Node.js', 'MongoDB', 'Docker'],
          verified: true,
          repoUrl: 'https://github.com/xyphx/ShowMySkills-system',
          liveUrl: 'https://showmyskills.xyphx.com',
        },
        {
          id: 'demo-p2',
          title: 'CloudFlow Orchestrator',
          description: 'Microservices workflow event-stream processor built on Node.js and Redis.',
          tags: ['Node.js', 'TypeScript', 'Redis'],
          verified: true,
          repoUrl: 'https://github.com/xyphx/cloudflow',
        },
      ],
      certifications: [
        {
          name: 'React Certified Architecture Specialist',
          issuingOrganization: 'OpenJS Foundation',
          validationDate: new Date('2025-06-15'),
          isVerified: true,
        },
      ],
      achievements: [
        {
          achievement: '1st Place - National Inter-College Hackathon 2025',
          year: 2025,
        },
      ],
      githubUrl: 'https://github.com/xyphx',
      linkedinUrl: 'https://linkedin.com/in/demo-student-xyphx',
    });

    // 1. Joel A. Jacob
    const joel = await User.create({
      displayOrder: 1,
      name: 'Joel A. Jacob',
      email: 'joel.jacob@cet.ac.in',
      phone: '+91 98471 23456',
      password: defaultHashedPassword,
      role: 'student',
      roleTag: 'Maintainer',
      headline: 'Frontend Developer',
      college: 'College of Engineering Trivandrum',
      course: 'B.Tech',
      branch: 'Computer Science (AI & Machine Learning)',
      graduationYear: 2026,
      location: 'Punalur, Kollam, Kerala, India',
      profileIcon: 'https://api.builder.io/api/v1/image/assets/TEMP/5a82e47de052e6b1e8a0daf000f4c7f2631701fe?width=180',
      reputationScore: 88,
      topPercentile: 'Top 5% in Frontend',
      completionPercentage: 95,
      emailVerified: true,
      collegeIdVerified: true,
      bio: 'Passionate frontend engineer focused on building intuitive, high-performance web and mobile applications with modern JavaScript frameworks.',
      primarySkills: ['App Development', 'Communication', 'React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
      skills: [
        { name: 'App Development', level: 'advanced', endorsedCount: 23 },
        { name: 'Communication', level: 'advanced', endorsedCount: 19 },
        { name: 'React', level: 'expert', endorsedCount: 42 },
        { name: 'Next.js', level: 'expert', endorsedCount: 38 },
        { name: 'Tailwind CSS', level: 'expert', endorsedCount: 29 },
        { name: 'TypeScript', level: 'advanced', endorsedCount: 25 },
      ],
      projects: [
        {
          id: 'p1',
          title: 'CampusHub Mobile',
          description: 'Flutter & Firebase app for campus events and peer networking.',
          tags: ['Flutter', 'Firebase', 'Mobile'],
          verified: true,
        },
        {
          id: 'p2',
          title: 'ShowMySkills Web Client',
          description: 'High-performance student portfolio showcase system.',
          tags: ['React', 'Next.js', 'Tailwind CSS'],
          verified: true,
        },
      ],
      githubUrl: 'https://github.com/joel-jacob',
      linkedinUrl: 'https://linkedin.com/in/joel-jacob',
    });

    // 2. S SIDHARTH
    const sidharth = await User.create({
      displayOrder: 2,
      name: 'S SIDHARTH',
      email: 'sidharth.s@cet.ac.in',
      phone: '+91 94470 65432',
      password: defaultHashedPassword,
      role: 'student',
      roleTag: 'Admin',
      headline: 'UI/UX Designer',
      college: 'College of Engineering Trivandrum',
      course: 'B.Tech',
      branch: 'Industrial Engineering',
      graduationYear: 2026,
      location: 'Trivandrum, Kerala',
      profileIcon: 'https://api.builder.io/api/v1/image/assets/TEMP/ab8e554398afb86403d2a7da0c420fe67c60f085?width=180',
      reputationScore: 94,
      topPercentile: 'Top 3% in Product Design',
      completionPercentage: 98,
      emailVerified: true,
      collegeIdVerified: true,
      bio: 'Product designer and engineer who blends human-centered design with computational engineering to build seamless digital experiences.',
      primarySkills: ['Machine Learning / AI', 'Operating Systems', 'UI/UX Design', 'Figma', 'Design Systems'],
      skills: [
        { name: 'Machine Learning / AI', level: 'advanced', endorsedCount: 32 },
        { name: 'Operating Systems', level: 'advanced', endorsedCount: 28 },
        { name: 'UI/UX Design', level: 'expert', endorsedCount: 54 },
        { name: 'Figma', level: 'expert', endorsedCount: 46 },
        { name: 'Design Systems', level: 'expert', endorsedCount: 39 },
      ],
      projects: [
        {
          id: 'p3',
          title: 'FinFlow Analytics Dashboard',
          description: 'Design system and interface for enterprise financial metrics.',
          tags: ['Figma', 'Design Systems', 'UI/UX'],
          verified: true,
        },
        {
          id: 'p4',
          title: 'EcoTrack Mobility',
          description: 'UX research and high-fidelity prototype for sustainable transit.',
          tags: ['UX Research', 'Figma', 'Wireframing'],
          verified: true,
        },
      ],
      portfolioUrl: 'https://behance.net/sidharth-design',
      linkedinUrl: 'https://linkedin.com/in/sidharth-s',
    });

    // 3. Reshma Udhayan
    const reshma = await User.create({
      displayOrder: 3,
      name: 'Reshma Udhayan',
      email: 'reshma.u@cet.ac.in',
      phone: '+91 98460 11223',
      password: defaultHashedPassword,
      role: 'student',
      roleTag: 'Promoter',
      headline: 'FullStack Developer',
      college: 'College of Engineering Trivandrum',
      course: 'B.Tech',
      branch: 'Industrial engineering',
      graduationYear: 2026,
      location: 'Trivandrum',
      profileIcon: 'https://api.builder.io/api/v1/image/assets/TEMP/c3059191c12486377929540d913e78b03ba9bddc?width=180',
      reputationScore: 82,
      topPercentile: 'Top 10% in Full Stack',
      completionPercentage: 92,
      emailVerified: true,
      collegeIdVerified: true,
      bio: 'Full-stack developer with a strong systems design background, engineering scalable web platforms and 3D modeling tools.',
      primarySkills: ['SolidWorks', 'CAD / CAM / CAE', 'Node.js', 'React', 'PostgreSQL', 'FullStack Web'],
      skills: [
        { name: 'SolidWorks', level: 'expert', endorsedCount: 40 },
        { name: 'CAD / CAM / CAE', level: 'expert', endorsedCount: 35 },
        { name: 'Node.js', level: 'advanced', endorsedCount: 31 },
        { name: 'React', level: 'advanced', endorsedCount: 28 },
        { name: 'PostgreSQL', level: 'advanced', endorsedCount: 22 },
      ],
      projects: [
        {
          id: 'p5',
          title: 'AutoCAD Cloud Sync',
          description: 'Web platform connecting CAD rendering pipelines with real-time feedback.',
          tags: ['Cloud', 'CAD', 'WebGL'],
          verified: true,
        },
        {
          id: 'p6',
          title: 'TalentLink Portal',
          description: 'Full-stack recruiting platform with automated resume parsing.',
          tags: ['React', 'Node.js', 'PostgreSQL'],
          verified: true,
        },
      ],
    });

    // 4. Vaishnav RL
    const vaishnav = await User.create({
      displayOrder: 4,
      name: 'Vaishnav RL',
      email: 'vaishnav.rl@cet.ac.in',
      phone: '+91 94960 99887',
      password: defaultHashedPassword,
      role: 'student',
      roleTag: 'Ambassador',
      headline: 'Graphic Designer',
      college: 'College of Engineering Trivandrum',
      course: 'B.Tech',
      branch: 'Industrial Engineering',
      graduationYear: 2026,
      location: 'Trivandrum',
      profileIcon: 'https://api.builder.io/api/v1/image/assets/TEMP/46fce00ed55aca498d8347d953abdc65e3ba2655?width=180',
      reputationScore: 81,
      completionPercentage: 90,
      emailVerified: true,
      collegeIdVerified: true,
      bio: 'Visual and brand designer translating quantitative business insights and financial narratives into compelling graphics.',
      primarySkills: ['UI/ UX', 'Financial analysis', 'Brand Identity', 'Motion Graphics', 'Figma'],
      skills: [
        { name: 'UI/ UX', level: 'expert', endorsedCount: 45 },
        { name: 'Financial analysis', level: 'advanced', endorsedCount: 38 },
        { name: 'Brand Identity', level: 'expert', endorsedCount: 30 },
      ],
      projects: [
        {
          id: 'p7',
          title: 'Venture Metrics Annual Report',
          description: 'Visual storytelling and data visualization branding package.',
          tags: ['Branding', 'DataViz'],
          verified: true,
        },
      ],
    });

    // 5. Abhay SA
    const abhay = await User.create({
      displayOrder: 5,
      name: 'Abhay SA',
      email: 'abhay.sa@cet.ac.in',
      phone: '+91 95670 44332',
      password: defaultHashedPassword,
      role: 'student',
      roleTag: 'Contributor',
      headline: 'FullStack Developer',
      college: 'College of Engineering Trivandrum',
      course: 'B.Tech',
      branch: 'Industrial engineering',
      graduationYear: 2026,
      location: 'Trivandrum',
      profileIcon: 'https://api.builder.io/api/v1/image/assets/TEMP/f7559f012fcf86117c87ef912259ea3d4b2467c5?width=180',
      reputationScore: 78,
      completionPercentage: 88,
      emailVerified: true,
      collegeIdVerified: true,
      bio: 'Full-stack engineer passionate about industrial automation, backend architectures, and developer tooling.',
      primarySkills: ['SolidWorks', 'CAD / CAM / CAE', 'Next.js', 'Express', 'Docker', 'REST APIs'],
      skills: [
        { name: 'SolidWorks', level: 'advanced', endorsedCount: 30 },
        { name: 'CAD / CAM / CAE', level: 'advanced', endorsedCount: 26 },
        { name: 'Next.js', level: 'expert', endorsedCount: 34 },
      ],
      projects: [
        {
          id: 'p9',
          title: 'Smart Inventory Orchestrator',
          description: 'Real-time warehouse tracking platform with IoT integration.',
          tags: ['IoT', 'Node.js', 'Docker'],
          verified: true,
        },
      ],
    });

    // 6. Rishi Chandran
    const rishi = await User.create({
      displayOrder: 6,
      name: 'Rishi Chandran',
      email: 'rishi.chandran@cet.ac.in',
      phone: '+91 94470 88990',
      password: defaultHashedPassword,
      role: 'student',
      roleTag: 'Ambassador',
      headline: 'Graphic Designer',
      college: 'College of Engineering Trivandrum',
      course: 'B.Tech',
      branch: 'Industrial Engineering',
      graduationYear: 2026,
      location: 'Trivandrum',
      profileIcon: 'https://api.builder.io/api/v1/image/assets/TEMP/ffe52c79545b2a85e56e27f28c8198d4551e8795?width=180',
      reputationScore: 81,
      completionPercentage: 90,
      emailVerified: true,
      collegeIdVerified: true,
      bio: 'Multidisciplinary visual designer focused on marketing design, clean interface aesthetics, and conversion-focused landing pages.',
      primarySkills: ['UI/ UX', 'Financial analysis', 'Typography', 'Illustrator', 'Product Strategy'],
      skills: [
        { name: 'UI/ UX', level: 'expert', endorsedCount: 42 },
        { name: 'Financial analysis', level: 'advanced', endorsedCount: 31 },
      ],
    });

    // 7. asher john
    await User.create({
      displayOrder: 7,
      name: 'asher john',
      email: 'asher.john@cet.ac.in',
      phone: '+91 94460 33445',
      password: defaultHashedPassword,
      role: 'student',
      roleTag: 'Promoter',
      headline: 'Frontend Developer',
      college: 'College of Engineering Trivandrum',
      course: 'B.Tech',
      branch: 'Computer Science (AI & Machine Learning)',
      graduationYear: 2026,
      location: 'Punalur, Kollam, Kerala, India',
      profileIcon: 'https://api.builder.io/api/v1/image/assets/TEMP/c108ffdec7504150607ccddcecf48749b1c50f54?width=180',
      reputationScore: 76,
      completionPercentage: 86,
      emailVerified: true,
      collegeIdVerified: true,
      primarySkills: ['App Development', 'Communication', 'React Native', 'Vue.js', 'GraphQL'],
    });

    // 8. Devikripa S
    await User.create({
      displayOrder: 8,
      name: 'Devikripa S',
      email: 'devikripa.s@cet.ac.in',
      phone: '+91 95670 11992',
      password: defaultHashedPassword,
      role: 'student',
      roleTag: 'Contributor',
      headline: 'UI/UX Designer',
      college: 'College of Engineering Trivandrum',
      course: 'B.Tech',
      branch: 'Industrial Engineering',
      graduationYear: 2026,
      location: 'Trivandrum, Kerala',
      profileIcon: 'https://api.builder.io/api/v1/image/assets/TEMP/a5bb5f84222369dfc64ce1f696c04fdc36d5fa89?width=180',
      reputationScore: 84,
      completionPercentage: 88,
      emailVerified: true,
      collegeIdVerified: true,
      primarySkills: ['Machine Learning / AI', 'Operating Systems', 'User Research', 'Wireframing', 'Figma'],
    });

    // 9. Ananya Sharma
    await User.create({
      displayOrder: 9,
      name: 'Ananya Sharma',
      email: 'ananya.sharma@iitm.ac.in',
      phone: '+91 98450 77665',
      password: defaultHashedPassword,
      role: 'student',
      roleTag: 'Contributor',
      headline: 'Machine Learning Research Intern & Deep Learning Fellow',
      college: 'Indian Institute of Technology Madras',
      course: 'B.Tech',
      branch: 'Data Science & AI',
      graduationYear: 2026,
      location: 'Chennai, Tamil Nadu',
      profileIcon: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=180&auto=format&fit=crop&q=80',
      reputationScore: 94,
      topPercentile: 'Top 2% in AI / ML',
      completionPercentage: 96,
      emailVerified: true,
      collegeIdVerified: true,
      primarySkills: ['Python', 'PyTorch', 'TensorFlow', 'Computer Vision'],
    });

    // 10. Rohan Nair
    await User.create({
      displayOrder: 10,
      name: 'Rohan Nair',
      email: 'rohan.nair@nitc.ac.in',
      phone: '+91 94470 12389',
      password: defaultHashedPassword,
      role: 'student',
      roleTag: 'Promoter',
      headline: 'Mobile Engineering Specialist | React Native & iOS',
      college: 'National Institute of Technology Calicut',
      course: 'B.Tech',
      branch: 'Computer Science and Engineering',
      graduationYear: 2026,
      location: 'Kozhikode, Kerala',
      profileIcon: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=180&auto=format&fit=crop&q=80',
      reputationScore: 89,
      completionPercentage: 91,
      emailVerified: true,
      collegeIdVerified: true,
      primarySkills: ['React Native', 'Swift', 'TypeScript', 'Redux', 'Mobile UX'],
    });

    // ──────────────────────────────────────────────────────────
    // 5. High-Impact Career Launchpad Opportunities
    // ──────────────────────────────────────────────────────────
    console.log('🚀 Seeding top tier career launchpad opportunities...');
    await LaunchpadItem.create([
      {
        displayOrder: 1,
        position: 'VCA Consulting & Analytics Intern',
        company: 'Visa Inc.',
        oneLiner: 'Formulate strategic payment analytics & data-driven advisory for global banking clients.',
        location: 'Bengaluru / Mumbai, India (Hybrid)',
        stipend: '₹75,000 - ₹90,000 / mo',
        duration: '6 Months · Batch 2025/2026',
        clicks: '1.8k clicks',
        clickCount: 1820,
        logoType: 'visa',
        applyUrl: 'https://visa.wd5.myworkdayjobs.com/en-US/Visa_Early_Careers/job/VCA-Intern--IDS-_REF086121W',
        skills: ['Data Analytics', 'SQL', 'Python'],
        allSkills: ['Data Analytics', 'SQL', 'Python', 'Client Advisory', 'Financial Modeling', 'Tableau'],
        about: 'Visa Consulting & Analytics (VCA) is the strategic consulting arm of Visa. We leverage Visa rich dataset to solve business challenges.',
        perks: 'Pre-Placement Offer (PPO) opportunity, transit allowance, and comprehensive healthcare coverage.',
        batchYear: '2025/2026',
        isVerified: true,
        featured: true,
      },
      {
        displayOrder: 2,
        position: 'Software Engineering Intern 2025',
        company: 'Atlassian',
        oneLiner: 'Build high-throughput microservices and collaborative UI primitives powering Jira & Confluence.',
        location: 'Bengaluru, India (Remote Eligible)',
        stipend: '₹1,30,000 / mo',
        duration: 'Summer 2025 · 10-12 Weeks',
        clicks: '2.4k clicks',
        clickCount: 2450,
        logoType: 'atlassian',
        applyUrl: 'https://www.atlassian.com/company/careers/details/26273',
        skills: ['Java / Kotlin', 'React', 'TypeScript'],
        allSkills: ['Java / Kotlin', 'React', 'TypeScript', 'Distributed Systems', 'AWS', 'Microservices'],
        about: 'Atlassian unleashes the potential of every team with products like Jira, Confluence, and Bitbucket.',
        perks: 'Top-tier stipend, home office stipend, wellness budget, and direct mentorship from Principal Engineers.',
        batchYear: '2025/2026',
        isVerified: true,
        featured: true,
      },
      {
        displayOrder: 3,
        position: 'Software Engineering Intern',
        company: 'Google',
        oneLiner: 'Engineer high-scale distributed systems, search infrastructure, and production AI models.',
        location: 'Bengaluru / Hyderabad, India',
        stipend: '₹1,15,000 / mo',
        duration: 'Summer 2025 · 10-12 Weeks',
        clicks: '4.1k clicks',
        clickCount: 4120,
        logoType: 'google',
        applyUrl: 'https://careers.google.com/jobs/results/?q=Software%20Engineering%20Intern',
        skills: ['C++ / Java', 'Python', 'DSA'],
        allSkills: ['C++ / Java', 'Python', 'Algorithms', 'Distributed Systems', 'Machine Learning', 'Linux'],
        about: 'Google software engineering interns work on core products that impact billions of people daily.',
        perks: 'Free gourmet dining, relocation travel, housing assistance, and conversion opportunities for full-time SWE.',
        batchYear: '2025/2026',
        isVerified: true,
        featured: true,
      },
      {
        displayOrder: 4,
        position: 'Software Engineer Intern (SDE)',
        company: 'Microsoft',
        oneLiner: 'Develop next-generation cloud services and enterprise tools on Azure & Windows Core.',
        location: 'Bengaluru / Hyderabad, India',
        stipend: '₹1,25,000 / mo',
        duration: 'Summer 2025 · 8-12 Weeks',
        clicks: '3.6k clicks',
        clickCount: 3600,
        logoType: 'microsoft',
        applyUrl: 'https://careers.microsoft.com/us/en/search-results?keywords=Software%20Engineering%20Intern',
        skills: ['C# / C++', 'Azure Cloud', 'Data Structures'],
        allSkills: ['C# / C++', 'Azure Cloud', 'Data Structures', 'Full Stack', 'Distributed Computing', 'APIs'],
        about: 'Microsoft Cloud and Enterprise engineering teams build planet-scale infrastructure.',
        perks: 'Corporate housing allowance, premium health coverage, and mentorship from senior architects.',
        batchYear: '2025/2026',
        isVerified: true,
        featured: true,
      },
      {
        displayOrder: 5,
        position: 'Frontend Systems & Frameworks Intern',
        company: 'Vercel Inc.',
        oneLiner: 'Build cutting-edge edge compute runtimes and serverless primitives for the Next.js ecosystem.',
        location: 'San Francisco, CA · Global Remote',
        stipend: '$8,000 / mo (~₹6.6L/mo)',
        duration: 'Flexible · 3-6 Months',
        clicks: '2.1k clicks',
        clickCount: 2100,
        logoType: 'vercel',
        applyUrl: 'https://vercel.com/careers',
        skills: ['Next.js', 'Serverless', 'TypeScript'],
        allSkills: ['Next.js', 'Serverless', 'TypeScript', 'Edge Computing', 'Turbo', 'Web Performance'],
        about: 'Vercel is the creator of Next.js and the leading frontend cloud platform. You will work on developer experience tooling, edge runtime compilation, and high-performance framework internals.',
        perks: 'Fully remote flexibility, high-spec equipment stipend, and direct collaboration with world-class open-source creators.',
        batchYear: '2025/2026',
        isVerified: true,
        featured: true,
      },
      {
        displayOrder: 6,
        position: 'Database Systems & Backend Intern',
        company: 'Supabase',
        oneLiner: 'Develop distributed PostgreSQL replication and realtime streaming database extensions.',
        location: 'Singapore · Remote Global',
        stipend: '$5,000 / mo (~₹4.1L/mo)',
        duration: 'Summer 2025 · 3-4 Months',
        clicks: '1.9k clicks',
        clickCount: 1900,
        logoType: 'supabase',
        applyUrl: 'https://supabase.com/careers',
        skills: ['PostgreSQL', 'Go / Rust', 'Docker'],
        allSkills: ['PostgreSQL', 'Go / Rust', 'Docker', 'Realtime DB', 'Edge Functions', 'Distributed Systems'],
        about: 'Supabase is an open source Firebase alternative built on PostgreSQL. Interns work directly on core open-source repositories handling realtime CDC, vector search, and edge authorization.',
        perks: '100% remote asynchronous culture, open source attribution, and competitive global stipend.',
        batchYear: '2025/2026',
        isVerified: true,
        featured: true,
      },
      {
        displayOrder: 7,
        position: 'Software Engineer Intern - Core Mobility',
        company: 'Uber Technologies',
        oneLiner: 'Build high-throughput dispatch algorithms and real-time geospatial routing engines.',
        location: 'Bengaluru / Hyderabad, India',
        stipend: '₹1,60,000 / mo',
        duration: 'Summer 2025 · 2-3 Months',
        clicks: '2.7k clicks',
        clickCount: 2700,
        logoType: 'uber',
        applyUrl: 'https://www.uber.com/us/en/careers/list/',
        skills: ['Golang / Java', 'Microservices', 'Kafka'],
        allSkills: ['Golang / Java', 'Microservices', 'Kafka', 'Algorithms', 'Geospatial Indexing', 'gRPC'],
        about: 'Uber connects the physical and digital worlds to help make movement happen at the push of a button.',
        perks: 'Industry-leading monthly stipend, Uber credits, meal benefits, and dedicated mentor pairing.',
        batchYear: '2025/2026',
        isVerified: true,
        featured: true,
      },
      {
        displayOrder: 8,
        position: 'Software Development Engineer Intern',
        company: 'Amazon',
        oneLiner: 'Build fault-tolerant distributed web services supporting millions of active shoppers & AWS users.',
        location: 'Bengaluru / Chennai, India',
        stipend: '₹1,10,000 / mo',
        duration: '6 Months · Jan - Jun 2025',
        clicks: '3.8k clicks',
        clickCount: 3800,
        logoType: 'amazon',
        applyUrl: 'https://www.amazon.jobs/en/job_categories/software-development',
        skills: ['Java', 'AWS Cloud', 'Distributed Systems'],
        allSkills: ['Java', 'AWS Cloud', 'Distributed Systems', 'OOP', 'Database Design', 'CI/CD'],
        about: 'Amazon SDE interns own and deploy features for production systems that touch millions of global consumers and enterprise cloud builders across Amazon Retail and AWS.',
        perks: 'Relocation assistance, comprehensive health insurance, Amazon employee discount, and PPO eligibility.',
        batchYear: '2025/2026',
        isVerified: true,
        featured: true,
      },
    ]);

    // ──────────────────────────────────────────────────────────
    // 6. Active Corporate Internships (Discovery Feed)
    // ──────────────────────────────────────────────────────────
    console.log('💼 Seeding rich corporate internships for discovery deck...');
    const xyphxInternship = await Internship.create({
      company: 'Xyphx Technologies',
      companyLogoText: 'XYPHX',
      companyLogoSubText: 'TECH',
      role: 'Full-Stack Developer Intern',
      location: 'Bengaluru, India',
      mode: 'hybrid',
      stipendMin: 30000,
      stipendMax: 40000,
      stipendText: '₹30,000 - ₹40,000 / mo',
      duration: '6 Months',
      skills: ['React', 'Node.js', 'MongoDB', 'Next.js', 'TypeScript'],
      responsibilities: [
        'Design and build high-throughput API endpoints and reactive React UI components',
        'Collaborate on distributed microservices and real-time candidate assessment workflows',
        'Contribute to open-source developer tooling and platform documentation',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: true,
      isFeatured: true,
      status: 'active',
      applicationUrl: 'https://xyphx.com/careers/fullstack-intern',
      postedBy: xyphxCompany._id,
      applicantsCount: 28,
      description: 'Join the core engineering team building the next wave of developer ecosystems and talent benchmarking platforms.',
    });

    const int1 = await Internship.create({
      company: 'WebShark Web Services',
      companyLogoText: 'WEBSHARK',
      companyLogoSubText: 'WEB SERVICES',
      role: 'UI/UX Design Intern',
      location: 'Bangalore, India',
      mode: 'hybrid',
      stipendMin: 15000,
      stipendMax: 20000,
      stipendText: '₹15,000 - ₹20,000 / mo',
      duration: '6 Months',
      skills: ['Figma', 'UI/UX', 'User Research', 'Wireframing', 'Prototyping'],
      responsibilities: [
        'Lead user research and synthesize client problem statements into atomic Figma components',
        'Build high-fidelity responsive mobile prototypes adhering to strict accessibility guidelines',
        'Collaborate with React engineers to ensure design implementation fidelity across production screens',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: true,
      isFeatured: true,
      status: 'active',
      applicationUrl: 'https://webshark.io/careers/ui-ux',
      postedBy: websharkCompany._id,
      applicantsCount: 42,
      description: 'Design intuitive interfaces and create responsive mobile prototypes for high-scale enterprise SaaS clients.',
    });

    const int2 = await Internship.create({
      company: 'TechNova Solutions',
      companyLogoText: 'TECHNOVA',
      companyLogoSubText: 'SOLUTIONS',
      role: 'Frontend Developer Intern',
      location: 'Remote',
      mode: 'remote',
      stipendMin: 20000,
      stipendMax: 25000,
      stipendText: '₹20,000 - ₹25,000 / mo',
      duration: '3 Months',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git'],
      responsibilities: [
        'Build responsive Next.js App Router client and server components',
        'Optimize Core Web Vitals and client bundle size for millisecond render speeds',
        'Author reusable UI primitives and write comprehensive component test suites',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: true,
      isFeatured: true,
      status: 'active',
      applicationUrl: 'https://technova.io/careers/frontend',
      postedBy: technovaCompany._id,
      applicantsCount: 89,
      description: 'Collaborate with full stack engineers to develop modern interactive user experiences on Next.js 15.',
    });

    const int3 = await Internship.create({
      company: 'CloudPeak Analytics',
      companyLogoText: 'CLOUDPEAK',
      companyLogoSubText: 'ANALYTICS',
      role: 'Data Science Intern',
      location: 'Hyderabad, India',
      mode: 'onsite',
      stipendMin: 18000,
      stipendMax: 22000,
      stipendText: '₹18,000 - ₹22,000 / mo',
      duration: '4 Months',
      skills: ['Python', 'Pandas', 'TensorFlow', 'SQL', 'Tableau'],
      responsibilities: [
        'Analyze large-scale tabular datasets and extract actionable financial insights',
        'Build and benchmark supervised machine learning classification pipelines',
        'Create interactive Tableau dashboards for executive business reporting',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: false,
      isFeatured: false,
      status: 'pending_review',
      applicationUrl: 'https://cloudpeak.com/internships/ds',
      applicantsCount: 16,
      description: 'Analyze large-scale tabular datasets, build classification models, and report statistical insights.',
    });

    const int4 = await Internship.create({
      company: 'FinEdge Technologies',
      companyLogoText: 'FINEDGE',
      companyLogoSubText: 'TECHNOLOGIES',
      role: 'Backend Engineering Intern',
      location: 'Mumbai, India',
      mode: 'hybrid',
      stipendMin: 25000,
      stipendMax: 30000,
      stipendText: '₹25,000 - ₹30,000 / mo',
      duration: '6 Months',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
      responsibilities: [
        'Design high-throughput RESTful endpoints and asynchronous worker pipelines',
        'Optimize relational database indexing and Redis cache invalidation strategies',
        'Implement robust NoSQL and SQL security protections and JWT session handling',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: true,
      isFeatured: false,
      status: 'active',
      applicationUrl: 'https://finedge.tech/careers/backend',
      applicantsCount: 53,
      description: 'Design robust microservices, optimize database queries, and secure distributed endpoints.',
    });

    const int5 = await Internship.create({
      company: 'Razorpay',
      companyLogoText: 'RAZORPAY',
      companyLogoSubText: 'PAYMENTS',
      role: 'SDE Intern - Payments Core',
      location: 'Bengaluru, India',
      mode: 'hybrid',
      stipendMin: 45000,
      stipendMax: 50000,
      stipendText: '₹45,000 - ₹50,000 / mo',
      duration: '6 Months',
      skills: ['Go', 'Node.js', 'Kafka', 'PostgreSQL', 'Distributed Systems'],
      responsibilities: [
        'Build low-latency payment processing pipelines handling 10,000+ TPS',
        'Integrate bank gateway webhook listeners with idempotent retry guarantees',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: true,
      isFeatured: true,
      status: 'active',
      applicationUrl: 'https://razorpay.com/jobs/sde-intern',
      postedBy: razorpayCompany._id,
      applicantsCount: 142,
      description: 'Work on India most resilient payment gateway infrastructure powering millions of checkouts daily.',
    });

    const int6 = await Internship.create({
      company: 'CRED',
      companyLogoText: 'CRED',
      companyLogoSubText: 'DESIGN & TECH',
      role: 'Frontend Engineer Intern (Design Systems)',
      location: 'Bengaluru, India',
      mode: 'onsite',
      stipendMin: 50000,
      stipendMax: 60000,
      stipendText: '₹50,000 - ₹60,000 / mo',
      duration: '6 Months',
      skills: ['React', 'Framer Motion', 'Tailwind CSS', 'WebGL', 'TypeScript'],
      responsibilities: [
        'Craft fluid 60fps micro-animations and physics-based interactions for the member web dashboard',
        'Maintain the internal CRED design system tokens and headless UI components',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: true,
      isFeatured: true,
      status: 'active',
      applicationUrl: 'https://cred.club/careers',
      applicantsCount: 188,
      description: 'Bring world-class aesthetic excellence and frictionless UI animations to member experiences.',
    });

    const int7 = await Internship.create({
      company: 'Swiggy',
      companyLogoText: 'SWIGGY',
      companyLogoSubText: 'CONSUMER TECH',
      role: 'Product Design Intern',
      location: 'Bengaluru, India',
      mode: 'hybrid',
      stipendMin: 35000,
      stipendMax: 40000,
      stipendText: '₹35,000 - ₹40,000 / mo',
      duration: '6 Months',
      skills: ['Figma', 'UI/UX Design', 'User Research', 'Design Systems', 'Prototyping'],
      responsibilities: [
        'Design checkout flows, cart interactions, and live tracking UI for quick-commerce',
        'Conduct field research with restaurant partners and consumer focus groups',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: true,
      isFeatured: false,
      status: 'active',
      applicationUrl: 'https://swiggy.com/careers',
      applicantsCount: 76,
      description: 'Solve real-world hyperlocal logistics and food delivery design challenges for millions of daily active users.',
    });

    const int8 = await Internship.create({
      company: 'Postman',
      companyLogoText: 'POSTMAN',
      companyLogoSubText: 'API PLATFORM',
      role: 'API Platform Engineering Intern',
      location: 'Bengaluru, India (Remote Eligible)',
      mode: 'remote',
      stipendMin: 50000,
      stipendMax: 55000,
      stipendText: '₹50,000 - ₹55,000 / mo',
      duration: '3 Months',
      skills: ['Node.js', 'TypeScript', 'REST APIs', 'OpenAPI', 'WebSockets'],
      responsibilities: [
        'Enhance API client testing tools and automated mock server runtime engines',
        'Contribute to open-source Postman collections and OpenAPI specification linters',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: true,
      isFeatured: true,
      status: 'active',
      applicationUrl: 'https://postman.com/careers',
      applicantsCount: 97,
      description: 'Empower over 30 million developers to build, test, and document world-class APIs seamlessly.',
    });

    const int9 = await Internship.create({
      company: 'Zerodha',
      companyLogoText: 'ZERODHA',
      companyLogoSubText: 'KITE ENGINE',
      role: 'Systems & Go Backend Intern',
      location: 'Bengaluru, India',
      mode: 'onsite',
      stipendMin: 40000,
      stipendMax: 45000,
      stipendText: '₹40,000 - ₹45,000 / mo',
      duration: '6 Months',
      skills: ['Go', 'PostgreSQL', 'Linux', 'Networking', 'WebSockets'],
      responsibilities: [
        'Develop ultra-fast order routing engines and real-time market ticker socket streams',
        'Optimize memory allocations and Linux kernel network socket buffers',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: true,
      isFeatured: false,
      status: 'active',
      applicationUrl: 'https://zerodha.com/careers',
      applicantsCount: 112,
      description: 'Work alongside India largest retail stockbroker on lean, pure open-source tech stacks without bloated frameworks.',
    });

    const int10 = await Internship.create({
      company: 'Zomato',
      companyLogoText: 'ZOMATO',
      companyLogoSubText: 'MOBILE CORE',
      role: 'Mobile Developer Intern (React Native)',
      location: 'Gurugram, India',
      mode: 'hybrid',
      stipendMin: 35000,
      stipendMax: 40000,
      stipendText: '₹35,000 - ₹40,000 / mo',
      duration: '6 Months',
      skills: ['React Native', 'JavaScript', 'TypeScript', 'Redux', 'Mobile UX'],
      responsibilities: [
        'Build high-performance native bridge modules and offline-first cart persistence',
        'Optimize app startup time and render lists with thousands of restaurant menu items',
      ],
      employmentType: 'Full time',
      jobType: 'Full time',
      isVerified: true,
      isFeatured: false,
      status: 'active',
      applicationUrl: 'https://zomato.com/careers',
      applicantsCount: 68,
      description: 'Ship fluid Android and iOS application features loved by foodies across 500+ Indian cities.',
    });

    // ──────────────────────────────────────────────────────────
    // 7. ATS Candidate Applications Lifecycle
    // ──────────────────────────────────────────────────────────
    console.log('📑 Seeding ATS applications and status pipelines...');
    await Application.create([
      {
        internship: xyphxInternship._id,
        student: xyphxStudent._id,
        company: xyphxCompany._id,
        roleTitle: 'Full-Stack Developer Intern',
        companyName: 'Xyphx Technologies',
        status: 'shortlisted',
        candidateSnapshot: {
          name: xyphxStudent.name,
          email: xyphxStudent.email,
          phone: xyphxStudent.phone,
          college: xyphxStudent.college,
          department: xyphxStudent.branch,
          score: xyphxStudent.reputationScore,
          avatar: xyphxStudent.profileIcon,
          skills: ['React', 'Next.js', 'Node.js', 'MongoDB'],
          portfolioUrl: xyphxStudent.githubUrl,
        },
        notes: 'Demonstrated high skill in distributed Next.js systems and MongoDB architectures.',
      },
      {
        internship: int2._id,
        student: xyphxStudent._id,
        company: technovaCompany._id,
        roleTitle: 'Frontend Developer Intern',
        companyName: 'TechNova Solutions',
        status: 'interview_scheduled',
        candidateSnapshot: {
          name: xyphxStudent.name,
          email: xyphxStudent.email,
          phone: xyphxStudent.phone,
          college: xyphxStudent.college,
          department: xyphxStudent.branch,
          score: xyphxStudent.reputationScore,
          avatar: xyphxStudent.profileIcon,
          skills: ['React', 'Next.js', 'TypeScript'],
        },
        notes: 'Round 1 technical review cleared. Scheduled for live pairing interview.',
        interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        internship: int1._id,
        student: joel._id,
        company: websharkCompany._id,
        roleTitle: 'UI/UX Design Intern',
        companyName: 'WebShark Web Services',
        status: 'shortlisted',
        candidateSnapshot: {
          name: joel.name,
          email: joel.email,
          phone: joel.phone,
          college: joel.college,
          department: joel.branch,
          score: joel.reputationScore,
          avatar: joel.profileIcon,
          skills: ['React', 'Next.js', 'Tailwind CSS', 'Figma'],
          portfolioUrl: joel.githubUrl,
        },
        notes: 'Demonstrated exceptional mastery in UI architecture and React component design.',
      },
      {
        internship: int1._id,
        student: sidharth._id,
        company: websharkCompany._id,
        roleTitle: 'UI/UX Design Intern',
        companyName: 'WebShark Web Services',
        status: 'interview_scheduled',
        candidateSnapshot: {
          name: sidharth.name,
          email: sidharth.email,
          phone: sidharth.phone,
          college: sidharth.college,
          department: sidharth.branch,
          score: sidharth.reputationScore,
          avatar: sidharth.profileIcon,
          skills: ['Figma', 'Design Systems', 'User Research'],
          portfolioUrl: sidharth.portfolioUrl,
        },
        notes: 'Portfolio includes enterprise design system and mobile prototypes. Scheduled technical interview round.',
        interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        internship: int2._id,
        student: joel._id,
        company: technovaCompany._id,
        roleTitle: 'Frontend Developer Intern',
        companyName: 'TechNova Solutions',
        status: 'hired',
        candidateSnapshot: {
          name: joel.name,
          email: joel.email,
          phone: joel.phone,
          college: joel.college,
          department: joel.branch,
          score: joel.reputationScore,
          avatar: joel.profileIcon,
          skills: ['React', 'Next.js', 'TypeScript'],
        },
        notes: 'Passed all 3 evaluation rounds with top marks. Offer letter generated at ₹25,000/mo.',
      },
      {
        internship: int5._id,
        student: abhay._id,
        company: razorpayCompany._id,
        roleTitle: 'SDE Intern - Payments Core',
        companyName: 'Razorpay',
        status: 'reviewing',
        candidateSnapshot: {
          name: abhay.name,
          email: abhay.email,
          phone: abhay.phone,
          college: abhay.college,
          department: abhay.branch,
          score: abhay.reputationScore,
          avatar: abhay.profileIcon,
          skills: ['Next.js', 'Express', 'Docker'],
        },
        notes: 'Resume under preliminary code review by the Payments Core hiring team.',
      },
      {
        internship: int6._id,
        student: sidharth._id,
        company: websharkCompany._id,
        roleTitle: 'Frontend Engineer Intern (Design Systems)',
        companyName: 'CRED',
        status: 'applied',
        candidateSnapshot: {
          name: sidharth.name,
          email: sidharth.email,
          college: sidharth.college,
          score: sidharth.reputationScore,
          avatar: sidharth.profileIcon,
          skills: ['Figma', 'Design Systems', 'UI/UX'],
        },
        notes: 'Applied through the ShowMySkills campus portal.',
      },
    ]);

    // ──────────────────────────────────────────────────────────
    // 8. Verification Requests
    // ──────────────────────────────────────────────────────────
    console.log('🛡️ Seeding student credential verification requests...');
    await VerificationRequest.create([
      {
        user: xyphxStudent._id,
        role: 'student',
        type: 'College ID Document',
        institution: 'Xyphx Institute of Technology',
        department: 'Computer Science and Engineering',
        docName: 'XIT_Student_ID_2026.pdf',
        docUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
        notes: 'Campus identity verification card for the 2022-2026 academic batch.',
        status: 'approved',
        reviewedBy: xyphxAdmin._id,
        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        user: joel._id,
        role: 'student',
        type: 'College ID Document',
        institution: 'College of Engineering Trivandrum',
        department: 'Computer Science (AI & ML)',
        docName: 'CET_College_ID_Card_2026.pdf',
        docUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        notes: 'Batch 2026 undergraduate seeking official verified badge for campus placements.',
        status: 'approved',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        user: sidharth._id,
        role: 'student',
        type: 'College ID Document',
        institution: 'College of Engineering Trivandrum',
        department: 'Industrial Engineering',
        docName: 'CET_ID_Card_Sidharth.pdf',
        docUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        notes: 'Undergraduate student verification for campus placement portal.',
        status: 'approved',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        user: reshma._id,
        role: 'student',
        type: 'College ID Document',
        institution: 'College of Engineering Trivandrum',
        department: 'Industrial Engineering',
        docName: 'CET_ID_Reshma.pdf',
        docUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        notes: 'Academic credential verification.',
        status: 'approved',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        user: rishi._id,
        role: 'student',
        type: 'Skill Assessment Proof',
        institution: 'College of Engineering Trivandrum',
        department: 'Industrial Engineering',
        docName: 'Design_Specialist_Certificate.pdf',
        docUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80',
        notes: 'Submitted score 95% in Visual Design Systems.',
        status: 'pending',
      },
    ]);

    // ──────────────────────────────────────────────────────────
    // 9. Real-Time Chat Channels & Messages
    // ──────────────────────────────────────────────────────────
    console.log('💬 Seeding chat conversations...');
    const convDemo = await Conversation.create({
      participants: [xyphxStudent._id, xyphxCompany._id],
      lastMessage: 'Hi Demo Student! We loved your profile and would like to invite you for a technical discussion.',
      lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      lastSender: xyphxCompany._id,
    });

    await Message.create([
      {
        conversationId: convDemo._id,
        sender: xyphxCompany._id,
        receiver: xyphxStudent._id,
        text: 'Hello Demo Student! Thank you for applying for the Full-Stack Developer Intern role.',
        status: 'read',
      },
      {
        conversationId: convDemo._id,
        sender: xyphxStudent._id,
        receiver: xyphxCompany._id,
        text: 'Hi! Thank you for considering my application. I am excited about the opportunity at Xyphx Technologies.',
        status: 'read',
      },
      {
        conversationId: convDemo._id,
        sender: xyphxCompany._id,
        receiver: xyphxStudent._id,
        text: 'Hi Demo Student! We loved your profile and would like to invite you for a technical discussion.',
        status: 'delivered',
      },
    ]);

    const conv1 = await Conversation.create({
      participants: [joel._id, websharkCompany._id],
      lastMessage: 'Hi Joel! We reviewed your frontend portfolio and would love to schedule a technical chat.',
      lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastSender: websharkCompany._id,
    });

    await Message.create([
      {
        conversationId: conv1._id,
        sender: websharkCompany._id,
        receiver: joel._id,
        text: 'Hello Joel! Your project CampusHub looks fantastic.',
        status: 'read',
      },
      {
        conversationId: conv1._id,
        sender: joel._id,
        receiver: websharkCompany._id,
        text: 'Thank you! I focused heavily on fluid animations and responsive mobile architecture.',
        status: 'read',
      },
      {
        conversationId: conv1._id,
        sender: websharkCompany._id,
        receiver: joel._id,
        text: 'Hi Joel! We reviewed your frontend portfolio and would love to schedule a technical chat.',
        status: 'delivered',
      },
    ]);

    // ──────────────────────────────────────────────────────────
    // 10. Notifications
    // ──────────────────────────────────────────────────────────
    console.log('🔔 Seeding platform notifications...');
    await Notification.create([
      {
        user: xyphxStudent._id,
        title: 'Application Shortlisted 🎉',
        desc: 'Xyphx Technologies shortlisted your application for Full-Stack Developer Intern.',
        unread: true,
        type: 'application',
      },
      {
        user: xyphxStudent._id,
        title: 'Interview Scheduled',
        desc: 'TechNova Solutions has scheduled an interview for Frontend Developer Intern.',
        unread: true,
        type: 'application',
      },
      {
        user: joel._id,
        title: 'Application Shortlisted',
        desc: 'WebShark Web Services shortlisted your application for UI/UX Design Intern.',
        unread: true,
        type: 'application',
      },
      {
        user: joel._id,
        title: 'Offer Letter Released 🎉',
        desc: 'TechNova Solutions has extended an internship offer for Frontend Developer Intern.',
        unread: false,
        type: 'application',
      },
      {
        user: sidharth._id,
        title: 'Interview Scheduled',
        desc: 'Technical round scheduled with WebShark Web Services for UI/UX Design Intern.',
        unread: true,
        type: 'application',
      },
    ]);

    // ──────────────────────────────────────────────────────────
    // 11. Technical Skill Assessments
    // ──────────────────────────────────────────────────────────
    console.log('🧠 Seeding skill benchmark tests...');
    const reactAssessment = await SkillAssessment.create({
      title: 'React & Next.js Architecture',
      category: 'Frontend',
      description: 'Comprehensive evaluation of React 19 primitives, Server Components, and Next.js App Router performance patterns.',
      durationMinutes: 25,
      passingScore: 75,
      reputationPoints: 15,
      badgeName: 'React Certified Specialist',
      totalTaken: 342,
      averageScore: 84,
      questions: [
        {
          question: 'What is the key benefit of React Server Components (RSC)?',
          options: [
            'Zero client bundle impact for server dependencies',
            'Full DOM access on the backend',
            'Synchronous client-side renders',
            'Replaces all client-side state management completely',
          ],
          correctIndex: 0,
          explanation: 'RSC execute strictly on the server and transmit minimal JSON-stream representations, keeping heavy libraries out of the client JS bundle.',
          difficulty: 'intermediate',
        },
        {
          question: 'How do you prevent unnecessary re-renders in deep component hierarchies?',
          options: [
            'Using React.memo and useCallback/useMemo for reference stability',
            'Wrapping the root component in useEffect',
            'Calling forceUpdate on every state change',
            'Disabling the React reconciliation algorithm',
          ],
          correctIndex: 0,
          explanation: 'React.memo memoizes the rendered output of the wrapped component preventing unnecessary re-renders when props remain unchanged.',
          difficulty: 'intermediate',
        },
      ],
    });

    const backendAssessment = await SkillAssessment.create({
      title: 'Node.js & Scalable Backend Systems',
      category: 'Backend',
      description: 'Benchmark assessment covering event loops, asynchronous streams, clustering, and high-throughput REST APIs.',
      durationMinutes: 30,
      passingScore: 75,
      reputationPoints: 20,
      badgeName: 'Backend Certified Engineer',
      totalTaken: 218,
      averageScore: 81,
      questions: [
        {
          question: 'In Node.js event loop, which phase executes process.nextTick callbacks?',
          options: [
            'Immediately after the current operation before moving to the next microtask/phase',
            'In the Check phase along with setImmediate',
            'In the Timers phase after setTimeout',
            'In the Poll phase alongside I/O callbacks',
          ],
          correctIndex: 0,
          explanation: 'process.nextTick callbacks run immediately after the current operation finishes, before the next tick of the event loop.',
          difficulty: 'advanced',
        },
      ],
    });

    await SkillSubmission.create([
      {
        student: xyphxStudent._id,
        assessment: reactAssessment._id,
        skillName: reactAssessment.title,
        score: 96,
        passed: true,
        totalQuestions: 2,
        correctAnswers: 2,
      },
      {
        student: joel._id,
        assessment: reactAssessment._id,
        skillName: reactAssessment.title,
        score: 93,
        passed: true,
        totalQuestions: 2,
        correctAnswers: 2,
      },
    ]);

    // ──────────────────────────────────────────────────────────
    // 12. Bookmarks (Saved Items)
    // ──────────────────────────────────────────────────────────
    console.log('📌 Seeding user bookmarks...');
    await Bookmark.create([
      {
        user: xyphxStudent._id,
        itemType: 'internship',
        internship: xyphxInternship._id,
      },
      {
        user: xyphxStudent._id,
        itemType: 'internship',
        internship: int2._id,
      },
      {
        user: xyphxCompany._id,
        itemType: 'candidate',
        candidate: xyphxStudent._id,
      },
      {
        user: joel._id,
        itemType: 'internship',
        internship: int1._id,
      },
      {
        user: websharkCompany._id,
        itemType: 'candidate',
        candidate: joel._id,
      },
      {
        user: websharkCompany._id,
        itemType: 'candidate',
        candidate: sidharth._id,
      },
    ]);

    // ──────────────────────────────────────────────────────────
    // Summary Audit & Verification
    // ──────────────────────────────────────────────────────────
    const counts = {
      users: await User.countDocuments(),
      internships: await Internship.countDocuments(),
      applications: await Application.countDocuments(),
      launchpadItems: await LaunchpadItem.countDocuments(),
      verificationRequests: await VerificationRequest.countDocuments(),
      conversations: await Conversation.countDocuments(),
      messages: await Message.countDocuments(),
      notifications: await Notification.countDocuments(),
      skillAssessments: await SkillAssessment.countDocuments(),
      skillSubmissions: await SkillSubmission.countDocuments(),
      bookmarks: await Bookmark.countDocuments(),
    };

    console.log(`\n======================================================`);
    console.log(`🎉 DATABASE SEEDING COMPLETED IN DATABASE: "${dbName}"`);
    console.log(`======================================================`);
    console.table(counts);
    console.log(`👉 In MongoDB Compass: Click the Refresh icon (⟳) on the collection!`);
    console.log(`======================================================\n`);

    await mongoose.disconnect();
    return counts;
  } catch (error) {
    console.error(`❌ Database seeding error in ${targetUri}:`, error);
    try {
      await mongoose.disconnect();
    } catch {}
    throw error;
  }
};

export const seedDatabase = async () => {
  const baseUri = DEFAULT_MONGODB_URI.trim();
  let targetUris = [baseUri];

  if (baseUri.includes('mongodb.net')) {
    const match = baseUri.match(/^(mongodb\+srv:\/\/[^/]+)(\/[^?]*)?(\?.*)?$/);
    if (match) {
      const root = match[1];
      const query = match[3] || '?retryWrites=true&w=majority';
      targetUris = [
        `${root}/test${query}`,
        `${root}/showmyskills${query}`,
      ];
    }
  }

  console.log(`\n🚀 Initializing multi-database seed for targets:`, targetUris);

  for (const uri of targetUris) {
    await seedSingleDatabase(uri);
  }

  console.log(`\n✅ ALL DATABASES SEEDED SUCCESSFULLY!`);
  process.exit(0);
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().catch((err) => {
    console.error('Fatal seed failure:', err);
    process.exit(1);
  });
}
