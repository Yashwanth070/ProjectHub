const Project = require('../models/Project');
const Review = require('../models/Review');
const { validationResult } = require('express-validator');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, status, category, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.submittedBy = req.user.id;
    }

    // Filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('submittedBy', 'name email avatar department')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('submittedBy', 'name email avatar department');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Students can only view their own projects
    if (req.user.role === 'student' && project.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
    }

    const reviews = await Review.find({ project: project._id })
      .populate('reviewer', 'name email avatar');

    res.json({
      success: true,
      data: { ...project.toObject(), reviews }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Student)
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, category, tags, team, githubUrl, liveUrl, abstract } = req.body;

    // Process uploaded files
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    // Parse tags and team if they come as strings
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (tags || []);
    const parsedTeam = typeof team === 'string' ? team.split(',').map(t => t.trim()).filter(Boolean) : (team || []);

    const project = await Project.create({
      title,
      description,
      category,
      submittedBy: req.user.id,
      tags: parsedTags,
      team: parsedTeam,
      files,
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      abstract: abstract || '',
      status: 'submitted'
    });

    await project.populate('submittedBy', 'name email avatar department');

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Owner)
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check ownership
    if (project.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    const { title, description, category, tags, team, githubUrl, liveUrl, abstract } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
    if (abstract !== undefined) updateData.abstract = abstract;
    if (tags) updateData.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    if (team) updateData.team = typeof team === 'string' ? team.split(',').map(t => t.trim()) : team;

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      updateData.files = [...project.files, ...newFiles];
    }

    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('submittedBy', 'name email avatar department');

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Owner or Admin)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    // Delete associated reviews
    await Review.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project status
// @route   PATCH /api/projects/:id/status
// @access  Private (Reviewer, Admin)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'submitted', 'under_review', 'revision_required', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('submittedBy', 'name email avatar department');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats/overview
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.submittedBy = req.user.id;
    }

    const [total, statusCounts, categoryCounts, recentProjects] = await Promise.all([
      Project.countDocuments(query),
      Project.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Project.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Project.find(query)
        .populate('submittedBy', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status category createdAt averageRating')
    ]);

    const statusMap = {};
    statusCounts.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      success: true,
      data: {
        total,
        submitted: statusMap.submitted || 0,
        underReview: statusMap.under_review || 0,
        approved: statusMap.approved || 0,
        rejected: statusMap.rejected || 0,
        revisionRequired: statusMap.revision_required || 0,
        draft: statusMap.draft || 0,
        categoryCounts,
        recentProjects
      }
    });
  } catch (error) {
    next(error);
  }
};
