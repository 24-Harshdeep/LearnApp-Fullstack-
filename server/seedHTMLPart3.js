import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import Curriculum from './models/Curriculum.js'

dotenv.config()

const seedHTMLPart3 = async () => {
  try {
    await connectDB()
    
    console.log('🗑️  Removing existing HTML Part 3 curriculum...')
    await Curriculum.deleteOne({ topic: "HTML Fundamentals - Part 3" })
    
    const htmlPart3Curriculum = {
      topic: "HTML Fundamentals - Part 3",
      description: "Master HTML forms, validation, and accessibility with 8 comprehensive modules covering form fundamentals, input types, validation, and SEO optimization.",
      difficulty: "beginner",
      estimatedHours: 10,
      icon: "📝",
      tags: ["HTML", "Forms", "Validation", "Accessibility", "SEO"],
      prerequisites: ["HTML Fundamentals - Part 1", "HTML Fundamentals - Part 2"],
      subtopics: [
        {
          lessonTitle: "HTML Forms Fundamentals",
          order: 1,
          estimatedTime: 45,
          explanation: `Forms are the backbone of user input in web applications. They allow users to submit data to servers for processing.

**Key Concepts:**
- The <form> element creates a data submission area
- **action** attribute specifies where to send form data
- **method** attribute defines HTTP method (GET or POST)
- <label> improves accessibility by associating text with inputs
- **for** attribute in label matches **id** in input

**Form Structure:**
- <form> - Container for all form elements
- <label> - Descriptive text for inputs
- <input> - Various input fields
- <button> or <input type="submit"> - Submit button

**Best Practices:**
- Always use labels for inputs
- Use descriptive names for form fields
- Provide clear submit button text
- Use POST method for sensitive data`,
          codeExamples: [
            `<form action="/signup" method="POST">
  <label for="name">Full Name:</label>
  <input id="name" name="name" type="text" required>
  
  <label for="email">Email Address:</label>
  <input id="email" name="email" type="email" required>
  
  <button type="submit">Register</button>
</form>`,
            `<!-- Form with multiple fields -->
<form action="/contact" method="POST">
  <div>
    <label for="username">Username:</label>
    <input id="username" name="username" type="text" required>
  </div>
  
  <div>
    <label for="password">Password:</label>
    <input id="password" name="password" type="password" required>
  </div>
  
  <div>
    <label for="remember">
      <input id="remember" name="remember" type="checkbox">
      Remember me
    </label>
  </div>
  
  <button type="submit">Sign In</button>
</form>`
          ],
          practicalTasks: [
            {
              task: "Create a 'Newsletter Signup' form with fields for name, email, and a submit button. Use proper labels and set the form method to POST.",
              expectedOutput: "A functional form with labeled inputs for name and email, and a submit button",
              hints: [
                "Use <form> with action and method attributes",
                "Link each <label> to its input using 'for' and 'id'",
                "Add 'required' attribute to make fields mandatory",
                "Use type='email' for email input"
              ],
              xpReward: 35
            }
          ],
          bonusTips: "Use the 'name' attribute on inputs - it's how servers identify the data when the form is submitted. The 'id' is for accessibility (label association) and JavaScript, while 'name' is for form submission.",
          resources: [
            "MDN HTML Forms Guide: https://developer.mozilla.org/en-US/docs/Learn/Forms",
            "W3Schools Forms Tutorial: https://www.w3schools.com/html/html_forms.asp"
          ]
        },
        {
          lessonTitle: "Exploring Input Types",
          order: 2,
          estimatedTime: 50,
          explanation: `HTML5 introduced diverse input types to improve user experience and provide built-in validation.

**Modern Input Types:**
- **email** - Email validation with @ symbol
- **number** - Numeric input with spinner controls
- **date** - Date picker calendar
- **time** - Time selection widget
- **color** - Color picker interface
- **range** - Slider control
- **tel** - Telephone number (mobile-optimized)
- **url** - URL validation
- **search** - Search box with clear button
- **file** - File upload dialog

**Benefits:**
- Automatic validation on submit
- Mobile-optimized keyboards
- Better user experience
- Reduced JavaScript needed

**Attributes:**
- **placeholder** - Hint text inside input
- **min/max** - Range limits
- **step** - Increment value
- **accept** - File type filter (for file input)`,
          codeExamples: [
            `<form>
  <!-- Email with validation -->
  <input type="email" placeholder="you@example.com" required>
  
  <!-- Number with range -->
  <input type="number" min="1" max="100" value="50">
  
  <!-- Date picker -->
  <input type="date" min="2025-01-01">
  
  <!-- Color picker -->
  <input type="color" value="#3498db">
  
  <!-- Range slider -->
  <input type="range" min="0" max="100" value="50" step="5">
  
  <!-- Telephone -->
  <input type="tel" placeholder="+1-555-555-5555" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
</form>`,
            `<!-- Profile settings form -->
<form action="/profile" method="POST">
  <label for="avatar">Profile Picture:</label>
  <input id="avatar" type="file" accept="image/*">
  
  <label for="birth">Birth Date:</label>
  <input id="birth" type="date" max="2010-12-31">
  
  <label for="age">Age:</label>
  <input id="age" type="number" min="13" max="120">
  
  <label for="website">Website:</label>
  <input id="website" type="url" placeholder="https://example.com">
  
  <label for="theme">Theme Color:</label>
  <input id="theme" type="color" value="#007bff">
  
  <button type="submit">Save Settings</button>
</form>`
          ],
          practicalTasks: [
            {
              task: "Design a profile settings form using at least 6 modern input types (email, number, date, color, range, file). Include proper labels and placeholders.",
              expectedOutput: "A comprehensive form demonstrating various HTML5 input types with labels",
              hints: [
                "Use type='email' for email validation",
                "Add min/max attributes to number and date inputs",
                "Use accept='image/*' for file input to filter images",
                "Add placeholder text for better UX",
                "Use step attribute with range for increments"
              ],
              xpReward: 40
            }
          ],
          bonusTips: "Mobile browsers automatically show optimized keyboards based on input type. For example, type='email' shows @ and .com keys, type='number' shows numeric keypad, and type='tel' shows phone dialer layout.",
          resources: [
            "MDN Input Element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input",
            "Can I Use - Input Types: https://caniuse.com/?search=input%20type"
          ]
        },
        {
          lessonTitle: "Grouping with Fieldset & Legend",
          order: 3,
          estimatedTime: 40,
          explanation: `Fieldset and legend group related form fields visually and semantically, improving organization and accessibility.

**Why Use Fieldsets:**
- Groups related inputs logically
- Improves accessibility for screen readers
- Provides visual organization
- Creates semantic relationships

**Structure:**
- <fieldset> - Container that groups related fields
- <legend> - Title/description for the group
- Can nest multiple fieldsets
- Can be styled with CSS

**Accessibility Benefits:**
- Screen readers announce the legend when entering the group
- Helps users understand form structure
- Improves keyboard navigation
- Better form comprehension`,
          codeExamples: [
            `<form>
  <fieldset>
    <legend>Personal Information</legend>
    <label for="fname">First Name:</label>
    <input id="fname" name="fname" type="text" required>
    
    <label for="lname">Last Name:</label>
    <input id="lname" name="lname" type="text" required>
    
    <label for="age">Age:</label>
    <input id="age" name="age" type="number" min="18" max="120">
  </fieldset>
  
  <fieldset>
    <legend>Account Settings</legend>
    <label for="username">Username:</label>
    <input id="username" name="username" type="text" required>
    
    <label for="password">Password:</label>
    <input id="password" name="password" type="password" required>
  </fieldset>
  
  <button type="submit">Create Account</button>
</form>`,
            `<!-- Survey with multiple sections -->
<form action="/survey" method="POST">
  <fieldset>
    <legend>Contact Details</legend>
    <label>Email: <input type="email" name="email" required></label>
    <label>Phone: <input type="tel" name="phone"></label>
  </fieldset>
  
  <fieldset>
    <legend>Preferences</legend>
    <label>
      <input type="checkbox" name="newsletter">
      Subscribe to newsletter
    </label>
    <label>
      <input type="checkbox" name="updates">
      Receive product updates
    </label>
  </fieldset>
  
  <fieldset>
    <legend>Feedback</legend>
    <label>
      Rating:
      <input type="range" name="rating" min="1" max="5" value="3">
    </label>
    <label>
      Comments:
      <textarea name="comments" rows="4"></textarea>
    </label>
  </fieldset>
  
  <button type="submit">Submit Survey</button>
</form>`
          ],
          practicalTasks: [
            {
              task: "Create a 'User Profile' form with two separate fieldsets: one for Personal Info (name, email, birth date) and another for Account Settings (username, password, security question).",
              expectedOutput: "A well-organized form with two distinct fieldset sections, each with a legend and appropriate inputs",
              hints: [
                "Use <fieldset> to wrap related inputs",
                "Add <legend> as the first child of fieldset",
                "Include at least 3 inputs in each fieldset",
                "Use appropriate input types for each field",
                "Make fields required where appropriate"
              ],
              xpReward: 35
            }
          ],
          bonusTips: "Fieldsets can be disabled entirely with the 'disabled' attribute, which disables all inputs inside. This is useful for progressive forms where sections unlock as users complete previous ones.",
          resources: [
            "MDN Fieldset Element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset",
            "WebAIM: Creating Accessible Forms: https://webaim.org/techniques/forms/"
          ]
        },
        {
          lessonTitle: "Dropdowns, Datalists, and Textareas",
          order: 4,
          estimatedTime: 45,
          explanation: `Advanced form controls provide flexible ways for users to input data.

**Select Dropdowns:**
- <select> creates dropdown menus
- <option> defines each choice
- <optgroup> groups related options
- **multiple** allows multi-selection
- **size** shows multiple options at once

**Datalists (Autocomplete):**
- Provides suggestions as user types
- Combines input freedom with preset options
- More flexible than select
- Great for searchable lists

**Textareas:**
- Multi-line text input
- **rows** and **cols** set size
- **maxlength** limits characters
- **placeholder** for hints
- Resizable by users (can disable with CSS)`,
          codeExamples: [
            `<form>
  <!-- Select dropdown -->
  <label for="country">Country:</label>
  <select id="country" name="country" required>
    <option value="">-- Select Country --</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="in">India</option>
    <option value="ca">Canada</option>
  </select>
  
  <!-- Datalist for autocomplete -->
  <label for="city">City:</label>
  <input id="city" list="cities" name="city" placeholder="Start typing...">
  <datalist id="cities">
    <option value="Mumbai">
    <option value="Delhi">
    <option value="Bangalore">
    <option value="Hyderabad">
    <option value="Chennai">
  </datalist>
  
  <!-- Textarea for long text -->
  <label for="feedback">Your Feedback:</label>
  <textarea 
    id="feedback" 
    name="feedback" 
    rows="4" 
    cols="50"
    placeholder="Share your thoughts..."
    maxlength="500"
  ></textarea>
</form>`,
            `<!-- Advanced form with grouped options -->
<form action="/order" method="POST">
  <label for="size">T-Shirt Size:</label>
  <select id="size" name="size">
    <optgroup label="Standard Sizes">
      <option value="s">Small</option>
      <option value="m">Medium</option>
      <option value="l">Large</option>
    </optgroup>
    <optgroup label="Plus Sizes">
      <option value="xl">XL</option>
      <option value="xxl">XXL</option>
    </optgroup>
  </select>
  
  <label for="color">Preferred Color:</label>
  <input id="color" list="colors" name="color">
  <datalist id="colors">
    <option value="Red">
    <option value="Blue">
    <option value="Green">
    <option value="Black">
    <option value="White">
  </datalist>
  
  <label for="notes">Special Instructions:</label>
  <textarea id="notes" name="notes" rows="3" placeholder="Gift message, delivery notes, etc."></textarea>
  
  <button type="submit">Place Order</button>
</form>`
          ],
          practicalTasks: [
            {
              task: "Build a feedback form with: a dropdown for topic selection (Bug Report, Feature Request, General), a datalist for department autocomplete (Sales, Support, Engineering, Marketing), and a textarea for detailed feedback.",
              expectedOutput: "A complete feedback form with dropdown, datalist, and textarea, all properly labeled",
              hints: [
                "Use <select> with <option> for topics",
                "Create <datalist> with multiple <option> values",
                "Set textarea to 5 rows for visibility",
                "Add placeholder text to guide users",
                "Make all fields required"
              ],
              xpReward: 40
            }
          ],
          bonusTips: "Datalist is better than select when you have many options or want to allow custom input. For example, use datalist for city names (hundreds of options) but select for shirt sizes (limited options).",
          resources: [
            "MDN Select Element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select",
            "MDN Datalist Element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist",
            "MDN Textarea Element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea"
          ]
        },
        {
          lessonTitle: "HTML Form Validation",
          order: 5,
          estimatedTime: 50,
          explanation: `HTML5 provides built-in validation to ensure data quality before submission, reducing server load and improving UX.

**Validation Attributes:**
- **required** - Field must be filled
- **minlength/maxlength** - Text length limits
- **min/max** - Numeric/date range limits
- **pattern** - Regular expression validation
- **type** - Automatic validation (email, url, etc.)

**How It Works:**
- Browser checks validation on submit
- Invalid fields show error messages
- Form won't submit until valid
- Can be customized with CSS (:invalid, :valid)

**Validation Messages:**
- Use **title** attribute for pattern hints
- **setCustomValidity()** in JavaScript for custom messages
- Different browsers show different styles

**Best Practices:**
- Combine HTML validation with server-side validation
- Provide clear error messages
- Use appropriate input types
- Give users immediate feedback`,
          codeExamples: [
            `<form>
  <!-- Required email -->
  <label for="email">Email (required):</label>
  <input 
    id="email" 
    type="email" 
    name="email" 
    required
    placeholder="you@example.com"
  >
  
  <!-- Password with minimum length -->
  <label for="password">Password (min 8 characters):</label>
  <input 
    id="password" 
    type="password" 
    name="password" 
    required
    minlength="8"
    maxlength="50"
  >
  
  <!-- Pattern validation for username -->
  <label for="username">Username (letters and numbers only):</label>
  <input 
    id="username" 
    type="text" 
    name="username" 
    required
    pattern="[A-Za-z0-9]+"
    title="Only letters and numbers allowed"
  >
  
  <!-- Numeric range -->
  <label for="age">Age (18-100):</label>
  <input 
    id="age" 
    type="number" 
    name="age" 
    required
    min="18" 
    max="100"
  >
  
  <button type="submit">Register</button>
</form>`,
            `<!-- Advanced validation example -->
<form action="/signup" method="POST">
  <!-- Phone number pattern -->
  <label for="phone">Phone (format: 123-456-7890):</label>
  <input 
    id="phone" 
    type="tel" 
    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
    title="Format: 123-456-7890"
    placeholder="123-456-7890"
    required
  >
  
  <!-- URL validation -->
  <label for="website">Website:</label>
  <input 
    id="website" 
    type="url" 
    placeholder="https://example.com"
  >
  
  <!-- Password confirmation (needs JavaScript for matching) -->
  <label for="pass">Password:</label>
  <input id="pass" type="password" minlength="8" required>
  
  <label for="confirm">Confirm Password:</label>
  <input id="confirm" type="password" minlength="8" required>
  
  <!-- Terms acceptance -->
  <label>
    <input type="checkbox" required>
    I agree to the terms and conditions
  </label>
  
  <button type="submit">Create Account</button>
</form>`
          ],
          practicalTasks: [
            {
              task: "Create a secure login form with: email validation, password with minimum 8 characters and maximum 50, and a username that only accepts alphanumeric characters (use pattern attribute).",
              expectedOutput: "A login form with proper HTML5 validation attributes that prevents submission of invalid data",
              hints: [
                "Use type='email' for automatic email validation",
                "Add minlength='8' maxlength='50' to password",
                "Use pattern='[A-Za-z0-9]{4,15}' for username (4-15 chars)",
                "Add title attribute to explain validation rules",
                "Make all fields required"
              ],
              xpReward: 45
            }
          ],
          bonusTips: "Use the :invalid and :valid CSS pseudo-classes to style form fields based on validation state. For example: input:invalid { border: 2px solid red; } gives immediate visual feedback.",
          resources: [
            "MDN Form Validation: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation",
            "HTML5 Pattern Attribute: https://www.html5pattern.com/"
          ]
        },
        {
          lessonTitle: "Buttons and Submission Control",
          order: 6,
          estimatedTime: 40,
          explanation: `HTML provides different button types and submission control mechanisms for flexible form handling.

**Button Types:**
- **type="submit"** - Submits the form (default)
- **type="reset"** - Clears all form fields
- **type="button"** - No default action (for JavaScript)

**Submit Alternatives:**
- <input type="submit"> - Image-less submit button
- <button type="submit"> - Can contain HTML (icons, images)
- Pressing Enter in text input submits form

**Form Control Attributes:**
- **formaction** - Override form's action URL
- **formmethod** - Override form's method
- **formnovalidate** - Skip validation for this button
- **formtarget** - Override where response opens

**Best Practices:**
- Use <button> over <input type="submit"> for flexibility
- Always specify button type explicitly
- Use reset sparingly (users rarely want it)
- Provide clear button labels`,
          codeExamples: [
            `<form action="/save" method="POST">
  <label for="task">Task Name:</label>
  <input id="task" name="task" type="text" required>
  
  <!-- Standard submit button -->
  <button type="submit">Save Task</button>
  
  <!-- Reset button (clears all fields) -->
  <button type="reset">Clear Form</button>
  
  <!-- Plain button (no default action) -->
  <button type="button" onclick="previewTask()">Preview</button>
</form>`,
            `<!-- Multiple submit buttons with different actions -->
<form action="/article" method="POST">
  <label for="title">Article Title:</label>
  <input id="title" name="title" type="text" required>
  
  <label for="content">Content:</label>
  <textarea id="content" name="content" rows="5" required></textarea>
  
  <!-- Save as draft (different endpoint) -->
  <button type="submit" formaction="/draft" formmethod="POST">
    Save as Draft
  </button>
  
  <!-- Publish immediately -->
  <button type="submit" formaction="/publish" formmethod="POST">
    Publish Now
  </button>
  
  <!-- Preview without validation -->
  <button type="submit" formaction="/preview" formnovalidate formtarget="_blank">
    Preview
  </button>
</form>`,
            `<!-- Buttons with icons (using emoji) -->
<form>
  <input type="text" placeholder="Search..." required>
  
  <button type="submit">
    🔍 Search
  </button>
  
  <button type="reset">
    🗑️ Clear
  </button>
  
  <button type="button" onclick="advancedSearch()">
    ⚙️ Advanced
  </button>
</form>`
          ],
          practicalTasks: [
            {
              task: "Create a task creation form with: a text input for task name, a textarea for description, a 'Save Task' submit button, and a 'Clear' reset button.",
              expectedOutput: "A functional form with both submit and reset buttons that work correctly",
              hints: [
                "Use <button type='submit'> for save",
                "Use <button type='reset'> for clear",
                "Make sure form has action attribute",
                "Add labels for accessibility",
                "Test that reset actually clears fields"
              ],
              xpReward: 35
            }
          ],
          bonusTips: "The formaction attribute lets you have multiple submit buttons that send data to different endpoints. Perfect for 'Save Draft' vs 'Publish' scenarios without JavaScript!",
          resources: [
            "MDN Button Element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button",
            "Form Submit Variations: https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_and_retrieving_form_data"
          ]
        },
        {
          lessonTitle: "Accessibility in Forms",
          order: 7,
          estimatedTime: 50,
          explanation: `Accessible forms ensure everyone can use your web applications, including people using screen readers, keyboards, or assistive technologies.

**Accessibility Principles:**
1. **Labels** - Every input needs a label
2. **Focus** - Visible focus indicators
3. **Errors** - Clear error messages
4. **Keyboard** - Full keyboard navigation
5. **ARIA** - Use only when HTML isn't enough

**Key Techniques:**
- Associate labels with inputs (for/id)
- Use aria-label when visual label isn't possible
- Add aria-describedby for hints/errors
- Use aria-required for required fields
- Ensure logical tab order
- Provide clear error messages

**ARIA Attributes:**
- **aria-label** - Accessible name
- **aria-labelledby** - References label element
- **aria-describedby** - Additional description
- **aria-required** - Mark required fields
- **aria-invalid** - Mark validation errors

**Testing:**
- Use keyboard only (no mouse)
- Try a screen reader
- Check color contrast
- Verify focus visibility`,
          codeExamples: [
            `<!-- Accessible form with ARIA -->
<form action="/signup" method="POST">
  <div>
    <label for="email">Email Address</label>
    <input 
      id="email" 
      name="email" 
      type="email" 
      aria-required="true"
      aria-describedby="email-hint"
      required
    >
    <span id="email-hint" class="hint">
      We'll never share your email with anyone else.
    </span>
  </div>
  
  <div>
    <label for="password">Password</label>
    <input 
      id="password" 
      name="password" 
      type="password" 
      aria-required="true"
      aria-describedby="password-requirements"
      minlength="8"
      required
    >
    <span id="password-requirements" class="hint">
      Must be at least 8 characters long
    </span>
  </div>
  
  <button type="submit">Create Account</button>
</form>`,
            `<!-- Error handling with ARIA -->
<form novalidate>
  <div>
    <label for="username">Username</label>
    <input 
      id="username" 
      name="username" 
      type="text"
      aria-required="true"
      aria-invalid="false"
      aria-describedby="username-error"
      required
    >
    <span id="username-error" role="alert" hidden>
      Username must be at least 4 characters
    </span>
  </div>
  
  <!-- Focus visible for keyboard users -->
  <style>
    input:focus {
      outline: 3px solid #4A90E2;
      outline-offset: 2px;
    }
    
    input[aria-invalid="true"] {
      border-color: red;
    }
  </style>
</form>`,
            `<!-- Accessible fieldset with proper structure -->
<form>
  <fieldset>
    <legend>Contact Information</legend>
    
    <label for="name">
      Full Name 
      <abbr title="required" aria-label="required">*</abbr>
    </label>
    <input 
      id="name" 
      type="text" 
      aria-required="true" 
      required
    >
    
    <label for="phone">Phone Number (optional)</label>
    <input 
      id="phone" 
      type="tel"
      aria-describedby="phone-format"
    >
    <span id="phone-format">Format: 123-456-7890</span>
  </fieldset>
  
  <fieldset>
    <legend>Notification Preferences</legend>
    
    <div role="group" aria-labelledby="notify-legend">
      <span id="notify-legend">How would you like to be notified?</span>
      
      <label>
        <input type="checkbox" name="notify" value="email">
        Email
      </label>
      
      <label>
        <input type="checkbox" name="notify" value="sms">
        SMS
      </label>
    </div>
  </fieldset>
  
  <button type="submit">Submit</button>
</form>`
          ],
          practicalTasks: [
            {
              task: "Create an accessible contact form with: proper label associations, ARIA attributes (aria-required, aria-describedby), hint text for each field, and ensure full keyboard navigation. Include name, email, phone, and message fields.",
              expectedOutput: "A fully accessible form that works with screen readers and keyboard navigation, with proper ARIA markup",
              hints: [
                "Use for/id to associate labels with inputs",
                "Add aria-required='true' to required fields",
                "Use aria-describedby to link hints to inputs",
                "Provide clear placeholder text",
                "Test tab order is logical",
                "Add visible focus styles"
              ],
              xpReward: 50
            }
          ],
          bonusTips: "Never rely on placeholder text alone for labels - it disappears when typing and isn't accessible. Always use visible <label> elements. Placeholders should be examples, not instructions.",
          resources: [
            "W3C WAI-ARIA Practices: https://www.w3.org/WAI/ARIA/apg/patterns/",
            "WebAIM Forms Accessibility: https://webaim.org/techniques/forms/",
            "MDN ARIA Basics: https://developer.mozilla.org/en-US/docs/Learn/Accessibility/WAI-ARIA_basics"
          ]
        },
        {
          lessonTitle: "SEO & Metadata Optimization",
          order: 8,
          estimatedTime: 45,
          explanation: `Metadata helps search engines and social platforms understand your content, improving discoverability and sharing.

**Essential Meta Tags:**
- **charset** - Character encoding (UTF-8)
- **viewport** - Responsive design control
- **description** - Page summary (150-160 chars)
- **keywords** - Search terms (less important now)
- **author** - Content creator
- **robots** - Search engine instructions

**Open Graph (Social Media):**
- **og:title** - Title for social shares
- **og:description** - Description for shares
- **og:image** - Preview image
- **og:url** - Canonical URL
- **og:type** - Content type (website, article)

**Twitter Cards:**
- **twitter:card** - Card type (summary, large)
- **twitter:title** - Tweet title
- **twitter:description** - Tweet description
- **twitter:image** - Tweet image

**Other Important Tags:**
- <link rel="canonical"> - Preferred URL
- <title> - Browser tab title (critical for SEO)
- <meta name="theme-color"> - Browser UI color`,
          codeExamples: [
            `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Essential metadata -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO metadata -->
  <meta name="description" content="Learn HTML, CSS, and JavaScript through interactive tutorials and real-world projects. Master web development step by step.">
  <meta name="keywords" content="HTML, CSS, JavaScript, web development, tutorial, learning">
  <meta name="author" content="IdleLearn Team">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph for social media -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="IdleLearn - Master Web Development">
  <meta property="og:description" content="Interactive tutorials to learn HTML, CSS, and JavaScript">
  <meta property="og:image" content="https://idlelearn.com/preview.jpg">
  <meta property="og:url" content="https://idlelearn.com">
  <meta property="og:site_name" content="IdleLearn">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="IdleLearn - Master Web Development">
  <meta name="twitter:description" content="Learn to code through interactive tutorials">
  <meta name="twitter:image" content="https://idlelearn.com/twitter-card.jpg">
  <meta name="twitter:creator" content="@idlelearn">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://idlelearn.com">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  
  <!-- Theme color for mobile browsers -->
  <meta name="theme-color" content="#4A90E2">
  
  <title>IdleLearn | Learn Web Development Through Interactive Tutorials</title>
</head>
<body>
  <h1>Welcome to IdleLearn</h1>
</body>
</html>`,
            `<!-- Blog post with rich metadata -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Article metadata -->
  <meta name="description" content="Discover 10 essential HTML5 features every developer should know. From semantic elements to form validation, level up your skills.">
  <meta name="author" content="Jane Developer">
  <meta name="publish_date" content="2025-11-02">
  
  <!-- Open Graph for articles -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="10 Must-Know HTML5 Features">
  <meta property="og:description" content="Essential HTML5 features for modern web development">
  <meta property="og:image" content="https://blog.example.com/html5-features.jpg">
  <meta property="og:url" content="https://blog.example.com/html5-features">
  <meta property="article:published_time" content="2025-11-02T10:00:00Z">
  <meta property="article:author" content="Jane Developer">
  <meta property="article:section" content="Web Development">
  <meta property="article:tag" content="HTML5">
  <meta property="article:tag" content="Web Development">
  
  <link rel="canonical" href="https://blog.example.com/html5-features">
  
  <title>10 Must-Know HTML5 Features | Dev Blog</title>
</head>
<body>
  <article>
    <h1>10 Must-Know HTML5 Features</h1>
    <!-- Article content -->
  </article>
</body>
</html>`
          ],
          practicalTasks: [
            {
              task: "Create a complete HTML page for your portfolio with: proper SEO meta tags (description, keywords, author), Open Graph tags for social sharing, Twitter Card metadata, favicon link, and a descriptive page title. The description should be 150-160 characters.",
              expectedOutput: "An SEO-optimized HTML page with complete metadata in the <head> section",
              hints: [
                "Write description under 160 characters",
                "Include og:title, og:description, og:image, og:url",
                "Add twitter:card, twitter:title, twitter:description",
                "Use descriptive, keyword-rich title",
                "Add canonical link to prevent duplicate content",
                "Include viewport meta for mobile"
              ],
              xpReward: 45
            }
          ],
          bonusTips: "Test your Open Graph tags using Facebook's Sharing Debugger (developers.facebook.com/tools/debug/) and Twitter's Card Validator (cards-dev.twitter.com/validator) before sharing your site!",
          resources: [
            "Google SEO Starter Guide: https://developers.google.com/search/docs/beginner/seo-starter-guide",
            "Open Graph Protocol: https://ogp.me/",
            "Twitter Card Documentation: https://developer.twitter.com/en/docs/twitter-for-websites/cards",
            "Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/"
          ]
        }
      ]
    }
    
    console.log('📚 Creating HTML Part 3 curriculum...')
    const curriculum = await Curriculum.create(htmlPart3Curriculum)
    
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

seedHTMLPart3()
