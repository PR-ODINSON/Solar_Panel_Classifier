import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    role: {
        type: String,
        enum: ['admin', 'maintenance_staff'],
        default: 'maintenance_staff',
        required: true
    },
    phone: {
        type: String,
        trim: true,
        match: [/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian phone number (+91 followed by 10 digits starting with 6-9)']
    },
    department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department cannot exceed 100 characters']
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    profilePicture: {
        type: String, // URL or file path
        default: null
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
        },
        language: {
            type: String,
            default: 'en'
        }
    },
    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 604800 // 7 days in seconds
        }
    }]
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.refreshTokens;
            return ret;
        }
    }
});

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate full name
userSchema.methods.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

// Static method to find active users
userSchema.statics.findActive = function() {
    return this.find({ isActive: true });
};

// Static method to find by role
userSchema.statics.findByRole = function(role) {
    return this.find({ role, isActive: true });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;
