import User from "../models/userModel.js"
import bcrypt from "bcrypt";
import jwt from'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Error } from "mongoose";



export const signup = async (req, res) => {
  try {
    const username = req.body.username.trim();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password.trim();
    const phoneNumber = req.body.phoneNumber.trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const signupInfo = await User.create({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    return res.status(201).json({ message: 'User signup successful' });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(400).json({ message: 'User signup unsuccessful', error: error.message });
  }
};



export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    return res.status(200).json({
      message: "Login successful.",
      userId: user._id,
      username: username,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};



export const users = async (req, res) => {
  if (req.user.role != 'superAdmin' || 'admin') {
          throw new Error('You are not authorized to access this.');    
    }
  try {
      const usersInfo = await User.find()
      if (!usersInfo) {
          console.error(error)
      }
    return  res.status(200).json({ usersInfo })  
  } catch (error) {
      res.status(400).json({message:'Unable to fetch users', error})  
  }
}


export const user = async (req, res) => {  
  const { _id } = req.params;
  try {
      const userInfo = await User.findById(_id);
      if (!userInfo) {
          return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(userInfo);
  } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ message: 'Server error while fetching user', error: error.message });
  }
};


export const deleteUser = async (req, res) => { 
    if (req.user.role != 'superAdmin' || 'admin') {
            throw new Error('You are not authorized to access this.');    
        }
    const { _id } = req.params
    try {
        const removeInfo = await User.findByIdAndDelete(_id);
        if (!removeInfo) {
            throw new Error('User deleting was unsuccessful')
        }
        return res.status(200).json({message:'User removed successfully'})
    } catch (error) {
        res.status(400).json({message:'Unable to delete user', error})   
    }
}


export const updateUser = async (req, res) => {
    const { _id } = req.params
    const { username, phoneNumber, email} = req.body;
    try {
        const existingUser = await Book.findById(_id);
        if (!existingUser) {
            throw new Error('User not found')
           }
        const updateInfo = await User.findByIdAndUpdate(
            _id,
             {
                  username: username || existingUser.username,
                  phoneNumber: phoneNumber || existingUser.phoneNumber, 
                  email: email || existingUser.email
                },
              { new: true }
            );
       if (!updateInfo) {
        throw new Error('User updating was unsuccessful')
       }
       return res.status(201).json({message:'User info updated successfully'})
    } catch (error) {
        res.status(400).json({message:'Unable to update user', error}) 
    }
}


// passport.use(
//     new GoogleStrategy(
//       {
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: '/auth/google/callback', // Ensure this matches your Google Cloud setup
//       },
//       async (accessToken, refreshToken, profile, done) => {
//         try {
//           let user = await User.findOne({ email: profile.emails[0].value });
//           if (!user) {
//             user = await User.create({
//               username: profile.displayName,
//               email: profile.emails[0].value,
//               googleId: profile.id,
//             });
//           }
//           return done(null, user);
//         } catch (error) {
//           console.error('Error during Google authentication:', error);
//           return done(error, null);
//         }
//       }
//     )
//   );
  
 
//   export const googleAuth = passport.authenticate('google', {
//     scope: ['profile', 'email'], // Request user profile and email
//   });
  
  
//   export const googleAuthCallback = (req, res, next) => {
//     passport.authenticate('google', { session: false }, (err, user) => {
//       if (err) {
//         console.error('Error during Google authentication callback:', err);
//         return res.status(500).json({ message: 'Internal server error' });
//       }
//       if (!user) {
//         return res.status(400).json({ message: 'Google Authentication Failed' });
//       }
//       const token = generateToken(user);
//       return res.status(200).json({
//         message: 'Google login/signup successful',
//         userId: user._id,
//         role: user.role,
//         token,
//       });
//     })(req, res, next);
//   };
//   passport.serializeUser((user, done) => done(null, user.id));
//   passport.deserializeUser(async (id, done) => {
//     try {
//       const user = await User.findById(id);
//       done(null, user);
//     } catch (error) {
//       done(error, null);
//     }
//   });


export const resetPassword = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(400).json({message:'Unable to reset password', error}) 
    }

}