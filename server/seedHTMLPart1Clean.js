import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import Curriculum from './models/Curriculum.js'

dotenv.config()

const seedHTMLPart1 = async () => {
  try {
    await connectDB()
    
    console.log('🗑️  Removing existing HTML Part 1 curriculum...')
    await Curriculum.deleteOne({ topic: "HTML Fundamentals - Part 1" })
    
    const htmlCurriculum = {
      topic: "HTML Fundamentals - Part 1",
      description: "Master the core foundations of HTML with 6 comprehensive modules covering document structure, text formatting, lists, links, images, tables, and metadata.",
      difficulty: "beginner",
      estimatedHours: 12,
      icon: "🌐",
      tags: ["HTML", "Web Development", "Frontend", "Beginner"],
      prerequisites: [],
      subtopics: [
        {
          lessonTitle: "Introduction to HTML",
          order: 1,
          estimatedTime: 45,
          explanation: `HTML (HyperText Markup Language) is the standard markup language for creating web pages. Every webpage you see is built with HTML.

**Key Concepts:**
- HTML uses tags enclosed in angle brackets: <tag>content</tag>
- DOCTYPE declaration tells browsers to use HTML5
- <html>, <head>, and <body> form the basic structure
- Tags usually come in pairs (opening and closing)

**Document Structure:**
- <!DOCTYPE html> - Declares HTML5
- <html> - Root container
- <head> - Metadata, title, links to CSS
- <body> - Visible page content`,
          codeExamples: [
            `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is my first HTML page.</p>
</body>
</html>`
          ],
          practicalTasks: [
            {
              task: "Create a basic HTML page with a title 'About Me', an h1 heading with your name, and a paragraph introducing yourself",
              expectedOutput: "A valid HTML5 document with proper structure, title, heading, and paragraph",
              hints: [
                "Start with <!DOCTYPE html>",
                "Include <html>, <head>, and <body> tags",
                "Use <h1> for your main heading",
                "Close all tags properly"
              ],
              xpReward: 30
            }
          ],
          bonusTips: "Open your HTML file in a browser (double-click it) to see your creation! Try F12 to open Developer Tools and inspect your HTML.",
          resources: [
            "MDN HTML Basics: https://developer.mozilla.org/en-US/docs/Learn/HTML",
            "W3Schools HTML Intro: https://www.w3schools.com/html/html_intro.asp"
          ]
        },
        {
          lessonTitle: "Text Formatting & Structure",
          order: 2,
          estimatedTime: 40,
          explanation: `HTML provides semantic tags to structure and format text content properly.

**Heading Hierarchy:**
- <h1> through <h6> - Headings from most to least important
- Only one <h1> per page recommended
- Use headings to outline your content structure

**Text Formatting Tags:**
- <p> - Paragraph blocks
- <strong> - Important text (bold)
- <em> - Emphasized text (italic)
- <mark> - Highlighted text
- <small> - Fine print
- <br> - Line break
- <hr> - Horizontal rule divider`,
          codeExamples: [
            `<h1>Main Title</h1>
<h2>Section Heading</h2>
<p>This is a <strong>bold</strong> word and this is <em>italic</em>.</p>
<p>We can <mark>highlight</mark> important terms.</p>
<hr>
<p><small>Fine print goes here</small></p>`
          ],
          practicalTasks: [
            {
              task: "Create an 'About Us' page with proper heading hierarchy (h1, h2, h3), paragraphs using strong, em, and mark tags, and add a horizontal rule between sections",
              expectedOutput: "A well-structured page demonstrating heading hierarchy and inline formatting",
              hints: [
                "Use h1 for page title, h2 for sections",
                "Emphasize key words with <strong>",
                "Use <mark> for highlights",
                "Add <hr> to separate sections"
              ],
              xpReward: 35
            }
          ],
          bonusTips: "Screen readers rely on heading structure to navigate pages. Proper semantic HTML improves accessibility!",
          resources: [
            "MDN Text Fundamentals: https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals"
          ]
        },
        {
          lessonTitle: "Lists and Navigation",
          order: 3,
          estimatedTime: 45,
          explanation: `Lists organize information and create navigation menus. Links connect pages together.

**List Types:**
- <ul> - Unordered (bulleted) list
- <ol> - Ordered (numbered) list
- <li> - List item
- Lists can be nested

**Links (Anchors):**
- <a href="url">text</a> - Basic link
- href="#id" - Link to section on same page
- target="_blank" - Open in new tab
- rel="noopener" - Security for external links`,
          codeExamples: [
            `<h2>My Skills</h2>
<ol>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ol>

<nav>
  <ul>
    <li><a href="#home">Home</a></li>
    <li><a href="#about">About</a></li>
    <li><a href="https://github.com" target="_blank" rel="noopener">GitHub</a></li>
  </ul>
</nav>`
          ],
          practicalTasks: [
            {
              task: "Build a Table of Contents using an ordered list with links to 3 sections on your page using anchor links (#section1, etc)",
              expectedOutput: "A working navigation menu that jumps to different page sections when clicked",
              hints: [
                "Use <ol> for numbered table of contents",
                "Add id attributes to sections",
                "Link to sections using href='#sectionid'",
                "Test that clicking links scrolls to sections"
              ],
              xpReward: 40
            }
          ],
          bonusTips: "Navigation menus should always be wrapped in a <nav> tag for semantic HTML and accessibility.",
          resources: [
            "MDN Links: https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Creating_hyperlinks",
            "MDN Lists: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul"
          ]
        },
        {
          lessonTitle: "Images & Media",
          order: 4,
          estimatedTime: 40,
          explanation: `Images make websites visual and engaging. Proper image implementation is crucial for performance and accessibility.

**Image Basics:**
- <img src="path" alt="description"> - Embed image
- src - File path (relative or absolute)
- alt - Alternative text (required for accessibility)
- width/height - Dimensions in pixels
- loading="lazy" - Lazy load below-the-fold images

**Best Practices:**
- Always provide descriptive alt text
- Optimize file sizes (compress images)
- Use appropriate formats (JPG, PNG, WebP)
- Use <figure> and <figcaption> for semantic images`,
          codeExamples: [
            `<img src="logo.png" alt="Company Logo" width="200" height="100">

<figure>
  <img src="chart.jpg" alt="Sales growth chart showing 50% increase" width="600" loading="lazy">
  <figcaption>Figure 1: Annual Sales Growth</figcaption>
</figure>`
          ],
          practicalTasks: [
            {
              task: "Create an image gallery with 3 images, each wrapped in a <figure> with descriptive captions. Include proper alt text and lazy loading.",
              expectedOutput: "Three images with figures, figcaptions, descriptive alt text, and lazy loading enabled",
              hints: [
                "Wrap each image in <figure> tags",
                "Add <figcaption> below each image",
                "Write descriptive alt text (not just 'image1')",
                "Add loading='lazy' to images"
              ],
              xpReward: 35
            }
          ],
          bonusTips: "Alt text should describe the image content, not just say 'image'. Think: what would a screen reader user need to know?",
          resources: [
            "MDN Images: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Images_in_HTML",
            "Image Optimization: https://web.dev/fast/#optimize-your-images"
          ]
        },
        {
          lessonTitle: "HTML Tables",
          order: 5,
          estimatedTime: 50,
          explanation: `Tables display tabular data in rows and columns. Use tables for data, not for layout (that's CSS's job).

**Table Structure:**
- <table> - Container
- <thead> - Table header section
- <tbody> - Table body
- <tfoot> - Table footer (optional)
- <tr> - Table row
- <th> - Header cell
- <td> - Data cell

**Accessibility:**
- Use <caption> for table title
- scope="col" or scope="row" for headers
- colspan/rowspan for merged cells`,
          codeExamples: [
            `<table>
  <caption>Pricing Plans</caption>
  <thead>
    <tr>
      <th scope="col">Plan</th>
      <th scope="col">Price</th>
      <th scope="col">Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Basic</th>
      <td>$10/mo</td>
      <td>5 Projects</td>
    </tr>
    <tr>
      <th scope="row">Pro</th>
      <td>$25/mo</td>
      <td>Unlimited</td>
    </tr>
  </tbody>
</table>`
          ],
          practicalTasks: [
            {
              task: "Create a pricing comparison table with 3 columns (Feature, Basic Plan, Pro Plan) and at least 5 feature rows. Include caption, thead, tbody, and proper scope attributes.",
              expectedOutput: "A well-structured, accessible pricing table with proper semantic markup",
              hints: [
                "Start with <table> and add <caption>",
                "Use <thead> for headers with scope='col'",
                "Use <tbody> for data rows",
                "First column should use <th scope='row'>",
                "Test with a screen reader if possible"
              ],
              xpReward: 45
            }
          ],
          bonusTips: "Tables should only be used for actual tabular data. For layouts, use CSS Grid or Flexbox instead!",
          resources: [
            "MDN Tables: https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Basics",
            "Accessible Tables: https://webaim.org/techniques/tables/"
          ]
        },
        {
          lessonTitle: "Containers & Metadata",
          order: 6,
          estimatedTime: 50,
          explanation: `Containers group content, while metadata improves SEO and functionality.

**Container Elements:**
- <div> - Generic block-level container
- <span> - Generic inline container
- Use with class/id for styling and scripting

**Essential Metadata:**
- <meta charset="UTF-8"> - Character encoding
- <meta name="viewport"> - Responsive design
- <meta name="description"> - SEO description (150-160 chars)
- <meta name="keywords"> - Search keywords
- <link rel="icon"> - Favicon

**Open Graph (Social Sharing):**
- og:title, og:description, og:image
- Improves link previews on social media`,
          codeExamples: [
            `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Learn HTML with interactive tutorials and projects.">
  <meta property="og:title" content="HTML Learning Hub">
  <meta property="og:image" content="preview.jpg">
  <link rel="icon" href="favicon.ico">
  <title>HTML Hub | Learn Web Development</title>
</head>
<body>
  <div class="container">
    <header>
      <h1>Welcome to <span class="highlight">HTML Hub</span></h1>
    </header>
  </div>
</body>
</html>`
          ],
          practicalTasks: [
            {
              task: "Create a complete HTML page with proper metadata (viewport, description, Open Graph tags), a favicon link, and use div containers to structure a header, main content area, and footer. Use span to highlight specific words.",
              expectedOutput: "An SEO-optimized page with complete metadata, Open Graph tags, and semantic container structure",
              hints: [
                "Add all meta tags in <head>",
                "Write a compelling 150-char description",
                "Include og:title, og:description, og:image",
                "Structure page with div containers",
                "Use span for inline highlights"
              ],
              xpReward: 50
            }
          ],
          bonusTips: "Open Graph tags control how your links look when shared on Facebook, Twitter, LinkedIn. Test them with sharing debuggers!",
          resources: [
            "MDN Metadata: https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML",
            "Open Graph Protocol: https://ogp.me/",
            "Google SEO: https://developers.google.com/search/docs"
          ]
        }
      ]
    }
    
    console.log('📚 Creating HTML Part 1 curriculum...')
    const curriculum = await Curriculum.create(htmlCurriculum)
    
        console.log('✅ Successfully created: HTML Fundamentals - Part 1')
    console.log(`📊 Modules: ${curriculum.subtopics.length}`)
    console.log(`⏱️  Estimated hours: ${curriculum.estimatedHours}`)
    console.log(`🎯 Difficulty: ${curriculum.difficulty}`)
    console.log(`⭐ Total XP Available: ${curriculum.totalXP}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

seedHTMLPart1()
