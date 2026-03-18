// src/models/Plan.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PlanSchema = new Schema({
  planType: { 
    type: String, 
    enum: ['daily', 'weekly', 'quarterly'], 
    required: true 
  },
  title: { type: String },
  description: { type: String },
  // For daily plans
  date: { type: Date },
  startTime: { type: String },
  endTime: { type: String },
  location: { type: String },
  client: { type: Schema.Types.ObjectId, ref: 'User' },
  activity: { type: String },
  activityPlanned: { type: String },
  technicalApproach: { type: String },
  inputs: { type: String }, // resources & tools
  output: { type: String }, // success metrics
  outcome: { type: String },
  resources: { type: String },
  personnel: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  remarks: { type: String },
  // Comments from super admin
  comments: [{
    text: { type: String, required: true },
    commentedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  // For weekly plans - contains multiple daily plans
  dailyPlans: [{ type: Schema.Types.ObjectId, ref: 'Plan' }],
  // For quarterly plans - contains multiple weekly plans
  weeklyPlans: [{ type: Schema.Types.ObjectId, ref: 'Plan' }],
  // Status
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'cancelled'], 
    default: 'draft' 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

// Auto-generate plan number
PlanSchema.pre('save', async function (next) {
  try {
    if (this.isNew && !this.planNumber) {
      const count = await mongoose.model('Plan').countDocuments();
      const nextNumber = count + 1;
      const prefix = this.planType === 'daily' ? 'DLY' : this.planType === 'weekly' ? 'WKY' : 'QTR';
      this.planNumber = `${prefix}-${nextNumber.toString().padStart(5, '0')}`;
    }
    next();
  } catch (err) {
    console.error('Pre-save error for plan:', err);
    next(err);
  }
});

module.exports = mongoose.model('Plan', PlanSchema);
