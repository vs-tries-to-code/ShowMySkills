/**
 * Validates internship fields across COM-002, COM-003 and the posting form:
 * custom department/track, work mode/location, duration, skills and compensation.
 */

export const validateInternshipPayload = (req, res, next) => {
  const { department, track, mode, location, duration, skills, compensationType, stipendMin, stipendMax } = req.body;
  const isCreatePayload = req.method === 'POST' && req.body.role !== undefined;

  // 1. Department validation
  if (department !== undefined && department !== null) {
    if (typeof department !== 'string' || !department.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department cannot be empty',
      });
    }
    if (department.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Department cannot exceed 100 characters',
      });
    }
    req.body.department = department.trim();
  }

  // 2. Track validation
  if (track !== undefined && track !== null) {
    if (typeof track !== 'string' || !track.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Track cannot be empty',
      });
    }
    if (track.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Track cannot exceed 100 characters',
      });
    }
    req.body.track = track.trim();
  }

  // 3. Work Mode & Location validation
  if (mode !== undefined && mode !== null) {
    const normalizedMode = String(mode).trim().toLowerCase();
    if (!['remote', 'onsite', 'hybrid'].includes(normalizedMode)) {
      return res.status(400).json({ success: false, message: 'Work modality must be remote, onsite, or hybrid' });
    }

    if (['onsite', 'hybrid'].includes(normalizedMode)) {
      if (location === undefined || location === null || typeof location !== 'string' || !location.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Location is required for Onsite and Hybrid work modes',
        });
      }
      if (location.trim().length > 150) {
        return res.status(400).json({ success: false, message: 'Location cannot exceed 150 characters' });
      }
      req.body.location = location.trim();
    } else if (normalizedMode === 'remote') {
      req.body.location = '';
    }
    req.body.mode = normalizedMode;
  }

  // 4. Duration validation
  if (isCreatePayload && (duration === undefined || duration === null)) {
    return res.status(400).json({ success: false, message: 'Duration is required' });
  }
  if (duration !== undefined && duration !== null) {
    if (typeof duration !== 'string' || !duration.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Duration cannot be empty',
      });
    }

    const trimmedDuration = duration.trim();
    const durationMatch = trimmedDuration.match(/^(-?\d+(?:\.\d+)?)\s+(weeks?|months?)$/i);
    if (!durationMatch) {
      return res.status(400).json({ success: false, message: 'Duration must be a valid positive value with a unit' });
    }
    if (Number(durationMatch[1]) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be greater than zero',
      });
    }

    req.body.duration = trimmedDuration;
  }

  // 5. Required Skills validation
  if (isCreatePayload || (skills !== undefined && skills !== null)) {
    let skillsList = [];
    if (Array.isArray(skills)) {
      skillsList = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      skillsList = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (skillsList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one required skill must be provided',
      });
    }
    req.body.skills = skillsList;
  }

  // 6. Compensation validation
  if (isCreatePayload || compensationType !== undefined || stipendMin !== undefined || stipendMax !== undefined) {
    const compType = String(compensationType || 'paid').toLowerCase();

    if (compType === 'paid') {
      const min = stipendMin !== undefined && stipendMin !== null && stipendMin !== '' ? Number(stipendMin) : NaN;
      const max = stipendMax !== undefined && stipendMax !== null && stipendMax !== '' ? Number(stipendMax) : NaN;

      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return res.status(400).json({
          success: false,
          message: 'Minimum and maximum monthly stipend amounts are required for Paid internships',
        });
      }

      if (min < 0 || max < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stipend amounts cannot be negative',
        });
      }

      if (max <= min) {
        return res.status(400).json({
          success: false,
          message: 'Maximum stipend must be greater than minimum stipend',
        });
      }

      req.body.compensationType = 'paid';
      req.body.stipendMin = min;
      req.body.stipendMax = max;
      const formatted = `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')} / month`;
      req.body.stipendText = formatted;
      req.body.stipend = formatted;
    } else if (compType === 'unpaid') {
      req.body.compensationType = 'unpaid';
      req.body.stipendMin = 0;
      req.body.stipendMax = 0;
      req.body.stipendText = 'Unpaid';
      req.body.stipend = 'Unpaid';
    } else if (compType === 'flexible') {
      req.body.compensationType = 'flexible';
      const hasMin = stipendMin !== undefined && stipendMin !== null && stipendMin !== '';
      const hasMax = stipendMax !== undefined && stipendMax !== null && stipendMax !== '';

      if (hasMin || hasMax) {
        const min = Number(stipendMin);
        const max = Number(stipendMax);

        if (!Number.isFinite(min) || !Number.isFinite(max)) {
          return res.status(400).json({
            success: false,
            message: 'Both minimum and maximum stipend amounts must be specified if entered',
          });
        }

        if (min < 0 || max < 0) {
          return res.status(400).json({
            success: false,
            message: 'Stipend amounts cannot be negative',
          });
        }

        if (max <= min) {
          return res.status(400).json({
            success: false,
            message: 'Maximum stipend must be greater than minimum stipend',
          });
        }

        req.body.stipendMin = min;
        req.body.stipendMax = max;
        const formatted = `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')} / month (Flexible)`;
        req.body.stipendText = formatted;
        req.body.stipend = formatted;
      } else {
        req.body.stipendMin = 0;
        req.body.stipendMax = 0;
        req.body.stipendText = 'Flexible';
        req.body.stipend = 'Flexible';
      }
    } else {
      return res.status(400).json({ success: false, message: 'Compensation type must be paid, unpaid, or flexible' });
    }
  }

  next();
};
