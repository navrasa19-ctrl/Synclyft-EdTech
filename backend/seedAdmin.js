const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel.js");

dotenv.config({ quiet: true });

const url = process.env.MONGODB_URL;

const seedAdmin = async () => {
  try {
    const adminEmail = "superadmin@synclyft.in";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Super Admin account already exists.");
      return;
    }

    const password = "SuperAdmin@123";
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "super-admin",
      organization: "Synclyft - EdTech",
      isEmailVerified: true,
      status: "Approved",
      approvedAt: new Date(),
    });

    console.log("Super Admin Account Seeded Successfully");
  } catch (err) {
    console.log("SeedAdmin Operation Failed!");
    console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

mongoose
  .connect(url)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    seedAdmin();
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });