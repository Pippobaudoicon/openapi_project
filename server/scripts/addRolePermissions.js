import mongoose from 'mongoose';
import '../config/env.js';
import Role from '../models/Role.js';

const updateRolesWithPermissions = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/openapi_project';
    console.log('Connecting to MongoDB:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    // Define new activity permissions
    const activityPermissions = [
      // 'get_activities',
      // 'log_activity'
    ];

    // Update all existing roles to include activity permissions
    const roles = await Role.find();
    console.log(`Found ${roles.length} roles to update`);

    for (const role of roles) {
      let hasUpdates = false;
      
      // Add missing activity permissions
      for (const permission of activityPermissions) {
        if (!role.permissions.includes(permission)) {
          role.permissions.push(permission);
          hasUpdates = true;
          console.log(`Added permission "${permission}" to role "${role.roleName}"`);
        }
      }

      // Save if there were updates
      if (hasUpdates) {
        await role.save();
        console.log(`Updated role: ${role.roleName}`);
      } else {
        console.log(`Role "${role.roleName}" already has all activity permissions`);
      }
    }

    console.log('Activity permissions migration completed successfully');
  } catch (error) {
    console.error('Error updating roles with activity permissions:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
updateRolesWithPermissions();
