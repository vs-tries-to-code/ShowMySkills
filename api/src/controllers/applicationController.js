import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const applicationController = {
  // Student applies to an internship
  apply: async (req, res, next) => {
    try {
      const studentId = req.user.id;
      const { internshipId, notes = '' } = req.body;

      if (!internshipId) {
        return res.status(400).json({ success: false, message: 'internshipId is required' });
      }

      const [internship, student] = await Promise.all([
        Internship.findById(internshipId),
        User.findById(studentId),
      ]);

      if (!internship) {
        return res.status(404).json({ success: false, message: 'Internship not found' });
      }

      const existing = await Application.findOne({
        internship: internshipId,
        student: studentId,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'You have already submitted an application for this role.',
        });
      }

      const candidateSnapshot = {
        name: student.name,
        email: student.email,
        phone: student.phone || '',
        college: student.college || '',
        department: student.branch || student.course || '',
        score: student.reputationScore ?? 0,
        avatar: student.profileIcon || null,
        skills: student.skills?.map((s) => s.name) || student.primarySkills || [],
        portfolioUrl: student.portfolioUrl || '',
        resumeUrl: student.resumeUrl || '',
      };

      const application = await Application.create({
        internship: internshipId,
        student: studentId,
        company: internship.postedBy,
        roleTitle: internship.role,
        companyName: internship.company,
        candidateSnapshot,
        notes,
        status: 'applied',
      });

      // Increment applicants count on internship
      await Internship.findByIdAndUpdate(internshipId, { $inc: { applicantsCount: 1 } });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  },

  // Student gets their submitted applications
  getMyApplications: async (req, res, next) => {
    try {
      const studentId = req.user.id;
      const applications = await Application.find({ student: studentId })
        .populate('internship')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  },

  // Company gets applications submitted for their postings
  getCompanyApplications: async (req, res, next) => {
    try {
      const { status, search, role } = req.query;
      const filter = {};

      if (req.user.role === 'company') {
        filter.company = req.user.id;
      }

      if (status && status !== 'all') {
        filter.status = status;
      }

      if (role) {
        filter.roleTitle = new RegExp(role, 'i');
      }

      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { 'candidateSnapshot.name': regex },
          { 'candidateSnapshot.college': regex },
          { roleTitle: regex },
          { 'candidateSnapshot.skills': regex },
        ];
      }

      const applications = await Application.find(filter)
        .populate('internship')
        .populate('student', '-password')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  },

  // Recruiter or Admin updates candidate status & notes
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, notes, interviewDate } = req.body;

      if (!['company', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only the associated company or an admin can update application status',
        });
      }

      const application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      if (
        req.user.role === 'company' &&
        String(application.company) !== String(req.user.id)
      ) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      const previousStatus = application.status;

      if (status) application.status = status;
      if (notes !== undefined) application.notes = notes;
      if (interviewDate) application.interviewDate = new Date(interviewDate);
      await application.save();

      if (status && status !== previousStatus) {
        const readableStatus = application.status.replaceAll('_', ' ');
        await Notification.create({
          user: application.student,
          title: 'Application status updated',
          desc: `${application.companyName} updated your application for ${application.roleTitle} to ${readableStatus}.`,
          type: 'application',
          link: '/student/applications',
        });
      }

      res.json({
        success: true,
        message: `Candidate status updated to ${application.status}`,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  },
};
