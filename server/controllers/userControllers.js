import User from "../models/userModel.js"
import bcrypt from "bcrypt";
import jwt from'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Error } from "mongoose";

const generateToken = (user) => {
    return jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // Replace with your JWT secret
      { expiresIn: '5h' }
    );
  };

export const signup = async (req, res) => {
  const  { username, phoneNumber, email, password } = req.body;
     try {
        const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
        const hashedPassword = await bcrypt.hash(password, 10);
    
    const signupInfo = await User.create({ username, phoneNumber, email, password: hashedPassword })
    if (!signupInfo) {
       console.error(error)
    }
      return  res.status(201).json({message:'User signup successful'})  
    } catch (error) {
        res.status(400).json({message:'User signup unsuccessful', error})  
    
    }
}

export const login = async (req, res) => {
  const  { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
           if (!user) {
            throw new Error('Incorrect username'); 
             }   
        const passwordMatch = await bcrypt.compare( password, user.password );   
              if (!passwordMatch) {
                throw new Error('Incorrect password'); 
              }
        const token = generateToken(user)
        return  res.status(200).json({message:'User logged successfully', userId: user._id, role: user.role, token });   
      } catch (error) {
        res.status(400).json({message:'login unsuccessful', error}) 
         console.error(error);
      }
}



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
    if (req.user.role != 'superAdmin' || 'admin') {
        throw new Error('You are not authorized to access this.'); 
       }
        const { _id } = req.params
    try {
        const userInfo = await User.findById(_id)
        if (!userInfo) {
            console.error(error)
        }
       return res.status(200).json(userInfo)
    } catch (error) {
        res.status(400).json({message:'Unable to fetch user', error})   
      }
    }


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