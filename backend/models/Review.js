const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Overall rating is required'],
    min: 1,
    max: 10
  },
  feedback: {
    type: String,
    required: [true, 'Feedback is required'],
    maxlength: [3000, 'Feedback cannot exceed 3000 characters']
  },
  criteria: {
    innovation: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    execution: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    presentation: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    documentation: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews
reviewSchema.index({ project: 1, reviewer: 1 }, { unique: true });

// Update project average rating after save
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Project = mongoose.model('Project');
  
  const stats = await Review.aggregate([
    { $match: { project: this.project } },
    {
      $group: {
        _id: '$project',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Project.findByIdAndUpdate(this.project, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
