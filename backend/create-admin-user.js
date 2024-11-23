// create-admin-user.js
const bcrypt = require('bcrypt');
const { User } = require('./models');

async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const user = await User.create({
            name: 'Test Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true
        });
        console.log('Admin user created:', user.toJSON());
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

createAdminUser();