import mongoose from 'mongoose';

const panelSchema = new mongoose.Schema({
    panelId: {
        type: String,
        required: [true, 'Panel ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    serialNumber: {
        type: String,
        required: [true, 'Serial number is required'],
        unique: true,
        trim: true
    },
    manufacturer: {
        type: String,
        required: [true, 'Manufacturer is required'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true
    },
    wattage: {
        type: Number,
        required: [true, 'Wattage is required'],
        min: [1, 'Wattage must be positive']
    },
    voltage: {
        type: Number,
        required: [true, 'Voltage is required'],
        min: [1, 'Voltage must be positive']
    },
    current: {
        type: Number,
        required: [true, 'Current is required'],
        min: [0, 'Current cannot be negative']
    },
    efficiency: {
        type: Number,
        min: [0, 'Efficiency cannot be negative'],
        max: [100, 'Efficiency cannot exceed 100%']
    },
    location: {
        coordinates: {
            latitude: {
                type: Number,
                required: [true, 'Latitude is required'],
                min: [-90, 'Latitude must be between -90 and 90'],
                max: [90, 'Latitude must be between -90 and 90']
            },
            longitude: {
                type: Number,
                required: [true, 'Longitude is required'],
                min: [-180, 'Longitude must be between -180 and 180'],
                max: [180, 'Longitude must be between -180 and 180']
            }
        },
        address: {
            type: String,
            trim: true
        },
        site: {
            type: String,
            required: [true, 'Site is required'],
            trim: true
        },
        zone: {
            type: String,
            trim: true
        },
        row: {
            type: String,
            trim: true
        },
        position: {
            type: String,
            trim: true
        }
    },
    installationDate: {
        type: Date,
        required: [true, 'Installation date is required']
    },
    warrantyExpiry: {
        type: Date,
        required: [true, 'Warranty expiry date is required']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance', 'defective', 'decommissioned'],
        default: 'active',
        required: true
    },
    healthScore: {
        type: Number,
        min: [0, 'Health score cannot be negative'],
        max: [100, 'Health score cannot exceed 100'],
        default: 100
    },
    lastInspectionDate: {
        type: Date
    },
    nextInspectionDate: {
        type: Date
    },
    maintenanceSchedule: {
        frequency: {
            type: String,
            enum: ['weekly', 'monthly', 'quarterly', 'semi-annual', 'annual'],
            default: 'quarterly'
        },
        lastMaintenance: {
            type: Date
        },
        nextMaintenance: {
            type: Date
        }
    },
    performance: {
        currentOutput: {
            type: Number,
            min: [0, 'Current output cannot be negative']
        },
        expectedOutput: {
            type: Number,
            min: [0, 'Expected output cannot be negative']
        },
        performanceRatio: {
            type: Number,
            min: [0, 'Performance ratio cannot be negative'],
            max: [200, 'Performance ratio seems too high']
        },
        energyGenerated: {
            daily: { type: Number, default: 0 },
            monthly: { type: Number, default: 0 },
            yearly: { type: Number, default: 0 },
            lifetime: { type: Number, default: 0 }
        }
    },
    specifications: {
        dimensions: {
            length: { type: Number, min: [0, 'Length cannot be negative'] },
            width: { type: Number, min: [0, 'Width cannot be negative'] },
            thickness: { type: Number, min: [0, 'Thickness cannot be negative'] }
        },
        weight: {
            type: Number,
            min: [0, 'Weight cannot be negative']
        },
        cellType: {
            type: String,
            enum: ['monocrystalline', 'polycrystalline', 'thin-film', 'other']
        },
        frameColor: {
            type: String,
            trim: true
        },
        certifications: [String]
    },
    assignedTechnician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

// Indexes
panelSchema.index({ panelId: 1 });
panelSchema.index({ serialNumber: 1 });
panelSchema.index({ status: 1 });
panelSchema.index({ 'location.site': 1 });
panelSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
panelSchema.index({ healthScore: 1 });
panelSchema.index({ lastInspectionDate: 1 });
panelSchema.index({ nextInspectionDate: 1 });
panelSchema.index({ assignedTechnician: 1 });

// Virtual for age in days
panelSchema.virtual('ageInDays').get(function() {
    return Math.floor((Date.now() - this.installationDate) / (1000 * 60 * 60 * 24));
});

// Virtual for warranty status
panelSchema.virtual('warrantyStatus').get(function() {
    return this.warrantyExpiry > new Date() ? 'active' : 'expired';
});

// Virtual for performance percentage
panelSchema.virtual('performancePercentage').get(function() {
    if (!this.performance.currentOutput || !this.performance.expectedOutput) return null;
    return Math.round((this.performance.currentOutput / this.performance.expectedOutput) * 100);
});

// Static method to find panels by status
panelSchema.statics.findByStatus = function(status) {
    return this.find({ status });
};

// Static method to find panels needing inspection
panelSchema.statics.findNeedingInspection = function() {
    return this.find({
        $or: [
            { nextInspectionDate: { $lte: new Date() } },
            { nextInspectionDate: null }
        ]
    });
};

// Static method to find panels by site
panelSchema.statics.findBySite = function(site) {
    return this.find({ 'location.site': site });
};

// Ensure virtual fields are serialized
panelSchema.set('toJSON', { virtuals: true });

const Panel = mongoose.model('Panel', panelSchema);

export default Panel;
