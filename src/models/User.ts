import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the User interface for TypeScript type safety
export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'manager' | 'staff';
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema with TypeScript typings
const UserSchema: Schema<IUser> = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' }
});

// Pre-save hook to hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
    // Only hash if the password is new or modified
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next();
    } catch (error) {
        next(error as Error); // Type assertion for error handling
    }
});

// Method to compare passwords for login
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Export the model with TypeScript type
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;