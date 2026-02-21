import bcrypt from 'bcryptjs';

const run = async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    console.log('HASH:', hash);
};

run();
