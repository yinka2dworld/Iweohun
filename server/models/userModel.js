import mongoose from 'mongoose';

const { Schema } = mongoose;

const creatorProfileSchema = new Schema(
  {
    country: { type: String, trim: true },
    currency: { type: String, trim: true, uppercase: true },
    paymentMethod: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    swiftCode: { type: String, trim: true, uppercase: true },
    taxId: { type: String, trim: true },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ['none', 'pending', 'active'],
      default: 'none',
    },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    profilePhoto: {
      type: String,
      trim: true,
    },

    fullName: {
      type: String,
      trim: true,
    },

    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [40, 'Username must be at most 40 characters'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },

    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },

    country: {
      type: String,
      trim: true,
    },

    preferredLanguage: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ['admin', 'user', 'creator', 'superAdmin'],
      default: 'user',
      required: true,
    },

    activityStatus: {
      type: String,
      enum: ['isSuspended', 'isPermited'],
      default: 'isPermited',
      required: true,
    },

    creatorProfile: {
      type: creatorProfileSchema,
      default: undefined,
    },
  },
  { timestamps: true }
);

// Never serialize the password hash, even if it was explicitly selected.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
