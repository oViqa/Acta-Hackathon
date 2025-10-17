import mongoose, { Schema, Document, Model } from 'mongoose';

// Prevent model overwrite on hot reloads (important when running dev server)
const MODEL_NAME = 'User';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string | null;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required.']
  },
  name: {
    type: String,
    required: [true, 'Name is required.'],
    trim: true
  },
  avatarUrl: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Ensure updatedAt/createdAt fields are handled by mongoose
});

// For dev/hot-reload: prevent model compilation errors
export const User: Model<IUser> =
  mongoose.models[MODEL_NAME] || mongoose.model<IUser>(MODEL_NAME, UserSchema);
