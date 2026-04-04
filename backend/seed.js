const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const Review = require('./models/Review');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Review.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@portal.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      bio: 'System administrator for the project portal.'
    });

    const reviewer1 = await User.create({
      name: 'Dr. Sarah Chen',
      email: 'sarah@portal.com',
      password: 'reviewer123',
      role: 'reviewer',
      department: 'Computer Science',
      bio: 'Associate Professor specializing in machine learning and data science.'
    });

    const reviewer2 = await User.create({
      name: 'Prof. James Wilson',
      email: 'james@portal.com',
      password: 'reviewer123',
      role: 'reviewer',
      department: 'Software Engineering',
      bio: 'Full professor with 15 years of experience in software architecture.'
    });

    const student1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex@portal.com',
      password: 'student123',
      role: 'student',
      department: 'Computer Science',
      bio: 'Final year CS student interested in full-stack development.'
    });

    const student2 = await User.create({
      name: 'Maya Patel',
      email: 'maya@portal.com',
      password: 'student123',
      role: 'student',
      department: 'Data Science',
      bio: 'Graduate student focusing on machine learning applications.'
    });

    const student3 = await User.create({
      name: 'Ryan Kim',
      email: 'ryan@portal.com',
      password: 'student123',
      role: 'student',
      department: 'Cybersecurity',
      bio: 'Security enthusiast and CTF competitor.'
    });

    console.log('Created users');

    // Create projects
    const project1 = await Project.create({
      title: 'Smart Campus Navigation System',
      description: 'A mobile-first web application that provides real-time indoor navigation for university campus buildings. Uses Wi-Fi fingerprinting and beacon technology to provide accurate positioning within buildings, helping students and visitors find classrooms, labs, and offices efficiently.',
      category: 'mobile-app',
      submittedBy: student1._id,
      team: ['Alex Johnson', 'David Lee', 'Emma Watson'],
      status: 'approved',
      tags: ['react-native', 'node.js', 'bluetooth', 'navigation'],
      githubUrl: 'https://github.com/example/smart-campus',
      abstract: 'Indoor navigation system using Wi-Fi fingerprinting for accurate campus navigation.',
      averageRating: 8.5,
      reviewCount: 2
    });

    const project2 = await Project.create({
      title: 'AI-Powered Study Companion',
      description: 'An intelligent tutoring system that uses natural language processing to help students understand complex topics. Features include adaptive quizzing, concept mapping, and personalized study schedules based on learning patterns and upcoming deadlines.',
      category: 'machine-learning',
      submittedBy: student2._id,
      team: ['Maya Patel', 'Sofia Garcia'],
      status: 'under_review',
      tags: ['python', 'tensorflow', 'nlp', 'education'],
      githubUrl: 'https://github.com/example/ai-companion',
      abstract: 'NLP-based tutoring system with adaptive learning capabilities.'
    });

    const project3 = await Project.create({
      title: 'Blockchain-Based Credential Verification',
      description: 'A decentralized application for verifying academic credentials and certificates. Institutions can issue tamper-proof digital credentials on the blockchain, while employers and other institutions can instantly verify their authenticity without contacting the issuing institution.',
      category: 'blockchain',
      submittedBy: student3._id,
      team: ['Ryan Kim', 'Chris Park'],
      status: 'submitted',
      tags: ['ethereum', 'solidity', 'react', 'web3'],
      githubUrl: 'https://github.com/example/credential-verify',
      abstract: 'Decentralized credential verification using Ethereum smart contracts.'
    });

    const project4 = await Project.create({
      title: 'Real-Time Air Quality Monitoring Dashboard',
      description: 'An IoT-based system that collects air quality data from sensors deployed across the campus and displays real-time measurements on an interactive dashboard. Includes predictive analytics for air quality trends and automatic alerts when pollution levels exceed safe thresholds.',
      category: 'iot',
      submittedBy: student1._id,
      team: ['Alex Johnson', 'Lisa Wang'],
      status: 'revision_required',
      tags: ['iot', 'react', 'python', 'sensors', 'dashboard'],
      githubUrl: 'https://github.com/example/air-quality',
      abstract: 'IoT-based air quality monitoring with predictive analytics.'
    });

    const project5 = await Project.create({
      title: 'Secure File Sharing Platform',
      description: 'An end-to-end encrypted file sharing platform designed for academic collaboration. Features zero-knowledge encryption, granular access controls, and automated expiration policies. Built with security-first principles to protect sensitive research data.',
      category: 'cybersecurity',
      submittedBy: student3._id,
      team: ['Ryan Kim', 'Amy Zhang', 'Tom Brown'],
      status: 'submitted',
      tags: ['encryption', 'node.js', 'react', 'security'],
      abstract: 'Zero-knowledge encrypted file sharing for secure academic collaboration.'
    });

    const project6 = await Project.create({
      title: 'Cloud-Native Microservices E-Commerce',
      description: 'A fully cloud-native e-commerce platform built using microservices architecture. Deployed on Kubernetes with service mesh, distributed tracing, and auto-scaling. Demonstrates modern cloud computing patterns including CQRS, event sourcing, and saga pattern.',
      category: 'cloud-computing',
      submittedBy: student2._id,
      team: ['Maya Patel', 'Jake Miller'],
      status: 'approved',
      tags: ['kubernetes', 'docker', 'microservices', 'aws'],
      githubUrl: 'https://github.com/example/cloud-ecommerce',
      abstract: 'Cloud-native e-commerce demonstrating microservices best practices.',
      averageRating: 9.0,
      reviewCount: 1
    });

    console.log('Created projects');

    // Create reviews
    await Review.create({
      project: project1._id,
      reviewer: reviewer1._id,
      rating: 9,
      feedback: 'Excellent project with strong technical implementation. The Wi-Fi fingerprinting approach is well-researched and the UI is intuitive. The documentation is thorough and the code quality is high. Minor suggestion: consider adding offline navigation support.',
      criteria: { innovation: 9, execution: 9, presentation: 8, documentation: 9 },
      status: 'completed'
    });

    await Review.create({
      project: project1._id,
      reviewer: reviewer2._id,
      rating: 8,
      feedback: 'Very practical application with real-world utility. Good use of modern technologies. The team demonstrated strong collaboration. Would benefit from more extensive testing documentation and performance benchmarks.',
      criteria: { innovation: 8, execution: 8, presentation: 9, documentation: 7 },
      status: 'completed'
    });

    await Review.create({
      project: project6._id,
      reviewer: reviewer1._id,
      rating: 9,
      feedback: 'Outstanding demonstration of cloud-native architecture. The use of CQRS and event sourcing patterns shows deep understanding of distributed systems. The deployment pipeline is production-grade quality.',
      criteria: { innovation: 9, execution: 10, presentation: 8, documentation: 9 },
      status: 'completed'
    });

    console.log('Created reviews');
    console.log('\n✓ Seed data created successfully!\n');
    console.log('Test Accounts:');
    console.log('─────────────────────────────────────');
    console.log('Admin:    admin@portal.com / admin123');
    console.log('Reviewer: sarah@portal.com / reviewer123');
    console.log('Reviewer: james@portal.com / reviewer123');
    console.log('Student:  alex@portal.com  / student123');
    console.log('Student:  maya@portal.com  / student123');
    console.log('Student:  ryan@portal.com  / student123');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
