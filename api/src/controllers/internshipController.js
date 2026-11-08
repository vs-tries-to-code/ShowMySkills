import {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
} from '../services/internshipService.js';

export const listInternships = async (req, res, next) => {
  try {
    const result = await getInternships(req.query);

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const internshipDetails = async (req, res, next) => {
  try {
    const internship = await getInternshipById(req.params.id);

    return res.status(200).json({
      success: true,
      data: internship,
    });
  } catch (error) {
    next(error);
  }
};

export const createNewInternship = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const internship = await createInternship(req.body, userId);

    return res.status(201).json({
      success: true,
      message: 'Internship posting created successfully',
      data: internship,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExistingInternship = async (req, res, next) => {
  try {
    const existing = await getInternshipById(req.params.id);

    // Company-level authorization: companies can only manage their own postings
    if (req.user && req.user.role === 'company') {
      const isOwner =
        existing.postedBy && existing.postedBy.toString() === req.user.id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only manage your own internship postings',
        });
      }
    }

    const updated = await updateInternship(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Internship posting updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeInternship = async (req, res, next) => {
  try {
    const existing = await getInternshipById(req.params.id);

    // Company-level authorization: companies can only delete their own postings
    if (req.user && req.user.role === 'company') {
      const isOwner =
        existing.postedBy && existing.postedBy.toString() === req.user.id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only delete your own internship postings',
        });
      }
    }

    // Do not allow deleting an Open/Active posting through a bypass of the UI restriction
    if (existing.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active internship posting. Please close the posting before deleting.',
      });
    }

    await deleteInternship(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Internship posting removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
