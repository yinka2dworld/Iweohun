import User from "../models/userModel.js";
import bcrypt from "bcrypt";

export const seedAdmin = async () => {
  try {
    const adminChecker = await User.findOne({ email: "fawazmusty247@gmail.com" });
    if (adminChecker) {
      console.log("Admin user already exists, skipping seed");
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("abc123", saltRounds);

    // Create the admin user object
    const adminUser = {
      username: "adeyinka",
      fullName: "Ajibade Adeyinka",
      phoneNumber: "07085812226",
      email: "fawazmusty247@gmail.com",
      password: hashedPassword,
      role: "superAdmin",
    };

    await User.create(adminUser);

    console.log("Admin user seeded successfully");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  } 
};
