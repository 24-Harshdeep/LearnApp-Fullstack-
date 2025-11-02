import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import Curriculum from './models/Curriculum.js'

dotenv.config()

const seedHTMLPart2 = async () => {
  try {
    await connectDB()
    
    console.log('🗑️  Removing existing HTML Part 2 curriculum...')
    await Curriculum.deleteOne({ topic: "HTML Fundamentals - Part 2" })
    
    const htmlPart2Curriculum = {
      topic: "HTML Fundamentals - Part 2",
      description: "Master semantic HTML, multimedia elements, and embedded content. Learn to build accessible, SEO-friendly layouts with audio, video, iframes, and advanced semantic tags.",
      difficulty: "beginner",
      estimatedHours: 10,
      icon: "🎬",
      tags: ["HTML", "Semantic HTML", "Multimedia", "Accessibility", "SEO"],
      prerequisites: ["HTML Fundamentals - Part 1"],
      subtopics: [
        {
          lessonTitle: "Module 7: Semantic Structure",
          order: 1,
          estimatedTime: 45,
          explanation: `Semantic HTML tags give meaning to your layout instead of relying on generic <div> blocks. They improve SEO, accessibility, and code readability by clearly defining each section's purpose.

**Why Semantic HTML Matters:**
- **SEO**: Search engines understand page structure better
- **Accessibility**: Screen readers navigate more effectively
- **Maintainability**: Code is self-documenting
- **Future-proof**: Standards-compliant and forward-compatible

**Core Semantic Tags:**
- <header> - Page or section header (logo, navigation)
- <nav> - Navigation links
- <main> - Primary content (unique to the page)
- <article> - Self-contained content
- <section> - Thematic grouping of content
- <aside> - Sidebar or tangential content
- <footer> - Footer information

**Best Practices:**
- Use <main> only once per page
- <article> should make sense on its own
- <section> for thematic grouping within articles
- Avoid <div> for structural purposes`,
          codeExamples: [
            `<header>
  <h1>TaskRelay Dashboard</h1>
  <nav>
    <a href="#home">Home</a>
    <a href="#reports">Reports</a>
  </nav>
</header>

<main>
  <article>
    <h2>Productivity Insights</h2>
    <p>Analyze your team's efficiency in real time.</p>
    
    <section>
      <h3>This Week</h3>
      <p>12 tasks completed, 8 in progress</p>
    </section>
    
    <section>
      <h3>Top Performers</h3>
      <p>Alice, Bob, and Carol leading the board!</p>
    </section>
  </article>
  
  <aside>
    <h3>Quick Tips</h3>
    <p>Use keyboard shortcuts to boost productivity</p>
  </aside>
</main>

<footer>
  <p>&copy; 2025 TaskRelay. All rights reserved.</p>
</footer>`
          ],
          practicalTasks: [
            {
              task: "Rebuild your homepage using only semantic HTML tags - replace all structural <div> elements with appropriate semantic tags like <header>, <main>, <article>, <section>, <aside>, and <footer>",
              expectedOutput: "A complete page structure using semantic HTML with no <div> tags for layout structure",
              hints: [
                "Start with <header> for your top section",
                "Wrap main content in <main> tag",
                "Use <article> for blog posts or independent content",
                "Use <section> to group related content within articles",
                "Add <nav> for navigation menus",
                "End with <footer> for bottom information"
              ],
              xpReward: 40
            }
          ],
          bonusTips: "Semantic HTML isn't just for large layouts! Even a simple contact form benefits from semantic structure. Use <fieldset> for form sections and <legend> for their labels.",
          resources: [
            "MDN: Semantic Elements - https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html",
            "HTML5 Doctor: Semantic Elements - http://html5doctor.com/lets-talk-about-semantics/"
          ]
        },
        {
          lessonTitle: "Module 8: Grouping & Content Hierarchy",
          order: 2,
          estimatedTime: 40,
          explanation: `Understanding when to use <section>, <article>, and <aside> is crucial for proper document structure and hierarchy.

**<section> vs <article>:**
- **<section>** - Thematic grouping of content, usually with a heading
- **<article>** - Independent, self-contained content that could stand alone
- Rule of thumb: Could this content be syndicated? Use <article>. Is it just grouping related info? Use <section>.

**<aside> Element:**
- Tangentially related content
- Sidebars, callouts, quotes
- Related links, ads, author bios
- Should enhance but not be critical to main content

**Nesting Rules:**
- <article> can contain <section> elements
- <section> can contain <article> elements
- Both can have their own headers and footers
- Proper nesting improves accessibility

**When to Use What:**
- Blog post → <article>
- Chapter in article → <section>
- Pull quote → <aside>
- Product listing → <article>
- Related products → <aside>`,
          codeExamples: [
            `<!-- Blog Post Structure -->
<article>
  <header>
    <h2>Weekly Dev Report</h2>
    <p>Published: <time datetime="2025-01-15">Jan 15, 2025</time></p>
  </header>
  
  <section>
    <h3>Frontend Updates</h3>
    <p>This week, the dev team completed 12 tasks.</p>
  </section>
  
  <section>
    <h3>Backend Progress</h3>
    <p>API endpoints optimized, reducing load time by 30%.</p>
  </section>
  
  <footer>
    <p>Written by: Dev Team</p>
  </footer>
</article>

<!-- Sidebar Content -->
<aside>
  <h3>Pro Tip</h3>
  <p>Track daily progress using the TaskTimer widget for better insights.</p>
</aside>

<!-- News Feed with Multiple Articles -->
<section>
  <h2>Latest News</h2>
  
  <article>
    <h3>Company Milestone</h3>
    <p>Reached 1 million users!</p>
  </article>
  
  <article>
    <h3>New Feature Launch</h3>
    <p>Dark mode now available</p>
  </article>
</section>`
          ],
          practicalTasks: [
            {
              task: "Design a news layout page with at least 3 <article> elements (each with a heading and content) and one <aside> element for related updates or tips",
              expectedOutput: "A news page with proper hierarchy showing multiple articles and a sidebar with supplementary content",
              hints: [
                "Wrap all articles in a <section> with heading 'Latest News'",
                "Each article should have its own <h3> heading",
                "The <aside> should be separate from articles",
                "Consider adding <time> elements for publish dates",
                "Each article could have multiple <section>s within it"
              ],
              xpReward: 35
            }
          ],
          bonusTips: "Use the HTML5 Outliner browser extension to visualize your document structure. It shows exactly how browsers and screen readers interpret your semantic hierarchy!",
          resources: [
            "MDN: HTML Sections - https://developer.mozilla.org/en-US/docs/Web/HTML/Element#content_sectioning",
            "HTML5 Outliner: https://chrome.google.com/webstore/detail/html5-outliner"
          ]
        },
        {
          lessonTitle: "Module 9: Multimedia with <audio>",
          order: 3,
          estimatedTime: 35,
          explanation: `The <audio> element embeds sound content directly into web pages without requiring third-party plugins.

**Audio Element Basics:**
- <audio> is a container for audio sources
- Multiple <source> elements for format compatibility
- Browsers play the first supported format
- Always provide fallback text

**Key Attributes:**
- **controls** - Shows play/pause/volume controls
- **autoplay** - Starts automatically (use sparingly!)
- **loop** - Repeats indefinitely
- **muted** - Starts muted (required for autoplay in many browsers)
- **preload** - "none", "metadata", or "auto"

**Accessibility:**
- Provide transcripts for important audio
- Don't autoplay with sound (accessibility issue)
- Give users control over playback
- Consider <track> for captions/subtitles

**Audio Format Support:**
- MP3 - Universal support
- WAV - Uncompressed, large files
- OGG - Open format, good compression
- Provide multiple formats for compatibility`,
          codeExamples: [
            `<!-- Basic Audio Player -->
<audio controls>
  <source src="notification.mp3" type="audio/mpeg">
  <source src="notification.ogg" type="audio/ogg">
  Your browser does not support the audio element.
</audio>

<!-- Background Music (Muted Autoplay) -->
<audio autoplay loop muted id="bgMusic">
  <source src="ambient.mp3" type="audio/mpeg">
</audio>
<button onclick="toggleMusic()">Toggle Music</button>

<script>
function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  if (audio.muted) {
    audio.muted = false;
  } else {
    audio.muted = true;
  }
}
</script>

<!-- Audio with Preload Control -->
<audio controls preload="metadata">
  <source src="podcast-episode-1.mp3" type="audio/mpeg">
  <p>Your browser doesn't support HTML5 audio. 
     <a href="podcast-episode-1.mp3">Download the audio</a> instead.</p>
</audio>

<!-- Notification Sound (Hidden) -->
<audio id="taskComplete">
  <source src="success.mp3" type="audio/mpeg">
</audio>
<button onclick="document.getElementById('taskComplete').play()">
  Complete Task
</button>`
          ],
          practicalTasks: [
            {
              task: "Add a notification sound that plays when users visit your 'Task Completed' page. Include controls attribute and provide multiple audio formats for compatibility.",
              expectedOutput: "An audio element with controls, multiple source formats (mp3, ogg), and fallback text",
              hints: [
                "Use <audio controls> to show playback controls",
                "Add multiple <source> tags for different formats",
                "Provide descriptive fallback text",
                "Consider adding preload='metadata' to load faster",
                "You can trigger playback with JavaScript: audio.play()"
              ],
              xpReward: 30
            }
          ],
          bonusTips: "Modern browsers block autoplay audio with sound to improve user experience. If you need autoplay, start with muted=true and let users unmute. Always respect user preferences!",
          resources: [
            "MDN: Audio Element - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio",
            "Can I Use Audio - https://caniuse.com/audio"
          ]
        },
        {
          lessonTitle: "Module 10: Video Embedding",
          order: 4,
          estimatedTime: 45,
          explanation: `The <video> element brings native video playback to the web without plugins, supporting multiple formats and advanced features.

**Video Element Basics:**
- Container for video sources
- Multiple formats for browser compatibility
- Built-in controls or custom JavaScript controls
- Responsive by default with CSS

**Essential Attributes:**
- **controls** - Shows play/pause/fullscreen controls
- **poster** - Thumbnail image before playback
- **width/height** - Dimensions (maintain aspect ratio)
- **autoplay** - Auto-start (must be muted)
- **loop** - Continuous playback
- **muted** - Start without sound
- **preload** - Loading strategy

**Accessibility Features:**
- <track> for captions/subtitles
- kind="captions" for hearing-impaired
- kind="subtitles" for translations
- kind="descriptions" for visually-impaired

**Format Recommendations:**
- **MP4 (H.264)** - Universal support
- **WebM** - Modern, open format
- **OGG** - Fallback for older browsers
- Provide multiple for compatibility`,
          codeExamples: [
            `<!-- Basic Video Player -->
<video width="640" height="360" controls poster="thumbnail.jpg">
  <source src="intro.mp4" type="video/mp4">
  <source src="intro.webm" type="video/webm">
  <p>Your browser doesn't support HTML5 video. 
     <a href="intro.mp4">Download the video</a> instead.</p>
</video>

<!-- Video with Subtitles -->
<video controls width="500">
  <source src="tutorial.mp4" type="video/mp4">
  <track kind="subtitles" src="subtitles-en.vtt" srclang="en" label="English" default>
  <track kind="subtitles" src="subtitles-es.vtt" srclang="es" label="Spanish">
</video>

<!-- Autoplay Background Video (Muted) -->
<video autoplay loop muted playsinline poster="hero.jpg" class="hero-video">
  <source src="background.mp4" type="video/mp4">
  <source src="background.webm" type="video/webm">
</video>

<!-- Responsive Video -->
<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <video controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
    <source src="responsive-demo.mp4" type="video/mp4">
  </video>
</div>

<!-- Video with JavaScript Controls -->
<video id="myVideo" width="600">
  <source src="lesson.mp4" type="video/mp4">
</video>
<div>
  <button onclick="document.getElementById('myVideo').play()">Play</button>
  <button onclick="document.getElementById('myVideo').pause()">Pause</button>
  <button onclick="document.getElementById('myVideo').currentTime = 0">Restart</button>
</div>`
          ],
          practicalTasks: [
            {
              task: "Embed a tutorial video on your dashboard's 'Onboarding' page with controls, a poster image, proper dimensions (width=500), and multiple source formats for compatibility",
              expectedOutput: "A video element with controls, poster attribute, width/height, multiple sources, and fallback text",
              hints: [
                "Set width and height to maintain aspect ratio",
                "Use poster attribute to show thumbnail",
                "Include both MP4 and WebM formats",
                "Add descriptive fallback text and download link",
                "Consider preload='metadata' for faster loading",
                "Test that controls are fully functional"
              ],
              xpReward: 40
            }
          ],
          bonusTips: "Use the 'playsinline' attribute on mobile devices to prevent videos from forcing fullscreen mode. For background videos, always use autoplay muted loop playsinline for the best UX.",
          resources: [
            "MDN: Video Element - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video",
            "WebVTT Format - https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API"
          ]
        },
        {
          lessonTitle: "Module 11: Embedded Content with <iframe>",
          order: 5,
          estimatedTime: 40,
          explanation: `The <iframe> (inline frame) element embeds another webpage or application within your current page. It's powerful but requires careful security consideration.

**Common Use Cases:**
- Embedding YouTube/Vimeo videos
- Google Maps integration
- Social media feeds
- Third-party widgets
- Embedded dashboards
- Payment forms (Stripe, PayPal)

**Essential Attributes:**
- **src** - URL of embedded content
- **title** - Descriptive title (accessibility!)
- **width/height** - Dimensions
- **allowfullscreen** - Enable fullscreen mode
- **loading="lazy"** - Defer loading until visible
- **sandbox** - Security restrictions

**Sandbox Security:**
- Restricts iframe capabilities
- Values: allow-scripts, allow-forms, allow-popups
- Use for untrusted content
- Empty sandbox="" is most restrictive

**Accessibility:**
- Always provide title attribute
- Make content within iframe accessible
- Ensure keyboard navigation works
- Consider alternatives for screen readers`,
          codeExamples: [
            `<!-- YouTube Video Embed -->
<iframe
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  width="560"
  height="315"
  title="HTML Tutorial Video"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  loading="lazy">
</iframe>

<!-- Google Maps Embed -->
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.9"
  width="600"
  height="450"
  title="Office Location Map"
  style="border:0;"
  allowfullscreen
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade">
</iframe>

<!-- Sandboxed External Content (Secure) -->
<iframe
  src="https://untrusted-content.com"
  title="External Content"
  width="400"
  height="300"
  sandbox="allow-scripts allow-same-origin"
  loading="lazy">
</iframe>

<!-- Responsive iframe (16:9 aspect ratio) -->
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://player.vimeo.com/video/123456789"
    title="Product Demo"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allowfullscreen>
  </iframe>
</div>

<!-- Embedded Dashboard with Lazy Loading -->
<iframe
  src="https://dashboard.example.com/embed"
  title="Analytics Dashboard"
  width="100%"
  height="600"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin"
  style="border: 1px solid #ddd; border-radius: 8px;">
  <p>Your browser does not support iframes. 
     <a href="https://dashboard.example.com">View dashboard</a></p>
</iframe>`
          ],
          practicalTasks: [
            {
              task: "Embed a Google Map showing your office location using an iframe. Include proper title attribute for accessibility, set dimensions (width=600, height=450), enable allowfullscreen, and add loading='lazy' for performance.",
              expectedOutput: "A Google Maps iframe with all required attributes including title, dimensions, allowfullscreen, and lazy loading",
              hints: [
                "Go to Google Maps, find your location, click Share > Embed a map",
                "Copy the iframe code provided",
                "Add title='Office Location' for accessibility",
                "Ensure width and height are specified",
                "Add loading='lazy' to defer loading",
                "Test that the map is interactive and fullscreen works"
              ],
              xpReward: 35
            }
          ],
          bonusTips: "For responsive iframes (especially videos), use the 'padding-bottom trick': wrap the iframe in a div with padding-bottom percentage matching the aspect ratio (56.25% for 16:9). Set iframe to position:absolute with 100% width/height.",
          resources: [
            "MDN: iframe Element - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe",
            "iframe Security Guide - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#security_concerns"
          ]
        },
        {
          lessonTitle: "Module 12: Advanced Semantic Elements",
          order: 6,
          estimatedTime: 45,
          explanation: `Modern HTML5 includes specialized semantic elements for specific content types, improving structure, accessibility, and SEO.

**<figure> and <figcaption>:**
- Semantic wrapper for images, diagrams, code
- <figcaption> provides description
- Can contain multiple elements
- Improves accessibility and SEO

**<time> Element:**
- Machine-readable dates/times
- datetime attribute for ISO format
- Helps search engines and assistive tech
- Use for events, publish dates, deadlines

**<mark> Element:**
- Highlights relevant text
- Like a highlighter pen
- Good for search results, key terms
- Different from <strong> or <em>

**<details> and <summary>:**
- Native collapsible content
- No JavaScript required!
- <summary> is the clickable heading
- Great for FAQs, expandable sections

**<progress> and <meter>:**
- Visual indicators
- <progress> for task completion
- <meter> for measurements/gauges
- Both have min, max, value attributes`,
          codeExamples: [
            `<!-- Figure with Caption -->
<figure>
  <img src="productivity-chart.png" alt="Bar chart showing 30% productivity increase">
  <figcaption>
    <strong>Figure 1:</strong> Weekly Productivity Report - 
    Tasks completed increased by 30% this quarter.
  </figcaption>
</figure>

<!-- Multiple Images in One Figure -->
<figure>
  <img src="before.jpg" alt="Dashboard before redesign">
  <img src="after.jpg" alt="Dashboard after redesign">
  <figcaption>UI Comparison: Before and After Redesign</figcaption>
</figure>

<!-- Time Elements -->
<article>
  <h2>Product Launch</h2>
  <p>Published: <time datetime="2025-01-15T09:00:00-05:00">January 15, 2025 at 9:00 AM EST</time></p>
  <p>Event Date: <time datetime="2025-02-01">February 1st, 2025</time></p>
</article>

<!-- Mark for Highlighting -->
<p>Our new feature allows users to <mark>track time automatically</mark> without manual input.</p>

<p>Search results for "HTML": 
   Learn <mark>HTML</mark> basics with our interactive <mark>HTML</mark> tutorial.
</p>

<!-- Details/Summary for Collapsible Content -->
<details>
  <summary>View Performance Details</summary>
  <p>Tasks completed increased by 20% this week.</p>
  <ul>
    <li>Frontend: 15 tasks</li>
    <li>Backend: 12 tasks</li>
    <li>Design: 8 tasks</li>
  </ul>
</details>

<details open>
  <summary>Important Announcement</summary>
  <p>System maintenance scheduled for this weekend.</p>
</details>

<!-- Progress Bar -->
<label for="project-progress">Project Completion:</label>
<progress id="project-progress" max="100" value="75">75%</progress>

<!-- Meter (Gauge) -->
<label for="disk-usage">Disk Usage:</label>
<meter id="disk-usage" min="0" max="100" low="33" high="66" optimum="20" value="85">
  85% used (Critical)
</meter>

<!-- Combined Example: Report Card -->
<article>
  <h3>Sprint Summary</h3>
  <figure>
    <img src="sprint-chart.png" alt="Sprint velocity chart">
    <figcaption>Sprint Velocity - Last 6 Sprints</figcaption>
  </figure>
  
  <details>
    <summary>View Detailed Metrics</summary>
    <div>
      <p>Completed: <progress max="50" value="45">45/50</progress> 45 of 50 tasks</p>
      <p>Code Quality: <meter min="0" max="100" value="92">92/100</meter></p>
      <p>Last Updated: <time datetime="2025-01-15">Jan 15, 2025</time></p>
    </div>
  </details>
</article>`
          ],
          practicalTasks: [
            {
              task: "Build a comprehensive report section using <figure> with <figcaption> for an image/chart, <details>/<summary> for expandable content, <progress> bars for task completion, <time> elements for dates, and <mark> to highlight key metrics",
              expectedOutput: "A report page showcasing all advanced semantic elements working together with proper structure and accessibility",
              hints: [
                "Start with a <figure> containing an image and descriptive <figcaption>",
                "Add <details> with <summary> for collapsible sections",
                "Use <progress> with value and max attributes",
                "Include <time> with datetime attribute in ISO format",
                "Use <mark> to highlight important numbers/text",
                "Combine multiple elements for rich, semantic content",
                "Test that details expand/collapse properly"
              ],
              xpReward: 45
            }
          ],
          bonusTips: "The <details> element has a 'toggle' event you can listen to with JavaScript! Use it to track which sections users expand or to lazy-load content when details are opened. No need for complex accordion libraries!",
          resources: [
            "MDN: Figure Element - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure",
            "MDN: Details Element - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details",
            "MDN: Time Element - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time"
          ]
        },
        {
          lessonTitle: "Module 13: Accessibility & Semantics Validation",
          order: 7,
          estimatedTime: 50,
          explanation: `Semantic HTML dramatically improves accessibility, but proper implementation requires validation and testing. ARIA (Accessible Rich Internet Applications) supplements HTML when needed.

**Why Accessibility Matters:**
- 1 billion people worldwide have disabilities
- Legal requirements (ADA, Section 508, WCAG)
- Better SEO rankings
- Improved usability for everyone
- Future-proofs your content

**Semantic HTML = Better Accessibility:**
- Screen readers understand structure
- Keyboard navigation works automatically
- Assistive technologies interpret correctly
- No need for excessive ARIA

**ARIA Basics:**
- Only use when native HTML insufficient
- Don't override native semantics
- Common roles: banner, navigation, main, complementary
- Use sparingly and correctly

**Validation Tools:**
- **W3C HTML Validator** - Check syntax
- **WAVE** - Accessibility evaluation
- **axe DevTools** - Browser extension
- **Lighthouse** - Built into Chrome DevTools
- **Screen readers** - NVDA, JAWS, VoiceOver

**Best Practices:**
- Use semantic tags first
- Add ARIA only when necessary
- Test with keyboard only
- Test with screen reader
- Check color contrast
- Provide text alternatives`,
          codeExamples: [
            `<!-- Proper Semantic Navigation (No ARIA Needed) -->
<nav>
  <ul>
    <li><a href="#dashboard">Dashboard</a></li>
    <li><a href="#reports">Reports</a></li>
    <li><a href="#settings">Settings</a></li>
  </ul>
</nav>

<!-- ARIA Labels for Additional Context -->
<nav aria-label="Main Navigation">
  <a href="#dashboard">Dashboard</a>
  <a href="#reports">Reports</a>
  <a href="#settings">Settings</a>
</nav>

<nav aria-label="Footer Navigation">
  <a href="#privacy">Privacy</a>
  <a href="#terms">Terms</a>
  <a href="#contact">Contact</a>
</nav>

<!-- Skip to Main Content Link (Accessibility) -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<header>
  <nav aria-label="Main">
    <!-- navigation -->
  </nav>
</header>

<main id="main-content" tabindex="-1">
  <!-- main content -->
</main>

<!-- Accessible Form with Proper Labels -->
<form>
  <label for="username">Username:</label>
  <input 
    type="text" 
    id="username" 
    name="username" 
    aria-required="true"
    aria-describedby="username-hint">
  <p id="username-hint">Must be 3-20 characters</p>
  
  <label for="email">Email:</label>
  <input 
    type="email" 
    id="email" 
    name="email" 
    required
    aria-invalid="false">
    
  <button type="submit">Submit</button>
</form>

<!-- ARIA Live Region for Dynamic Content -->
<div role="status" aria-live="polite" aria-atomic="true" id="status-message">
  <!-- Dynamic status messages appear here -->
</div>

<!-- Accessible Modal Dialog -->
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Delete</h2>
  <p id="dialog-desc">Are you sure you want to delete this item?</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>

<!-- Landmark Roles (Use Native Tags When Possible) -->
<header role="banner">
  <h1>Site Title</h1>
</header>

<nav role="navigation" aria-label="Main">
  <!-- nav links -->
</nav>

<main role="main">
  <article role="article">
    <!-- article content -->
  </article>
</main>

<aside role="complementary">
  <!-- sidebar -->
</aside>

<footer role="contentinfo">
  <!-- footer content -->
</footer>

<!-- Accessible Button (Proper Semantics) -->
<!-- GOOD: -->
<button onclick="saveData()">Save</button>

<!-- BAD (Don't Do This): -->
<div onclick="saveData()" role="button" tabindex="0" 
     onkeypress="handleKeyPress()">Save</div>

<!-- Accessible Tabs Pattern -->
<div role="tablist" aria-label="Project Sections">
  <button role="tab" aria-selected="true" aria-controls="overview-panel" id="overview-tab">
    Overview
  </button>
  <button role="tab" aria-selected="false" aria-controls="tasks-panel" id="tasks-tab">
    Tasks
  </button>
</div>

<div role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
  <!-- Overview content -->
</div>

<div role="tabpanel" id="tasks-panel" aria-labelledby="tasks-tab" hidden>
  <!-- Tasks content -->
</div>`
          ],
          practicalTasks: [
            {
              task: "Create an accessible navigation section with proper ARIA labels, validate your entire page structure with W3C Validator (https://validator.w3.org), fix all errors and warnings, then test with a keyboard (Tab, Enter, arrows) to ensure all interactive elements are reachable",
              expectedOutput: "A fully validated, accessible page passing W3C validation with zero errors, proper ARIA labels, and full keyboard accessibility",
              hints: [
                "Use <nav> with aria-label to distinguish multiple navs",
                "Ensure all links have descriptive text (not 'click here')",
                "Add skip-to-main-content link at top",
                "Validate HTML at validator.w3.org",
                "Fix any errors or warnings shown",
                "Test tab order makes logical sense",
                "Ensure Enter key activates links/buttons",
                "Check focus indicators are visible"
              ],
              xpReward: 50
            }
          ],
          bonusTips: "Install NVDA (Windows) or use VoiceOver (Mac) and actually navigate your site with eyes closed. This 5-minute test reveals accessibility issues no automated tool can catch. You'll understand your users' experience firsthand!",
          resources: [
            "W3C Validator - https://validator.w3.org/",
            "MDN: ARIA Basics - https://developer.mozilla.org/en-US/docs/Learn/Accessibility/WAI-ARIA_basics",
            "WebAIM: ARIA - https://webaim.org/techniques/aria/",
            "WAVE Tool - https://wave.webaim.org/",
            "A11y Project Checklist - https://www.a11yproject.com/checklist/"
          ]
        }
      ]
    }
    
    console.log('📚 Creating HTML Part 2 curriculum...')
    const curriculum = await Curriculum.create(htmlPart2Curriculum)
    
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

seedHTMLPart2()
