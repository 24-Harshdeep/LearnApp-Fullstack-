import mongoose from 'mongoose';
import Curriculum from './models/Curriculum.js';

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/adaptive-learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const cssPart2Curriculum = {
  topic: 'CSS Part 2',
  description: 'Master advanced CSS techniques including positioning, Flexbox, Grid, animations, responsive design, and CSS variables for modern web development.',
  difficulty: 'intermediate',
  estimatedHours: 15,
  icon: '🎨',
  tags: ['CSS', 'Flexbox', 'Grid', 'Animations', 'Responsive Design', 'CSS Variables'],
  prerequisites: ['CSS Part 1'],
  subtopics: [
    {
      lessonTitle: 'Module 8: CSS Positioning',
      explanation: `**Understanding CSS Position**

The position property is fundamental to controlling element placement in your layouts. Understanding positioning is crucial for creating complex layouts and UI components.

**Position Values:**
- static - Default flow (no positioning)
- relative - Positioned relative to normal position
- absolute - Positioned relative to nearest positioned ancestor
- fixed - Positioned relative to viewport (stays on scroll)
- sticky - Hybrid of relative and fixed

**Common Use Cases:**
- Sticky headers that remain visible
- Overlays and modals
- Tooltips and dropdowns
- Fixed navigation bars
- Absolute positioning for icons`,
      codeExamples: [
        `.header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}`,
        `.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}`,
        `.tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: black;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
}`
      ],
      practicalTasks: [
        {
          task: 'Create a sticky header that remains visible when scrolling down the page. The header should have a white background and a subtle shadow.',
          expectedOutput: 'A header element with position: sticky, top: 0, and appropriate styling that stays at the top when scrolling',
          hints: [
            'Use position: sticky with top: 0',
            'Add z-index to ensure it stays above other content',
            'Include box-shadow for visual depth'
          ],
          xpReward: 50
        },
        {
          task: 'Build a modal overlay with a centered modal box. The overlay should cover the entire viewport with a semi-transparent background.',
          expectedOutput: 'Fixed position overlay covering the screen with an absolutely positioned modal box centered in the middle',
          hints: [
            'Use position: fixed for the overlay',
            'Center the modal using position: absolute and transform',
            'Set appropriate z-index values'
          ],
          xpReward: 60
        }
      ],
      bonusTips: 'Always use z-index with positioned elements to control stacking order. Remember that position: absolute is relative to the nearest positioned ancestor (not static).',
      resources: [
        'MDN: CSS Position - https://developer.mozilla.org/en-US/docs/Web/CSS/position',
        'CSS Tricks: Position - https://css-tricks.com/almanac/properties/p/position/'
      ],
      order: 8,
      estimatedTime: 90
    },
    {
      lessonTitle: 'Module 9: Flexbox Layout',
      explanation: `**Mastering Flexbox**

Flexbox is a powerful one-dimensional layout system that simplifies alignment, distribution, and ordering of elements along a row or column.

**Key Flexbox Concepts:**
- display: flex - Activates flexbox on container
- justify-content - Aligns items along main axis
- align-items - Aligns items along cross axis
- flex-direction - Sets main axis direction
- flex-wrap - Controls wrapping behavior
- gap - Spacing between flex items

**Common Flexbox Patterns:**
- Navigation bars with even spacing
- Card layouts with equal heights
- Centered content (horizontal and vertical)
- Responsive button groups
- Header with logo and menu`,
      codeExamples: [
        `.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}`,
        `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}`,
        `.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.card {
  flex: 1 1 300px;
  min-width: 0;
}`,
        `.center-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}`
      ],
      practicalTasks: [
        {
          task: 'Design a responsive navigation bar using Flexbox. Include a logo on the left and menu items with even spacing on the right.',
          expectedOutput: 'A flex container with space-between justification, logo aligned left, menu items aligned right with gap spacing',
          hints: [
            'Use display: flex on the navbar container',
            'Apply justify-content: space-between',
            'Use gap for spacing between menu items',
            'Consider flex-wrap for mobile responsiveness'
          ],
          xpReward: 55
        },
        {
          task: 'Create a card layout where all cards have equal height regardless of content length, with 3 cards per row that wrap on smaller screens.',
          expectedOutput: 'Flex container with flex-wrap, cards using flex: 1 1 300px for responsive behavior and equal heights',
          hints: [
            'Use flex-wrap: wrap on the container',
            'Set flex: 1 1 300px on cards for responsiveness',
            'Use gap for spacing instead of margins',
            'Cards will naturally have equal heights in flexbox'
          ],
          xpReward: 60
        }
      ],
      bonusTips: 'Use gap instead of margins for spacing flex items — it\'s cleaner and more maintainable. Remember flex-basis sets the initial size before growing/shrinking.',
      resources: [
        'MDN: Flexbox - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout',
        'CSS Tricks: Complete Guide to Flexbox - https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
        'Flexbox Froggy Game - https://flexboxfroggy.com/'
      ],
      order: 9,
      estimatedTime: 120
    },
    {
      lessonTitle: 'Module 10: CSS Grid Layout',
      explanation: `**Mastering CSS Grid**

CSS Grid is the most powerful two-dimensional layout system in CSS. It allows you to create complex layouts with precise control over rows, columns, and positioning.

**Core Grid Concepts:**
- display: grid - Activates grid on container
- grid-template-columns - Defines column structure
- grid-template-rows - Defines row structure
- gap - Spacing between grid items
- grid-column / grid-row - Item placement
- fr unit - Fractional unit for flexible sizing

**Grid Layout Patterns:**
- Multi-column galleries
- Dashboard layouts
- Magazine-style layouts
- Card grids with varied sizes
- Complex page structures`,
      codeExamples: [
        `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}`,
        `.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 40px;
  gap: 1rem;
  min-height: 100vh;
}

.sidebar { grid-column: 1; grid-row: 1 / -1; }
.header { grid-column: 2; grid-row: 1; }
.main { grid-column: 2; grid-row: 2; }
.footer { grid-column: 2; grid-row: 3; }`,
        `.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}`,
        `.featured-layout {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.featured-item:first-child {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}`
      ],
      practicalTasks: [
        {
          task: 'Build a 3-column product gallery with equal spacing and equal-width columns that maintains aspect ratio.',
          expectedOutput: 'Grid container with grid-template-columns: repeat(3, 1fr) and consistent gap spacing',
          hints: [
            'Use repeat(3, 1fr) for three equal columns',
            'Apply gap for consistent spacing',
            'Consider adding aspect-ratio or padding-bottom trick for images',
            'Use object-fit: cover for images'
          ],
          xpReward: 55
        },
        {
          task: 'Create a responsive dashboard layout with a sidebar, header, main content area, and footer using CSS Grid.',
          expectedOutput: 'Grid layout with defined template areas, sidebar spanning full height, header and footer spanning content width',
          hints: [
            'Use grid-template-columns for sidebar and content areas',
            'Use grid-template-rows for header, main, footer',
            'Apply grid-column and grid-row for placement',
            'Consider using grid-template-areas for clarity'
          ],
          xpReward: 70
        }
      ],
      bonusTips: 'Use repeat(auto-fit, minmax(250px, 1fr)) for automatically responsive grids without media queries. The fr unit is more flexible than percentages for grid layouts.',
      resources: [
        'MDN: CSS Grid - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout',
        'CSS Tricks: Complete Guide to Grid - https://css-tricks.com/snippets/css/complete-guide-grid/',
        'Grid Garden Game - https://cssgridgarden.com/'
      ],
      order: 10,
      estimatedTime: 120
    },
    {
      lessonTitle: 'Module 11: CSS Transitions & Animations',
      explanation: `**Bringing Your UI to Life**

CSS transitions and animations add polish and interactivity to your designs. Transitions smooth property changes, while keyframe animations create complex multi-step effects.

**Transitions:**
- transition-property - What to animate
- transition-duration - How long it takes
- transition-timing-function - Animation curve
- transition-delay - When to start

**Animations:**
- @keyframes - Define animation steps
- animation-name - Reference keyframe
- animation-duration - Length of animation
- animation-timing-function - Easing curve
- animation-iteration-count - How many times to run`,
      codeExamples: [
        `button {
  background: #2196f3;
  transition: all 0.3s ease;
}

button:hover {
  background: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}`,
        `@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.box {
  animation: fadeIn 1s ease-in;
}`,
        `@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}`,
        `.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}`
      ],
      practicalTasks: [
        {
          task: 'Create a button with a smooth hover effect that changes background color, slightly lifts up (translateY), and adds a shadow.',
          expectedOutput: 'Button with transition property, hover state with background change, transform: translateY(-2px), and box-shadow',
          hints: [
            'Use transition: all 0.3s ease on the button',
            'Apply transform: translateY(-2px) on hover',
            'Add box-shadow for depth effect',
            'Use ease or ease-out for smooth motion'
          ],
          xpReward: 50
        },
        {
          task: 'Animate a box to fade in and slide up when the page loads using @keyframes. The animation should last 1 second.',
          expectedOutput: 'Keyframe animation with opacity 0 to 1 and translateY(20px) to 0, applied to element with 1s duration',
          hints: [
            'Define @keyframes with from and to states',
            'Animate both opacity and transform',
            'Apply animation with animation-name and animation-duration',
            'Consider using ease-out for natural motion'
          ],
          xpReward: 55
        },
        {
          task: 'Build a loading spinner using a rotating circular border. The animation should loop infinitely and rotate smoothly.',
          expectedOutput: 'Circular element with border styling, rotating 360 degrees using keyframes with infinite iteration',
          hints: [
            'Create a circular div with border-radius: 50%',
            'Use partial border colors for spinner effect',
            'Rotate from 0deg to 360deg in keyframes',
            'Set animation-iteration-count: infinite',
            'Use linear timing for constant speed'
          ],
          xpReward: 60
        }
      ],
      bonusTips: 'Use will-change: transform for better animation performance. Avoid animating properties like width/height — use transform: scale() instead for better performance.',
      resources: [
        'MDN: CSS Transitions - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions',
        'MDN: CSS Animations - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations',
        'CSS Tricks: Animation - https://css-tricks.com/almanac/properties/a/animation/'
      ],
      order: 11,
      estimatedTime: 100
    },
    {
      lessonTitle: 'Module 12: Responsive Design',
      explanation: `**Creating Adaptive Layouts**

Responsive design ensures your website looks great and functions well on all devices — from mobile phones to large desktop monitors. Media queries and fluid layouts are the foundation.

**Responsive Design Principles:**
- Mobile-first approach - Start with mobile, enhance for larger screens
- Fluid layouts - Use percentages and flexible units
- Media queries - Apply styles based on screen size
- Flexible images - Scale images appropriately
- Viewport meta tag - Control mobile rendering

**Common Breakpoints:**
- Mobile: up to 767px
- Tablet: 768px to 1023px
- Desktop: 1024px and above
- Large desktop: 1440px and above`,
      codeExamples: [
        `/* Mobile-first approach */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 720px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}`,
        `@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .navbar {
    flex-direction: column;
  }
  
  .hide-mobile {
    display: none;
  }
}`,
        `/* Responsive images */
img {
  max-width: 100%;
  height: auto;
}

/* Responsive typography */
html {
  font-size: 16px;
}

@media (min-width: 768px) {
  html {
    font-size: 18px;
  }
}`,
        `/* Container queries (modern approach) */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}`
      ],
      practicalTasks: [
        {
          task: 'Make your website responsive for mobile and tablet viewports. Convert a 3-column grid to 1 column on mobile and 2 columns on tablet.',
          expectedOutput: 'Media queries adjusting grid-template-columns: 1fr for mobile, 2fr for tablet (768px), and 3fr for desktop (1024px)',
          hints: [
            'Start with mobile styles (1 column)',
            'Add media query at 768px for 2 columns',
            'Add media query at 1024px for 3 columns',
            'Use min-width for mobile-first approach',
            'Test at common breakpoints'
          ],
          xpReward: 60
        },
        {
          task: 'Create a responsive navigation that displays horizontally on desktop but stacks vertically on mobile devices.',
          expectedOutput: 'Flexbox navigation with flex-direction: column on mobile, switching to row on desktop with media query',
          hints: [
            'Use flexbox for the navigation',
            'Set flex-direction: column by default (mobile)',
            'Use media query to change to flex-direction: row',
            'Adjust gap/spacing for different layouts',
            'Consider hiding/showing burger menu icon'
          ],
          xpReward: 65
        }
      ],
      bonusTips: 'Always include the viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">. Test on real devices, not just browser dev tools.',
      resources: [
        'MDN: Media Queries - https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries',
        'MDN: Responsive Design - https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design',
        'Web.dev: Responsive Design - https://web.dev/responsive-web-design-basics/'
      ],
      order: 12,
      estimatedTime: 110
    },
    {
      lessonTitle: 'Module 13: CSS Variables & Best Practices',
      explanation: `**Writing Maintainable CSS**

CSS variables (custom properties) allow you to store and reuse values throughout your stylesheet. Combined with best practices, they create maintainable, scalable CSS codebases.

**CSS Variables Benefits:**
- Consistent theming across your site
- Easy light/dark mode implementation
- Centralized design tokens
- Dynamic value updates with JavaScript
- Reduced repetition in code

**Best Practices:**
- Use meaningful naming conventions
- Follow DRY (Don't Repeat Yourself)
- Organize with comments and sections
- Use BEM or similar methodology
- Keep specificity low
- Mobile-first approach
- Modular structure`,
      codeExamples: [
        `:root {
  /* Colors */
  --primary: #007bff;
  --primary-dark: #0056b3;
  --secondary: #6c757d;
  --success: #28a745;
  --danger: #dc3545;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  
  /* Typography */
  --font-body: 'Inter', sans-serif;
  --font-heading: 'Poppins', sans-serif;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
}

button {
  background: var(--primary);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-body);
}

button:hover {
  background: var(--primary-dark);
}`,
        `/* Light and Dark theme */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
}

[data-theme="dark"] {
  --bg-primary: #212529;
  --bg-secondary: #343a40;
  --text-primary: #f8f9fa;
  --text-secondary: #adb5bd;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
}`,
        `/* BEM Methodology Example */
.card { /* Block */
  padding: var(--space-md);
  border-radius: 8px;
}

.card__header { /* Element */
  font-weight: bold;
  margin-bottom: var(--space-sm);
}

.card__body { /* Element */
  line-height: 1.6;
}

.card--featured { /* Modifier */
  border: 2px solid var(--primary);
  background: var(--bg-secondary);
}`,
        `/* Responsive spacing with variables */
:root {
  --container-padding: 1rem;
}

@media (min-width: 768px) {
  :root {
    --container-padding: 2rem;
  }
}

@media (min-width: 1024px) {
  :root {
    --container-padding: 3rem;
  }
}

.container {
  padding: var(--container-padding);
}`
      ],
      practicalTasks: [
        {
          task: 'Create a light/dark theme system using CSS variables. Define colors for both themes and implement a toggle mechanism.',
          expectedOutput: ':root with light theme variables, [data-theme="dark"] with dark theme variables, elements using var() to reference them',
          hints: [
            'Define color variables in :root for light theme',
            'Create [data-theme="dark"] selector with dark colors',
            'Use var(--variable-name) throughout your CSS',
            'Apply data-theme attribute to body element',
            'Include background, text, and accent colors'
          ],
          xpReward: 70
        },
        {
          task: 'Refactor a CSS file to use CSS variables for colors, spacing, and typography. Follow naming conventions like --color-primary, --space-md.',
          expectedOutput: 'Organized :root section with categorized variables (colors, spacing, typography) and refactored CSS using var() references',
          hints: [
            'Group variables by category (colors, spacing, typography)',
            'Use consistent naming: --category-name-variant',
            'Replace hardcoded values with var() references',
            'Add comments to organize variable sections',
            'Consider creating size scales (xs, sm, md, lg, xl)'
          ],
          xpReward: 65
        }
      ],
      bonusTips: 'CSS variables are inherited, so define globals in :root and component-specific ones on the component. You can also update CSS variables with JavaScript for dynamic themes!',
      resources: [
        'MDN: CSS Variables - https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties',
        'CSS Tricks: Custom Properties - https://css-tricks.com/a-complete-guide-to-custom-properties/',
        'Web.dev: CSS Best Practices - https://web.dev/learn/css/'
      ],
      order: 13,
      estimatedTime: 100
    }
  ]
};

// Calculate total XP
cssPart2Curriculum.totalXP = cssPart2Curriculum.subtopics.reduce((total, subtopic) => {
  const subtopicXP = subtopic.practicalTasks.reduce((sum, task) => sum + task.xpReward, 0);
  return total + subtopicXP;
}, 0);

async function seedCSSPart2() {
  try {
    // Remove existing CSS Part 2 if it exists
    await Curriculum.deleteOne({ topic: 'CSS Part 2' });
    console.log('🗑️  Removed existing CSS Part 2 curriculum');

    // Insert new curriculum
    const newCurriculum = await Curriculum.create(cssPart2Curriculum);
    
    console.log('✅ Successfully created: CSS Part 2');
    console.log(`📊 Modules: ${newCurriculum.subtopics.length}`);
    console.log(`⏱️  Estimated hours: ${newCurriculum.estimatedHours}`);
    console.log(`⭐ Total XP Available: ${newCurriculum.totalXP}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding CSS Part 2:', error);
    process.exit(1);
  }
}

seedCSSPart2();
