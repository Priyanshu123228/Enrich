import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const manageAdmin = async () => {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase()?.trim();

  const printHelp = () => {
    console.log(`
======================================================
  Enrich Beauty Parlour & Cosmetic Clinic Admin Account Management Utility
======================================================

1. List all current Admins:
   node src/scripts/createAdmin.js --list

2. Remove / Delete an Admin account:
   node src/scripts/createAdmin.js --remove <email>
   Example: node src/scripts/createAdmin.js --remove admin@enrichparlour.com

3. Demote an Admin back to regular Customer:
   node src/scripts/createAdmin.js --demote <email>
   Example: node src/scripts/createAdmin.js --demote admin@enrichparlour.com

4. Promote an existing user to Admin:
   node src/scripts/createAdmin.js <user_email>
   Example: node src/scripts/createAdmin.js priyanshusaini1212@gmail.com

5. Create a brand new Admin account:
   node src/scripts/createAdmin.js <email> <password> "<Full Name>" "<Phone>"
   Example: node src/scripts/createAdmin.js newadmin@gmail.com MyPass123 "Salon Owner" "(212) 555-0100"
======================================================
`);
  };

  if (!command) {
    printHelp();
    process.exit(0);
  }

  try {
    console.log('Connecting to MongoDB Atlas database [Enrich]...');
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'Enrich' });

    // 1. LIST ADMINS
    if (command === '--list' || command === '-l' || command === 'list') {
      const admins = await User.find({ role: 'admin' });
      console.log(`\n📋 Current Active Administrators (${admins.length}):`);
      admins.forEach((a, idx) => {
        console.log(`  ${idx + 1}. ${a.name} | Email: ${a.email} | Phone: ${a.phone}`);
      });
      console.log('');
      process.exit(0);
    }

    // 2. REMOVE / DELETE ADMIN ACCOUNT
    if (command === '--remove' || command === '--delete' || command === '-d') {
      const targetEmail = args[1]?.toLowerCase()?.trim();
      if (!targetEmail) {
        console.error('❌ Please specify the email of the admin to remove.');
        console.log('Example: node src/scripts/createAdmin.js --remove admin@enrichparlour.com');
        process.exit(1);
      }

      const deletedUser = await User.findOneAndDelete({ email: targetEmail });
      if (!deletedUser) {
        console.log(`⚠️ User with email [${targetEmail}] not found.`);
      } else {
        console.log(`\n🗑️ Successfully DELETED user [${targetEmail}] (${deletedUser.name}).`);
      }
      process.exit(0);
    }

    // 3. DEMOTE ADMIN TO CUSTOMER
    if (command === '--demote') {
      const targetEmail = args[1]?.toLowerCase()?.trim();
      if (!targetEmail) {
        console.error('❌ Please specify the email of the admin to demote.');
        console.log('Example: node src/scripts/createAdmin.js --demote admin@enrichparlour.com');
        process.exit(1);
      }

      const user = await User.findOneAndUpdate(
        { email: targetEmail },
        { role: 'customer' },
        { new: true }
      );

      if (!user) {
        console.log(`⚠️ User with email [${targetEmail}] not found.`);
      } else {
        console.log(`\n🔄 Successfully DEMOTED [${targetEmail}] from admin to 'customer' role.`);
      }
      process.exit(0);
    }

    // 4. PROMOTE OR CREATE
    const email = command;
    const password = args[1]?.trim();
    const name = args[2]?.trim() || 'Admin User';
    const phone = args[3]?.trim() || `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

    let user = await User.findOne({ email });

    if (user) {
      user.role = 'admin';
      if (password) {
        user.password = password; // Will be hashed by pre-save hook
      }
      if (name && name !== 'Admin User') user.name = name;
      await user.save();
      console.log(`\n✅ Success! User [${email}] is now configured as ADMIN.`);
    } else {
      if (!password) {
        console.error(`❌ User with email [${email}] does not exist. Please provide a password to create a new admin.`);
        console.log(`Example: node src/scripts/createAdmin.js ${email} MyPassword123`);
        process.exit(1);
      }

      user = await User.create({
        name,
        email,
        phone,
        password,
        role: 'admin',
        isVerified: true
      });
      console.log(`\n✅ Success! New ADMIN account created for [${email}].`);
    }

    console.log(`
------------------------------------------------------
  Login URL: http://localhost:5173/login
  Email:     ${user.email}
  Role:      ${user.role}
------------------------------------------------------
`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error managing admin:', error.message);
    process.exit(1);
  }
};

manageAdmin();
