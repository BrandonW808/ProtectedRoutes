import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// User interface for TypeScript
export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    role: 'admin' | 'user' | 'moderator';
    isActive: boolean;
    isEmailVerified: boolean;
    profilePicture?: string;
    bio?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    getFullName(): string;
}

// User Schema
const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false // Don't return password by default
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters']
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
            enum: ['admin', 'user', 'moderator'],
            default: 'user'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        profilePicture: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters']
        },
        phoneNumber: {
            type: String,
            match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
        },
        dateOfBirth: {
            type: Date,
            validate: {
                validator: function (value: Date) {
                    return value < new Date();
                },
                message: 'Date of birth must be in the past'
            }
        },
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        },
        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Indexes for better query performance
UserSchema.index({ email: 1, username: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Instance method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Instance method to get full name
UserSchema.methods.getFullName = function (): string {
    return `${this.firstName} ${this.lastName}`;
};

// Create and export User model
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
