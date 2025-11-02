import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import Curriculum from './models/Curriculum.js'

dotenv.config()

const seedCSSPart1 = async () => {
  try {
    await connectDB()
    
    console.log('🗑️  Removing existing CSS Part 1 curriculum...')
    await Curriculum.deleteOne({ topic: "CSS Part 1" })
    
    const cssPart1Curriculum = {
      topic: "CSS Part 1",
      description: "Master CSS Foundations & Styling Basics with 7 comprehensive modules covering selectors, box model, colors, fonts, backgrounds, and display properties.",
      difficulty: "beginner",
      estimatedHours: 10,
      icon: "🎨",
      tags: ["CSS", "Styling", "Web Development", "Design", "Frontend"],
      prerequisites: ["HTML Fundamentals 1"],
      subtopics: [
        {
          lessonTitle: "Introduction to CSS",
          order: 1,
          estimatedTime: 60,
          explanation: `CSS (Cascading Style Sheets) defines the visual appearance of web pages. It styles HTML elements by targeting them through selectors and applying property–value pairs. Styles cascade based on specificity and source order.

**Key Concepts:**
- CSS controls the presentation of HTML
- Selectors target specific HTML elements
- Properties define what to style (color, size, etc.)
- Values specify how to style
- Cascade determines which styles apply when there's conflict`,
          codeExamples: [
            `h1 {
  color: royalblue;
  font-family: Arial, sans-serif;
}`,
            `/* CSS Syntax */
selector {
  property: value;
  another-property: another-value;
}`,
            `/* Multiple selectors */
h1, h2, h3 {
  color: #333;
  margin-bottom: 1rem;
}`
          ],
          practicalTasks: [
            {
              task: "Style your homepage heading with custom font, size, and color",
              expectedOutput: "An h1 element with a custom color (like royalblue), font-family (like Arial), and increased font-size visible on your webpage",
              xpReward: 30
            },
            {
              task: "Create a CSS comment explaining what your styles do",
              expectedOutput: "CSS file contains comments like /* This styles the main heading */ above your CSS rules",
              xpReward: 10
            },
            {
              task: "Apply styles to at least 3 different HTML elements",
              expectedOutput: "Three different element types (e.g., h1, p, a) each with visible CSS styles applied",
              xpReward: 20
            }
          ],
          bonusTips: "Use CSS comments (/* comment */) to document your styles and make your code more maintainable.",
          resources: [
            "MDN: CSS Basics - https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics",
            "CSS Tricks: Getting Started - https://css-tricks.com/guides/beginner/",
            "W3Schools CSS Tutorial - https://www.w3schools.com/css/"
          ]
        },
        {
          lessonTitle: "Applying CSS (3 Ways)",
          order: 2,
          estimatedTime: 45,
          explanation: `CSS can be applied inline, internally in <style> tags, or externally via .css files. External stylesheets are preferred for scalability and maintainability.

**Three Methods:**
1. **Inline CSS**: Directly on HTML elements using style attribute
2. **Internal CSS**: In <style> tags within the HTML <head>
3. **External CSS**: Separate .css file linked with <link> tag

**Best Practice:** Use external stylesheets for production websites.`,
          codeExamples: [
            `<!-- 1. Inline CSS -->
<p style="color: blue; font-size: 16px;">Inline styled text</p>`,
            `<!-- 2. Internal CSS -->
<head>
  <style>
    p {
      color: blue;
      font-size: 16px;
    }
  </style>
</head>`,
            `<!-- 3. External CSS (Recommended) -->
<head>
  <link rel="stylesheet" href="styles.css">
</head>

/* In styles.css */
p {
  color: blue;
  font-size: 16px;
}`
          ],
          practicalTasks: [
            {
              task: "Create an external stylesheet named 'styles.css' and link it to your HTML",
              expectedOutput: "A styles.css file exists and is properly linked in HTML using <link rel='stylesheet' href='styles.css'>",
              xpReward: 40
            },
            {
              task: "Style at least three different elements using your external stylesheet",
              expectedOutput: "Styles from styles.css are applied and visible on at least 3 HTML elements",
              xpReward: 30
            },
            {
              task: "Compare the three methods by implementing the same style in each way",
              expectedOutput: "Examples of inline, internal, and external CSS all producing the same visual result",
              xpReward: 20
            }
          ],
          bonusTips: "External stylesheets load faster on repeat visits because browsers cache them. They also make updating styles across multiple pages much easier.",
          resources: [
            "MDN: How to Add CSS - https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps/How_CSS_is_structured",
            "CSS External vs Internal - https://www.w3schools.com/css/css_howto.asp"
          ]
        },
        {
          lessonTitle: "CSS Selectors",
          order: 3,
          estimatedTime: 90,
          explanation: `Selectors define which elements CSS rules apply to. Understanding selectors is fundamental to writing efficient and maintainable CSS.

**Selector Types:**
- **Element Selector**: Targets HTML tags (p, div, h1)
- **Class Selector**: Targets elements with specific class (.btn, .card)
- **ID Selector**: Targets unique element by ID (#header, #main)
- **Attribute Selector**: Targets elements with specific attributes ([type="text"])
- **Pseudo-classes**: Style based on state (:hover, :focus, :first-child)

**Specificity:** ID > Class > Element`,
          codeExamples: [
            `/* Element Selector */
p {
  color: black;
}`,
            `/* Class Selector */
.btn {
  background: blue;
  color: white;
  padding: 10px 20px;
}`,
            `/* ID Selector */
#header {
  background: #333;
  color: white;
}`,
            `/* Attribute Selector */
input[type="text"] {
  border: 2px solid #ccc;
  padding: 8px;
}`,
            `/* Pseudo-classes */
.btn:hover {
  background: gold;
  cursor: pointer;
}

li:first-child {
  font-weight: bold;
}`,
            `/* Combining Selectors */
nav .menu-item:hover {
  color: crimson;
}`
          ],
          practicalTasks: [
            {
              task: "Style elements using all five selector types mentioned above",
              expectedOutput: "CSS file contains examples of element, class, ID, attribute, and pseudo-class selectors all working on your page",
              xpReward: 50
            },
            {
              task: "Create a button that changes color on :hover and :active states",
              expectedOutput: "A button that changes background color when you hover over it and has a different style when clicked",
              xpReward: 30
            },
            {
              task: "Use attribute selectors to style different input types differently",
              expectedOutput: "Text inputs, email inputs, and submit buttons each have distinct styles using input[type='...'] selectors",
              xpReward: 30
            }
          ],
          bonusTips: "Avoid overusing ID selectors - classes are more reusable and flexible. Use descendant selectors (nav a) to target specific contexts.",
          resources: [
            "MDN: CSS Selectors - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors",
            "CSS Diner Game - https://flukeout.github.io/",
            "CSS Tricks: Selectors - https://css-tricks.com/how-css-selectors-work/"
          ]
        },
        {
          lessonTitle: "Colors, Units & Fonts",
          order: 4,
          estimatedTime: 75,
          explanation: `CSS provides multiple ways to define colors and units, plus rich typography control through font properties.

**Color Formats:**
- **HEX**: #ff0000 (red)
- **RGB**: rgb(255, 0, 0)
- **RGBA**: rgba(255, 0, 0, 0.5) with transparency
- **HSL**: hsl(0, 100%, 50%) - Hue, Saturation, Lightness

**Units:**
- **Absolute**: px (pixels)
- **Relative**: %, em, rem, vw, vh
- **rem**: Relative to root font size (recommended for responsive design)

**Fonts:**
- font-family, font-size, font-weight, font-style
- Import custom fonts from Google Fonts or use web-safe fonts`,
          codeExamples: [
            `/* Color Examples */
h1 {
  color: #3498db;           /* HEX */
  background: rgb(52, 152, 219);  /* RGB */
  border-color: rgba(52, 152, 219, 0.5);  /* RGBA with opacity */
}`,
            `/* HSL Colors */
body {
  color: hsl(210, 20%, 20%);      /* Dark gray-blue */
  background: hsl(210, 50%, 95%);  /* Light blue-gray */
}`,
            `/* Units */
.container {
  width: 80%;           /* Percentage of parent */
  max-width: 1200px;    /* Absolute pixels */
  padding: 2rem;        /* Relative to root font size */
  margin: 5vh 10vw;     /* Viewport units */
}`,
            `/* Typography */
body {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 400;
  line-height: 1.6;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}`,
            `/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

body {
  font-family: 'Poppins', sans-serif;
}`
          ],
          practicalTasks: [
            {
              task: "Create a color theme using HSL values for your website",
              expectedOutput: "A consistent color scheme with at least 3 colors defined using HSL (e.g., primary, secondary, background colors)",
              xpReward: 40
            },
            {
              task: "Import a Google Font and apply it to your headings and body text",
              expectedOutput: "Custom font from Google Fonts visible on your page with @import statement in CSS and font-family declarations",
              xpReward: 30
            },
            {
              task: "Use rem units for all font sizes and spacing to create responsive typography",
              expectedOutput: "All font-size and spacing values use rem units instead of px, allowing text to scale properly",
              xpReward: 30
            }
          ],
          bonusTips: "HSL is often easier for creating color variations (lighter/darker). Use rem for font sizes to respect user accessibility preferences. Always include fallback fonts.",
          resources: [
            "Google Fonts - https://fonts.google.com/",
            "MDN: CSS Colors - https://developer.mozilla.org/en-US/docs/Web/CSS/color",
            "Color Picker Tool - https://coolors.co/"
          ]
        },
        {
          lessonTitle: "The Box Model",
          order: 5,
          estimatedTime: 90,
          explanation: `Every HTML element is a rectangular box composed of content, padding, border, and margin. Understanding the box model is fundamental to CSS layout.

**Box Model Components (inside to outside):**
1. **Content**: The actual content (text, images)
2. **Padding**: Space between content and border (inside)
3. **Border**: Outline around the padding
4. **Margin**: Space outside the border (creates gap between elements)

**Box Sizing:**
- box-sizing: content-box (default) - width only applies to content
- box-sizing: border-box (recommended) - width includes padding and border`,
          codeExamples: [
            `/* Basic Box Model */
.card {
  width: 300px;
  padding: 20px;        /* Inside space */
  border: 2px solid #ccc;
  margin: 10px;         /* Outside space */
}`,
            `/* Box Model Shorthand */
.box {
  /* All sides */
  padding: 20px;
  
  /* Vertical | Horizontal */
  margin: 10px 20px;
  
  /* Top | Right | Bottom | Left */
  padding: 10px 15px 20px 15px;
}`,
            `/* Border-box (Recommended) */
* {
  box-sizing: border-box;
}

.container {
  width: 100%;
  padding: 20px;  /* Padding included in 100% width */
}`,
            `/* Visual Box Model Example */
.demo-box {
  /* Content area */
  width: 200px;
  height: 100px;
  background: lightblue;
  
  /* Padding (inside, expands the box) */
  padding: 20px;
  
  /* Border */
  border: 5px solid navy;
  
  /* Margin (outside, creates space) */
  margin: 30px;
}`
          ],
          practicalTasks: [
            {
              task: "Build a 'Card' component demonstrating all four box model layers with different colors",
              expectedOutput: "A visible card element showing content (blue), padding (green), border (red), and margin (yellow/visible space) with background colors or dev tools highlighting",
              xpReward: 50
            },
            {
              task: "Apply box-sizing: border-box to all elements and observe the difference",
              expectedOutput: "CSS contains * { box-sizing: border-box; } and elements with padding/border maintain their specified width",
              xpReward: 20
            },
            {
              task: "Create a layout with proper spacing using padding and margin",
              expectedOutput: "A multi-element layout with consistent spacing between elements (margin) and space inside elements (padding)",
              xpReward: 30
            }
          ],
          bonusTips: "Use margin for spacing between elements, padding for spacing inside elements. Set box-sizing: border-box on all elements for easier layout calculations.",
          resources: [
            "MDN: Box Model - https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model",
            "CSS Box Model Interactive - https://www.w3schools.com/css/css_boxmodel.asp"
          ]
        },
        {
          lessonTitle: "Backgrounds & Borders",
          order: 6,
          estimatedTime: 75,
          explanation: `CSS provides rich styling options for backgrounds and borders including colors, images, gradients, shadows, and rounded corners.

**Background Properties:**
- background-color: Solid color
- background-image: Image or gradient
- background-size: cover, contain, or custom
- background-position: Position of image
- background-repeat: Repeat pattern

**Border Properties:**
- border-width, border-style, border-color
- border-radius: Rounded corners
- box-shadow: Drop shadows`,
          codeExamples: [
            `/* Background Color & Image */
.hero {
  background-color: #3498db;
  background-image: url('hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}`,
            `/* Linear Gradient */
.gradient-bg {
  background: linear-gradient(45deg, #ff6b6b, #f8e71c);
}

/* Radial Gradient */
.radial-bg {
  background: radial-gradient(circle, #667eea 0%, #764ba2 100%);
}`,
            `/* Multiple Backgrounds */
.layered {
  background: 
    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
    url('image.jpg');
  background-size: cover;
}`,
            `/* Borders */
.card {
  border: 2px solid #ddd;
  border-radius: 10px;
}

/* Individual Sides */
.custom-border {
  border-top: 3px solid blue;
  border-bottom: 3px solid red;
  border-left: none;
  border-right: none;
}`,
            `/* Box Shadow */
.elevated {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Multiple Shadows */
.fancy-shadow {
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.1),
    0 8px 16px rgba(0,0,0,0.1);
}`
          ],
          practicalTasks: [
            {
              task: "Design a gradient banner with rounded corners and a shadowed border",
              expectedOutput: "A banner element with linear-gradient background, border-radius applied, and visible box-shadow",
              xpReward: 50
            },
            {
              task: "Create a card with a background image overlaid with a semi-transparent gradient",
              expectedOutput: "An element displaying both a background image and a gradient overlay using multiple backgrounds",
              xpReward: 40
            },
            {
              task: "Build a button with hover effect using box-shadow",
              expectedOutput: "A button that gains a visible shadow effect when hovered, creating a 'lifted' appearance",
              xpReward: 30
            }
          ],
          bonusTips: "Use linear-gradient overlays to make text readable on background images. Subtle box-shadows (low opacity) create depth without being distracting.",
          resources: [
            "MDN: Backgrounds - https://developer.mozilla.org/en-US/docs/Web/CSS/background",
            "CSS Gradient Generator - https://cssgradient.io/",
            "Box Shadow Generator - https://box-shadow.dev/"
          ]
        },
        {
          lessonTitle: "Display & Visibility",
          order: 7,
          estimatedTime: 60,
          explanation: `The display property controls how elements are rendered and how they interact with other elements. Understanding display is crucial for layout control.

**Display Values:**
- **block**: Takes full width, starts on new line (div, p, h1)
- **inline**: Takes only needed width, stays in line (span, a, strong)
- **inline-block**: Inline but can have width/height (button, img)
- **none**: Removes element from layout
- **flex/grid**: Modern layout systems

**Visibility:**
- visibility: hidden - Hides element but keeps its space
- display: none - Removes element completely`,
          codeExamples: [
            `/* Block Elements */
div {
  display: block;
  width: 100%;
  margin-bottom: 10px;
}`,
            `/* Inline Elements */
span {
  display: inline;
  background: yellow;  /* Only wraps around content */
}`,
            `/* Inline-Block (Best for horizontal layouts) */
nav a {
  display: inline-block;
  padding: 10px 20px;
  margin: 0 10px;
  background: #333;
  color: white;
}`,
            `/* Display None vs Visibility Hidden */
.hidden-completely {
  display: none;  /* Removed from layout */
}

.hidden-but-takes-space {
  visibility: hidden;  /* Invisible but space remains */
}`,
            `/* Converting List to Horizontal Menu */
ul {
  list-style: none;
  padding: 0;
}

li {
  display: inline-block;
  margin-right: 20px;
}`
          ],
          practicalTasks: [
            {
              task: "Convert a vertical list into a horizontal navbar using display: inline-block",
              expectedOutput: "A <ul> list with items appearing horizontally in a row instead of vertically, styled like a navigation menu",
              xpReward: 40
            },
            {
              task: "Create a 'Show More' button that toggles display: none on hidden content",
              expectedOutput: "Hidden content that appears/disappears when a button is clicked using JavaScript and display: none",
              xpReward: 30
            },
            {
              task: "Build a button group with inline-block elements and proper spacing",
              expectedOutput: "Multiple buttons appearing side-by-side with consistent spacing between them using display: inline-block",
              xpReward: 30
            }
          ],
          bonusTips: "Use inline-block for horizontal layouts when you need width/height control. Use display: none for hiding elements you want to toggle with JavaScript.",
          resources: [
            "MDN: Display Property - https://developer.mozilla.org/en-US/docs/Web/CSS/display",
            "CSS Display Values - https://www.w3schools.com/cssref/pr_class_display.asp"
          ]
        }
      ]
    }
    
    console.log('📚 Creating CSS Part 1 curriculum...')
    const curriculum = await Curriculum.create(cssPart1Curriculum)
    
    console.log('✅ Successfully created:', curriculum.topic)
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

seedCSSPart1()
