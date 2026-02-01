import mongoose from 'mongoose';

const inspectionSchema = new mongoose.Schema({
    inspectionId: {
        type: String,
        required: [true, 'Inspection ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    panel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Panel'
        // Made optional for drone-based inspections that may cover multiple panels
    },
    panels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Panel'
        // Array of panels for multi-panel inspections
    }],
    inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // Made optional for AI-based inspections
    },
    inspectionDate: {
        type: Date,
        required: [true, 'Inspection date is required'],
        default: Date.now
    },
    inspectionType: {
        type: String,
        enum: ['routine', 'maintenance', 'emergency', 'warranty', 'performance'],
        default: 'routine'
        // Made optional - defaults to 'routine' for AI-based inspections
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled',
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
        required: true
    },
    weather: {
        temperature: {
            type: Number,
            min: [-50, 'Temperature seems too low'],
            max: [70, 'Temperature seems too high']
        },
        humidity: {
            type: Number,
            min: [0, 'Humidity cannot be negative'],
            max: [100, 'Humidity cannot exceed 100%']
        },
        windSpeed: {
            type: Number,
            min: [0, 'Wind speed cannot be negative']
        },
        conditions: {
            type: String,
            enum: ['sunny', 'cloudy', 'overcast', 'rainy', 'snowy', 'foggy', 'windy']
        },
        irradiance: {
            type: Number,
            min: [0, 'Irradiance cannot be negative']
        }
    },
    visualInspection: {
        overallCondition: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor', 'critical']
            // Made optional for AI-based inspections
        },
        cleanliness: {
            type: String,
            enum: ['clean', 'slightly_dirty', 'dirty', 'very_dirty']
            // Made optional for AI-based inspections
        },
        physicalDamage: {
            cracks: {
                present: { type: Boolean, default: false },
                severity: { type: String, enum: ['minor', 'moderate', 'severe'] },
                location: { type: String },
                count: { type: Number, min: 0 }
            },
            chips: {
                present: { type: Boolean, default: false },
                severity: { type: String, enum: ['minor', 'moderate', 'severe'] },
                location: { type: String },
                count: { type: Number, min: 0 }
            },
            delamination: {
                present: { type: Boolean, default: false },
                severity: { type: String, enum: ['minor', 'moderate', 'severe'] },
                location: { type: String }
            },
            corrosion: {
                present: { type: Boolean, default: false },
                severity: { type: String, enum: ['minor', 'moderate', 'severe'] },
                location: { type: String }
            },
            discoloration: {
                present: { type: Boolean, default: false },
                severity: { type: String, enum: ['minor', 'moderate', 'severe'] },
                location: { type: String }
            }
        },
        connections: {
            condition: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor', 'critical']
                // Made optional for AI-based inspections
            },
            tightness: {
                type: String,
                enum: ['tight', 'loose', 'very_loose']
                // Made optional for AI-based inspections
            },
            corrosion: {
                type: Boolean,
                default: false
            }
        },
        mounting: {
            condition: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor', 'critical']
                // Made optional for AI-based inspections
            },
            stability: {
                type: String,
                enum: ['stable', 'slightly_loose', 'loose', 'unstable']
                // Made optional for AI-based inspections
            }
        }
    },
    electricalTesting: {
        voltage: {
            measured: { type: Number },
            expected: { type: Number },
            withinRange: { type: Boolean }
        },
        current: {
            measured: { type: Number },
            expected: { type: Number },
            withinRange: { type: Boolean }
        },
        power: {
            measured: { type: Number },
            expected: { type: Number },
            withinRange: { type: Boolean }
        },
        resistance: {
            insulation: { type: Number },
            ground: { type: Number }
        },
        continuity: {
            type: Boolean,
            default: true
        }
    },
    thermalImaging: {
        conducted: {
            type: Boolean,
            default: false
        },
        hotSpots: [{
            location: { type: String },
            temperature: { type: Number },
            severity: { type: String, enum: ['minor', 'moderate', 'severe'] }
        }],
        averageTemperature: {
            type: Number
        },
        maxTemperature: {
            type: Number
        },
        imageUrl: {
            type: String
        }
    },
    aiAnalysis: {
        conducted: {
            type: Boolean,
            default: false
        },
        confidence: {
            type: Number,
            min: [0, 'Confidence cannot be negative'],
            max: [100, 'Confidence cannot exceed 100%']
        },
        detectedDefects: [{
            type: {
                type: String,
                enum: ['crack', 'hotspot', 'soiling', 'shading', 'corrosion', 'delamination', 'other']
            },
            confidence: {
                type: Number,
                min: [0, 'Confidence cannot be negative'],
                max: [100, 'Confidence cannot exceed 100%']
            },
            location: {
                x: { type: Number },
                y: { type: Number },
                width: { type: Number },
                height: { type: Number }
            },
            severity: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical']
            }
        }],
        processedImageUrl: {
            type: String
        },
        rawImageUrl: {
            type: String
        }
    },
    findings: [{
        category: {
            type: String,
            enum: ['visual', 'electrical', 'thermal', 'performance', 'safety', 'other']
            // Made optional for AI-based inspections
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters']
            // Made optional for AI-based inspections
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
            // Made optional for AI-based inspections
        },
        recommendation: {
            type: String,
            maxlength: [500, 'Recommendation cannot exceed 500 characters']
        },
        images: [String] // URLs to images
    }],
    recommendations: [{
        action: {
            type: String,
            maxlength: [200, 'Action cannot exceed 200 characters']
            // Made optional for AI-based inspections
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
            // Made optional for AI-based inspections
        },
        estimatedCost: {
            type: Number,
            min: [0, 'Cost cannot be negative']
        },
        timeframe: {
            type: String,
            enum: ['immediate', 'within_week', 'within_month', 'within_quarter', 'annual']
        }
    }],
    overallRating: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'critical']
        // Made optional for AI-based inspections
    },
    healthScore: {
        type: Number,
        min: [0, 'Health score cannot be negative'],
        max: [100, 'Health score cannot exceed 100']
        // Made optional for AI-based inspections
    },
    nextInspectionDate: {
        type: Date
        // Made optional for AI-based inspections
    },
    images: [String], // URLs to inspection images
    documents: [String], // URLs to related documents
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    duration: {
        type: Number, // Duration in minutes
        min: [0, 'Duration cannot be negative']
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
inspectionSchema.index({ inspectionId: 1 });
inspectionSchema.index({ panel: 1 });
inspectionSchema.index({ inspector: 1 });
inspectionSchema.index({ inspectionDate: -1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ priority: 1 });
inspectionSchema.index({ overallRating: 1 });
inspectionSchema.index({ healthScore: 1 });
inspectionSchema.index({ nextInspectionDate: 1 });

// Pre-save middleware to set completedAt when status changes to completed
inspectionSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    next();
});

// Virtual for inspection age
inspectionSchema.virtual('ageInDays').get(function() {
    return Math.floor((Date.now() - this.inspectionDate) / (1000 * 60 * 60 * 24));
});

// Virtual for critical findings count
inspectionSchema.virtual('criticalFindingsCount').get(function() {
    return this.findings?.filter(finding => finding.severity === 'critical').length || 0;
});

// Virtual for high priority findings count
inspectionSchema.virtual('highPriorityFindingsCount').get(function() {
    return this.findings?.filter(finding => finding.severity === 'high').length || 0;
});

// Static method to find by status
inspectionSchema.statics.findByStatus = function(status) {
    return this.find({ status });
};

// Static method to find overdue inspections
inspectionSchema.statics.findOverdue = function() {
    return this.find({
        nextInspectionDate: { $lt: new Date() },
        status: { $ne: 'completed' }
    });
};

// Static method to find by inspector
inspectionSchema.statics.findByInspector = function(inspectorId) {
    return this.find({ inspector: inspectorId });
};

// Static method to find critical inspections
inspectionSchema.statics.findCritical = function() {
    return this.find({
        $or: [
            { priority: 'critical' },
            { overallRating: 'critical' },
            { healthScore: { $lt: 30 } }
        ]
    });
};

// Ensure virtual fields are serialized
inspectionSchema.set('toJSON', { virtuals: true });

const Inspection = mongoose.model('Inspection', inspectionSchema);

export default Inspection;
