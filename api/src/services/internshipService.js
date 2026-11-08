import mongoose from 'mongoose';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import InternshipAction from '../models/InternshipAction.js';

export const getInternships = async (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));

  const filter = {};

  // Status filter (defaults to active unless specified e.g. for admin or company)
  if (query.status) {
    if (query.status !== 'all') {
      filter.status = query.status;
    }
  } else {
    filter.status = 'active';
  }

  if (query.mode) {
    const mode = String(query.mode).toLowerCase();
    if (['remote', 'onsite', 'hybrid'].includes(mode)) {
      filter.mode = mode;
    }
  }

  if (query.company) {
    filter.company = new RegExp(String(query.company).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }

  if (query.postedBy) {
    filter.postedBy = query.postedBy;
  }

  if (query.location) {
    filter.location = {
      $regex: String(query.location).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  }

  if (query.department) {
    filter.department = {
      $regex: String(query.department).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  }

  if (query.track) {
    filter.track = {
      $regex: String(query.track).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  }

  if (query.verified === 'true') {
    filter.isVerified = true;
  }

  if (query.featured === 'true') {
    filter.isFeatured = true;
  }

  if (query.skill) {
    filter.skills = {
      $in: [new RegExp(String(query.skill).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')],
    };
  }

  if (query.search) {
    const term = String(query.search).trim().slice(0, 100);
    if (term) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { role: { $regex: escaped, $options: 'i' } },
        { company: { $regex: escaped, $options: 'i' } },
        { skills: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { department: { $regex: escaped, $options: 'i' } },
        { track: { $regex: escaped, $options: 'i' } },
      ];
    }
  }

  const [items, total] = await Promise.all([
    Internship.find(filter)
      .sort({ isFeatured: -1, createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Internship.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  };
};

export const getInternshipById = async (id) => {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    const error = new Error('Invalid internship ID');
    error.statusCode = 400;
    throw error;
  }

  const internship = await Internship.findById(id).lean();
  if (!internship) {
    const error = new Error('Internship not found');
    error.statusCode = 404;
    throw error;
  }
  return internship;
};

export const createInternship = async (data, userId = null) => {
  const payload = { ...data };
  if (typeof payload.department === 'string') {
    payload.department = payload.department.trim();
  }
  if (typeof payload.track === 'string') {
    payload.track = payload.track.trim();
  }

  const newInternship = await Internship.create({
    ...payload,
    postedBy: userId,
    status: payload.status || 'active',
  });
  return newInternship;
};

export const updateInternship = async (id, data) => {
  const updatePayload = { ...data };
  if (typeof updatePayload.department === 'string') {
    updatePayload.department = updatePayload.department.trim();
  }
  if (typeof updatePayload.track === 'string') {
    updatePayload.track = updatePayload.track.trim();
  }

  const updated = await Internship.findByIdAndUpdate(id, { $set: updatePayload }, { new: true });
  if (!updated) {
    const error = new Error('Internship not found');
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

export const deleteInternship = async (id) => {
  const deleted = await Internship.findByIdAndDelete(id);
  if (!deleted) {
    const error = new Error('Internship not found');
    error.statusCode = 404;
    throw error;
  }
  // Permanently remove associated candidate application and action records
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await Application.deleteMany({ internship: id });
    await InternshipAction.deleteMany({ internship: id });
  } else if (typeof Application.deleteMany === 'function' && Application.deleteMany !== mongoose.Model?.deleteMany) {
    await Application.deleteMany({ internship: id });
    await InternshipAction.deleteMany?.({ internship: id });
  }
  return deleted;
};
