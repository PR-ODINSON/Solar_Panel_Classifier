import mongoose from 'mongoose';

const defectSchema = new mongoose.Schema({
    defectId: {
        type: String,
        required: [true, 'Defect ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    panel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Panel'
        // Made optional for AI-detected defects where panel may not be in database yet
    },
    inspection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inspection'
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // Made optional for AI-detected defects
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    detectedDate: {
        type: Date,
        required: [true, 'Detection date is required'],
        default: Date.now
    },
    defectType: {
        type: String,
        enum: [
            'crack',
            'hotspot',
            'soiling',
            'shading',
            'corrosion',
            'delamination',
            'discoloration',
            'burn_mark',
            'cell_failure',
            'junction_box_issue',
            'wiring_issue',
            'mounting_issue',
            'glass_breakage',
            'frame_damage',
            'other'
        ],
        required: [true, 'Defect type is required']
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: [true, 'Severity is required']
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed', 'deferred'],
        default: 'open',
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: [true, 'Priority is required']
    },
    location: {
        description: {
            type: String,
            required: [true, 'Location description is required'],
            maxlength: [200, 'Location description cannot exceed 200 characters']
        },
        coordinates: {
            x: { type: Number },
            y: { type: Number },
            width: { type: Number },
            height: { type: Number }
        },
        cellPosition: {
            row: { type: Number },
            column: { type: Number }
        }
    },
    description: {
        type: String,
        required: [true, 'Defect description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    symptoms: [{
        type: String,
        maxlength: [200, 'Symptom cannot exceed 200 characters']
    }],
    rootCause: {
        type: String,
        maxlength: [500, 'Root cause cannot exceed 500 characters']
    },
    impact: {
        powerLoss: {
            type: Number,
            min: [0, 'Power loss cannot be negative'],
            max: [100, 'Power loss cannot exceed 100%']
        },
        efficiencyReduction: {
            type: Number,
            min: [0, 'Efficiency reduction cannot be negative'],
            max: [100, 'Efficiency reduction cannot exceed 100%']
        },
        estimatedCost: {
            type: Number,
            min: [0, 'Estimated cost cannot be negative']
        },
        safetyRisk: {
            type: String,
            enum: ['none', 'low', 'medium', 'high', 'critical']
        }
    },
    detectionMethod: {
        type: String,
        enum: ['visual_inspection', 'thermal_imaging', 'electrical_testing', 'ai_analysis', 'performance_monitoring', 'routine_maintenance', 'other'],
        required: [true, 'Detection method is required']
    },
    aiAnalysis: {
        confidence: {
            type: Number,
            min: [0, 'Confidence cannot be negative'],
            max: [100, 'Confidence cannot exceed 100%']
        },
        algorithm: {
            type: String
        },
        modelVersion: {
            type: String
        },
        processedImageUrl: {
            type: String
        }
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['visible', 'thermal', 'processed', 'before', 'after'],
            default: 'visible'
        },
        description: {
            type: String,
            maxlength: [200, 'Image description cannot exceed 200 characters']
        },
        capturedDate: {
            type: Date,
            default: Date.now
        }
    }],
    resolution: {
        method: {
            type: String,
            enum: ['repair', 'replacement', 'cleaning', 'adjustment', 'monitoring', 'deferred', 'no_action_required']
        },
        description: {
            type: String,
            maxlength: [1000, 'Resolution description cannot exceed 1000 characters']
        },
        cost: {
            type: Number,
            min: [0, 'Cost cannot be negative']
        },
        timeSpent: {
            type: Number, // Time in minutes
            min: [0, 'Time spent cannot be negative']
        },
        partsUsed: [{
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            cost: { type: Number, min: 0 }
        }],
        resolvedDate: {
            type: Date
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verificationDate: {
            type: Date
        }
    },
    followUp: {
        required: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date
        },
        notes: {
            type: String,
            maxlength: [500, 'Follow-up notes cannot exceed 500 characters']
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    warranty: {
        covered: {
            type: Boolean,
            default: false
        },
        claimNumber: {
            type: String,
            trim: true
        },
        claimStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'processing']
        }
    },
    notes: [{
        text: {
            type: String,
            required: [true, 'Note text is required'],
            maxlength: [500, 'Note cannot exceed 500 characters']
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [String],
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringPattern: {
        type: String,
        enum: ['weekly', 'monthly', 'seasonal', 'annual']
    },
    observations: [{
        text: {
            type: String,
            required: [true, 'Observation text is required']
        },
        images: [{
            type: String
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
defectSchema.index({ defectId: 1 });
defectSchema.index({ panel: 1 });
defectSchema.index({ inspection: 1 });
defectSchema.index({ reportedBy: 1 });
defectSchema.index({ assignedTo: 1 });
defectSchema.index({ detectedDate: -1 });
defectSchema.index({ defectType: 1 });
defectSchema.index({ severity: 1 });
defectSchema.index({ status: 1 });
defectSchema.index({ priority: 1 });
defectSchema.index({ 'resolution.resolvedDate': -1 });

// Pre-save middleware to set resolved date when status changes to resolved
defectSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'resolved' && !this.resolution.resolvedDate) {
        this.resolution.resolvedDate = new Date();
    }
    next();
});

// Virtual for age in days
defectSchema.virtual('ageInDays').get(function() {
    return Math.floor((Date.now() - this.detectedDate) / (1000 * 60 * 60 * 24));
});

// Virtual for resolution time in days
defectSchema.virtual('resolutionTimeInDays').get(function() {
    if (!this.resolution.resolvedDate) return null;
    return Math.floor((this.resolution.resolvedDate - this.detectedDate) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue (based on priority)
defectSchema.virtual('isOverdue').get(function() {
    if (this.status === 'resolved' || this.status === 'closed') return false;
    
    const daysSinceDetection = this.ageInDays;
    const thresholds = {
        critical: 1,
        high: 7,
        medium: 30,
        low: 90
    };
    
    return daysSinceDetection > thresholds[this.priority];
});

// Static method to find by status
defectSchema.statics.findByStatus = function(status) {
    return this.find({ status });
};

// Static method to find by severity
defectSchema.statics.findBySeverity = function(severity) {
    return this.find({ severity });
};

// Static method to find critical defects
defectSchema.statics.findCritical = function() {
    return this.find({
        $or: [
            { severity: 'critical' },
            { priority: 'critical' }
        ],
        status: { $nin: ['resolved', 'closed'] }
    });
};

// Static method to find overdue defects
defectSchema.statics.findOverdue = function() {
    const now = new Date();
    return this.find({
        status: { $nin: ['resolved', 'closed'] },
        $or: [
            {
                priority: 'critical',
                detectedDate: { $lt: new Date(now - 24 * 60 * 60 * 1000) } // 1 day
            },
            {
                priority: 'high',
                detectedDate: { $lt: new Date(now - 7 * 24 * 60 * 60 * 1000) } // 7 days
            },
            {
                priority: 'medium',
                detectedDate: { $lt: new Date(now - 30 * 24 * 60 * 60 * 1000) } // 30 days
            },
            {
                priority: 'low',
                detectedDate: { $lt: new Date(now - 90 * 24 * 60 * 60 * 1000) } // 90 days
            }
        ]
    });
};

// Static method to find by panel
defectSchema.statics.findByPanel = function(panelId) {
    return this.find({ panel: panelId });
};

// Static method to find by assigned technician
defectSchema.statics.findByAssignedTo = function(userId) {
    return this.find({ assignedTo: userId });
};

// Ensure virtual fields are serialized
defectSchema.set('toJSON', { virtuals: true });

const Defect = mongoose.model('Defect', defectSchema);

export default Defect;
