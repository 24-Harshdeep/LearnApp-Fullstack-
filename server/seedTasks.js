import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Task from './models/Task.js'

dotenv.config()

const tasksData = [
  // HTML Tasks
  {
    title: "Create Your First HTML Page",
    description: "Build a simple HTML page with a heading and paragraph introducing yourself.",
    topic: "HTML Basics",
    difficulty: "easy",
    xpReward: 50,
    timeEstimate: "15 min",
    tags: ["html", "basics", "structure"],
    starterCode: "<!-- Write your HTML code here -->\n",
    solution: "<!DOCTYPE html>\n<html>\n<head>\n  <title>About Me</title>\n</head>\n<body>\n  <h1>Your Name</h1>\n  <p>Brief introduction about yourself.</p>\n</body>\n</html>",
    instructions: "Create an HTML page with a title, heading, and paragraph about yourself.",
    hints: [
      "Start with <!DOCTYPE html>",
      "Use <h1> for the main heading",
      "Use <p> for paragraphs"
    ],
    testCases: [
      { input: "", expectedOutput: "HTML page with h1 and p tags" }
    ]
  },
  {
    title: "Build a Navigation Menu",
    description: "Create a navigation menu with links to Home, About, Projects, and Contact pages.",
    topic: "HTML Navigation",
    difficulty: "easy",
    xpReward: 75,
    timeEstimate: "20 min",
    tags: ["html", "navigation", "links"],
    starterCode: "<!-- Create your navigation here -->\n",
    solution: "<nav>\n  <ul>\n    <li><a href=\"#home\">Home</a></li>\n    <li><a href=\"#about\">About</a></li>\n    <li><a href=\"#projects\">Projects</a></li>\n    <li><a href=\"#contact\">Contact</a></li>\n  </ul>\n</nav>",
    instructions: "Use semantic HTML to create a navigation menu with 4 links.",
    hints: [
      "Use <nav> for semantic navigation",
      "Use <ul> and <li> for list items",
      "Use <a> tags with href for links"
    ]
  },
  {
    title: "Create a Contact Form",
    description: "Build an HTML form with name, email, and message fields.",
    topic: "HTML Forms",
    difficulty: "medium",
    xpReward: 100,
    timeEstimate: "30 min",
    tags: ["html", "forms", "input"],
    starterCode: "<!-- Create your form here -->\n",
    solution: "<form>\n  <label>Name: <input type=\"text\" name=\"name\" required></label>\n  <label>Email: <input type=\"email\" name=\"email\" required></label>\n  <label>Message: <textarea name=\"message\" required></textarea></label>\n  <button type=\"submit\">Send</button>\n</form>",
    instructions: "Create a contact form with proper labels and input validation.",
    hints: [
      "Use <form> to wrap inputs",
      "Use <input type=\"email\"> for email",
      "Use <textarea> for message"
    ]
  },

  // CSS Tasks
  {
    title: "Style a Button",
    description: "Create a styled button with background color, padding, and hover effect.",
    topic: "CSS Styling",
    difficulty: "easy",
    xpReward: 50,
    timeEstimate: "15 min",
    tags: ["css", "styling", "button"],
    starterCode: "/* Style your button */\n.btn {\n  \n}",
    solution: ".btn {\n  background-color: #007bff;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n}\n\n.btn:hover {\n  background-color: #0056b3;\n}",
    instructions: "Style a button with colors, padding, and a hover effect.",
    hints: [
      "Use background-color for button color",
      "Add padding for spacing",
      "Use :hover for hover effects"
    ]
  },
  {
    title: "Create a Flexbox Layout",
    description: "Use Flexbox to create a responsive navigation bar with space-between.",
    topic: "CSS Flexbox",
    difficulty: "medium",
    xpReward: 100,
    timeEstimate: "25 min",
    tags: ["css", "flexbox", "layout"],
    starterCode: "/* Create flexbox layout */\n.navbar {\n  \n}",
    solution: ".navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem;\n  background-color: #333;\n}\n\n.navbar a {\n  color: white;\n  text-decoration: none;\n  margin: 0 1rem;\n}",
    instructions: "Create a navigation bar using Flexbox with proper alignment.",
    hints: [
      "Use display: flex",
      "Use justify-content for horizontal alignment",
      "Use align-items for vertical alignment"
    ]
  },
  {
    title: "Build a CSS Grid Gallery",
    description: "Create a responsive image gallery using CSS Grid with 3 columns.",
    topic: "CSS Grid",
    difficulty: "hard",
    xpReward: 125,
    timeEstimate: "35 min",
    tags: ["css", "grid", "responsive"],
    starterCode: "/* Create grid gallery */\n.gallery {\n  \n}",
    solution: ".gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}\n\n@media (max-width: 768px) {\n  .gallery {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n\n@media (max-width: 480px) {\n  .gallery {\n    grid-template-columns: 1fr;\n  }\n}",
    instructions: "Build a responsive gallery using CSS Grid with media queries.",
    hints: [
      "Use display: grid",
      "Use grid-template-columns with repeat()",
      "Add media queries for responsiveness"
    ]
  },

  // JavaScript Tasks
  {
    title: "Calculate Sum of Array",
    description: "Write a function that calculates the sum of all numbers in an array.",
    topic: "JavaScript Arrays",
    difficulty: "easy",
    xpReward: 75,
    timeEstimate: "15 min",
    tags: ["javascript", "arrays", "functions"],
    starterCode: "function sumArray(arr) {\n  // Your code here\n}\n\nconsole.log(sumArray([1, 2, 3, 4, 5])); // Should output 15",
    solution: "function sumArray(arr) {\n  return arr.reduce((sum, num) => sum + num, 0);\n}\n\nconsole.log(sumArray([1, 2, 3, 4, 5]));",
    instructions: "Use array methods to calculate the sum of all numbers.",
    hints: [
      "Use array.reduce() method",
      "Start with initial value of 0",
      "Accumulate sum in each iteration"
    ],
    testCases: [
      { input: "[1, 2, 3, 4, 5]", expectedOutput: "15" },
      { input: "[10, 20, 30]", expectedOutput: "60" }
    ]
  },
  {
    title: "Filter Even Numbers",
    description: "Create a function that filters out even numbers from an array.",
    topic: "JavaScript Arrays",
    difficulty: "easy",
    xpReward: 75,
    timeEstimate: "15 min",
    tags: ["javascript", "arrays", "filter"],
    starterCode: "function filterEvens(arr) {\n  // Your code here\n}\n\nconsole.log(filterEvens([1, 2, 3, 4, 5, 6])); // Should output [2, 4, 6]",
    solution: "function filterEvens(arr) {\n  return arr.filter(num => num % 2 === 0);\n}\n\nconsole.log(filterEvens([1, 2, 3, 4, 5, 6]));",
    instructions: "Use the filter method to return only even numbers.",
    hints: [
      "Use array.filter() method",
      "Check if number % 2 === 0",
      "Return filtered array"
    ]
  },
  {
    title: "DOM Manipulation - Add Elements",
    description: "Write code to add 5 list items to an unordered list dynamically.",
    topic: "JavaScript DOM",
    difficulty: "medium",
    xpReward: 100,
    timeEstimate: "20 min",
    tags: ["javascript", "dom", "manipulation"],
    starterCode: "// Add 5 items to the list\nconst ul = document.getElementById('myList');\n// Your code here",
    solution: "const ul = document.getElementById('myList');\nfor (let i = 1; i <= 5; i++) {\n  const li = document.createElement('li');\n  li.textContent = `Item ${i}`;\n  ul.appendChild(li);\n}",
    instructions: "Dynamically create and add list items to the DOM.",
    hints: [
      "Use document.createElement('li')",
      "Set textContent for each item",
      "Use appendChild() to add to list"
    ]
  },
  {
    title: "Fetch API Data",
    description: "Fetch data from a REST API and display the results in console.",
    topic: "JavaScript Async",
    difficulty: "hard",
    xpReward: 150,
    timeEstimate: "30 min",
    tags: ["javascript", "api", "fetch", "async"],
    starterCode: "// Fetch data from API\nasync function fetchData() {\n  // Your code here\n}\n\nfetchData();",
    solution: "async function fetchData() {\n  try {\n    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}\n\nfetchData();",
    instructions: "Use async/await to fetch data from an API with error handling.",
    hints: [
      "Use async/await syntax",
      "Use fetch() to get data",
      "Convert response to JSON with .json()",
      "Add try-catch for error handling"
    ]
  },

  // React Tasks
  {
    title: "Create a Counter Component",
    description: "Build a React component with increment and decrement buttons.",
    topic: "React Hooks",
    difficulty: "medium",
    xpReward: 100,
    timeEstimate: "25 min",
    tags: ["react", "hooks", "state"],
    starterCode: "import { useState } from 'react';\n\nfunction Counter() {\n  // Your code here\n}\n\nexport default Counter;",
    solution: "import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <h2>Count: {count}</h2>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n      <button onClick={() => setCount(count - 1)}>Decrement</button>\n    </div>\n  );\n}\n\nexport default Counter;",
    instructions: "Create a counter with state management using useState hook.",
    hints: [
      "Use useState hook",
      "Create increment/decrement functions",
      "Display count value"
    ]
  },
  {
    title: "Build a Todo List Component",
    description: "Create a React todo list with add and delete functionality.",
    topic: "React State Management",
    difficulty: "hard",
    xpReward: 150,
    timeEstimate: "40 min",
    tags: ["react", "hooks", "state", "lists"],
    starterCode: "import { useState } from 'react';\n\nfunction TodoList() {\n  // Your code here\n}\n\nexport default TodoList;",
    solution: "import { useState } from 'react';\n\nfunction TodoList() {\n  const [todos, setTodos] = useState([]);\n  const [input, setInput] = useState('');\n\n  const addTodo = () => {\n    if (input.trim()) {\n      setTodos([...todos, { id: Date.now(), text: input }]);\n      setInput('');\n    }\n  };\n\n  const deleteTodo = (id) => {\n    setTodos(todos.filter(todo => todo.id !== id));\n  };\n\n  return (\n    <div>\n      <input value={input} onChange={(e) => setInput(e.target.value)} />\n      <button onClick={addTodo}>Add</button>\n      <ul>\n        {todos.map(todo => (\n          <li key={todo.id}>\n            {todo.text}\n            <button onClick={() => deleteTodo(todo.id)}>Delete</button>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n\nexport default TodoList;",
    instructions: "Build a todo list with add and delete using array state.",
    hints: [
      "Use useState for todos array and input",
      "Use map() to render todos",
      "Use filter() to delete items"
    ]
  },
  {
    title: "Fetch and Display Users",
    description: "Create a React component that fetches and displays a list of users from an API.",
    topic: "React API Integration",
    difficulty: "hard",
    xpReward: 175,
    timeEstimate: "35 min",
    tags: ["react", "hooks", "api", "fetch"],
    starterCode: "import { useState, useEffect } from 'react';\n\nfunction UserList() {\n  // Your code here\n}\n\nexport default UserList;",
    solution: "import { useState, useEffect } from 'react';\n\nfunction UserList() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetch('https://jsonplaceholder.typicode.com/users')\n      .then(res => res.json())\n      .then(data => {\n        setUsers(data);\n        setLoading(false);\n      })\n      .catch(err => console.error(err));\n  }, []);\n\n  if (loading) return <div>Loading...</div>;\n\n  return (\n    <ul>\n      {users.map(user => (\n        <li key={user.id}>{user.name} - {user.email}</li>\n      ))}\n    </ul>\n  );\n}\n\nexport default UserList;",
    instructions: "Fetch users on mount using useEffect and display with loading state.",
    hints: [
      "Use useEffect for data fetching",
      "Use useState for users and loading state",
      "Show loading message while fetching"
    ]
  },

  // Backend/Node.js Tasks
  {
    title: "Create Express Server",
    description: "Build a basic Express server with a GET route that returns 'Hello World'.",
    topic: "Node.js Basics",
    difficulty: "easy",
    xpReward: 100,
    timeEstimate: "20 min",
    tags: ["nodejs", "express", "backend"],
    starterCode: "const express = require('express');\nconst app = express();\n\n// Your code here\n\napp.listen(3000, () => console.log('Server running'));",
    solution: "const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('Hello World');\n});\n\napp.get('/api/message', (req, res) => {\n  res.json({ message: 'Hello from API' });\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));",
    instructions: "Set up Express server with GET routes for text and JSON responses.",
    hints: [
      "Use app.get() for GET routes",
      "Use res.send() for text response",
      "Use res.json() for JSON response"
    ]
  },
  {
    title: "Build REST API with CRUD",
    description: "Create a REST API for managing a list of items with GET, POST, PUT, DELETE routes.",
    topic: "REST API",
    difficulty: "hard",
    xpReward: 200,
    timeEstimate: "50 min",
    tags: ["nodejs", "express", "rest-api", "crud"],
    starterCode: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nlet items = [];\n\n// Your CRUD routes here\n\napp.listen(3000);",
    solution: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nlet items = [];\nlet nextId = 1;\n\n// GET all items\napp.get('/api/items', (req, res) => {\n  res.json(items);\n});\n\n// POST new item\napp.post('/api/items', (req, res) => {\n  const item = { id: nextId++, ...req.body };\n  items.push(item);\n  res.status(201).json(item);\n});\n\n// PUT update item\napp.put('/api/items/:id', (req, res) => {\n  const id = parseInt(req.params.id);\n  const index = items.findIndex(i => i.id === id);\n  if (index !== -1) {\n    items[index] = { id, ...req.body };\n    res.json(items[index]);\n  } else {\n    res.status(404).json({ error: 'Item not found' });\n  }\n});\n\n// DELETE item\napp.delete('/api/items/:id', (req, res) => {\n  const id = parseInt(req.params.id);\n  items = items.filter(i => i.id !== id);\n  res.status(204).send();\n});\n\napp.listen(3000, () => console.log('Server running'));",
    instructions: "Implement full CRUD operations with proper HTTP methods and status codes.",
    hints: [
      "Use app.get/post/put/delete for CRUD",
      "Use req.params for URL parameters",
      "Use req.body for POST/PUT data",
      "Return appropriate status codes"
    ]
  }
]

const seedTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('📚 Connected to MongoDB')

    // Clear existing tasks
    await Task.deleteMany({})
    console.log('🗑️  Cleared old tasks')

    // Insert new tasks
    const result = await Task.insertMany(tasksData)
    console.log(`✅ Successfully seeded ${result.length} tasks!`)
    
    // Count by category
    const categories = {}
    result.forEach(task => {
      categories[task.category] = (categories[task.category] || 0) + 1
    })
    
    console.log('\n📊 Tasks by Category:')
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} tasks`)
    })
    
    const totalXP = result.reduce((sum, task) => sum + task.xpReward, 0)
    console.log(`\n⭐ Total XP Available: ${totalXP}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding tasks:', error)
    process.exit(1)
  }
}

seedTasks()
