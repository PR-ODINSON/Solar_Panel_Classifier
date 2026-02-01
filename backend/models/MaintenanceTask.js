import mongoose from 'mongoose';

const maintenanceTaskSchema = new mongoose.Schema({
    taskId: {
        type: String,
        required: [true, 'Task ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Task description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
        type: String,
        enum: ['preventive', 'corrective', 'emergency', 'inspection', 'cleaning', 'repair', 'replacement', 'calibration'],
        required: [true, 'Task type is required']
    },
    category: {
        type: String,
        enum: ['electrical', 'mechanical', 'cleaning', 'inspection', 'safety', 'performance', 'other'],
        required: [true, 'Task category is required']
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: [true, 'Priority is required']
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'],
        default: 'pending',
        required: true
    },
    panel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Panel'
    },
    panels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Panel'
    }],
    relatedDefect: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Defect'
    },
    relatedInspection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inspection'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator reference is required']
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedTeam: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    estimatedDuration: {
        type: Number, // Duration in minutes
        min: [1, 'Estimated duration must be at least 1 minute']
    },
    actualDuration: {
        type: Number, // Duration in minutes
        min: [0, 'Actual duration cannot be negative']
    },
    location: {
        site: {
            type: String,
            required: [true, 'Site is required'],
            trim: true
        },
        zone: {
            type: String,
            trim: true
        },
        specificLocation: {
            type: String,
            trim: true,
            maxlength: [200, 'Specific location cannot exceed 200 characters']
        }
    },
    requiredSkills: [{
        type: String,
        enum: ['electrical', 'mechanical', 'thermal_imaging', 'safety', 'climbing', 'diagnostics', 'cleaning', 'welding']
    }],
    requiredTools: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        },
        available: {
            type: Boolean,
            default: true
        }
    }],
    requiredParts: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        partNumber: {
            type: String,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        estimatedCost: {
            type: Number,
            min: 0
        },
        available: {
            type: Boolean,
            default: false
        }
    }],
    safetyRequirements: [{
        type: String,
        enum: ['ppe', 'lockout_tagout', 'confined_space', 'height_safety', 'electrical_safety', 'hot_work_permit']
    }],
    workSteps: [{
        stepNumber: {
            type: Number,
            required: true,
            min: 1
        },
        description: {
            type: String,
            required: true,
            maxlength: [300, 'Step description cannot exceed 300 characters']
        },
        estimatedTime: {
            type: Number, // Time in minutes
            min: 0
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date
        },
        notes: {
            type: String,
            maxlength: [200, 'Step notes cannot exceed 200 characters']
        }
    }],
    progress: {
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    results: {
        outcome: {
            type: String,
            enum: ['successful', 'partially_successful', 'failed', 'deferred']
        },
        description: {
            type: String,
            maxlength: [1000, 'Results description cannot exceed 1000 characters']
        },
        issuesEncountered: [{
            description: {
                type: String,
                required: true,
                maxlength: [300, 'Issue description cannot exceed 300 characters']
            },
            resolution: {
                type: String,
                maxlength: [300, 'Resolution cannot exceed 300 characters']
            }
        }],
        followUpRequired: {
            type: Boolean,
            default: false
        },
        followUpDate: {
            type: Date
        },
        followUpNotes: {
            type: String,
            maxlength: [500, 'Follow-up notes cannot exceed 500 characters']
        }
    },
    costs: {
        labor: {
            type: Number,
            min: 0,
            default: 0
        },
        parts: {
            type: Number,
            min: 0,
            default: 0
        },
        tools: {
            type: Number,
            min: 0,
            default: 0
        },
        other: {
            type: Number,
            min: 0,
            default: 0
        },
        total: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['before', 'during', 'after', 'issue', 'completion'],
            default: 'during'
        },
        description: {
            type: String,
            maxlength: [200, 'Image description cannot exceed 200 characters']
        },
        capturedAt: {
            type: Date,
            default: Date.now
        }
    }],
    documents: [{
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['checklist', 'procedure', 'safety_sheet', 'warranty', 'invoice', 'report', 'other'],
            default: 'other'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
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
        },
        type: {
            type: String,
            enum: ['general', 'issue', 'progress', 'completion'],
            default: 'general'
        }
    }],
    observations: [{
        text: {
            type: String,
            maxlength: [1000, 'Observation text cannot exceed 1000 characters']
        },
        images: [{
            url: {
                type: String,
                required: true
            },
            description: {
                type: String,
                maxlength: [200, 'Image description cannot exceed 200 characters']
            },
            capturedAt: {
                type: Date,
                default: Date.now
            }
        }],
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    recurrence: {
        isRecurring: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual']
        },
        nextDueDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    },
    approval: {
        required: {
            type: Boolean,
            default: false
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: {
            type: Date
        },
        approvalNotes: {
            type: String,
            maxlength: [300, 'Approval notes cannot exceed 300 characters']
        }
    }
}, {
    timestamps: true
});

// Indexes
maintenanceTaskSchema.index({ taskId: 1 });
maintenanceTaskSchema.index({ status: 1 });
maintenanceTaskSchema.index({ priority: 1 });
maintenanceTaskSchema.index({ assignedTo: 1 });
maintenanceTaskSchema.index({ createdBy: 1 });
maintenanceTaskSchema.index({ scheduledDate: 1 });
maintenanceTaskSchema.index({ dueDate: 1 });
maintenanceTaskSchema.index({ panel: 1 });
maintenanceTaskSchema.index({ 'location.site': 1 });
maintenanceTaskSchema.index({ type: 1 });
maintenanceTaskSchema.index({ category: 1 });

// Pre-save middleware to update progress and timestamps
maintenanceTaskSchema.pre('save', function(next) {
    // Set startedAt when status changes to in_progress
    if (this.isModified('status') && this.status === 'in_progress' && !this.startedAt) {
        this.startedAt = new Date();
    }
    
    // Set completedAt when status changes to completed
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
        this.progress.percentage = 100;
    }
    
    // Calculate progress based on completed work steps
    if (this.workSteps && this.workSteps.length > 0) {
        const completedSteps = this.workSteps.filter(step => step.completed).length;
        this.progress.percentage = Math.round((completedSteps / this.workSteps.length) * 100);
    }
    
    // Calculate total cost
    this.costs.total = (this.costs.labor || 0) + (this.costs.parts || 0) + (this.costs.tools || 0) + (this.costs.other || 0);
    
    next();
});

// Virtual for age in days
maintenanceTaskSchema.virtual('ageInDays').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days until due
maintenanceTaskSchema.virtual('daysUntilDue').get(function() {
    return Math.floor((this.dueDate - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
maintenanceTaskSchema.virtual('isOverdue').get(function() {
    return this.dueDate < new Date() && this.status !== 'completed' && this.status !== 'cancelled';
});

// Virtual for actual duration in hours
maintenanceTaskSchema.virtual('actualDurationHours').get(function() {
    return this.actualDuration ? Math.round((this.actualDuration / 60) * 100) / 100 : null;
});

// Virtual for estimated duration in hours
maintenanceTaskSchema.virtual('estimatedDurationHours').get(function() {
    return this.estimatedDuration ? Math.round((this.estimatedDuration / 60) * 100) / 100 : null;
});

// Static method to find by status
maintenanceTaskSchema.statics.findByStatus = function(status) {
    return this.find({ status });
};

// Static method to find overdue tasks
maintenanceTaskSchema.statics.findOverdue = function() {
    return this.find({
        dueDate: { $lt: new Date() },
        status: { $nin: ['completed', 'cancelled'] }
    });
};

// Static method to find by assigned technician
maintenanceTaskSchema.statics.findByAssignedTo = function(userId) {
    return this.find({ assignedTo: userId });
};

// Static method to find high priority tasks
maintenanceTaskSchema.statics.findHighPriority = function() {
    return this.find({
        priority: { $in: ['high', 'critical'] },
        status: { $nin: ['completed', 'cancelled'] }
    });
};

// Static method to find tasks due soon (within specified days)
maintenanceTaskSchema.statics.findDueSoon = function(days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.find({
        dueDate: { $lte: futureDate, $gte: new Date() },
        status: { $nin: ['completed', 'cancelled'] }
    });
};

// Static method to find by site
maintenanceTaskSchema.statics.findBySite = function(site) {
    return this.find({ 'location.site': site });
};

// Ensure virtual fields are serialized
maintenanceTaskSchema.set('toJSON', { virtuals: true });

const MaintenanceTask = mongoose.model('MaintenanceTask', maintenanceTaskSchema);

export default MaintenanceTask;
