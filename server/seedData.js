// Sample seed data for MongoDB

// Sample Learning Path Modules
export const sampleModules = [
  {
    title: "HTML Fundamentals",
    description: "Master the building blocks of the web",
    topics: ["Tags & Attributes", "Semantic HTML", "Forms", "Accessibility"],
    order: 1,
    difficulty: "beginner",
    estimatedTime: "1 week",
    prerequisites: [],
    resources: [
      { title: "MDN HTML Guide", type: "documentation", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" }
    ],
    subtopics: [
      { lesson_title: "HTML Basics", explanation: "Learn about tags, elements, and attributes.", code_examples: ["<h1>Hello World</h1>"], practical_tasks: [{ task: "Create a simple HTML page.", expected_output: "A page with a heading and paragraph." }], bonus_tips: "Use semantic tags for better accessibility.", resources: [] },
      { lesson_title: "Semantic HTML", explanation: "Understand the importance of semantic elements.", code_examples: ["<header></header>"], practical_tasks: [{ task: "Add semantic structure to your page.", expected_output: "Header, main, footer sections." }], bonus_tips: "Semantic HTML improves SEO.", resources: [] },
      { lesson_title: "Forms", explanation: "Build interactive forms.", code_examples: ["<form><input type='text'></form>"], practical_tasks: [{ task: "Create a contact form.", expected_output: "Form with name and email fields." }], bonus_tips: "Always label your inputs.", resources: [] },
  { lesson_title: "Accessibility", explanation: "Make your sites usable for everyone.", code_examples: ["<img alt='description'>"], practical_tasks: [{ task: "Add alt text to images.", expected_output: "All images have descriptive alt text." }], bonus_tips: "Test with screen readers.", resources: [] },
      {
        lesson_title: "HTML Intermediate (Phase 2): Structure, Media & Semantics Deep Dive",
        explanation: "\n## Theory Overview\nHTML is not just markup — it defines meaning, accessibility, and the structure of data your backend will later interact with. By mastering intermediate HTML, you’re setting the stage for scalable frontends and accessible UI frameworks.\n\nKey Goals: Use semantic structure for clarity and SEO, embed media and interactive content, create accessible forms and data layouts, and prepare a real project structure for your 'Portfolio Pro' app.",
        code_examples: [],
        practical_tasks: [],
        bonus_tips: "Think modularly — this same structure will scale when we attach Express routes and APIs later.",
        resources: []
      },
      {
        lesson_title: "Semantic Page Layout",
        explanation: "Structure your webpage like a professional application.",
        code_examples: ["<header>...</header>\n<main>...</main>\n<footer>...</footer>"],
        practical_tasks: [{ task: "Rebuild your homepage with semantic layout (header, nav, main, section, footer).", expected_output: "Homepage uses semantic tags." }],
        bonus_tips: "Think of sections like modules — each should serve a distinct purpose.",
        resources: []
      },
      {
        lesson_title: "Sectioning & Articles",
        explanation: "Group related content and represent standalone items.",
        code_examples: ["<section>...</section>\n<article>...</article>"],
        practical_tasks: [{ task: "Add a Blog section with two articles.", expected_output: "Blog section with two articles." }],
        bonus_tips: "<section> groups, <article> stands alone.",
        resources: []
      },
      {
        lesson_title: "Inline vs Block Elements",
        explanation: "Understand display behavior before CSS.",
        code_examples: ["<p>This is <strong>inline</strong> text.</p>\n<div>This is a block element.</div>"],
        practical_tasks: [{ task: "List 5 inline and 5 block elements from your Portfolio Pro and test their rendering.", expected_output: "List and test elements." }],
        bonus_tips: "Inline = flows in text line. Block = new line, full width.",
        resources: []
      },
      {
        lesson_title: "Media: Audio & Video",
        explanation: "Embed rich media elements.",
        code_examples: ["<video controls width='400'><source src='intro.mp4' type='video/mp4'></video>\n<audio controls><source src='music.mp3' type='audio/mpeg'></audio>"],
        practical_tasks: [{ task: "Add an intro video and background audio to your portfolio.", expected_output: "Portfolio has video and audio." }],
        bonus_tips: "Always include fallback text for unsupported browsers.",
        resources: []
      },
      {
        lesson_title: "Iframes",
        explanation: "Display other web pages or apps inside yours.",
        code_examples: ["<iframe src='https://example.com' width='600' height='400' title='Example'></iframe>"],
        practical_tasks: [{ task: "Embed your GitHub profile in your portfolio using an iframe.", expected_output: "GitHub profile visible in Projects section." }],
        bonus_tips: "Use sandbox/allow attributes for security.",
        resources: []
      },
      {
        lesson_title: "Forms Advanced",
        explanation: "Learn more input types and accessibility techniques.",
        code_examples: ["<form>...</form>"],
        practical_tasks: [{ task: "Add a Contact Form with name, email, role, and message fields.", expected_output: "Contact form in portfolio." }],
        bonus_tips: "required, min, max enforce validation before backend integration.",
        resources: []
      },
      {
        lesson_title: "Meta Tags Deep Dive",
        explanation: "Optimize for browsers, SEO, and responsiveness.",
        code_examples: ["<meta charset='UTF-8'>\n<meta name='viewport' content='width=device-width, initial-scale=1.0'>"],
        practical_tasks: [{ task: "Update your portfolio head with charset, viewport, and keywords.", expected_output: "Head contains meta tags." }],
        bonus_tips: "Viewport meta is critical for mobile responsiveness.",
        resources: []
      },
      {
        lesson_title: "Favicon & Branding",
        explanation: "Add a favicon for branding.",
        code_examples: ["<link rel='icon' type='image/png' href='favicon.png'>"],
        practical_tasks: [{ task: "Design or pick a favicon and link it.", expected_output: "Favicon appears in browser tab." }],
        bonus_tips: "Consistency increases recall value.",
        resources: []
      },
      {
        lesson_title: "Tables Advanced",
        explanation: "Add captions, headers, and accessibility improvements.",
        code_examples: ["<table><caption>Project Summary</caption><thead>...</thead><tbody>...</tbody></table>"],
        practical_tasks: [{ task: "Add a Project Summary Table to your portfolio.", expected_output: "Table lists project name, tech, status." }],
        bonus_tips: "Wrap table content in thead, tbody, caption for accessibility.",
        resources: []
      },
      {
        lesson_title: "Layout Planning with Semantic Divisions",
        explanation: "Plan your full-page structure for CSS & JS phases.",
        code_examples: ["<header>Navbar + Logo</header>\n<main><section>About</section><section>Projects</section><section>Contact</section></main><footer>Copyright</footer>"],
        practical_tasks: [{ task: "Create the full HTML skeleton for Portfolio Pro.", expected_output: "Portfolio has modular sections with IDs." }],
        bonus_tips: "Think modularly for future scaling.",
        resources: []
      }
    ]
  },
  {
    title: "CSS Mastery",
    description: "Style beautiful, responsive websites and build production-ready Portfolio Pro app.",
    topics: ["Basics & Syntax", "Selectors", "Colors & Typography", "Box Model", "Display", "Positioning", "Flexbox", "Grid", "Forms & Buttons", "Pseudo-classes", "Backgrounds & Borders", "Transitions & Animations", "Responsive Design", "Variables", "Advanced Layouts"],
  },
  {
    title: "JavaScript Essentials",
    description: "Learn the language of the web and build dynamic, interactive frontends for Portfolio Pro.",
    topics: ["Syntax & Variables", "Data Types & Operators", "Functions", "Conditionals & Loops", "Objects", "DOM Manipulation", "Arrays & ES6", "Fetch & Axios", "Advanced JS", "API Integration"],
    order: 3,
    difficulty: "intermediate",
    estimatedTime: "4 weeks",
    prerequisites: ["HTML Fundamentals", "CSS Mastery"],
    resources: [],
    subtopics: [
      {
        lesson_title: "JavaScript Basics & Fundamentals",
        explanation: "JavaScript is a programming language that makes websites interactive. While HTML structures the content and CSS styles it, JS controls behavior, dynamic content, and frontend logic. Key goals: Learn syntax, variables, data types, operators, conditionals, loops, functions, DOM manipulation, and prepare for API integration.",
        code_examples: [],
        practical_tasks: [],
        bonus_tips: "Prefer let & const over var for modern JS.",
        resources: []
      },
      {
        lesson_title: "JavaScript Syntax & Variables",
        explanation: "Learn how to declare variables and use basic JS syntax.",
        code_examples: ["let name = 'Harshy';\nconst portfolioTitle = 'Portfolio Pro';\nvar isActive = true;\nconsole.log(name, portfolioTitle, isActive);"],
        practical_tasks: [{ task: "Declare variables for your portfolio: your name, current role, number of projects.", expected_output: "Variables declared and logged." }],
        bonus_tips: "Prefer let & const over var.",
        resources: []
      },
      {
        lesson_title: "Data Types & Operators",
        explanation: "Understand numbers, booleans, arrays, and operators.",
        code_examples: ["let age = 20;\nlet isDeveloper = true;\nlet skills = ['JS', 'CSS', 'HTML'];"],
        practical_tasks: [{ task: "Create an array of your top 5 skills. Use + to concatenate a greeting message.", expected_output: "Skills array and greeting message." }],
        bonus_tips: "Understand type coercion — '5' + 5 vs '5' - 2.",
        resources: []
      },
      {
        lesson_title: "Functions",
        explanation: "Reusable blocks of code for logic and actions.",
        code_examples: ["function greet(name) { return `Hello, ${name}!`; }\nconsole.log(greet('Harshy'));"],
        practical_tasks: [{ task: "Create a function to display each skill from your skills array in the console.", expected_output: "Skills displayed using function." }],
        bonus_tips: "Use arrow functions for shorter syntax.",
        resources: []
      },
      {
        lesson_title: "Conditionals & Loops",
        explanation: "Control flow with if/else and repeat actions with loops.",
        code_examples: ["let projectCount = 3;\nif (projectCount > 0) { console.log('You have projects!'); } else { console.log('Add some projects!'); }\nfor(let i=0; i<skills.length; i++){ console.log(skills[i]); }"],
        practical_tasks: [{ task: "Loop through your projects and log their names if complete.", expected_output: "Project names logged if complete." }],
        bonus_tips: "Use for, while, forEach based on context.",
        resources: []
      },
      {
        lesson_title: "Objects",
        explanation: "Represent real-world entities with properties and values.",
        code_examples: ["const project = { name: 'Portfolio Pro', tech: ['HTML', 'CSS', 'JS'], completed: true };\nconsole.log(project.name);"],
        practical_tasks: [{ task: "Create an array of objects for 3 projects with name, tech, and completed properties.", expected_output: "Array of project objects." }],
        bonus_tips: "Objects are perfect for projects, users, or posts.",
        resources: []
      },
      {
        lesson_title: "DOM Manipulation",
        explanation: "Select, modify, and react to HTML elements using JS.",
        code_examples: ["const header = document.getElementById('header');\nconst projectCards = document.querySelectorAll('.project');"],
        practical_tasks: [{ task: "Select your portfolio sections and log them to the console.", expected_output: "Sections selected and logged." }],
        bonus_tips: "querySelector is flexible, getElementById is fast.",
        resources: []
      },
      {
        lesson_title: "Changing Content & Attributes",
        explanation: "Update text and attributes of elements dynamically.",
        code_examples: ["header.textContent = 'Welcome to Portfolio Pro!';\ndocument.querySelector('.project img').src = 'new-image.jpg';"],
        practical_tasks: [{ task: "Update project titles dynamically using JS.", expected_output: "Project titles updated." }],
        bonus_tips: "Use JS to make your site dynamic.",
        resources: []
      },
      {
        lesson_title: "Adding & Removing Elements",
        explanation: "Create and delete elements in the DOM.",
        code_examples: ["const newProject = document.createElement('div');\nnewProject.className = 'project';\nnewProject.textContent = 'New Project';\ndocument.querySelector('#projects').appendChild(newProject);"],
        practical_tasks: [{ task: "Dynamically add a new project card to the portfolio.", expected_output: "New project card added." }],
        bonus_tips: "Use appendChild and removeChild for DOM changes.",
        resources: []
      },
      {
        lesson_title: "Event Handling",
        explanation: "Respond to user actions with event listeners.",
        code_examples: ["document.querySelector('button').addEventListener('click', () => { alert('Button clicked!'); });"],
        practical_tasks: [{ task: "Add a click event to submit button that validates form fields.", expected_output: "Form validated on click." }],
        bonus_tips: "Attach events after DOM is loaded or use defer in script.",
        resources: []
      },
      {
        lesson_title: "Forms & Input Handling",
        explanation: "Capture and process user input from forms.",
        code_examples: ["const form = document.querySelector('form');\nform.addEventListener('submit', (e) => { e.preventDefault(); const name = form.username.value; console.log(name); });"],
        practical_tasks: [{ task: "Capture contact form input and log all fields when submitted.", expected_output: "Form input logged on submit." }],
        bonus_tips: "Validate inputs before processing.",
        resources: []
      },
      {
        lesson_title: "Arrays, Higher-Order Functions & ES6 Features",
        explanation: "Use map, filter, reduce, find, forEach for modern JS.",
        code_examples: ["const skills = ['HTML', 'CSS', 'JS'];\nskills.forEach(skill => console.log(skill.toUpperCase()));\nconst newSkills = skills.map(skill => skill + ' Developer');"],
        practical_tasks: [{ task: "Use .filter() to list only completed projects.", expected_output: "Completed projects listed." }],
        bonus_tips: "Master higher-order functions for clean code.",
        resources: []
      },
      {
        lesson_title: "Fetch API & Axios",
        explanation: "Communicate with backend APIs to send/receive data dynamically.",
        code_examples: ["fetch('https://api.example.com/projects').then(res => res.json()).then(data => console.log(data)).catch(err => console.error(err));\naxios.get('https://api.example.com/projects').then(res => console.log(res.data)).catch(err => console.error(err));"],
        practical_tasks: [{ task: "Fetch a list of projects from a mock API and display in project cards. Replace fetch with Axios for API requests.", expected_output: "Projects fetched and displayed." }],
        bonus_tips: "Use Axios for simpler syntax and error handling.",
        resources: []
      },
      {
        lesson_title: "Advanced JS Concepts",
        explanation: "Destructuring, spread/rest, async/await, modules for scalable code.",
        code_examples: ["const { name, tech } = project;\nconst newTech = [...tech, 'Node.js'];\nasync function getProjects() { const res = await fetch('api/projects'); const data = await res.json(); console.log(data); }\n// project.js\nexport const projectName = 'Portfolio Pro';\n// main.js\nimport { projectName } from './project.js';"],
        practical_tasks: [{ task: "Refactor portfolio project code using async/await and ES6 modules.", expected_output: "Code uses modern JS features." }],
        bonus_tips: "Use modules for code organization.",
        resources: []
      },
      {
        lesson_title: "DOM + API Integration (Mini Project)",
        explanation: "Fetch projects dynamically from API, populate project cards, validate contact form, add interactive button events and hover effects. Portfolio Pro is now fully dynamic, interactive, and API-ready.",
        code_examples: [],
        practical_tasks: [{ task: "Build Portfolio Pro with dynamic project cards, API integration, and interactive features.", expected_output: "Portfolio Pro is dynamic and API-ready." }],
        bonus_tips: "Integrate all JS concepts for a full-stack-ready frontend.",
        resources: []
      }
    ]
  },
  {
    title: "React Fundamentals",
    description: "Build modern, interactive UIs and production-ready Portfolio Pro apps with React.",
    topics: ["Setup", "JSX", "Components & Props", "State & useState", "Event Handling", "Lists & Keys", "useEffect", "Forms", "Context API", "Router", "Advanced Patterns", "API Integration", "State Libraries", "Testing & Deployment"],
    order: 4,
    difficulty: "intermediate",
    estimatedTime: "4 weeks",
    prerequisites: ["JavaScript Essentials"],
    resources: [],
    subtopics: [
      { lesson_title: "React Fundamentals Overview", explanation: "React is a JavaScript library for building user interfaces. It uses components to break the UI into reusable pieces. State and props drive dynamic behavior.", code_examples: [], practical_tasks: [], bonus_tips: "Use components for modular UI.", resources: [] },
      { lesson_title: "Setting Up React", explanation: "Create a new React project and display your portfolio’s homepage heading.", code_examples: ["npx create-react-app portfolio-pro\ncd portfolio-pro\nnpm start", "function App() { return <h1>Welcome to Portfolio Pro</h1>; } export default App;"], practical_tasks: [{ task: "Create your React project and display homepage heading.", expected_output: "Homepage heading displayed." }], bonus_tips: "Use Vite for faster builds as you advance.", resources: [] },
      { lesson_title: "JSX & Rendering", explanation: "JSX lets you write HTML-like code inside JS. It’s compiled to React.createElement calls.", code_examples: ["const user = 'Harshy';\nconst element = <h2>Hello, {user}</h2>;"], practical_tasks: [{ task: "Display your name dynamically in the homepage using a JSX variable.", expected_output: "Name displayed via JSX." }], bonus_tips: "Wrap multiple elements in a single parent.", resources: [] },
      { lesson_title: "Components & Props", explanation: "Components are reusable UI blocks. Props allow passing data to components.", code_examples: ["function Header({ title }) { return <header><h1>{title}</h1></header>; }\n<App> <Header title='Portfolio Pro'/> </App>"], practical_tasks: [{ task: "Create a <ProjectCard> component that takes name, tech, and completed as props.", expected_output: "ProjectCard displays project info." }], bonus_tips: "Use meaningful prop names.", resources: [] },
      { lesson_title: "State & useState Hook", explanation: "State stores dynamic data in a component. useState allows you to update and render dynamically.", code_examples: ["import { useState } from 'react';\nfunction Counter() { const [count, setCount] = useState(0); return (<><p>Count: {count}</p><button onClick={() => setCount(count + 1)}>Increment</button></>); }"], practical_tasks: [{ task: "Create a Like button for each project card that updates likes in state.", expected_output: "Like button updates state." }], bonus_tips: "State changes trigger re-rendering.", resources: [] },
      { lesson_title: "Event Handling", explanation: "Handle user actions with event listeners in React.", code_examples: ["function ContactForm() { const handleSubmit = (e) => { e.preventDefault(); console.log('Form submitted'); }; return (<form onSubmit={handleSubmit}><input type='text' name='name'/><button type='submit'>Submit</button></form>); }"], practical_tasks: [{ task: "Add validation on your portfolio contact form: check for empty inputs and alert the user.", expected_output: "Form validates and alerts user." }], bonus_tips: "Validate inputs for better UX.", resources: [] },
      { lesson_title: "Lists, Keys & Conditional Rendering", explanation: "Render lists efficiently with keys. Show content based on conditions.", code_examples: ["const projects = [{ name: 'Portfolio Pro', completed: true }, { name: 'Blog', completed: false }];\nfunction ProjectList() { return (<div>{projects.map((p, index) => (<p key={index}>{p.name} {p.completed ? '✅' : '❌'}</p>))}</div>); }"], practical_tasks: [{ task: "Render all your portfolio projects dynamically. Show Completed or In Progress status.", expected_output: "Projects rendered with status." }], bonus_tips: "Always use unique keys.", resources: [] },
      { lesson_title: "useEffect & Lifecycle", explanation: "useEffect handles side effects like fetching data, subscriptions, or DOM updates.", code_examples: ["import { useEffect, useState } from 'react';\nfunction Projects() { const [projects, setProjects] = useState([]); useEffect(() => { fetch('/api/projects').then(res => res.json()).then(data => setProjects(data)); }, []); }"], practical_tasks: [{ task: "Fetch your projects from a mock API and display them in <ProjectCard> components.", expected_output: "Projects fetched and displayed." }], bonus_tips: "useEffect replaces class lifecycle methods.", resources: [] },
      { lesson_title: "Forms in React", explanation: "Build forms with controlled inputs for validation and state management.", code_examples: ["function ContactForm() { const [form, setForm] = useState({ name: '', email: '' }); const handleChange = (e) => { setForm({...form, [e.target.name]: e.target.value }); }; return (<form><input name='name' value={form.name} onChange={handleChange} /><input name='email' value={form.email} onChange={handleChange} /></form>); }"], practical_tasks: [{ task: "Create your portfolio contact form with controlled inputs.", expected_output: "Contact form with controlled inputs." }], bonus_tips: "Controlled components make validation easier.", resources: [] },
      { lesson_title: "Context API & State Management", explanation: "Share state across components without prop-drilling.", code_examples: ["import { createContext, useContext } from 'react';\nconst ThemeContext = createContext('light');\nfunction Header() { const theme = useContext(ThemeContext); return <h1 className={theme}>Portfolio Pro</h1>; }"], practical_tasks: [{ task: "Create a dark/light mode toggle using Context API.", expected_output: "Theme toggles globally." }], bonus_tips: "Context is for global state.", resources: [] },
      { lesson_title: "React Router", explanation: "Handle client-side routing for multi-page apps.", code_examples: ["import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';\nfunction App() { return (<Router><nav><Link to='/'>Home</Link><Link to='/projects'>Projects</Link></nav><Routes><Route path='/' element={<Home />} /><Route path='/projects' element={<ProjectList />} /></Routes></Router>); }"], practical_tasks: [{ task: "Add routing to your portfolio: Home, About, Projects, Contact pages.", expected_output: "Portfolio has client-side routing." }], bonus_tips: "Use BrowserRouter for SPA routing.", resources: [] },
      { lesson_title: "Advanced Patterns", explanation: "Higher-Order Components, Render Props, Custom Hooks, Lazy Loading, Error Boundaries.", code_examples: ["function useFetch(url) { const [data, setData] = useState(null); useEffect(() => { fetch(url).then(res => res.json()).then(setData); }, [url]); return data; }"], practical_tasks: [{ task: "Create a useProjects hook to fetch project data.", expected_output: "Custom hook fetches projects." }], bonus_tips: "Custom hooks promote reuse.", resources: [] },
      { lesson_title: "API Integration & Axios", explanation: "Fetch and display API data dynamically in React.", code_examples: ["import axios from 'axios'; import { useState, useEffect } from 'react'; function Projects() { const [projects, setProjects] = useState([]); useEffect(() => { axios.get('/api/projects').then(res => setProjects(res.data)).catch(err => console.error(err)); }, []); }"], practical_tasks: [{ task: "Fetch projects dynamically and display in your portfolio using <ProjectCard>.", expected_output: "Projects displayed from API." }], bonus_tips: "Use Axios for easier API calls.", resources: [] },
      { lesson_title: "State Management Libraries (Optional)", explanation: "Redux, Zustand, React Query for global state and API caching.", code_examples: [], practical_tasks: [{ task: "Manage a global dark/light theme using Redux or Zustand.", expected_output: "Global theme managed by state library." }], bonus_tips: "Choose state library based on app size.", resources: [] },
      { lesson_title: "Testing, Optimization & Deployment", explanation: "Unit testing, performance optimization, and deployment best practices.", code_examples: [], practical_tasks: [{ task: "Deploy your Portfolio Pro app online and ensure it’s responsive and functional.", expected_output: "Portfolio Pro deployed and tested." }], bonus_tips: "Use React.memo and lazy loading for performance.", resources: [] }
    ]
  },
  {
    title: "Fullstack Integration: Portfolio Pro",
    description: "Combine React frontend, Node.js backend, and MongoDB into a fully working Portfolio Pro project. Step-by-step integration, deployment, and real-world features.",
    topics: ["React", "Node.js", "Express.js", "MongoDB", "API Integration", "Deployment", "Testing"],
    order: 6,
    difficulty: "advanced",
    estimatedTime: "2 months",
    prerequisites: ["React Fundamentals", "Backend Development Mastery"],
    resources: [
      { title: "React Docs", type: "documentation", url: "https://react.dev/" },
      { title: "Node.js Docs", type: "documentation", url: "https://nodejs.org/en/docs/" },
      { title: "MongoDB Docs", type: "documentation", url: "https://www.mongodb.com/docs/" }
    ],
    subtopics: [
      { lesson_title: "Project Setup & Planning", explanation: "Plan your Portfolio Pro fullstack app. Define features, folder structure, and integration points.", code_examples: ["/client (React frontend)\n/server (Node.js backend)\nShared API contract"], practical_tasks: [{ task: "Sketch the architecture and folder structure for your fullstack app.", expected_output: "Diagram and folder plan." }], bonus_tips: "Keep frontend and backend in separate folders.", resources: [] },
      { lesson_title: "Connecting React to Backend APIs", explanation: "Set up fetch/axios in React to call backend endpoints. Handle async data and error states.", code_examples: ["fetch('http://localhost:5000/api/projects').then(res => res.json()).then(data => setProjects(data));"], practical_tasks: [{ task: "Display project data from backend in your React app.", expected_output: "Projects shown in frontend." }], bonus_tips: "Use useEffect for API calls.", resources: [] },
      { lesson_title: "Node.js & Express Basics", explanation: "Set up a simple Node.js server with Express. Understand middleware, routing, and error handling.", code_examples: ["const express = require('express');\nconst app = express();\napp.get('/api/projects', (req, res) => { res.json(projects); });\napp.listen(5000, () => console.log('Server running on http://localhost:5000'));"], practical_tasks: [{ task: "Create a Node.js server that responds with project data.", expected_output: "Server responds with project data." }], bonus_tips: "Use nodemon for automatic restarts during development.", resources: [] },
      { lesson_title: "MongoDB Integration", explanation: "Connect your Express app to MongoDB. Perform CRUD operations and understand Mongoose for data modeling.", code_examples: ["const mongoose = require('mongoose');\nmongoose.connect('mongodb://localhost:27017/portfolio', { useNewUrlParser: true, useUnifiedTopology: true });\nconst projectSchema = new mongoose.Schema({ name: String, tech: [String], completed: Boolean });\nconst Project = mongoose.model('Project', projectSchema);"], practical_tasks: [{ task: "Set up MongoDB connection and create a project model.", expected_output: "MongoDB connected and model created." }], bonus_tips: "Use MongoDB Atlas for a cloud database.", resources: [] },
      { lesson_title: "API Development with Express", explanation: "Build RESTful APIs with Express. Handle requests, responses, and middleware integration.", code_examples: ["app.post('/api/projects', (req, res) => { const newProject = new Project(req.body); newProject.save().then(() => res.status(201).send('Project created')); });"], practical_tasks: [{ task: "Create APIs for all CRUD operations on projects.", expected_output: "All CRUD APIs functional." }], bonus_tips: "Test APIs with Postman or Insomnia.", resources: [] },
      { lesson_title: "Connecting Frontend & Backend", explanation: "Integrate React frontend with Express backend. Handle CORS, environment variables, and proxy setup.", code_examples: ["// In React app's package.json\n\"proxy\": \"http://localhost:5000\""], practical_tasks: [{ task: "Connect your React app to the Express backend.", expected_output: "Frontend communicates with backend." }], bonus_tips: "Use environment variables for configuration.", resources: [] },
      { lesson_title: "Authentication & Authorization", explanation: "Implement user authentication with JWT. Protect routes and manage user sessions.", code_examples: ["const jwt = require('jsonwebtoken');\napp.post('/api/login', (req, res) => { const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' }); res.json({ token }); });"], practical_tasks: [{ task: "Add user authentication to your app.", expected_output: "Users can register, login, and access protected routes." }], bonus_tips: "Use bcrypt for password hashing.", resources: [] },
      { lesson_title: "Deployment & Environment Variables", explanation: "Deploy your fullstack app on platforms like Heroku, Vercel, or Netlify. Manage environment variables for production.", code_examples: ["// In server.js\nconst PORT = process.env.PORT || 5000;\napp.listen(PORT, () => console.log(`Server running on port ${PORT}`));"], practical_tasks: [{ task: "Deploy your fullstack app and ensure all features work.", expected_output: "App deployed and functional." }], bonus_tips: "Check logs for debugging deployment issues.", resources: [] },
      { lesson_title: "Testing & Debugging", explanation: "Write tests for your backend APIs and frontend components. Use debugging tools and techniques.", code_examples: ["// Example test with Jest\ntest('adds 1 + 2 to equal 3', () => { expect(1 + 2).toBe(3); });"], practical_tasks: [{ task: "Write tests for critical parts of your application.", expected_output: "Tests pass without errors." }], bonus_tips: "Use coverage reports to identify untested parts.", resources: [] }
    ]
  }
]
