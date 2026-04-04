const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const passport = require('./config/passport');

// Route imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for OAuth (minimal — we use JWT for actual auth)
app.use(session({
  secret: process.env.JWT_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 60000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// Static files - uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handler
app.use(errorHandler);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const PORT = process.env.PORT || 5001;

// Auto-seed function for in-memory MongoDB
const autoSeed = async () => {
  const User = require('./models/User');
  const Project = require('./models/Project');
  const Review = require('./models/Review');

  const userCount = await User.countDocuments();
  if (userCount > 0) return; // Already seeded

  console.log('📦 Seeding database with sample data...');

  const admin = await User.create({ name: 'Admin User', email: 'admin@portal.com', password: 'admin123', role: 'admin', department: 'Administration', bio: 'System administrator for the project portal.' });
  const reviewer1 = await User.create({ name: 'Dr. Sarah Chen', email: 'sarah@portal.com', password: 'reviewer123', role: 'reviewer', department: 'Computer Science', bio: 'Associate Professor specializing in ML and data science.' });
  const reviewer2 = await User.create({ name: 'Prof. James Wilson', email: 'james@portal.com', password: 'reviewer123', role: 'reviewer', department: 'Software Engineering', bio: 'Full professor with 15 years of experience in software architecture.' });
  const student1 = await User.create({ name: 'Alex Johnson', email: 'alex@portal.com', password: 'student123', role: 'student', department: 'Computer Science', bio: 'Final year CS student interested in full-stack development.' });
  const student2 = await User.create({ name: 'Maya Patel', email: 'maya@portal.com', password: 'student123', role: 'student', department: 'Data Science', bio: 'Graduate student focusing on machine learning applications.' });
  const student3 = await User.create({ name: 'Ryan Kim', email: 'ryan@portal.com', password: 'student123', role: 'student', department: 'Cybersecurity', bio: 'Security enthusiast and CTF competitor.' });

  const p1 = await Project.create({ title: 'Smart Campus Navigation System', description: 'A mobile-first web application that provides real-time indoor navigation for university campus buildings. Uses Wi-Fi fingerprinting and beacon technology to provide accurate positioning within buildings, helping students and visitors find classrooms, labs, and offices efficiently.', category: 'mobile-app', submittedBy: student1._id, team: ['Alex Johnson', 'David Lee', 'Emma Watson'], status: 'approved', tags: ['react-native', 'node.js', 'bluetooth', 'navigation'], githubUrl: 'https://github.com/example/smart-campus', abstract: 'Indoor navigation system using Wi-Fi fingerprinting for accurate campus navigation.', averageRating: 8.5, reviewCount: 2 });
  const p2 = await Project.create({ title: 'AI-Powered Study Companion', description: 'An intelligent tutoring system that uses natural language processing to help students understand complex topics. Features include adaptive quizzing, concept mapping, and personalized study schedules based on learning patterns and upcoming deadlines.', category: 'machine-learning', submittedBy: student2._id, team: ['Maya Patel', 'Sofia Garcia'], status: 'under_review', tags: ['python', 'tensorflow', 'nlp', 'education'], githubUrl: 'https://github.com/example/ai-companion', abstract: 'NLP-based tutoring system with adaptive learning capabilities.' });
  const p3 = await Project.create({ title: 'Blockchain-Based Credential Verification', description: 'A decentralized application for verifying academic credentials and certificates. Institutions can issue tamper-proof digital credentials on the blockchain, while employers can instantly verify their authenticity.', category: 'blockchain', submittedBy: student3._id, team: ['Ryan Kim', 'Chris Park'], status: 'submitted', tags: ['ethereum', 'solidity', 'react', 'web3'], githubUrl: 'https://github.com/example/credential-verify', abstract: 'Decentralized credential verification using Ethereum smart contracts.' });
  const p4 = await Project.create({ title: 'Real-Time Air Quality Dashboard', description: 'An IoT-based system that collects air quality data from sensors deployed across campus and displays real-time measurements on an interactive dashboard. Includes predictive analytics for air quality trends and automatic alerts.', category: 'iot', submittedBy: student1._id, team: ['Alex Johnson', 'Lisa Wang'], status: 'revision_required', tags: ['iot', 'react', 'python', 'sensors', 'dashboard'], abstract: 'IoT-based air quality monitoring with predictive analytics.' });
  const p5 = await Project.create({ title: 'Secure File Sharing Platform', description: 'An end-to-end encrypted file sharing platform designed for academic collaboration. Features zero-knowledge encryption, granular access controls, and automated expiration policies.', category: 'cybersecurity', submittedBy: student3._id, team: ['Ryan Kim', 'Amy Zhang', 'Tom Brown'], status: 'submitted', tags: ['encryption', 'node.js', 'react', 'security'], abstract: 'Zero-knowledge encrypted file sharing for academic collaboration.' });
  const p6 = await Project.create({ title: 'Cloud-Native Microservices E-Commerce', description: 'A fully cloud-native e-commerce platform built using microservices architecture. Deployed on Kubernetes with service mesh, distributed tracing, and auto-scaling. Demonstrates modern cloud computing patterns.', category: 'cloud-computing', submittedBy: student2._id, team: ['Maya Patel', 'Jake Miller'], status: 'approved', tags: ['kubernetes', 'docker', 'microservices', 'aws'], githubUrl: 'https://github.com/example/cloud-ecommerce', abstract: 'Cloud-native e-commerce demonstrating microservices best practices.', averageRating: 9.0, reviewCount: 1 });

  await Review.create({ project: p1._id, reviewer: reviewer1._id, rating: 9, feedback: 'Excellent project with strong technical implementation. The Wi-Fi fingerprinting approach is well-researched and the UI is intuitive. Minor suggestion: consider adding offline navigation support.', criteria: { innovation: 9, execution: 9, presentation: 8, documentation: 9 }, status: 'completed' });
  await Review.create({ project: p1._id, reviewer: reviewer2._id, rating: 8, feedback: 'Very practical application with real-world utility. Good use of modern technologies. Would benefit from more extensive testing documentation and performance benchmarks.', criteria: { innovation: 8, execution: 8, presentation: 9, documentation: 7 }, status: 'completed' });
  await Review.create({ project: p6._id, reviewer: reviewer1._id, rating: 9, feedback: 'Outstanding demonstration of cloud-native architecture. The use of CQRS and event sourcing patterns shows deep understanding of distributed systems. Production-grade deployment pipeline.', criteria: { innovation: 9, execution: 10, presentation: 8, documentation: 9 }, status: 'completed' });

  console.log('✓ Sample data seeded successfully!');
  console.log('  Test Accounts:');
  console.log('  ─────────────────────────────────────');
  console.log('  Admin:    admin@portal.com / admin123');
  console.log('  Reviewer: sarah@portal.com / reviewer123');
  console.log('  Student:  alex@portal.com  / student123');
  console.log('  ─────────────────────────────────────');
};

// Start server after DB connection
const startServer = async () => {
  await connectDB();
  await autoSeed();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   API: http://localhost:${PORT}/api\n`);
  });
};

startServer();
