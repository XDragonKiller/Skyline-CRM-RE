require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

console.log('JWT_SECRET loaded successfully');
exports.JWT_SECRET = process.env.JWT_SECRET;
