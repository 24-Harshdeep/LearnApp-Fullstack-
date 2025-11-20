import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Curriculum from './models/Curriculum.js'

dotenv.config()

const curriculumData = [
  {
    topic: "HTML",
    description: "Master the foundation of web development with HTML",
    difficulty: "beginner",
    estimatedHours: 10,
    icon: "🟠",
    subtopics: [
      {
        lessonTitle: "Introduction to HTML",
        explanation: "HTML (HyperText Markup Language) is the standard markup language for creating web pages.",
        codeExamples: ["<h1>Hello World</h1>", "<p>This is a paragraph</p>"],
        practicalTasks: [
          {
            task: "Create a simple HTML page with a heading and paragraph",
            expectedOutput: "An HTML page with <h1> and <p> tags",
            hints: ["Use <!DOCTYPE html>", "Add <html>, <head>, and <body> tags"],
            xpReward: 20
          }
        ],
        bonusTips: "Always use semantic HTML for better accessibility",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML"],
        order: 0,
        estimatedTime: 30
      },
      {
        lessonTitle: "HTML Elements and Tags",
        explanation: "Learn about various HTML elements and how to use them effectively.",
        codeExamples: ["<div>Container</div>", "<span>Inline text</span>", "<a href='#'>Link</a>"],
        practicalTasks: [
          {
            task: "Create a webpage with different HTML elements",
            expectedOutput: "Use div, span, a, img, ul, li tags",
            hints: ["Organize content logically", "Use proper nesting"],
            xpReward: 20
          }
        ],
        order: 1,
        estimatedTime: 45
      },
      {
        lessonTitle: "HTML Forms",
        explanation: "Understanding HTML forms and input elements for user interaction.",
        codeExamples: ["<form><input type='text' /></form>", "<button>Submit</button>"],
        practicalTasks: [
          {
            task: "Create a contact form with name, email, and message fields",
            expectedOutput: "A functional HTML form with proper input types",
            hints: ["Use <form> tag", "Add labels for accessibility"],
            xpReward: 30
          }
        ],
        order: 2,
        estimatedTime: 60
      }
    ]
  },
  {
    topic: "CSS",
    description: "Style your web pages with CSS",
    difficulty: "beginner",
    estimatedHours: 12,
    icon: "🔵",
    subtopics: [
      {
        lessonTitle: "Introduction to CSS",
        explanation: "CSS (Cascading Style Sheets) is used to style and layout web pages.",
        codeExamples: ["body { margin: 0; }", "h1 { color: blue; }"],
        practicalTasks: [
          {
            task: "Style an HTML page with basic CSS",
            expectedOutput: "Apply colors, fonts, and spacing",
            hints: ["Use external CSS file", "Link it in HTML head"],
            xpReward: 20
          }
        ],
        order: 0,
        estimatedTime: 30
      },
      {
        lessonTitle: "CSS Selectors",
        explanation: "Learn how to target HTML elements with CSS selectors.",
        codeExamples: [".class { }", "#id { }", "element { }"],
        practicalTasks: [
          {
            task: "Use different CSS selectors to style elements",
            expectedOutput: "Style using class, id, and element selectors",
            hints: ["Be specific with selectors", "Avoid over-specificity"],
            xpReward: 25
          }
        ],
        order: 1,
        estimatedTime: 45
      },
      {
        lessonTitle: "CSS Flexbox",
        explanation: "Master flexible box layout for responsive designs.",
        codeExamples: ["display: flex;", "justify-content: center;", "align-items: center;"],
        practicalTasks: [
          {
            task: "Create a responsive navigation bar using flexbox",
            expectedOutput: "A horizontal nav that adapts to screen size",
            hints: ["Use display: flex", "Experiment with flex properties"],
            xpReward: 35
          }
        ],
        order: 2,
        estimatedTime: 60
      }
    ]
  },
  {
    topic: "JavaScript",
    description: "Add interactivity to your websites with JavaScript",
    difficulty: "intermediate",
    estimatedHours: 20,
    icon: "🟡",
    subtopics: [
      {
        lessonTitle: "JavaScript Basics",
        explanation: "Learn the fundamentals of JavaScript programming.",
        codeExamples: ["let x = 5;", "const name = 'John';", "console.log(x);"],
        practicalTasks: [
          {
            task: "Create variables and log them to console",
            expectedOutput: "Use let, const, and console.log",
            hints: ["Open browser console", "Use F12 to debug"],
            xpReward: 20
          }
        ],
        order: 0,
        estimatedTime: 45
      },
      {
        lessonTitle: "Functions and Scope",
        explanation: "Understanding JavaScript functions and variable scope.",
        codeExamples: ["function greet(name) { return 'Hello ' + name; }"],
        practicalTasks: [
          {
            task: "Create a function that calculates the sum of two numbers",
            expectedOutput: "A working function that returns the sum",
            hints: ["Use return statement", "Test with different inputs"],
            xpReward: 30
          }
        ],
        order: 1,
        estimatedTime: 60
      }
    ]
  },
  {
    topic: "React",
    description: "Build modern user interfaces with React",
    difficulty: "intermediate",
    estimatedHours: 25,
    icon: "🔷",
    subtopics: [
      {
        lessonTitle: "React Components",
        explanation: "Learn to build reusable React components.",
        codeExamples: ["function MyComponent() { return <div>Hello</div>; }"],
        practicalTasks: [
          {
            task: "Create a simple React component",
            expectedOutput: "A functional component that renders JSX",
            hints: ["Use function syntax", "Return JSX"],
            xpReward: 25
          }
        ],
        order: 0,
        estimatedTime: 60
      }
    ]
  },
  {
    topic: "Node.js",
    description: "Server-side JavaScript with Node.js",
    difficulty: "intermediate",
    estimatedHours: 20,
    icon: "🟢",
    subtopics: [
      {
        lessonTitle: "Node.js Basics",
        explanation: "Introduction to Node.js runtime and its core modules.",
        codeExamples: ["const http = require('http');"],
        practicalTasks: [
          {
            task: "Create a simple HTTP server",
            expectedOutput: "A running Node.js server on port 3000",
            hints: ["Use http module", "Listen on a port"],
            xpReward: 30
          }
        ],
        order: 0,
        estimatedTime: 60
      }
    ]
  },
  {
    topic: "TypeScript",
    description: "Add type safety to your JavaScript code",
    difficulty: "intermediate",
    estimatedHours: 15,
    icon: "🔹",
    subtopics: [
      {
        lessonTitle: "TypeScript Basics",
        explanation: "Learn TypeScript syntax and type annotations.",
        codeExamples: ["let name: string = 'John';", "const age: number = 25;"],
        practicalTasks: [
          {
            task: "Create typed variables and functions",
            expectedOutput: "TypeScript code with proper type annotations",
            hints: ["Use : to specify types", "Compile with tsc"],
            xpReward: 25
          }
        ],
        order: 0,
        estimatedTime: 45
      }
    ]
  }
]

async function seedCurriculum() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://kamaljangid:Kamal%40123@cluster0.m1lrv3n.mongodb.net/learnflow?retryWrites=true&w=majority')
    console.log('✅ MongoDB Connected')

    // Clear existing curriculum
    await Curriculum.deleteMany({})
    console.log('🗑️  Cleared existing curriculum')

    // Insert new curriculum
    const inserted = await Curriculum.insertMany(curriculumData)
    console.log(`✅ Seeded ${inserted.length} curriculum items`)

    inserted.forEach(curr => {
      console.log(`   - ${curr.topic} (${curr.subtopics.length} lessons)`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding curriculum:', error)
    process.exit(1)
  }
}

seedCurriculum()
