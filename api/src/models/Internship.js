import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    companyLogoText: {
      type: String,
      default: '',
    },
    companyLogoSubText: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    mode: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'remote',
    },
    posterImage: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    track: {
      type: String,
      default: '',
      trim: true,
    },
    compensationType: {
      type: String,
      enum: ['paid', 'unpaid', 'flexible'],
      default: 'paid',
    },
    stipend: {
      type: String,
      default: '',
    },
    stipendMin: {
      type: Number,
      default: 0,
      min: 0,
    },
    stipendMax: {
      type: Number,
      default: 0,
      min: 0,
    },
    stipendText: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    employmentType: {
      type: String,
      default: 'Full time',
    },
    jobType: {
      type: String,
      default: 'Full time',
    },
    description: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      default: '',
    },
    perks: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft', 'pending_review', 'suspended'],
      default: 'active',
    },
    applicationUrl: {
      type: String,
      default: '',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

internshipSchema.index({
  company: 'text',
  role: 'text',
  skills: 'text',
  description: 'text',
});

internshipSchema.index({ department: 1 });
internshipSchema.index({ track: 1 });

export const Internship = mongoose.models.Internship || mongoose.model('Internship', internshipSchema);
export default Internship;
