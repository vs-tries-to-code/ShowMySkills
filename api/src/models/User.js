import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    id: { type: String },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    tags: { type: [String], default: [] },
    verified: { type: Boolean, default: false },
    repoUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
    endorsedCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuingOrganization: { type: String, default: '' },
    validationDate: { type: Date },
    certificateFile: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
  },
  { _id: false }
);

const achievementSchema = new mongoose.Schema(
  {
    achievement: { type: String, required: true },
    year: { type: Number },
    proofFile: { type: String, default: '' },
  },
  { _id: false }
);

const metricSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: Number, required: true },
    color: { type: String, default: '#4B9C93' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'company', 'college', 'admin'],
      default: 'student',
    },
    roleTag: {
      type: String,
      enum: ['Admin', 'Maintainer', 'Promoter', 'Contributor', 'Ambassador', 'Regular'],
      default: 'Regular',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    headline: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    dob: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      default: '',
    },
    profileIcon: {
      type: String,
      default: null,
    },

    // Student specific attributes
    college: {
      type: String,
      trim: true,
      default: '',
    },
    course: {
      type: String,
      default: '',
    },
    branch: {
      type: String,
      default: '',
    },
    graduationYear: {
      type: Number,
      default: null,
    },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Experienced', ''],
      default: '',
    },
    collegeId: {
      type: String,
      trim: true,
      default: '',
    },
    collegeIdDocument: {
      type: String,
      default: null,
    },
    collegeIdVerified: {
      type: Boolean,
      default: false,
    },
    collegeIdVerifiedAt: {
      type: Date,
      default: null,
    },
    verificationExpiresAt: {
      type: Date,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOtp: {
      type: String,
      default: null,
    },
    emailVerificationOtpExpires: {
      type: Date,
      default: null,
    },
    passwordResetOtp: {
      type: String,
      default: null,
    },
    passwordResetOtpExpires: {
      type: Date,
      default: null,
    },

    // Portfolio, Reputation & Skills
    skills: {
      type: [skillSchema],
      default: [],
    },
    primarySkills: {
      type: [String],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    certifications: {
      type: [certificationSchema],
      default: [],
    },
    achievements: {
      type: [achievementSchema],
      default: [],
    },
    metrics: {
      type: [metricSchema],
      default: [],
    },
    reputationScore: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    topPercentile: {
      type: String,
      default: 'Top 15%',
    },
    completionPercentage: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    portfolioUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    openToWorkMessage: {
      type: String,
      default: 'Open to internships and full-time opportunities',
    },

    // Company specific embedded profile
    companyProfile: {
      companyName: { type: String, default: '' },
      logo: { type: String, default: '' },
      tagline: { type: String, default: '' },
      aboutCompany: { type: String, default: '' },
      establishedYear: { type: Number },
      industryType: { type: String, default: '' },
      companySize: { type: String, default: '' },
      website: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      isVerified: { type: Boolean, default: false },
      awards: [
        {
          name: String,
          receivedYear: Number,
          category: String,
          certificateFile: String,
        },
      ],
      certifications: [
        {
          name: String,
          issuingBody: String,
          validationDate: Date,
          certificateFile: String,
        },
      ],
    },

    // College specific embedded profile
    collegeProfile: {
      collegeName: { type: String, default: '' },
      aboutCollege: { type: String, default: '' },
      establishedYear: { type: Number },
      collegeType: { type: String, default: '' },
      pincode: { type: String, default: '' },
      departments: { type: [String], default: [] },
      courses: { type: [String], default: [] },
      numberOfStudents: { type: Number, default: 0 },
      numberOfDepartments: { type: Number, default: 0 },
      placementRate: { type: Number, default: 0 },
      studentsPlaced: { type: Number, default: 0 },
      companiesVisited: { type: Number, default: 0 },
      highestPackage: { type: String, default: '' },
      averagePackage: { type: String, default: '' },
      internshipParticipation: { type: Number, default: 0 },
      website: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },

    // User preferences
    notificationPreferences: {
      applicationUpdates: { type: Boolean, default: true },
      recruiterMessages: { type: Boolean, default: true },
      weeklyInternshipsDigest: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
    privacyPreferences: {
      publicProfile: { type: Boolean, default: true },
      showScoresToRecruiters: { type: Boolean, default: true },
      allowDirectMessages: { type: Boolean, default: true },
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.index({
  name: 'text',
  college: 'text',
  headline: 'text',
  'skills.name': 'text',
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;