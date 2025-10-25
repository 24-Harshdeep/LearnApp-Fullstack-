import mongoose from 'mongoose'
import dotenv from 'dotenv'
import LearningPath from './models/LearningPath.js'

dotenv.config()

const curriculumData = [
  {
    title: "HTML Fundamentals",
    description: "Master the foundation of web development with HTML",
    difficulty: "beginner",
    estimatedTime: "4 weeks",
    xpReward: 1000,
    topics: ["HTML Basics", "Document Structure", "Elements & Tags", "Forms", "Semantic HTML", "Multimedia"],
    subtopics: [
      {
        lesson_title: "What is HTML and why it is used",
        explanation: "HTML = Hypertext Markup Language, the skeleton of webpages. It defines the structure of content.",
        code_examples: [
          "<h1>Hello World</h1>\n<p>This is a paragraph.</p>"
        ],
        practical_tasks: [
          {
            task: "Create a simple page with your name as heading and a paragraph describing yourself.",
            expected_output: "<h1>Your Name</h1>\n<p>Brief description about yourself.</p>"
          }
        ],
        bonus_tips: "Use semantic tags where possible for better accessibility and SEO.",
        resources: ["https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML"]
      },
      {
        lesson_title: "HTML Document Structure",
        explanation: "Learn the basic skeleton of an HTML page including <html>, <head>, and <body> tags and their roles.",
        code_examples: [
          "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Welcome!</h1>\n</body>\n</html>"
        ],
        practical_tasks: [
          {
            task: "Create a page with title 'My First Webpage' and heading 'Welcome to HTML'.",
            expected_output: "<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Webpage</title>\n</head>\n<body>\n  <h1>Welcome to HTML</h1>\n</body>\n</html>"
          }
        ],
        bonus_tips: "Always include <!DOCTYPE html> to ensure standards compliance.",
        resources: ["https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure"]
      },
      {
        lesson_title: "Headings, Paragraphs, and Text Formatting",
        explanation: "HTML provides heading tags <h1> to <h6>, paragraphs <p>, and text formatting tags like <strong>, <em>.",
        code_examples: [
          "<h1>Main Title</h1>\n<h2>Sub Title</h2>\n<p>This is <strong>bold</strong> and <em>italic</em> text.</p>"
        ],
        practical_tasks: [
          {
            task: "Create a page using headings hierarchy (h1 to h3), with bold and italic text.",
            expected_output: "<h1>Main Heading</h1>\n<h2>Sub Heading</h2>\n<h3>Smaller Heading</h3>\n<p>This is <strong>bold</strong> and <em>italic</em> text.</p>"
          }
        ],
        bonus_tips: "Use headings hierarchically: h1 → h2 → h3 for better SEO and accessibility.",
        resources: ["https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Headings"]
      },
      {
        lesson_title: "Lists - Ordered and Unordered",
        explanation: "Create ordered lists <ol> and unordered lists <ul> to organize content.",
        code_examples: [
          "<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>",
          "<ol>\n  <li>First</li>\n  <li>Second</li>\n  <li>Third</li>\n</ol>"
        ],
        practical_tasks: [
          {
            task: "Make a shopping list with 5 items using both numbered (ol) and bullet (ul) lists.",
            expected_output: "<h2>Shopping List</h2>\n<ol>\n  <li>Apples</li>\n  <li>Bread</li>\n  <li>Milk</li>\n  <li>Eggs</li>\n  <li>Cheese</li>\n</ol>"
          }
        ],
        bonus_tips: "Use <ol> for sequential items and <ul> for non-sequential lists.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul"]
      },
      {
        lesson_title: "Links and Anchors",
        explanation: "Learn to create hyperlinks with <a> tag, href attribute, and target=\"_blank\" for new tabs.",
        code_examples: [
          "<a href=\"https://example.com\">Visit Example</a>",
          "<a href=\"https://google.com\" target=\"_blank\">Open Google in new tab</a>"
        ],
        practical_tasks: [
          {
            task: "Create a navigation menu linking to three websites (Google, GitHub, MDN).",
            expected_output: "<nav>\n  <a href=\"https://google.com\">Google</a>\n  <a href=\"https://github.com\">GitHub</a>\n  <a href=\"https://developer.mozilla.org\">MDN</a>\n</nav>"
          }
        ],
        bonus_tips: "Use target=\"_blank\" with rel=\"noopener noreferrer\" for security.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a"]
      },
      {
        lesson_title: "Images and Media",
        explanation: "Embed images with <img> tag, use alt text for accessibility, and control dimensions with width/height.",
        code_examples: [
          "<img src=\"photo.jpg\" alt=\"Description\" width=\"300\">",
          "<img src=\"https://example.com/image.png\" alt=\"Remote image\">"
        ],
        practical_tasks: [
          {
            task: "Add 3 images with captions, experiment with relative and absolute paths.",
            expected_output: "<figure>\n  <img src=\"photo1.jpg\" alt=\"Photo 1\" width=\"200\">\n  <figcaption>Caption for photo 1</figcaption>\n</figure>"
          }
        ],
        bonus_tips: "Always add alt text to images for accessibility and SEO!",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img"]
      },
      {
        lesson_title: "Tables",
        explanation: "Create data tables with <table>, <tr> (rows), <td> (data cells), and <th> (header cells).",
        code_examples: [
          "<table>\n  <tr>\n    <th>Day</th>\n    <th>Subject</th>\n  </tr>\n  <tr>\n    <td>Monday</td>\n    <td>Math</td>\n  </tr>\n  <tr>\n    <td>Tuesday</td>\n    <td>English</td>\n  </tr>\n</table>"
        ],
        practical_tasks: [
          {
            task: "Create a timetable with 3 days and 3 subjects each.",
            expected_output: "<table>\n  <tr><th>Day</th><th>Period 1</th><th>Period 2</th></tr>\n  <tr><td>Monday</td><td>Math</td><td>Science</td></tr>\n</table>"
          }
        ],
        bonus_tips: "Use tables for data, not layout! Use CSS Grid/Flexbox for layouts.",
        resources: ["https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables"]
      },
      {
        lesson_title: "Input Fields and Form Types",
        explanation: "Learn various <input> types: text, email, password, number, and how to collect user data.",
        code_examples: [
          "<form>\n  <input type=\"text\" placeholder=\"Username\">\n  <input type=\"email\" placeholder=\"Email\">\n  <input type=\"password\" placeholder=\"Password\">\n  <input type=\"number\" placeholder=\"Age\">\n</form>"
        ],
        practical_tasks: [
          {
            task: "Create a registration form with username, email, and password fields.",
            expected_output: "<form>\n  <input type=\"text\" name=\"username\" placeholder=\"Username\">\n  <input type=\"email\" name=\"email\" placeholder=\"Email\">\n  <input type=\"password\" name=\"password\" placeholder=\"Password\">\n</form>"
          }
        ],
        bonus_tips: "Use appropriate input types for better mobile keyboard support.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input"]
      },
      {
        lesson_title: "Labels and Accessibility",
        explanation: "Use <label for=\"id\"> to improve form accessibility for screen readers and better UX.",
        code_examples: [
          "<label for=\"username\">Username:</label>\n<input type=\"text\" id=\"username\" name=\"username\">"
        ],
        practical_tasks: [
          {
            task: "Add proper labels to your registration form for accessibility.",
            expected_output: "<label for=\"email\">Email:</label>\n<input type=\"email\" id=\"email\" name=\"email\">"
          }
        ],
        bonus_tips: "Clicking a label focuses its associated input - great for UX!",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label"]
      },
      {
        lesson_title: "Buttons, Submit, and Reset",
        explanation: "Learn about <button> tag and button types: submit, reset, and button.",
        code_examples: [
          "<form>\n  <input type=\"text\" name=\"username\">\n  <button type=\"submit\">Submit</button>\n  <button type=\"reset\">Reset</button>\n</form>"
        ],
        practical_tasks: [
          {
            task: "Add submit and reset buttons to your registration form.",
            expected_output: "<button type=\"submit\">Register</button>\n<button type=\"reset\">Clear Form</button>"
          }
        ],
        bonus_tips: "Use type=\"button\" when you don't want form submission.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button"]
      },
      {
        lesson_title: "Semantic HTML - Why it Matters",
        explanation: "Semantic tags like <header>, <footer>, <nav>, <section>, <article>, <aside> help SEO, accessibility, and clean structure.",
        code_examples: [
          "<header>\n  <nav>\n    <a href=\"#\">Home</a>\n  </nav>\n</header>\n<main>\n  <article>\n    <h1>Article Title</h1>\n    <p>Content...</p>\n  </article>\n</main>\n<footer>\n  <p>&copy; 2025</p>\n</footer>"
        ],
        practical_tasks: [
          {
            task: "Redesign your page using semantic tags instead of divs.",
            expected_output: "<header><h1>Site Title</h1></header>\n<main><section>Content</section></main>\n<footer>Footer</footer>"
          }
        ],
        bonus_tips: "Semantic HTML improves SEO and helps screen readers understand page structure.",
        resources: ["https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html"]
      },
      {
        lesson_title: "Meta Tags and Document Metadata",
        explanation: "Learn about <meta> tags for charset, viewport, description, and other document metadata.",
        code_examples: [
          "<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <meta name=\"description\" content=\"My awesome website\">\n  <title>My Site</title>\n</head>"
        ],
        practical_tasks: [
          {
            task: "Add proper metadata to your personal page including viewport and description.",
            expected_output: "<meta name=\"description\" content=\"Personal portfolio of [Your Name]\">"
          }
        ],
        bonus_tips: "Viewport meta tag is essential for responsive design on mobile devices.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta"]
      },
      {
        lesson_title: "Audio and Video Embedding",
        explanation: "Embed multimedia with <audio> and <video> tags for native HTML5 media playback.",
        code_examples: [
          "<video width=\"320\" height=\"240\" controls>\n  <source src=\"movie.mp4\" type=\"video/mp4\">\n  Your browser does not support the video tag.\n</video>",
          "<audio controls>\n  <source src=\"audio.mp3\" type=\"audio/mpeg\">\n</audio>"
        ],
        practical_tasks: [
          {
            task: "Embed a short video and an audio file on a page with proper controls.",
            expected_output: "<video controls src=\"demo.mp4\"></video>\n<audio controls src=\"music.mp3\"></audio>"
          }
        ],
        bonus_tips: "Always provide multiple formats for better browser compatibility.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video"]
      },
      {
        lesson_title: "Canvas & SVG Introduction",
        explanation: "Introduction to <canvas> for dynamic drawings and graphics with JavaScript.",
        code_examples: [
          "<canvas id=\"myCanvas\" width=\"200\" height=\"100\"></canvas>\n<script>\n  const canvas = document.getElementById('myCanvas');\n  const ctx = canvas.getContext('2d');\n  ctx.fillStyle = 'blue';\n  ctx.fillRect(10, 10, 150, 75);\n</script>"
        ],
        practical_tasks: [
          {
            task: "Draw a rectangle using canvas element.",
            expected_output: "A blue rectangle displayed on canvas"
          }
        ],
        bonus_tips: "Canvas is great for games and dynamic graphics; SVG is better for scalable icons.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API"]
      },
      {
        lesson_title: "Advanced Form Features",
        explanation: "Learn about <datalist>, <fieldset>, <legend>, and pattern validation for advanced forms.",
        code_examples: [
          "<input list=\"browsers\" name=\"browser\">\n<datalist id=\"browsers\">\n  <option value=\"Chrome\">\n  <option value=\"Firefox\">\n  <option value=\"Safari\">\n</datalist>",
          "<fieldset>\n  <legend>Personal Info</legend>\n  <input type=\"text\" pattern=\"[A-Za-z]{3,}\">\n</fieldset>"
        ],
        practical_tasks: [
          {
            task: "Add autocomplete to form input fields using datalist.",
            expected_output: "Form with datalist providing suggestions"
          }
        ],
        bonus_tips: "Pattern attribute uses regex for client-side validation.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist"]
      },
      {
        lesson_title: "Final Project: Personal Portfolio Page",
        explanation: "Build a complete personal portfolio page using everything you've learned: semantic structure, headings, paragraphs, lists, images, links, contact form, and embedded media.",
        code_examples: [
          "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>My Portfolio</title>\n</head>\n<body>\n  <header>\n    <h1>Your Name</h1>\n    <nav>\n      <a href=\"#about\">About</a>\n      <a href=\"#projects\">Projects</a>\n      <a href=\"#contact\">Contact</a>\n    </nav>\n  </header>\n  <main>\n    <section id=\"about\">\n      <h2>About Me</h2>\n      <p>Your introduction...</p>\n    </section>\n  </main>\n  <footer>\n    <p>&copy; 2025 Your Name</p>\n  </footer>\n</body>\n</html>"
        ],
        practical_tasks: [
          {
            task: "Create a complete portfolio with: semantic structure, navigation, about section with image, projects list, contact form with validation, and embedded video/audio.",
            expected_output: "A fully functional personal portfolio webpage using all HTML concepts learned"
          }
        ],
        bonus_tips: "This project demonstrates real-world HTML skills - perfect for your actual portfolio!",
        resources: ["https://developer.mozilla.org/en-US/docs/Learn/HTML"]
      }
    ]
  },
  {
    title: "CSS Mastery",
    description: "Master CSS styling - from basics to advanced layouts, animations, and responsive design",
    difficulty: "beginner",
    estimatedTime: "5 weeks",
    xpReward: 1200,
    topics: ["Introduction to CSS", "Text & Fonts", "Colors & Backgrounds", "Box Model", "Positioning & Layouts", "Advanced Styling", "CSS Variables"],
    subtopics: [
      {
        lesson_title: "What is CSS and why it is used",
        explanation: "CSS = Cascading Style Sheets; separates content (HTML) from presentation (styling). Controls layout, colors, fonts, spacing, and responsiveness.",
        code_examples: [
          "<p style=\"color: blue; font-size: 18px;\">Hello CSS!</p>"
        ],
        practical_tasks: [
          {
            task: "Change the color and font size of a paragraph on your HTML page using inline styles.",
            expected_output: "<p style=\"color: green; font-size: 20px;\">Styled paragraph</p>"
          }
        ],
        bonus_tips: "Inline styles are okay for testing, but external CSS is preferred for maintainability.",
        resources: ["https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps"]
      },
      {
        lesson_title: "CSS Syntax & Selectors",
        explanation: "CSS uses selector { property: value; } syntax. Selectors include: element, class, id, group, and descendant selectors.",
        code_examples: [
          "p { color: red; }\n.highlight { background-color: yellow; }\n#main { font-size: 20px; }\nh1, h2 { font-family: Arial; }\ndiv p { margin: 10px; }"
        ],
        practical_tasks: [
          {
            task: "Style headings and paragraphs using element, class, and id selectors.",
            expected_output: "h1 { color: navy; }\n.intro { font-size: 18px; }\n#header { background: gray; }"
          }
        ],
        bonus_tips: "Use classes for reusable styles, IDs for unique elements.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors"]
      },
      {
        lesson_title: "Font Properties",
        explanation: "Control typography with font-family, font-size, font-weight, line-height, and letter-spacing.",
        code_examples: [
          "h1 {\n  font-family: 'Arial', sans-serif;\n  font-size: 32px;\n  font-weight: bold;\n  line-height: 1.5;\n  letter-spacing: 2px;\n}"
        ],
        practical_tasks: [
          {
            task: "Change font-family and size for headings and paragraphs. Make headings bold.",
            expected_output: "h1 { font-family: Georgia; font-size: 36px; font-weight: bold; }"
          }
        ],
        bonus_tips: "Always provide fallback fonts: 'Preferred Font', fallback, generic-family.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/font"]
      },
      {
        lesson_title: "Text Alignment and Decoration",
        explanation: "Use text-align, text-decoration, and text-transform to style text appearance.",
        code_examples: [
          "h1 { text-align: center; text-transform: uppercase; }\na { text-decoration: underline; }\np { text-align: justify; }"
        ],
        practical_tasks: [
          {
            task: "Make headings uppercase, underline links, and center paragraphs.",
            expected_output: "h2 { text-transform: uppercase; text-align: center; }\na { text-decoration: underline; }"
          }
        ],
        bonus_tips: "Use text-decoration: none to remove underlines from links.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/text-align"]
      },
      {
        lesson_title: "Colors in CSS",
        explanation: "Define colors using named colors, HEX (#FF0000), RGB (rgb(255,0,0)), or HSL (hsl(0,100%,50%)).",
        code_examples: [
          "h1 { color: red; }\nh2 { color: #00FF00; }\np { color: rgb(0, 0, 255); }\nspan { color: hsl(120, 100%, 50%); }"
        ],
        practical_tasks: [
          {
            task: "Make headings and paragraphs use at least 3 different color types (named, HEX, RGB).",
            expected_output: "h1 { color: navy; }\nh2 { color: #FF5733; }\np { color: rgb(50, 150, 200); }"
          }
        ],
        bonus_tips: "Use HSL for easier color manipulation - change hue while keeping saturation/lightness.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/color"]
      },
      {
        lesson_title: "Background Properties",
        explanation: "Style backgrounds with background-color, background-image, background-repeat, background-size, and background-position.",
        code_examples: [
          "body {\n  background-color: #f0f0f0;\n  background-image: url('pattern.png');\n  background-repeat: no-repeat;\n  background-size: cover;\n  background-position: center;\n}"
        ],
        practical_tasks: [
          {
            task: "Add a background color and a background image to your page.",
            expected_output: "body { background-color: #eee; background-image: url('bg.jpg'); background-size: cover; }"
          }
        ],
        bonus_tips: "Use background-size: cover for full-screen backgrounds that maintain aspect ratio.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/background"]
      },
      {
        lesson_title: "Understanding the Box Model",
        explanation: "Every element is a box with content, padding, border, and margin. Total width = content + padding + border + margin.",
        code_examples: [
          "div {\n  width: 200px;\n  padding: 10px;\n  border: 5px solid black;\n  margin: 20px;\n  box-sizing: border-box; /* includes padding and border in width */\n}"
        ],
        practical_tasks: [
          {
            task: "Style a div with padding, border, and margin; observe spacing differences using DevTools.",
            expected_output: ".box { width: 300px; padding: 15px; border: 3px solid blue; margin: 25px; }"
          }
        ],
        bonus_tips: "Use box-sizing: border-box to make width calculations easier!",
        resources: ["https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model"]
      },
      {
        lesson_title: "Width, Height, and Overflow",
        explanation: "Control element dimensions with width, height, min/max properties, and handle overflow content.",
        code_examples: [
          ".container {\n  width: 300px;\n  height: 200px;\n  min-width: 200px;\n  max-width: 500px;\n  overflow: auto; /* scroll, hidden, visible */\n}"
        ],
        practical_tasks: [
          {
            task: "Make a container with fixed width and handle overflowing text with overflow property.",
            expected_output: ".box { width: 250px; height: 150px; overflow: scroll; }"
          }
        ],
        bonus_tips: "Use overflow: hidden to clip content, overflow: auto for scrollbars only when needed.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/overflow"]
      },
      {
        lesson_title: "Position Property",
        explanation: "Control element positioning with static, relative, absolute, fixed, and sticky values.",
        code_examples: [
          ".relative { position: relative; top: 10px; left: 20px; }\n.absolute { position: absolute; top: 0; right: 0; }\n.fixed { position: fixed; bottom: 0; left: 0; }\n.sticky { position: sticky; top: 0; }"
        ],
        practical_tasks: [
          {
            task: "Position a box in the top-right corner of the page using absolute positioning.",
            expected_output: ".corner-box { position: absolute; top: 10px; right: 10px; }"
          }
        ],
        bonus_tips: "Absolute positioning is relative to the nearest positioned ancestor, not the page!",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/position"]
      },
      {
        lesson_title: "Display & Visibility",
        explanation: "Control element display with display: block/inline/inline-block/none and visibility: hidden/visible.",
        code_examples: [
          ".block { display: block; }\n.inline { display: inline; }\n.hidden { display: none; } /* removes from layout */\n.invisible { visibility: hidden; } /* takes space but invisible */"
        ],
        practical_tasks: [
          {
            task: "Hide an element using display: none, then change display type of span to block.",
            expected_output: ".hide { display: none; }\nspan { display: block; }"
          }
        ],
        bonus_tips: "display: none removes element from layout; visibility: hidden hides it but keeps space.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/display"]
      },
      {
        lesson_title: "Flexbox Layout",
        explanation: "Flexbox makes it easy to align and distribute items. Use display: flex, justify-content, align-items, and flex-direction.",
        code_examples: [
          ".container {\n  display: flex;\n  justify-content: space-between; /* or center, flex-start, flex-end */\n  align-items: center;\n  flex-direction: row; /* or column */\n}"
        ],
        practical_tasks: [
          {
            task: "Create a navbar with 3 items aligned horizontally using flexbox.",
            expected_output: "nav { display: flex; justify-content: space-around; align-items: center; }"
          }
        ],
        bonus_tips: "Play Flexbox Froggy game to master flexbox in a fun way!",
        resources: ["https://css-tricks.com/snippets/css/a-guide-to-flexbox/"]
      },
      {
        lesson_title: "Grid Layout",
        explanation: "CSS Grid creates two-dimensional layouts. Use display: grid, grid-template-columns, grid-gap, and grid-area.",
        code_examples: [
          ".grid-container {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  grid-gap: 20px;\n}\n.item1 { grid-area: 1 / 1 / 2 / 3; } /* row-start / col-start / row-end / col-end */"
        ],
        practical_tasks: [
          {
            task: "Build a 2x2 grid layout for a small photo gallery.",
            expected_output: ".gallery { display: grid; grid-template-columns: 1fr 1fr; grid-gap: 15px; }"
          }
        ],
        bonus_tips: "Use fr (fraction) units for flexible, responsive grid columns!",
        resources: ["https://css-tricks.com/snippets/css/complete-guide-grid/"]
      },
      {
        lesson_title: "Pseudo-classes and Pseudo-elements",
        explanation: "Pseudo-classes (:hover, :first-child, :last-child) and pseudo-elements (::before, ::after) add dynamic styles.",
        code_examples: [
          "button:hover { background-color: blue; }\nli:first-child { font-weight: bold; }\nh1::before { content: '→ '; color: red; }"
        ],
        practical_tasks: [
          {
            task: "Change color of button on hover, add decorative content before a heading using ::before.",
            expected_output: "button:hover { background: green; }\nh2::before { content: '★ '; }"
          }
        ],
        bonus_tips: "::before and ::after are great for decorative elements without extra HTML!",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes"]
      },
      {
        lesson_title: "Transitions and Animations",
        explanation: "Create smooth transitions with transition property and complex animations with @keyframes.",
        code_examples: [
          ".box {\n  transition: all 0.3s ease;\n}\n.box:hover {\n  transform: scale(1.1);\n}\n\n@keyframes slide {\n  from { left: 0; }\n  to { left: 100px; }\n}\n.animated { animation: slide 2s infinite; }"
        ],
        practical_tasks: [
          {
            task: "Animate a box moving left to right on hover using transitions or keyframes.",
            expected_output: ".box { transition: transform 0.5s; }\n.box:hover { transform: translateX(100px); }"
          }
        ],
        bonus_tips: "Transitions are for simple state changes; animations for complex, multi-step movements.",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions"]
      },
      {
        lesson_title: "Responsive Design with Media Queries",
        explanation: "Use @media queries to adapt styles for different screen sizes. Mobile-first approach is recommended.",
        code_examples: [
          "/* Mobile first */\n.container { padding: 10px; }\n\n/* Tablet and up */\n@media (min-width: 768px) {\n  .container { padding: 20px; }\n}\n\n/* Desktop */\n@media (min-width: 1024px) {\n  .container { padding: 30px; max-width: 1200px; }\n}"
        ],
        practical_tasks: [
          {
            task: "Make your portfolio page adapt to mobile screens using media queries.",
            expected_output: "@media (max-width: 768px) { nav { flex-direction: column; } }"
          }
        ],
        bonus_tips: "Design mobile-first, then add styles for larger screens with min-width queries!",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries"]
      },
      {
        lesson_title: "CSS Variables & Custom Properties",
        explanation: "Define reusable values with CSS variables: --variable-name and use them with var(--variable-name).",
        code_examples: [
          ":root {\n  --main-color: #3498db;\n  --padding: 20px;\n  --font-stack: 'Helvetica', sans-serif;\n}\n\nbutton {\n  background-color: var(--main-color);\n  padding: var(--padding);\n  font-family: var(--font-stack);\n}"
        ],
        practical_tasks: [
          {
            task: "Use CSS variables for primary colors and fonts in your page.",
            expected_output: ":root { --primary: blue; --font: Arial; }\nh1 { color: var(--primary); font-family: var(--font); }"
          }
        ],
        bonus_tips: "CSS variables make theme switching and color schemes super easy!",
        resources: ["https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties"]
      },
      {
        lesson_title: "Final Project: Fully Styled Portfolio Page",
        explanation: "Build a complete, professional portfolio page using all CSS concepts: layouts, colors, fonts, flexbox/grid, animations, and responsive design.",
        code_examples: [
          "/* Portfolio Structure */\nheader { background: var(--dark); color: white; padding: 2rem; }\nnav { display: flex; justify-content: space-around; }\n.hero { min-height: 100vh; display: flex; align-items: center; }\n.projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }\nfooter { text-align: center; padding: 2rem; background: #333; color: white; }\n\n@media (max-width: 768px) {\n  .hero { flex-direction: column; }\n  nav { flex-direction: column; }\n}"
        ],
        practical_tasks: [
          {
            task: "Create a fully styled portfolio with: Header with navigation, Hero section with image + text, About section, Projects grid using Flex/Grid, Footer. Add hover effects, transitions, and responsive layout.",
            expected_output: "A complete, responsive, beautifully styled portfolio webpage demonstrating all CSS skills"
          }
        ],
        bonus_tips: "This project is portfolio-worthy! Host it on GitHub Pages to show employers.",
        resources: ["https://developer.mozilla.org/en-US/docs/Learn/CSS"]
      }
    ]
  },
  {
    title: "JavaScript Essentials",
    description: "Master JavaScript essentials - from basics to advanced concepts, async programming, and real-world projects",
    difficulty: "beginner",
    estimatedTime: "6 weeks",
    xpReward: 1500,
    topics: ["Variables & Data Types", "Functions", "Advanced Functions", "Objects & Arrays", "DOM Manipulation", "Async JS", "Error Handling", "Advanced Concepts"],
    subtopics: [
      {
        lesson_title: "What is JavaScript and why it is used",
        explanation: "JS is a scripting language for web pages; makes them interactive and dynamic. It runs in the browser and on servers (Node.js).",
        code_examples: [
          "<script>\n  alert('Hello JS!');\n</script>"
        ],
        practical_tasks: [
          {
            task: "Add a JS alert on your HTML page that says 'Welcome to JavaScript!'",
            expected_output: "An alert popup displaying the welcome message"
          }
        ],
        bonus_tips: "JavaScript is the only programming language that runs natively in web browsers.",
        resources: ["https://javascript.info/intro"]
      },
      {
        lesson_title: "JS Placement in HTML",
        explanation: "JavaScript can be inline, internal (<script> in HTML), or external JS file (.js). External files are preferred for maintainability.",
        code_examples: [
          "<!-- External JS -->\n<script src=\"script.js\"></script>",
          "<!-- Internal JS -->\n<script>\n  console.log('Hello');\n</script>"
        ],
        practical_tasks: [
          {
            task: "Move your alert code to an external JS file and link it to your HTML.",
            expected_output: "script.js file with alert code, linked in HTML with <script src>"
          }
        ],
        bonus_tips: "Place <script> tags at the end of <body> for better page load performance.",
        resources: ["https://javascript.info/hello-world"]
      },
      {
        lesson_title: "Variables: var, let, const",
        explanation: "var (function-scoped, hoisted), let (block-scoped, reassignable), const (block-scoped, constant). Always prefer const, then let.",
        code_examples: [
          "var oldWay = 'avoid';",
          "let changeable = 'can reassign';",
          "const permanent = 'cannot reassign';"
        ],
        practical_tasks: [
          {
            task: "Create variables using var, let, and const, then log them to console.",
            expected_output: "console.log(oldWay); console.log(changeable); console.log(permanent);"
          }
        ],
        bonus_tips: "const doesn't mean the value is immutable, just that the variable can't be reassigned.",
        resources: ["https://javascript.info/variables"]
      },
      {
        lesson_title: "Data Types",
        explanation: "Primitives: string, number, boolean, null, undefined, symbol, bigint. Non-primitives: object, array, function.",
        code_examples: [
          "const str = 'text'; // string",
          "const num = 42; // number",
          "const bool = true; // boolean",
          "const obj = {}; // object",
          "console.log(typeof str); // 'string'"
        ],
        practical_tasks: [
          {
            task: "Log the type of different values using typeof operator.",
            expected_output: "typeof checks for: string, number, boolean, object, undefined"
          }
        ],
        bonus_tips: "typeof null returns 'object' - this is a known JavaScript quirk!",
        resources: ["https://javascript.info/types"]
      },
      {
        lesson_title: "Operators",
        explanation: "Arithmetic (+, -, *, /), assignment (=, +=), comparison (==, ===, !=, !==), logical (&&, ||, !), ternary (? :).",
        code_examples: [
          "const sum = 5 + 3;",
          "const isEqual = (5 === '5'); // false",
          "const result = age >= 18 ? 'adult' : 'minor';"
        ],
        practical_tasks: [
          {
            task: "Create expressions using arithmetic, comparison, and ternary operators.",
            expected_output: "Examples of each operator type working correctly"
          }
        ],
        bonus_tips: "Always use === instead of == for strict equality comparison.",
        resources: ["https://javascript.info/operators"]
      },
      {
        lesson_title: "Function Declaration, Expression, Arrow Functions",
        explanation: "Three ways to define functions: declaration (hoisted), expression (not hoisted), arrow (shorter syntax, lexical this).",
        code_examples: [
          "// Declaration\nfunction add(a, b) { return a + b; }",
          "// Expression\nconst multiply = function(a, b) { return a * b; };",
          "// Arrow\nconst divide = (a, b) => a / b;"
        ],
        practical_tasks: [
          {
            task: "Write three versions of a function that adds two numbers using each syntax.",
            expected_output: "All three function types working and returning correct sum"
          }
        ],
        bonus_tips: "Arrow functions don't have their own 'this' binding.",
        resources: ["https://javascript.info/function-basics"]
      },
      {
        lesson_title: "Parameters, Arguments, Default Values",
        explanation: "Functions can accept parameters. You can set default values for parameters that might not be passed.",
        code_examples: [
          "function greet(name = 'Guest') {\n  return `Hello, ${name}!`;\n}",
          "greet(); // 'Hello, Guest!'",
          "greet('John'); // 'Hello, John!'"
        ],
        practical_tasks: [
          {
            task: "Create a function that greets a user with a default name of 'Friend'.",
            expected_output: "function greet(name = 'Friend') { return `Hi ${name}!`; }"
          }
        ],
        bonus_tips: "Default parameters are evaluated at call time, not definition time.",
        resources: ["https://javascript.info/function-basics"]
      },
      {
        lesson_title: "Callbacks",
        explanation: "Functions passed as arguments to be executed later. Common in async operations and array methods.",
        code_examples: [
          "function doMath(a, b, operation) {\n  return operation(a, b);\n}",
          "const result = doMath(5, 3, (x, y) => x + y); // 8"
        ],
        practical_tasks: [
          {
            task: "Create a function doMath(num1, num2, operation) where operation is a callback.",
            expected_output: "doMath(10, 5, (a,b) => a * b) returns 50"
          }
        ],
        bonus_tips: "Callbacks are the foundation of asynchronous JavaScript.",
        resources: ["https://javascript.info/callbacks"]
      },
      {
        lesson_title: "Closures",
        explanation: "Functions that remember their outer scope even after the outer function has returned. Used for data privacy.",
        code_examples: [
          "function counter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}",
          "const increment = counter();\n increment(); // 1\n increment(); // 2"
        ],
        practical_tasks: [
          {
            task: "Create a counter function that maintains its count privately using closures.",
            expected_output: "A counter that increments and remembers its state"
          }
        ],
        bonus_tips: "Closures are powerful for creating private variables in JavaScript.",
        resources: ["https://javascript.info/closure"]
      },
      {
        lesson_title: "Higher-Order Functions (HOF)",
        explanation: "Functions that accept functions as arguments or return functions. Array methods like map, filter, reduce are HOFs.",
        code_examples: [
          "const numbers = [1, 2, 3, 4];",
          "const doubled = numbers.map(n => n * 2); // [2,4,6,8]",
          "const evens = numbers.filter(n => n % 2 === 0); // [2,4]",
          "const sum = numbers.reduce((acc, n) => acc + n, 0); // 10"
        ],
        practical_tasks: [
          {
            task: "Use map to double array values, filter to get even numbers, reduce to sum them.",
            expected_output: "Correct results from map, filter, and reduce operations"
          }
        ],
        bonus_tips: "HOFs make code more declarative and easier to read.",
        resources: ["https://javascript.info/array-methods"]
      },
      {
        lesson_title: "IIFE (Immediately Invoked Function Expression)",
        explanation: "Functions that execute immediately after definition. Used to create isolated scopes.",
        code_examples: [
          "(function() {\n  console.log('Hello World');\n})();",
          "(() => {\n  const private = 'secret';\n  console.log(private);\n})();"
        ],
        practical_tasks: [
          {
            task: "Write an IIFE to print 'Hello World' to the console.",
            expected_output: "(function() { console.log('Hello World'); })();"
          }
        ],
        bonus_tips: "IIFEs were commonly used before let/const for creating block scopes.",
        resources: ["https://javascript.info/function-expressions"]
      },
      {
        lesson_title: "Objects",
        explanation: "Objects store key-value pairs. They can have properties and methods. The 'this' keyword refers to the object.",
        code_examples: [
          "const book = {\n  title: '1984',\n  author: 'Orwell',\n  read() {\n    console.log(`Reading ${this.title}`);\n  }\n};"
        ],
        practical_tasks: [
          {
            task: "Create an object representing a book with title, author, and a read() method.",
            expected_output: "Object with properties and method using 'this'"
          }
        ],
        bonus_tips: "Use dot notation (obj.prop) for known properties, bracket notation (obj['prop']) for dynamic keys.",
        resources: ["https://javascript.info/object"]
      },
      {
        lesson_title: "Arrays",
        explanation: "Arrays store ordered collections. Access elements by index, use methods like push, pop, shift, unshift, map, filter.",
        code_examples: [
          "const nums = [1, 2, 3, 4, 5];",
          "nums.push(6); // [1,2,3,4,5,6]",
          "const doubled = nums.map(n => n * 2);"
        ],
        practical_tasks: [
          {
            task: "Create an array of 5 numbers, double them using map, log the result.",
            expected_output: "const nums = [1,2,3,4,5]; const doubled = nums.map(n => n*2);"
          }
        ],
        bonus_tips: "Array methods like map/filter/reduce don't mutate the original array.",
        resources: ["https://javascript.info/array"]
      },
      {
        lesson_title: "ES6 Features: Destructuring, Spread, Template Literals",
        explanation: "Destructuring extracts values, spread operator (...) expands arrays/objects, template literals use backticks for string interpolation.",
        code_examples: [
          "const [a, b] = [1, 2]; // destructuring",
          "const arr = [1, ...arr2, 3]; // spread",
          "const name = 'John'; const msg = `Hello ${name}`; // template literal"
        ],
        practical_tasks: [
          {
            task: "Use destructuring to extract values from an array and object, use spread operator to combine arrays.",
            expected_output: "Working examples of destructuring and spread"
          }
        ],
        bonus_tips: "Template literals support multi-line strings without \\n escape characters.",
        resources: ["https://javascript.info/destructuring-assignment"]
      },
      {
        lesson_title: "Selecting DOM Elements",
        explanation: "Access HTML elements using getElementById, querySelector, getElementsByClassName, querySelectorAll.",
        code_examples: [
          "const el = document.getElementById('myId');",
          "const el2 = document.querySelector('.myClass');",
          "const all = document.querySelectorAll('p');"
        ],
        practical_tasks: [
          {
            task: "Change the text of a paragraph using JavaScript querySelector.",
            expected_output: "document.querySelector('p').textContent = 'New text';"
          }
        ],
        bonus_tips: "querySelector uses CSS selector syntax - very powerful and flexible.",
        resources: ["https://javascript.info/searching-elements-dom"]
      },
      {
        lesson_title: "Events",
        explanation: "Listen for user interactions: click, mouseover, input, submit. Use addEventListener to attach event handlers.",
        code_examples: [
          "const btn = document.querySelector('button');",
          "btn.addEventListener('click', () => {\n  alert('Clicked!');\n});"
        ],
        practical_tasks: [
          {
            task: "Add a button that changes background color on click.",
            expected_output: "button.addEventListener('click', () => document.body.style.background = 'blue');"
          }
        ],
        bonus_tips: "addEventListener is preferred over onclick for multiple handlers.",
        resources: ["https://javascript.info/introduction-browser-events"]
      },
      {
        lesson_title: "Creating and Removing Elements",
        explanation: "Dynamically create, append, and remove DOM elements using createElement, appendChild, removeChild.",
        code_examples: [
          "const li = document.createElement('li');",
          "li.textContent = 'New Item';",
          "document.querySelector('ul').appendChild(li);"
        ],
        practical_tasks: [
          {
            task: "Add a new list item dynamically to a <ul> list when button is clicked.",
            expected_output: "createElement + appendChild working to add items"
          }
        ],
        bonus_tips: "Use innerHTML for multiple elements, but be careful of XSS vulnerabilities.",
        resources: ["https://javascript.info/modifying-document"]
      },
      {
        lesson_title: "Callbacks in Async Operations",
        explanation: "Callbacks handle asynchronous operations like setTimeout, fetching data, file reading.",
        code_examples: [
          "setTimeout(() => {\n  console.log('After 2 seconds');\n}, 2000);"
        ],
        practical_tasks: [
          {
            task: "Simulate fetching data with setTimeout that logs a message after 3 seconds.",
            expected_output: "setTimeout(() => console.log('Data loaded'), 3000);"
          }
        ],
        bonus_tips: "Callback hell (nested callbacks) led to the creation of Promises.",
        resources: ["https://javascript.info/callbacks"]
      },
      {
        lesson_title: "Promises",
        explanation: "Promises represent eventual completion or failure of async operations. Use then, catch, finally for handling.",
        code_examples: [
          "const promise = new Promise((resolve, reject) => {\n  setTimeout(() => resolve('Done'), 2000);\n});",
          "promise.then(result => console.log(result)).catch(err => console.error(err));"
        ],
        practical_tasks: [
          {
            task: "Create a promise that resolves after 2 seconds with message 'Success'.",
            expected_output: "Promise with then/catch handlers"
          }
        ],
        bonus_tips: "Promises can only be resolved or rejected once.",
        resources: ["https://javascript.info/promise-basics"]
      },
      {
        lesson_title: "Async / Await",
        explanation: "Async/await is syntactic sugar for Promises, making async code look synchronous and easier to read.",
        code_examples: [
          "async function fetchData() {\n  const response = await fetch('https://api.example.com/data');\n  const data = await response.json();\n  return data;\n}"
        ],
        practical_tasks: [
          {
            task: "Fetch data from a public API using fetch + async/await syntax.",
            expected_output: "async function using await with fetch API"
          }
        ],
        bonus_tips: "Always use try/catch with async/await for error handling.",
        resources: ["https://javascript.info/async-await"]
      },
      {
        lesson_title: "Try, Catch, Finally",
        explanation: "Error handling with try (execute code), catch (handle errors), finally (always execute).",
        code_examples: [
          "try {\n  const result = riskyOperation();\n} catch (error) {\n  console.error(error.message);\n} finally {\n  console.log('Cleanup');\n}"
        ],
        practical_tasks: [
          {
            task: "Catch division by zero or invalid input errors using try/catch.",
            expected_output: "try/catch block handling errors gracefully"
          }
        ],
        bonus_tips: "Finally block runs even if there's a return statement in try or catch.",
        resources: ["https://javascript.info/try-catch"]
      },
      {
        lesson_title: "Throwing Custom Errors",
        explanation: "Create and throw custom errors using the throw keyword for better error handling.",
        code_examples: [
          "function divide(a, b) {\n  if (typeof a !== 'number' || typeof b !== 'number') {\n    throw new Error('Both arguments must be numbers');\n  }\n  return a / b;\n}"
        ],
        practical_tasks: [
          {
            task: "Throw a custom error if function input is not a number.",
            expected_output: "Function with throw statement and custom error message"
          }
        ],
        bonus_tips: "Always throw Error objects, not plain strings, for better stack traces.",
        resources: ["https://javascript.info/try-catch"]
      },
      {
        lesson_title: "Scope & Hoisting",
        explanation: "Scope determines variable accessibility. Hoisting moves declarations to the top. var is function-scoped and hoisted, let/const are block-scoped.",
        code_examples: [
          "console.log(x); // undefined (hoisted)",
          "var x = 5;",
          "// let y; console.log(y); // ReferenceError"
        ],
        practical_tasks: [
          {
            task: "Explain difference between var, let, const using code examples showing scope.",
            expected_output: "Examples demonstrating scoping differences"
          }
        ],
        bonus_tips: "Temporal Dead Zone: let/const can't be accessed before declaration.",
        resources: ["https://javascript.info/closure"]
      },
      {
        lesson_title: "Event Loop & Call Stack",
        explanation: "JS is single-threaded. Call stack executes synchronous code, event loop handles async operations from callback queue.",
        code_examples: [
          "console.log('1');",
          "setTimeout(() => console.log('2'), 0);",
          "console.log('3');",
          "// Output: 1, 3, 2"
        ],
        practical_tasks: [
          {
            task: "Log execution order of setTimeout vs synchronous code to understand event loop.",
            expected_output: "Understanding why setTimeout runs after sync code even with 0 delay"
          }
        ],
        bonus_tips: "setTimeout(fn, 0) doesn't execute immediately - it waits for call stack to clear.",
        resources: ["https://javascript.info/event-loop"]
      },
      {
        lesson_title: "ES6 Modules",
        explanation: "Split code into reusable modules. Export functions/variables from one file, import in another.",
        code_examples: [
          "// math.js\nexport const add = (a, b) => a + b;",
          "// main.js\nimport { add } from './math.js';"
        ],
        practical_tasks: [
          {
            task: "Create two JS files: export a function from one, import it in main file.",
            expected_output: "Working module system with export/import"
          }
        ],
        bonus_tips: "Use type='module' in script tag for browser module support.",
        resources: ["https://javascript.info/modules-intro"]
      },
      {
        lesson_title: "Final Projects: Practical JS Applications",
        explanation: "Build real-world projects: To-Do List (add, remove, mark complete), Quiz App (score calculation), Calculator (arithmetic operations), Digital Clock (real-time updates).",
        code_examples: [
          "// To-Do List Example\nconst addTask = () => {\n  const task = input.value;\n  const li = document.createElement('li');\n  li.textContent = task;\n  list.appendChild(li);\n};"
        ],
        practical_tasks: [
          {
            task: "Build a complete To-Do List App with add, remove, and mark-complete functionality.",
            expected_output: "Fully functional to-do list using DOM manipulation, events, and array methods"
          }
        ],
        bonus_tips: "These projects combine everything: DOM manipulation, events, functions, arrays, and more!",
        resources: ["https://javascript.info/"]
      }
    ]
  },
  {
    title: "React Essentials",
    description: "Master React - from components and hooks to advanced patterns and real-world projects",
    difficulty: "intermediate",
    estimatedTime: "8 weeks",
    xpReward: 2000,
    topics: ["Introduction to React", "JSX", "Props & State", "Event Handling", "React Hooks", "Forms", "React Router", "Context API", "Advanced Concepts", "Projects"],
    subtopics: [
      {
        lesson_title: "What is React and why use it?",
        explanation: "React is a JavaScript library for building interactive UIs using reusable components. Benefits: Component reusability, virtual DOM for performance, declarative programming. React makes complex UIs manageable by breaking them into small, reusable pieces.",
        code_examples: [
          "// Simple React Component\nfunction Welcome() {\n  return <h1>Hello, React!</h1>;\n}\n\n// React uses Virtual DOM for efficient updates\n// Only changed parts of UI are re-rendered"
        ],
        practical_tasks: [
          {
            task: "Set up a new React app using Vite: npm create vite@latest my-react-app -- --template react",
            expected_output: "Working React app running on localhost with default Vite template"
          }
        ],
        bonus_tips: "Vite is faster than create-react-app for development with instant HMR (Hot Module Replacement).",
        resources: ["https://react.dev/learn"]
      },
      {
        lesson_title: "Functional Components",
        explanation: "Components are the building blocks of React apps. Functional components are JavaScript functions that return JSX. Modern React focuses on functional components with hooks instead of class components.",
        code_examples: [
          "// Functional Component\nfunction Header() {\n  return (\n    <header>\n      <h1>My App</h1>\n      <nav>Navigation</nav>\n    </header>\n  );\n}\n\n// Arrow Function Component\nconst Footer = () => {\n  return <footer>© 2025 My App</footer>;\n};"
        ],
        practical_tasks: [
          {
            task: "Create Header, Main, and Footer components. Import and use them in App.jsx.",
            expected_output: "Three separate component files with Header, Main, Footer rendered in App"
          }
        ],
        bonus_tips: "Components must start with a capital letter. Use PascalCase for component names.",
        resources: ["https://react.dev/learn/your-first-component"]
      },
      {
        lesson_title: "JSX Syntax and Expressions",
        explanation: "JSX lets you write HTML-like code in JavaScript. Use {} to embed JavaScript expressions. JSX is syntactic sugar for React.createElement() calls.",
        code_examples: [
          "const name = 'Sarah';\nconst age = 25;\n\nfunction Greeting() {\n  return (\n    <div>\n      <h1>Hello, {name}!</h1>\n      <p>You are {age} years old</p>\n      <p>Next year: {age + 1}</p>\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Create a Profile component that displays your name, age, and favorite hobby using JSX expressions.",
            expected_output: "Profile component with dynamic values rendered using {}"
          }
        ],
        bonus_tips: "JSX expressions can include any valid JavaScript: variables, functions, math operations, ternary operators.",
        resources: ["https://react.dev/learn/javascript-in-jsx-with-curly-braces"]
      },
      {
        lesson_title: "Conditional Rendering",
        explanation: "Render different UI based on conditions using: if/else (outside JSX), ternary operator (? :), logical AND (&&) operator.",
        code_examples: [
          "function Greeting({ isLoggedIn }) {\n  // Ternary operator\n  return (\n    <div>\n      {isLoggedIn ? <h1>Welcome back!</h1> : <h1>Please log in</h1>}\n    </div>\n  );\n}\n\n// Logical AND\nfunction Notification({ hasMessages, count }) {\n  return (\n    <div>\n      {hasMessages && <p>You have {count} new messages</p>}\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Create a UserStatus component that shows 'Logged In' or 'Guest' based on a boolean prop.",
            expected_output: "Component using ternary or && operator for conditional rendering"
          }
        ],
        bonus_tips: "Use && for simple 'if true, show this' conditions. Use ternary for 'if true show A, else show B'.",
        resources: ["https://react.dev/learn/conditional-rendering"]
      },
      {
        lesson_title: "Lists and Keys",
        explanation: "Render arrays using .map(). Keys help React identify which items changed, added, or removed for efficient updates. Keys must be unique and stable.",
        code_examples: [
          "const courses = ['HTML', 'CSS', 'JavaScript', 'React'];\n\nfunction CourseList() {\n  return (\n    <ul>\n      {courses.map((course, index) => (\n        <li key={index}>{course}</li>\n      ))}\n    </ul>\n  );\n}\n\n// Better: use unique IDs\nconst items = [{id: 1, name: 'HTML'}, {id: 2, name: 'CSS'}];\nitems.map(item => <li key={item.id}>{item.name}</li>)"
        ],
        practical_tasks: [
          {
            task: "Create a CourseList component that renders 5 course names from an array using map.",
            expected_output: "Unordered list with 5 courses, each with a key prop"
          }
        ],
        bonus_tips: "Avoid using array index as key if list order can change. Use unique IDs from your data.",
        resources: ["https://react.dev/learn/rendering-lists"]
      },
      {
        lesson_title: "Props - Passing Data to Components",
        explanation: "Props (properties) pass data from parent to child components. Props are read-only - child components cannot modify them. Props make components reusable with different data.",
        code_examples: [
          "// Parent Component\nfunction App() {\n  return (\n    <div>\n      <Course title='HTML Basics' duration='4 weeks' />\n      <Course title='CSS Mastery' duration='5 weeks' />\n    </div>\n  );\n}\n\n// Child Component\nfunction Course({ title, duration }) {\n  return (\n    <div className='course-card'>\n      <h3>{title}</h3>\n      <p>Duration: {duration}</p>\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Create a Course component that accepts title, description, and xp as props. Use it 3 times with different data.",
            expected_output: "Reusable Course component displaying different course information"
          }
        ],
        bonus_tips: "Use object destructuring in function parameters for cleaner code: function Course({ title, duration }).",
        resources: ["https://react.dev/learn/passing-props-to-a-component"]
      },
      {
        lesson_title: "State with useState Hook",
        explanation: "State is reactive data that causes re-render when changed. Plain variables don't trigger re-renders! useState returns [value, setterFunction]. Calling setter schedules a re-render with new value.",
        code_examples: [
          "import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>+</button>\n      <button onClick={() => setCount(count - 1)}>-</button>\n      <button onClick={() => setCount(0)}>Reset</button>\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Build a counter with increment, decrement, and reset buttons using useState.",
            expected_output: "Working counter that updates UI when buttons are clicked"
          }
        ],
        bonus_tips: "State updates are asynchronous. To update based on previous state, use function form: setCount(prev => prev + 1).",
        resources: ["https://react.dev/reference/react/useState"]
      },
      {
        lesson_title: "Lifting State Up",
        explanation: "When multiple components need to share state, move state to their closest common parent. Parent passes state down as props and update functions as callbacks.",
        code_examples: [
          "function Parent() {\n  const [totalScore, setTotalScore] = useState(0);\n  \n  return (\n    <div>\n      <h2>Total: {totalScore}</h2>\n      <Counter onScoreChange={(score) => setTotalScore(totalScore + score)} />\n      <Counter onScoreChange={(score) => setTotalScore(totalScore + score)} />\n    </div>\n  );\n}\n\nfunction Counter({ onScoreChange }) {\n  return <button onClick={() => onScoreChange(10)}>+10</button>;\n}"
        ],
        practical_tasks: [
          {
            task: "Create a parent component with 2 counter children. Parent displays the sum of both counters.",
            expected_output: "Parent component managing shared state for child counters"
          }
        ],
        bonus_tips: "This is a key React pattern. State flows down (props), actions flow up (callbacks).",
        resources: ["https://react.dev/learn/sharing-state-between-components"]
      },
      {
        lesson_title: "Handling Events",
        explanation: "React events use camelCase (onClick, onChange, onSubmit). Event handlers receive synthetic events (cross-browser wrapper). Use arrow functions or bind to preserve 'this' context.",
        code_examples: [
          "function Form() {\n  const handleSubmit = (event) => {\n    event.preventDefault();\n    console.log('Form submitted!');\n  };\n  \n  const handleChange = (event) => {\n    console.log('Input value:', event.target.value);\n  };\n  \n  return (\n    <form onSubmit={handleSubmit}>\n      <input onChange={handleChange} />\n      <button type='submit'>Submit</button>\n    </form>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Create a form with input field that logs values on change and shows alert on submit.",
            expected_output: "Form with onChange logging input values and onSubmit showing alert"
          }
        ],
        bonus_tips: "Always use event.preventDefault() on form submit to prevent page reload.",
        resources: ["https://react.dev/learn/responding-to-events"]
      },
      {
        lesson_title: "Synthetic Events",
        explanation: "React wraps browser events in SyntheticEvent for cross-browser compatibility. Events are pooled for performance - don't access event asynchronously without event.persist().",
        code_examples: [
          "function EventDemo() {\n  const handleClick = (event) => {\n    console.log('Event type:', event.type);\n    console.log('Target:', event.target);\n    console.log('Button clicked:', event.button);\n  };\n  \n  const handleKeyPress = (event) => {\n    if (event.key === 'Enter') {\n      console.log('Enter pressed!');\n    }\n  };\n  \n  return (\n    <div>\n      <button onClick={handleClick}>Click Me</button>\n      <input onKeyPress={handleKeyPress} />\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Create an input that logs key presses and a button that logs mouse events (click, hover).",
            expected_output: "Components with event handlers logging event details"
          }
        ],
        bonus_tips: "Common events: onClick, onChange, onSubmit, onKeyPress, onMouseEnter, onMouseLeave, onFocus, onBlur.",
        resources: ["https://react.dev/reference/react-dom/components/common#react-event-object"]
      },
      {
        lesson_title: "useEffect Hook - Side Effects",
        explanation: "useEffect runs side effects: API calls, subscriptions, timers, DOM manipulation. Runs AFTER render. Dependency array controls when it runs: [] = once, [var] = when var changes, none = every render.",
        code_examples: [
          "import { useState, useEffect } from 'react';\n\nfunction UserList() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n  \n  useEffect(() => {\n    // Runs once on mount\n    fetch('https://jsonplaceholder.typicode.com/users')\n      .then(res => res.json())\n      .then(data => {\n        setUsers(data);\n        setLoading(false);\n      });\n  }, []); // Empty array = run once\n  \n  if (loading) return <p>Loading...</p>;\n  \n  return (\n    <ul>\n      {users.map(user => <li key={user.id}>{user.name}</li>)}\n    </ul>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Fetch users from https://jsonplaceholder.typicode.com/users and display in a list using useEffect.",
            expected_output: "Component that fetches and displays user data on mount"
          }
        ],
        bonus_tips: "Return a cleanup function from useEffect to cancel subscriptions or clear timers.",
        resources: ["https://react.dev/reference/react/useEffect"]
      },
      {
        lesson_title: "useEffect Cleanup and Dependencies",
        explanation: "Cleanup function prevents memory leaks. Dependencies array tells React when to re-run effect. Missing dependencies can cause bugs. ESLint plugin helps catch these.",
        code_examples: [
          "function Timer() {\n  const [seconds, setSeconds] = useState(0);\n  \n  useEffect(() => {\n    const interval = setInterval(() => {\n      setSeconds(s => s + 1);\n    }, 1000);\n    \n    // Cleanup: clear interval when component unmounts\n    return () => clearInterval(interval);\n  }, []); // No dependencies needed\n  \n  return <p>Seconds: {seconds}</p>;\n}\n\n// With dependencies\nfunction SearchResults({ query }) {\n  const [results, setResults] = useState([]);\n  \n  useEffect(() => {\n    // Re-run when query changes\n    fetch(`/api/search?q=${query}`)\n      .then(res => res.json())\n      .then(data => setResults(data));\n  }, [query]); // Runs when query changes\n}"
        ],
        practical_tasks: [
          {
            task: "Create a countdown timer that starts at 60 and counts down. Clean up interval on unmount.",
            expected_output: "Timer component with proper cleanup preventing memory leaks"
          }
        ],
        bonus_tips: "Always include all values from component scope that effect uses in dependency array.",
        resources: ["https://react.dev/learn/synchronizing-with-effects"]
      },
      {
        lesson_title: "useReducer Hook",
        explanation: "useReducer is useState alternative for complex state logic. Takes reducer function and initial state. Returns [state, dispatch]. Reducer is (state, action) => newState. Good for related state values.",
        code_examples: [
          "import { useReducer } from 'react';\n\nconst initialState = { count: 0, step: 1 };\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'increment':\n      return { ...state, count: state.count + state.step };\n    case 'decrement':\n      return { ...state, count: state.count - state.step };\n    case 'setStep':\n      return { ...state, step: action.payload };\n    case 'reset':\n      return initialState;\n    default:\n      return state;\n  }\n}\n\nfunction Counter() {\n  const [state, dispatch] = useReducer(reducer, initialState);\n  \n  return (\n    <div>\n      <p>Count: {state.count}</p>\n      <p>Step: {state.step}</p>\n      <button onClick={() => dispatch({ type: 'increment' })}>+</button>\n      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>\n      <input \n        type='number' \n        value={state.step}\n        onChange={(e) => dispatch({ type: 'setStep', payload: +e.target.value })}\n      />\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Build a todo list using useReducer with actions: add, remove, toggle completion.",
            expected_output: "Todo app with useReducer managing state for multiple actions"
          }
        ],
        bonus_tips: "useReducer is great when next state depends on previous state or when state has multiple sub-values.",
        resources: ["https://react.dev/reference/react/useReducer"]
      },
      {
        lesson_title: "Custom Hooks",
        explanation: "Custom hooks are reusable functions that use React hooks. Must start with 'use'. Extract common logic to share across components. Can use other hooks inside.",
        code_examples: [
          "// Custom hook for window width\nimport { useState, useEffect } from 'react';\n\nfunction useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);\n  \n  useEffect(() => {\n    const handleResize = () => setWidth(window.innerWidth);\n    window.addEventListener('resize', handleResize);\n    return () => window.removeEventListener('resize', handleResize);\n  }, []);\n  \n  return width;\n}\n\n// Usage\nfunction MyComponent() {\n  const width = useWindowWidth();\n  return <p>Window width: {width}px</p>;\n}\n\n// Custom hook for localStorage\nfunction useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(() => {\n    const saved = localStorage.getItem(key);\n    return saved ? JSON.parse(saved) : initialValue;\n  });\n  \n  useEffect(() => {\n    localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n  \n  return [value, setValue];\n}"
        ],
        practical_tasks: [
          {
            task: "Create a useWindowWidth custom hook and use it to show 'Mobile' or 'Desktop' based on width.",
            expected_output: "Custom hook that tracks window width and component using it"
          }
        ],
        bonus_tips: "Custom hooks are a powerful way to share stateful logic without prop drilling or render props.",
        resources: ["https://react.dev/learn/reusing-logic-with-custom-hooks"]
      },
      {
        lesson_title: "Controlled Components and Forms",
        explanation: "Controlled component: React state controls form input values. Uncontrolled: DOM handles values (use refs). Controlled is recommended for validation and synchronization.",
        code_examples: [
          "function LoginForm() {\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n  \n  const handleSubmit = (e) => {\n    e.preventDefault();\n    console.log('Login:', { email, password });\n  };\n  \n  return (\n    <form onSubmit={handleSubmit}>\n      <input\n        type='email'\n        value={email}\n        onChange={(e) => setEmail(e.target.value)}\n        placeholder='Email'\n      />\n      <input\n        type='password'\n        value={password}\n        onChange={(e) => setPassword(e.target.value)}\n        placeholder='Password'\n      />\n      <button type='submit'>Login</button>\n    </form>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Create a registration form with name, email, password fields as controlled components.",
            expected_output: "Form where React state controls all input values"
          }
        ],
        bonus_tips: "For controlled components, value prop + onChange handler must both be present.",
        resources: ["https://react.dev/reference/react-dom/components/input"]
      },
      {
        lesson_title: "Form Validation",
        explanation: "Validate inputs on change or submit. Show error messages. Disable submit button if invalid. Use state to track errors and validation status.",
        code_examples: [
          "function SignupForm() {\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n  const [errors, setErrors] = useState({});\n  \n  const validate = () => {\n    const newErrors = {};\n    if (!email.includes('@')) newErrors.email = 'Invalid email';\n    if (password.length < 6) newErrors.password = 'Min 6 characters';\n    setErrors(newErrors);\n    return Object.keys(newErrors).length === 0;\n  };\n  \n  const handleSubmit = (e) => {\n    e.preventDefault();\n    if (validate()) {\n      console.log('Valid submission!');\n    }\n  };\n  \n  return (\n    <form onSubmit={handleSubmit}>\n      <input\n        type='email'\n        value={email}\n        onChange={(e) => setEmail(e.target.value)}\n      />\n      {errors.email && <span className='error'>{errors.email}</span>}\n      \n      <input\n        type='password'\n        value={password}\n        onChange={(e) => setPassword(e.target.value)}\n      />\n      {errors.password && <span className='error'>{errors.password}</span>}\n      \n      <button type='submit'>Sign Up</button>\n    </form>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Add validation to your form: email must contain @, password min 6 chars. Show error messages.",
            expected_output: "Form with inline validation and error display"
          }
        ],
        bonus_tips: "Consider libraries like Formik or React Hook Form for complex forms with many fields.",
        resources: ["https://react.dev/learn/managing-state"]
      },
      {
        lesson_title: "React Router - Setup and Basic Routes",
        explanation: "React Router enables client-side routing for SPAs. Install react-router-dom. Use BrowserRouter, Routes, Route components. Navigate without page reload.",
        code_examples: [
          "// Install: npm install react-router-dom\nimport { BrowserRouter, Routes, Route, Link } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <nav>\n        <Link to='/'>Home</Link>\n        <Link to='/about'>About</Link>\n        <Link to='/contact'>Contact</Link>\n      </nav>\n      \n      <Routes>\n        <Route path='/' element={<Home />} />\n        <Route path='/about' element={<About />} />\n        <Route path='/contact' element={<Contact />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}\n\nfunction Home() { return <h1>Home Page</h1>; }\nfunction About() { return <h1>About Page</h1>; }\nfunction Contact() { return <h1>Contact Page</h1>; }"
        ],
        practical_tasks: [
          {
            task: "Install react-router-dom and create routes for Home, About, Contact pages with navigation.",
            expected_output: "Multi-page SPA with working navigation using React Router"
          }
        ],
        bonus_tips: "Use Link instead of <a> tags to prevent page reload. Use NavLink for active link styling.",
        resources: ["https://reactrouter.com/en/main/start/tutorial"]
      },
      {
        lesson_title: "Dynamic Routes and URL Parameters",
        explanation: "Dynamic routes use :param syntax. Access params with useParams hook. Useful for detail pages, user profiles, product pages.",
        code_examples: [
          "import { useParams } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <Routes>\n      <Route path='/user/:id' element={<UserProfile />} />\n      <Route path='/course/:courseId/lesson/:lessonId' element={<Lesson />} />\n    </Routes>\n  );\n}\n\nfunction UserProfile() {\n  const { id } = useParams();\n  \n  return (\n    <div>\n      <h1>User Profile #{id}</h1>\n      {/* Fetch user data based on id */}\n    </div>\n  );\n}\n\nfunction Lesson() {\n  const { courseId, lessonId } = useParams();\n  return <h1>Course {courseId}, Lesson {lessonId}</h1>;\n}"
        ],
        practical_tasks: [
          {
            task: "Create a /profile/:userId route that displays user ID from URL parameter.",
            expected_output: "Dynamic route showing different content based on URL parameter"
          }
        ],
        bonus_tips: "Use useNavigate hook for programmatic navigation: const navigate = useNavigate(); navigate('/home');",
        resources: ["https://reactrouter.com/en/main/hooks/use-params"]
      },
      {
        lesson_title: "Context API - Global State Management",
        explanation: "Context API provides global state without prop drilling. Create context, provide value at top level, consume with useContext in any child. Great for themes, auth, language.",
        code_examples: [
          "import { createContext, useContext, useState } from 'react';\n\n// Create Context\nconst ThemeContext = createContext();\n\n// Provider Component\nfunction ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  \n  const toggleTheme = () => {\n    setTheme(theme === 'light' ? 'dark' : 'light');\n  };\n  \n  return (\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}\n\n// Consumer Component\nfunction ThemedButton() {\n  const { theme, toggleTheme } = useContext(ThemeContext);\n  \n  return (\n    <button \n      onClick={toggleTheme}\n      className={theme}\n    >\n      Current theme: {theme}\n    </button>\n  );\n}\n\n// App\nfunction App() {\n  return (\n    <ThemeProvider>\n      <ThemedButton />\n    </ThemeProvider>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Build a theme switcher (light/dark mode) using Context API. Apply theme to background color.",
            expected_output: "Working theme switcher without prop drilling"
          }
        ],
        bonus_tips: "Split contexts by concern. Don't put everything in one giant context - it causes unnecessary re-renders.",
        resources: ["https://react.dev/reference/react/useContext"]
      },
      {
        lesson_title: "Context with useReducer",
        explanation: "Combine Context API with useReducer for scalable global state management. Similar pattern to Redux but simpler. Good for medium-sized apps.",
        code_examples: [
          "import { createContext, useContext, useReducer } from 'react';\n\nconst TodoContext = createContext();\n\nconst todoReducer = (state, action) => {\n  switch (action.type) {\n    case 'ADD':\n      return [...state, { id: Date.now(), text: action.text, done: false }];\n    case 'TOGGLE':\n      return state.map(todo => \n        todo.id === action.id ? { ...todo, done: !todo.done } : todo\n      );\n    case 'DELETE':\n      return state.filter(todo => todo.id !== action.id);\n    default:\n      return state;\n  }\n};\n\nfunction TodoProvider({ children }) {\n  const [todos, dispatch] = useReducer(todoReducer, []);\n  \n  return (\n    <TodoContext.Provider value={{ todos, dispatch }}>\n      {children}\n    </TodoContext.Provider>\n  );\n}\n\nfunction TodoList() {\n  const { todos, dispatch } = useContext(TodoContext);\n  \n  return (\n    <div>\n      {todos.map(todo => (\n        <div key={todo.id}>\n          <span>{todo.text}</span>\n          <button onClick={() => dispatch({ type: 'TOGGLE', id: todo.id })}>Toggle</button>\n          <button onClick={() => dispatch({ type: 'DELETE', id: todo.id })}>Delete</button>\n        </div>\n      ))}\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Build a global todo list using Context + useReducer with add, toggle, delete actions.",
            expected_output: "Todo app with global state accessible from any component"
          }
        ],
        bonus_tips: "This pattern scales better than useState for complex state. For very large apps, consider Redux or Zustand.",
        resources: ["https://react.dev/learn/scaling-up-with-reducer-and-context"]
      },
      {
        lesson_title: "React.memo and Performance Optimization",
        explanation: "React.memo prevents re-renders if props haven't changed. Memoization caches results. Use for expensive components. useMemo memoizes values, useCallback memoizes functions.",
        code_examples: [
          "import { memo, useMemo, useCallback, useState } from 'react';\n\n// Memoized component\nconst ExpensiveComponent = memo(({ data }) => {\n  console.log('Rendering ExpensiveComponent');\n  return <div>{data}</div>;\n});\n\nfunction Parent() {\n  const [count, setCount] = useState(0);\n  const [items, setItems] = useState([1, 2, 3]);\n  \n  // useMemo: memoize expensive calculation\n  const total = useMemo(() => {\n    console.log('Calculating total');\n    return items.reduce((sum, item) => sum + item, 0);\n  }, [items]);\n  \n  // useCallback: memoize function\n  const handleClick = useCallback(() => {\n    console.log('Button clicked');\n  }, []);\n  \n  return (\n    <div>\n      <button onClick={() => setCount(count + 1)}>Count: {count}</button>\n      <p>Total: {total}</p>\n      <ExpensiveComponent data={items} />\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Optimize a list component with heavy computation using React.memo and useMemo.",
            expected_output: "Component that only re-renders when necessary"
          }
        ],
        bonus_tips: "Don't over-optimize! Measure performance first. Premature optimization adds complexity.",
        resources: ["https://react.dev/reference/react/memo"]
      },
      {
        lesson_title: "Error Boundaries",
        explanation: "Error boundaries catch JavaScript errors in child components. Display fallback UI instead of crashing. Must be class components (no hook equivalent yet). Use react-error-boundary library for functional approach.",
        code_examples: [
          "// Class component (Error Boundary requires class)\nimport { Component } from 'react';\n\nclass ErrorBoundary extends Component {\n  constructor(props) {\n    super(props);\n    this.state = { hasError: false };\n  }\n  \n  static getDerivedStateFromError(error) {\n    return { hasError: true };\n  }\n  \n  componentDidCatch(error, errorInfo) {\n    console.error('Error caught:', error, errorInfo);\n  }\n  \n  render() {\n    if (this.state.hasError) {\n      return <h1>Something went wrong.</h1>;\n    }\n    return this.props.children;\n  }\n}\n\n// Usage\nfunction App() {\n  return (\n    <ErrorBoundary>\n      <BuggyComponent />\n    </ErrorBoundary>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Create an Error Boundary and wrap a component that throws an error. Show fallback UI.",
            expected_output: "Error boundary catching errors and displaying fallback UI"
          }
        ],
        bonus_tips: "Error boundaries don't catch errors in event handlers. Use try/catch for those.",
        resources: ["https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary"]
      },
      {
        lesson_title: "Portals",
        explanation: "Portals render children into a DOM node outside parent hierarchy. Useful for modals, tooltips, dropdowns. Event bubbling still works as if portal is in React tree.",
        code_examples: [
          "import { createPortal } from 'react-dom';\nimport { useState } from 'react';\n\nfunction Modal({ isOpen, onClose, children }) {\n  if (!isOpen) return null;\n  \n  return createPortal(\n    <div className='modal-overlay' onClick={onClose}>\n      <div className='modal-content' onClick={(e) => e.stopPropagation()}>\n        {children}\n        <button onClick={onClose}>Close</button>\n      </div>\n    </div>,\n    document.getElementById('modal-root') // Render here instead of parent\n  );\n}\n\nfunction App() {\n  const [showModal, setShowModal] = useState(false);\n  \n  return (\n    <div>\n      <button onClick={() => setShowModal(true)}>Open Modal</button>\n      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>\n        <h2>Modal Content</h2>\n        <p>This is rendered in a portal!</p>\n      </Modal>\n    </div>\n  );\n}\n\n// Add to index.html: <div id='modal-root'></div>"
        ],
        practical_tasks: [
          {
            task: "Create a modal component using createPortal that renders outside the main app div.",
            expected_output: "Working modal using portal, rendered at document body level"
          }
        ],
        bonus_tips: "Portals are perfect for avoiding z-index and overflow issues with modals.",
        resources: ["https://react.dev/reference/react-dom/createPortal"]
      },
      {
        lesson_title: "Mini Project 1: Todo App",
        explanation: "Build a complete todo app combining state, events, controlled inputs, conditional rendering, and list operations.",
        code_examples: [
          "function TodoApp() {\n  const [todos, setTodos] = useState([]);\n  const [input, setInput] = useState('');\n  \n  const addTodo = () => {\n    if (input.trim()) {\n      setTodos([...todos, { id: Date.now(), text: input, done: false }]);\n      setInput('');\n    }\n  };\n  \n  const toggleTodo = (id) => {\n    setTodos(todos.map(todo => \n      todo.id === id ? { ...todo, done: !todo.done } : todo\n    ));\n  };\n  \n  const deleteTodo = (id) => {\n    setTodos(todos.filter(todo => todo.id !== id));\n  };\n  \n  return (\n    <div>\n      <h1>My Todos</h1>\n      <input value={input} onChange={(e) => setInput(e.target.value)} />\n      <button onClick={addTodo}>Add</button>\n      <ul>\n        {todos.map(todo => (\n          <li key={todo.id}>\n            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>\n              {todo.text}\n            </span>\n            <button onClick={() => toggleTodo(todo.id)}>Toggle</button>\n            <button onClick={() => deleteTodo(todo.id)}>Delete</button>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Build a complete todo app with add, toggle completion, delete, and persist to localStorage.",
            expected_output: "Fully functional todo app with all CRUD operations"
          }
        ],
        bonus_tips: "Add features: filter (all/active/completed), edit todos, drag-to-reorder.",
        resources: ["https://react.dev/learn"]
      },
      {
        lesson_title: "Mini Project 2: Quiz App",
        explanation: "Build an interactive quiz with timer, score tracking, multiple questions, and results page.",
        code_examples: [
          "const questions = [\n  { question: 'What is React?', options: ['Library', 'Framework', 'Language'], answer: 0 },\n  { question: 'What is JSX?', options: ['JavaScript', 'HTML in JS', 'CSS'], answer: 1 }\n];\n\nfunction QuizApp() {\n  const [currentQ, setCurrentQ] = useState(0);\n  const [score, setScore] = useState(0);\n  const [showResult, setShowResult] = useState(false);\n  \n  const handleAnswer = (selectedIndex) => {\n    if (selectedIndex === questions[currentQ].answer) {\n      setScore(score + 1);\n    }\n    \n    if (currentQ + 1 < questions.length) {\n      setCurrentQ(currentQ + 1);\n    } else {\n      setShowResult(true);\n    }\n  };\n  \n  if (showResult) {\n    return <h2>Your Score: {score}/{questions.length}</h2>;\n  }\n  \n  return (\n    <div>\n      <h2>{questions[currentQ].question}</h2>\n      {questions[currentQ].options.map((option, index) => (\n        <button key={index} onClick={() => handleAnswer(index)}>\n          {option}\n        </button>\n      ))}\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Build a quiz app with 5 questions, score tracking, timer, and results page.",
            expected_output: "Interactive quiz with question navigation and final score"
          }
        ],
        bonus_tips: "Add: timer countdown, progress bar, question shuffle, answer feedback (correct/wrong).",
        resources: ["https://react.dev/learn"]
      },
      {
        lesson_title: "Mini Project 3: Dashboard with API",
        explanation: "Build a data dashboard fetching from API, displaying charts, using reusable components, and handling loading/error states.",
        code_examples: [
          "function Dashboard() {\n  const [data, setData] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  \n  useEffect(() => {\n    fetch('https://jsonplaceholder.typicode.com/posts')\n      .then(res => {\n        if (!res.ok) throw new Error('Failed to fetch');\n        return res.json();\n      })\n      .then(data => {\n        setData(data);\n        setLoading(false);\n      })\n      .catch(err => {\n        setError(err.message);\n        setLoading(false);\n      });\n  }, []);\n  \n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>Error: {error}</div>;\n  \n  return (\n    <div>\n      <h1>Dashboard</h1>\n      <StatsCard title='Total Posts' value={data.length} />\n      <PostList posts={data.slice(0, 10)} />\n    </div>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Build a dashboard fetching user data, displaying stats cards, and a data table.",
            expected_output: "Dashboard with API data, loading states, error handling, reusable components"
          }
        ],
        bonus_tips: "Add: search/filter, pagination, data visualization with charts, refresh button.",
        resources: ["https://react.dev/learn"]
      },
      {
        lesson_title: "Mini Project 4: Blog SPA",
        explanation: "Build a multi-page blog with routing, dynamic pages, forms, state management, and mock backend integration.",
        code_examples: [
          "function BlogApp() {\n  return (\n    <BrowserRouter>\n      <nav>\n        <Link to='/'>Home</Link>\n        <Link to='/posts'>Posts</Link>\n        <Link to='/new'>New Post</Link>\n      </nav>\n      \n      <Routes>\n        <Route path='/' element={<Home />} />\n        <Route path='/posts' element={<PostList />} />\n        <Route path='/posts/:id' element={<PostDetail />} />\n        <Route path='/new' element={<NewPost />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}\n\nfunction PostDetail() {\n  const { id } = useParams();\n  const [post, setPost] = useState(null);\n  \n  useEffect(() => {\n    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)\n      .then(res => res.json())\n      .then(data => setPost(data));\n  }, [id]);\n  \n  if (!post) return <div>Loading...</div>;\n  \n  return (\n    <article>\n      <h1>{post.title}</h1>\n      <p>{post.body}</p>\n    </article>\n  );\n}"
        ],
        practical_tasks: [
          {
            task: "Build a blog SPA with: home page, post list, post detail (dynamic route), create post form, routing.",
            expected_output: "Complete multi-page blog application with routing and CRUD operations"
          }
        ],
        bonus_tips: "This project combines everything: routing, state, forms, API, context. Portfolio-worthy!",
        resources: ["https://react.dev/learn", "https://reactrouter.com/"]
      }
    ]
  }
]

const seedCurriculum = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('📚 Connected to MongoDB')

    // Clear existing curriculum learning paths
    await LearningPath.deleteMany({ 
      title: { $in: ['HTML Fundamentals', 'CSS Styling Basics', 'JavaScript Fundamentals', 'CSS Mastery', 'JavaScript Essentials', 'React Essentials'] } 
    })
    console.log('🗑️  Cleared old curriculum data')

    // Insert new curriculum
    await LearningPath.insertMany(curriculumData)
    console.log('✅ Curriculum seeded successfully!')
    console.log(`📖 Added ${curriculumData.length} learning paths with subtopics`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding curriculum:', error)
    process.exit(1)
  }
}

seedCurriculum()
