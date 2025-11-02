import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import Curriculum from './models/Curriculum.js'

dotenv.config()

const htmlPart1Curriculum = {
  topic: "HTML Fundamentals - Part 1",
  description: "Master the core foundations of HTML - the building blocks of the web. Learn document structure, text formatting, lists, links, images, tables, and essential metadata.",
  difficulty: "beginner",
  estimatedHours: 12,
  icon: "🌐",
  subtopics: [
    {
      lessonTitle: "Module 1: Introduction to HTML",
      order: 1,
      estimatedTime: 45,
      explanation: `## Theory

HTML (HyperText Markup Language) forms the skeleton of every webpage. It structures content through elements enclosed in tags. Each HTML document starts with a \`<!DOCTYPE html>\` declaration to ensure modern browser rendering.

### Key Concepts:
- **HTML** stands for HyperText Markup Language
- **Tags** are enclosed in angle brackets like \`<tag>\`
- Most tags come in pairs: opening \`<tag>\` and closing \`</tag>\`
- The **DOM** (Document Object Model) is the tree structure of HTML elements

### Basic Structure:
Every HTML document follows this structure:
- \`<!DOCTYPE html>\` - Declares HTML5
- \`<html>\` - Root element
- \`<head>\` - Contains metadata
- \`<body>\` - Contains visible content`,
      codeExamples: [
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My First Page</title>
  </head>
  <body>
    <h1>Welcome to My Website</h1>
    <p>This is my first HTML page!</p>
  </body>
</html>`
      ],
      practicalTasks: [
        {
          task: "Create a simple web page with a title, heading, and a short paragraph about yourself",
          expectedOutput: "An HTML file with proper structure including <!DOCTYPE html>, <html>, <head>, <title>, and <body> tags",
          hints: [
            "Start with <!DOCTYPE html> declaration",
            "Use <h1> for your main heading",
            "Add a <p> tag for your paragraph",
            "Don't forget to close all tags"
          ],
          xpReward: 30
        },
        {
          task: "Add a second paragraph about your learning goals and a meaningful page title",
          expectedOutput: "Two paragraphs with descriptive content and a custom title in the <title> tag",
          hints: [
            "Use multiple <p> tags for separate paragraphs",
            "Make your title descriptive and unique",
            "Remember to save your file as index.html"
          ],
          xpReward: 20
        }
      ],
      bonusTips: "Try viewing your HTML file in different browsers (Chrome, Firefox, Safari) to see how consistent it looks. Use the browser's developer tools (F12) to inspect your HTML structure.",
      resources: [
        "MDN: HTML Basics - https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics",
        "W3C: HTML Introduction - https://www.w3.org/standards/webdesign/htmlcss"
      ]
    },
    {
      title: "Module 2: Text and Document Structure",
      content: `## Theory

HTML uses headings and paragraphs to organize content hierarchically. Headings range from \`<h1>\` (most important) to \`<h6>\` (least important). Inline tags like \`<strong>\`, \`<em>\`, and \`<mark>\` add emphasis without breaking text flow.

### Heading Hierarchy:
- \`<h1>\` - Main page title (use only once per page)
- \`<h2>\` - Major sections
- \`<h3>\` - Subsections
- \`<h4>\`-\`<h6>\` - Further subdivisions

### Text Formatting Tags:
- \`<p>\` - Paragraph block
- \`<strong>\` - Important text (bold)
- \`<em>\` - Emphasized text (italic)
- \`<mark>\` - Highlighted text
- \`<small>\` - Fine print
- \`<br>\` - Line break
- \`<hr>\` - Horizontal rule (divider)

## Example

\`\`\`html
<h1>Our Vision</h1>
<p>We aim to <strong>empower developers</strong> through clear learning resources.<br>Join us today!</p>

<h2>Why Learn HTML?</h2>
<p>HTML is <em>essential</em> for web development. It's the <mark>foundation</mark> of every website.</p>

<hr>

<p><small>Last updated: 2025</small></p>
\`\`\`

## Challenge

Write an "About Me" section with:
1. An \`<h1>\` with your name
2. An \`<h2>\` for "My Background"
3. A paragraph using \`<strong>\` and \`<em>\`
4. Add a horizontal rule between sections
5. Include a line break within a paragraph

**Bonus**: Use \`<mark>\` to highlight your key skill.`,
      examples: [
        {
          title: "Formatted Article Structure",
          code: `<article>
  <h1>Learning Web Development</h1>
  <h2>Chapter 1: Getting Started</h2>
  <p>Web development is an <strong>exciting journey</strong> that requires <em>dedication</em> and practice.</p>
  <hr>
  <h2>Chapter 2: HTML Basics</h2>
  <p>HTML provides the <mark>structure</mark> for web content.<br>It's the first step in your web dev path.</p>
  <p><small>Written by: AI Coach</small></p>
</article>`,
          explanation: "Demonstrates proper heading hierarchy and inline text formatting."
        }
      ],
      resources: [
        {
          title: "MDN: HTML Text Fundamentals",
          url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals"
        }
      ]
    },
    {
      title: "Module 3: Lists and Links",
      content: `## Theory

Lists make data scannable and easy to digest. HTML offers three types of lists: ordered (numbered), unordered (bulleted), and description lists. Links (\`<a>\`) connect web pages together, forming the "web" in World Wide Web.

### List Types:
- **Ordered Lists** (\`<ol>\`) - Numbered items
- **Unordered Lists** (\`<ul>\`) - Bulleted items  
- **List Items** (\`<li>\`) - Individual entries
- **Nested Lists** - Lists within lists

### Link Attributes:
- \`href\` - Destination URL
- \`target="_blank"\` - Opens in new tab
- \`rel="noopener"\` - Security for external links
- \`#id\` - Links to page sections (anchors)

## Example

\`\`\`html
<h2>Top 3 Coding Skills</h2>
<ol>
  <li>HTML - Structure</li>
  <li>CSS - Styling</li>
  <li>JavaScript - Interactivity</li>
</ol>

<h2>Learning Resources</h2>
<ul>
  <li><a href="https://developer.mozilla.org/" target="_blank" rel="noopener">MDN Web Docs</a></li>
  <li><a href="#section2">Jump to Section 2</a></li>
  <li><a href="about.html">About Page</a></li>
</ul>

<h3>Nested List Example</h3>
<ul>
  <li>Frontend
    <ul>
      <li>HTML</li>
      <li>CSS</li>
    </ul>
  </li>
  <li>Backend
    <ul>
      <li>Node.js</li>
      <li>Python</li>
    </ul>
  </li>
</ul>
\`\`\`

## Challenge

Build a navigation menu with:
1. An unordered list of page sections
2. Links to at least 3 different sections using \`#id\`
3. One external link to a learning resource
4. Proper \`target\` and \`rel\` attributes for external links

Create a "Skills" section with:
1. An ordered list ranking your top 5 skills
2. A nested list showing sub-categories

**Bonus**: Add a "Table of Contents" at the top linking to each major section.`,
      examples: [
        {
          title: "Navigation Menu with Nested List",
          code: `<nav>
  <h2>Main Menu</h2>
  <ul>
    <li><a href="#home">Home</a></li>
    <li><a href="#about">About</a>
      <ul>
        <li><a href="#team">Our Team</a></li>
        <li><a href="#mission">Our Mission</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="https://github.com" target="_blank" rel="noopener">GitHub</a></li>
  </ul>
</nav>`,
          explanation: "Shows navigation with nested sublists and proper link attributes."
        }
      ],
      resources: [
        {
          title: "MDN: HTML Links",
          url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Creating_hyperlinks"
        },
        {
          title: "MDN: HTML Lists",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul"
        }
      ]
    },
    {
      title: "Module 4: Images",
      content: `## Theory

Images visually enhance content and convey information that text alone cannot. The \`<img>\` tag embeds images using the \`src\` attribute. Accessibility is crucial — always provide descriptive \`alt\` text for screen readers and SEO.

### Image Best Practices:
- **Always use \`alt\` text** - Describes image for accessibility
- **Optimize file size** - Compress images for faster loading
- **Use appropriate formats** - JPG for photos, PNG for graphics, WebP for modern browsers
- **Responsive sizing** - Use \`width\` and \`height\` attributes
- **Lazy loading** - \`loading="lazy"\` for below-the-fold images

### Image Attributes:
- \`src\` - Image file path (required)
- \`alt\` - Alternative text description (required)
- \`width\` & \`height\` - Dimensions in pixels
- \`loading="lazy"\` - Defers loading until needed
- \`title\` - Tooltip on hover (optional)

## Example

\`\`\`html
<!-- Hero image with descriptive alt text -->
<img 
  src="team.jpg" 
  alt="Our development team of 5 people smiling together in the office" 
  width="800" 
  height="600"
>

<!-- Logo with specific dimensions -->
<img 
  src="logo.png" 
  alt="Company Logo - IdleLearn" 
  width="150" 
  height="50"
>

<!-- Lazy-loaded image for better performance -->
<img 
  src="gallery-photo.jpg" 
  alt="Beautiful sunset over mountain landscape" 
  loading="lazy"
  width="600"
  height="400"
>

<!-- Image with figure and caption -->
<figure>
  <img 
    src="diagram.png" 
    alt="Flowchart showing user authentication process"
    width="500"
  >
  <figcaption>Figure 1: User Authentication Flow</figcaption>
</figure>
\`\`\`

## Challenge

Create an image gallery page with:
1. A hero image at the top (800px wide)
2. At least 3 gallery images with descriptive \`alt\` text
3. Use \`loading="lazy"\` on gallery images
4. Wrap one image in a \`<figure>\` with \`<figcaption>\`
5. Include your profile photo (or placeholder)

**Bonus**: 
- Add a logo image with proper dimensions
- Create image links by wrapping \`<img>\` in \`<a>\` tags`,
      examples: [
        {
          title: "Image Gallery with Captions",
          code: `<section class="gallery">
  <h2>Project Showcase</h2>
  
  <figure>
    <img 
      src="project1.jpg" 
      alt="E-commerce website homepage with clean design"
      width="600"
      height="400"
      loading="lazy"
    >
    <figcaption>E-commerce Platform - Built with React</figcaption>
  </figure>
  
  <figure>
    <img 
      src="project2.jpg" 
      alt="Mobile app dashboard showing analytics charts"
      width="600"
      height="400"
      loading="lazy"
    >
    <figcaption>Analytics Dashboard - Mobile App</figcaption>
  </figure>
  
  <!-- Clickable image -->
  <a href="project3.html">
    <img 
      src="project3-thumb.jpg" 
      alt="Portfolio website preview - click to view full project"
      width="300"
      height="200"
    >
  </a>
</section>`,
          explanation: "Demonstrates proper image usage with accessibility, lazy loading, and semantic markup."
        }
      ],
      resources: [
        {
          title: "MDN: Images in HTML",
          url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Images_in_HTML"
        },
        {
          title: "Web.dev: Image Optimization",
          url: "https://web.dev/fast/#optimize-your-images"
        }
      ]
    },
    {
      title: "Module 5: Tables",
      content: `## Theory

Tables organize data into rows and columns, making complex information easy to compare. Use tables for tabular data only — never for page layout (that's CSS's job). Proper table structure improves accessibility and readability.

### Table Structure:
- \`<table>\` - Container for entire table
- \`<thead>\` - Table header section
- \`<tbody>\` - Table body section
- \`<tfoot>\` - Table footer (totals, notes)
- \`<tr>\` - Table row
- \`<th>\` - Header cell (bold, centered)
- \`<td>\` - Data cell

### Table Attributes:
- \`colspan\` - Span multiple columns
- \`rowspan\` - Span multiple rows
- \`scope\` - Associates headers with cells (accessibility)

## Example

\`\`\`html
<h2>Pricing Plans</h2>
<table>
  <caption>Monthly Subscription Options</caption>
  <thead>
    <tr>
      <th scope="col">Plan</th>
      <th scope="col">Price</th>
      <th scope="col">Features</th>
      <th scope="col">Support</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Basic</th>
      <td>$10/mo</td>
      <td>5 Projects</td>
      <td>Email</td>
    </tr>
    <tr>
      <th scope="row">Pro</th>
      <td>$25/mo</td>
      <td>Unlimited Projects</td>
      <td>Priority Email</td>
    </tr>
    <tr>
      <th scope="row">Enterprise</th>
      <td>$99/mo</td>
      <td>Unlimited Everything</td>
      <td>24/7 Phone</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="4">All plans include 30-day money-back guarantee</td>
    </tr>
  </tfoot>
</table>

<!-- Table with colspan and rowspan -->
<table>
  <tr>
    <th colspan="2">Student Grades</th>
  </tr>
  <tr>
    <th>Name</th>
    <th>Grade</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td rowspan="2">A+</td>
  </tr>
  <tr>
    <td>Bob</td>
  </tr>
</table>
\`\`\`

## Challenge

Create a pricing comparison table with:
1. At least 3 subscription tiers (Basic, Pro, Enterprise)
2. Proper \`<thead>\`, \`<tbody>\`, and \`<tfoot>\` sections
3. Use \`<caption>\` for table title
4. Include 4-5 feature columns
5. Use \`scope\` attribute for accessibility
6. Add a footer row with \`colspan\`

**Bonus**:
- Create a schedule table with \`rowspan\` for multi-hour events
- Add a table showing your weekly study plan`,
      examples: [
        {
          title: "Feature Comparison Table",
          code: `<table>
  <caption>Web Hosting Plans Comparison</caption>
  <thead>
    <tr>
      <th scope="col">Feature</th>
      <th scope="col">Starter</th>
      <th scope="col">Business</th>
      <th scope="col">Pro</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Storage</th>
      <td>10 GB</td>
      <td>50 GB</td>
      <td>Unlimited</td>
    </tr>
    <tr>
      <th scope="row">Bandwidth</th>
      <td>100 GB/mo</td>
      <td>500 GB/mo</td>
      <td>Unlimited</td>
    </tr>
    <tr>
      <th scope="row">Domains</th>
      <td>1</td>
      <td>5</td>
      <td>Unlimited</td>
    </tr>
    <tr>
      <th scope="row">Email Accounts</th>
      <td>5</td>
      <td>25</td>
      <td>Unlimited</td>
    </tr>
    <tr>
      <th scope="row">SSL Certificate</th>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">Monthly Price</th>
      <td>$5.99</td>
      <td>$12.99</td>
      <td>$24.99</td>
    </tr>
  </tfoot>
</table>`,
          explanation: "A fully accessible pricing table with proper semantic structure and scope attributes."
        }
      ],
      resources: [
        {
          title: "MDN: HTML Tables",
          url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Basics"
        },
        {
          title: "WebAIM: Accessible Tables",
          url: "https://webaim.org/techniques/tables/"
        }
      ]
    },
    {
      title: "Module 6: Containers and Metadata",
      content: `## Theory

\`<div>\` and \`<span>\` are generic containers for grouping content. Use \`<div>\` for block-level sections and \`<span>\` for inline text styling. Metadata in the \`<head>\` improves SEO, responsiveness, and social media sharing.

### Container Elements:
- **\`<div>\`** - Block-level container (starts on new line)
- **\`<span>\`** - Inline container (flows with text)
- Both use \`class\` and \`id\` attributes for styling/scripting

### Essential Metadata Tags:
- \`<meta charset="UTF-8">\` - Character encoding
- \`<meta name="viewport">\` - Responsive design
- \`<meta name="description">\` - Page description for SEO
- \`<meta name="keywords">\` - Search keywords (less important now)
- \`<meta name="author">\` - Content author
- \`<link rel="icon">\` - Favicon

### Open Graph Tags (Social Media):
- \`<meta property="og:title">\` - Title for social shares
- \`<meta property="og:description">\` - Description for shares
- \`<meta property="og:image">\` - Preview image

## Example

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Learn HTML the easy way with interactive tutorials and real-world projects.">
  <meta name="keywords" content="HTML, web development, tutorial, learning">
  <meta name="author" content="IdleLearn Team">
  
  <!-- Open Graph for Social Media -->
  <meta property="og:title" content="HTML Learning Hub">
  <meta property="og:description" content="Master HTML with hands-on practice">
  <meta property="og:image" content="https://example.com/preview.jpg">
  <meta property="og:url" content="https://example.com">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="favicon.png">
  
  <title>HTML Learning Hub - Master Web Development</title>
</head>
<body>
  <!-- Main container -->
  <div class="container">
    <header>
      <h1>Welcome to <span class="highlight">HTML Hub</span></h1>
    </header>
    
    <main>
      <div class="content">
        <p>Start learning <span class="accent">HTML today</span>!</p>
      </div>
      
      <div class="sidebar">
        <h2>Quick Links</h2>
        <ul>
          <li><a href="#tutorials">Tutorials</a></li>
          <li><a href="#projects">Projects</a></li>
        </ul>
      </div>
    </main>
    
    <footer>
      <p><span>&copy; 2025</span> <span class="brand">IdleLearn</span></p>
    </footer>
  </div>
</body>
</html>
\`\`\`

## Challenge

Create a complete HTML page with:

**In the \`<head>\`:**
1. Proper character encoding
2. Viewport meta tag for mobile responsiveness
3. SEO-friendly description (150-160 characters)
4. Author meta tag with your name
5. 3-5 relevant keywords
6. Open Graph tags for social sharing
7. A favicon link

**In the \`<body>\`:**
1. Wrap all content in a \`<div class="container">\`
2. Create header, main, and footer sections using \`<div>\`
3. Use \`<span>\` to highlight specific words in your text
4. Add \`id\` attributes to major sections
5. Use \`class\` attributes for repeated elements

**Bonus**:
- Add Twitter Card meta tags
- Include a \`<noscript>\` message
- Add \`lang\` attribute to specific foreign language text`,
      examples: [
        {
          title: "Complete SEO-Optimized Page Structure",
          code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Professional web development portfolio showcasing modern HTML, CSS, and JavaScript projects. Hire an experienced frontend developer.">
  <meta name="keywords" content="web developer, frontend, HTML, CSS, JavaScript, portfolio">
  <meta name="author" content="Jane Developer">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Jane Developer - Portfolio">
  <meta property="og:description" content="Check out my web development projects">
  <meta property="og:image" content="https://janedev.com/og-image.jpg">
  <meta property="og:url" content="https://janedev.com">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Jane Developer - Portfolio">
  <meta name="twitter:description" content="Web developer specializing in React">
  <meta name="twitter:image" content="https://janedev.com/twitter-card.jpg">
  
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>Jane Developer | Frontend Developer Portfolio</title>
</head>
<body>
  <div class="wrapper">
    <header id="top">
      <div class="header-content">
        <h1>Jane <span class="highlight">Developer</span></h1>
        <p class="tagline">Building <span class="accent">beautiful</span> web experiences</p>
      </div>
    </header>
    
    <main>
      <section id="about" class="section">
        <h2>About Me</h2>
        <div class="content">
          <p>I'm a <span class="role">frontend developer</span> with 
          <span class="experience">5 years</span> of experience.</p>
        </div>
      </section>
      
      <section id="projects" class="section">
        <h2>Projects</h2>
        <div class="project-grid">
          <div class="project-card">
            <h3>E-commerce Site</h3>
            <p>Built with <span class="tech">React</span> and 
            <span class="tech">Node.js</span></p>
          </div>
        </div>
      </section>
    </main>
    
    <footer>
      <p>&copy; <span id="year">2025</span> Jane Developer. All rights reserved.</p>
    </footer>
  </div>
  
  <noscript>
    <p>This site works best with JavaScript enabled.</p>
  </noscript>
</body>
</html>`,
          explanation: "A production-ready HTML structure with complete metadata, SEO optimization, and proper container usage."
        }
      ],
      resources: [
        {
          title: "MDN: Metadata in HTML",
          url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML"
        },
        {
          title: "Open Graph Protocol",
          url: "https://ogp.me/"
        },
        {
          title: "Google SEO Guide",
          url: "https://developers.google.com/search/docs/beginner/seo-starter-guide"
        }
      ]
    }
  ],
  prerequisites: [],
  tags: ["HTML", "Web Development", "Frontend", "Beginner", "HTML5"],
  isPublished: true
}

const seedHTMLPart1 = async () => {
  try {
    await connectDB()
    
    console.log('🗑️  Removing existing HTML Part 1 curriculum...')
    await Curriculum.deleteOne({ title: "HTML Fundamentals - Part 1" })
    
    console.log('📚 Seeding HTML Part 1 curriculum...')
    const curriculum = await Curriculum.create(htmlPart1Curriculum)
    
    console.log('✅ Successfully created curriculum:', curriculum.title)
    console.log(`📊 Total modules: ${curriculum.subtopics.length}`)
    console.log(`⏱️  Estimated hours: ${curriculum.estimatedHours}`)
    console.log(`🎯 Level: ${curriculum.level}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding curriculum:', error)
    process.exit(1)
  }
}

seedHTMLPart1()
