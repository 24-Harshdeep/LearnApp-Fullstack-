// seedBackendCurriculum.js
import mongoose from 'mongoose';
import LearningPath from './models/LearningPath.js';
import dotenv from 'dotenv';

dotenv.config();

// Backend Curriculum Data
const backendCurriculum = {
  title: 'Backend Development Mastery — Node.js & Express Fullstack',
  description: 'Complete backend curriculum for Portfolio Pro: Node.js basics, Express, REST APIs, databases, authentication, deployment, and real-world integration. Includes theory, code, practice tasks, and tips.',
  difficulty: 'intermediate',
  estimatedTime: '12 weeks',
  xpReward: 3000,
  prerequisites: ['JavaScript Essentials'],
  order: 5,
  subtopics: [
    {
      title: 'Backend Fundamentals & Theory',
      description: 'The backend powers your app — it handles requests, stores data, and sends responses. Unlike frontend, the backend deals with servers, databases, APIs, and business logic.',
      content: 'Key Concepts: Server, API, Endpoint, HTTP Methods, Middleware, CORS.',
      code_examples: [],
      practical_tasks: [
        { task: 'Draw a simple diagram showing how a React frontend communicates with a Node.js/Express backend via REST APIs.', expected_output: 'Diagram of frontend-backend communication.' }
      ],
        bonus_tips: 'Backend handles business logic and data.',
      resources: []
    },
    {
      title: 'Node.js Fundamentals',
      description: 'Node.js is a JavaScript runtime for server-side code. Non-blocking and event-driven, perfect for APIs.',
      content: '',
      code_examples: [
        'mkdir portfolio-backend\ncd portfolio-backend\nnpm init -y\nnpm install express',
        'const http = require("http");\n\nconst server = http.createServer((req, res) => {\n  res.statusCode = 200;\n  res.setHeader("Content-Type", "text/plain");\n  res.end("Hello from Portfolio Pro backend!");\n});\n\nserver.listen(3000, () => console.log("Server running on port 3000"));'
      ],
      practical_tasks: [
        { task: 'Initialize a Node.js project for your backend and install Express.', expected_output: 'Node.js backend initialized.' },
        { task: 'Run the server and visit http://localhost:3000 to see the response.', expected_output: 'Server responds with message.' }
      ],
        bonus_tips: 'Node.js can run without Express, but Express makes backend development easier.',
      resources: []
    },
    {
      title: 'Express.js Basics',
      description: 'Express.js is a minimal framework for Node.js that simplifies routing, middleware, and API creation.',
      content: '',
      code_examples: [
        'const express = require("express");\nconst app = express();\n\napp.get("/", (req, res) => {\n  res.send("Welcome to Portfolio Pro API");\n});\n\napp.listen(3000, () => console.log("Server running on port 3000"));',
        'app.get("/projects", (req, res) => {\n  res.json([\n    { id: 1, name: "Portfolio Pro", completed: true },\n    { id: 2, name: "Blog", completed: false }\n  ]);\n});',
        'app.use(express.json());\napp.use((req, res, next) => {\n  console.log(req.method + " request to " + req.url);\n  next();\n});'
      ],
      practical_tasks: [
        { task: 'Create an Express server that responds with a welcome message at /.', expected_output: 'Express server running.' },
        { task: 'Create GET endpoints for /projects and /contact. Return mock JSON data.', expected_output: 'Endpoints return mock data.' },
        { task: 'Log all incoming requests to the console using middleware.', expected_output: 'Requests logged in console.' }
      ],
        bonus_tips: 'Middleware runs before the endpoint handler — useful for auth, logging, and validation.',
      resources: []
    },
    {
      title: 'RESTful API Design',
      description: 'REST APIs follow resource-based endpoints and standard HTTP methods.',
      content: '| Method | Action      | Example       |\n| ------ | ----------- | ------------- |\n| GET    | Read data   | /projects     |\n| POST   | Create data | /projects     |\n| PUT    | Update data | /projects/1   |\n| DELETE | Delete data | /projects/1   |',
      code_examples: [
        'app.post("/projects", (req, res) => {\n  const project = req.body;\n  console.log(project);\n  res.status(201).json({ message: "Project added", project });\n});'
      ],
      practical_tasks: [
        { task: 'Design REST endpoints for your portfolio: /projects, /projects/:id, /contact, /contact/:id.', expected_output: 'RESTful endpoints designed.' },
        { task: 'Send a POST request with project data using Postman or frontend fetch and log it in backend.', expected_output: 'POST request handled and logged.' }
      ],
        bonus_tips: 'Use standard HTTP methods for CRUD.',
      resources: []
    },
    {
      title: 'CORS & Security',
      description: 'CORS allows frontend domains to access your backend. Security essentials: use helmet for headers, validate input, never expose sensitive info.',
      content: '',
      code_examples: [
        'const cors = require("cors");\napp.use(cors({ origin: "http://localhost:5173" })); // frontend URL'
      ],
      practical_tasks: [
        { task: 'Enable CORS for your React frontend so it can fetch projects.', expected_output: 'CORS enabled for frontend.' }
      ],
        bonus_tips: 'CORS controls cross-origin access.',
      resources: []
    },
    {
      title: 'Databases',
      description: 'Backends store data in databases: SQL (PostgreSQL, MySQL) for structured tables, NoSQL (MongoDB) for JSON-like flexible documents.',
      content: '',
      code_examples: [
        'const mongoose = require("mongoose");\n\nmongoose.connect("mongodb://127.0.0.1:27017/portfolio", {\n  useNewUrlParser: true,\n  useUnifiedTopology: true\n});\n\nconst projectSchema = new mongoose.Schema({\n  name: String,\n  tech: [String],\n  completed: Boolean\n});\n\nconst Project = mongoose.model("Project", projectSchema);',
        '// Read\napp.get("/projects", async (req, res) => {\n  const projects = await Project.find();\n  res.json(projects);\n});\n\n// Create\napp.post("/projects", async (req, res) => {\n  const project = new Project(req.body);\n  await project.save();\n  res.status(201).json(project);\n});'
      ],
      practical_tasks: [
        { task: 'Create a MongoDB collection for your projects and insert a few sample projects.', expected_output: 'Projects stored in MongoDB.' },
        { task: 'Implement update and delete endpoints for projects.', expected_output: 'CRUD endpoints working.' }
      ],
        bonus_tips: 'Use Mongoose for schema and queries.',
      resources: []
    },
    {
      title: 'Authentication & Authorization',
      description: 'Secure endpoints: only authorized users can modify data. Use JWT for stateless auth and bcrypt for password hashing.',
      content: '',
      code_examples: [
        'const jwt = require("jsonwebtoken");\nconst token = jwt.sign({ userId: 1 }, "secretKey", { expiresIn: "1h" });'
      ],
      practical_tasks: [
        { task: 'Create login endpoint that returns a JWT token on successful authentication.', expected_output: 'JWT token returned on login.' }
      ],
        bonus_tips: 'Use bcrypt for password hashing.',
      resources: []
    },
    {
      title: 'Environment Variables & Config',
      description: 'Never hardcode sensitive info. Use .env for secrets.',
      content: '',
      code_examples: [
        'PORT=3000\nMONGO_URI=mongodb://127.0.0.1:27017/portfolio\nJWT_SECRET=mysecret',
        'require("dotenv").config();\nconst port = process.env.PORT;'
      ],
      practical_tasks: [
        { task: 'Move all keys and DB URLs into .env file.', expected_output: '.env file used for config.' }
      ],
        bonus_tips: 'Environment variables keep secrets safe.',
      resources: []
    },
    {
      title: 'Error Handling & Middleware',
      description: 'Add centralized error handling for all your endpoints.',
      content: '',
      code_examples: [
        'app.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).json({ message: "Something broke!" });\n});'
      ],
      practical_tasks: [
        { task: 'Add centralized error handling for all your endpoints.', expected_output: 'Errors handled centrally.' }
      ],
        bonus_tips: 'Centralized error handling improves reliability.',
      resources: []
    },
    {
      title: 'Deployment & DevOps',
      description: 'Deploy backend to Heroku, Render, or Railway. Connect MongoDB Atlas for cloud DB. Enable CORS and environment variables in production.',
      content: '',
      code_examples: [],
      practical_tasks: [
        { task: 'Deploy your backend and connect React frontend to the live API.', expected_output: 'Backend deployed and connected.' }
      ],
        bonus_tips: 'Use cloud DB for production.',
      resources: []
    },
    {
      title: 'Real-World Integration',
      description: 'Send emails from backend (Nodemailer), upload images/files (Multer), connect with payment gateways or third-party APIs.',
      content: '',
      code_examples: [],
      practical_tasks: [
        { task: 'Enable contact form submissions to send emails to your inbox.', expected_output: 'Contact form sends email.' }
      ],
        bonus_tips: 'Integrate real-world services for fullstack apps.',
      resources: []
    },
    {
      title: 'Testing & Documentation',
      description: 'Unit testing: Jest + Supertest, API docs: Swagger or Postman, input validation: Joi / express-validator.',
      content: '',
      code_examples: [],
      practical_tasks: [
        { task: 'Document all API endpoints with Postman and test responses.', expected_output: 'API documented and tested.' }
      ],
        bonus_tips: 'Test and document for reliability.',
      resources: []
    }

    // Continue with remaining phases similarly...
  ]
};

// Seed function
const seedBackendCurriculum = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/adaptive-learning', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('📚 Connected to MongoDB');

    // Delete existing backend curriculum if exists
    await LearningPath.deleteMany({
      title: { $regex: 'Backend Development', $options: 'i' }
    });
    console.log('🗑️  Cleared old backend curriculum');

    // Create new curriculum
    await LearningPath.create(backendCurriculum);

    console.log('✅ Backend Development curriculum added!');
    console.log(`📖 Total lessons: ${backendCurriculum.subtopics.length}`);
    console.log('⭐ XP Reward: 3000');
    console.log('⏱️  Estimated Time: 12 weeks');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedBackendCurriculum();
