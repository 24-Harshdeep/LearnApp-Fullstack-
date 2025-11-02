// Predefined quiz questions organized by topic and difficulty

export const quizBank = {
  JavaScript: {
    easy: [
      {
        id: 1,
        question: "What does the 'var' keyword do in JavaScript?",
        options: ["Declares a variable", "Creates a function", "Defines a constant", "Imports a module"],
        correctAnswer: "Declares a variable",
        explanation: "The 'var' keyword is used to declare variables in JavaScript. However, 'let' and 'const' are now preferred."
      },
      {
        id: 2,
        question: "Which symbol is used for single-line comments in JavaScript?",
        options: ["//", "/*", "#", "<!--"],
        correctAnswer: "//",
        explanation: "Double forward slashes (//) are used for single-line comments in JavaScript."
      },
      {
        id: 3,
        question: "What will 'typeof []' return in JavaScript?",
        options: ["object", "array", "undefined", "null"],
        correctAnswer: "object",
        explanation: "In JavaScript, arrays are actually objects, so typeof returns 'object'."
      },
      {
        id: 4,
        question: "Which method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: "push()",
        explanation: "The push() method adds one or more elements to the end of an array."
      },
      {
        id: 5,
        question: "What is the correct way to write a JavaScript string?",
        options: ["'Hello World'", "<Hello World>", "(Hello World)", "{Hello World}"],
        correctAnswer: "'Hello World'",
        explanation: "Strings in JavaScript can be written with single quotes, double quotes, or backticks."
      },
      {
        id: 6,
        question: "Which operator is used to assign a value to a variable?",
        options: ["=", "==", "===", "=>"],
        correctAnswer: "=",
        explanation: "The single equals sign (=) is the assignment operator in JavaScript."
      },
      {
        id: 7,
        question: "What is the result of '5' + 3 in JavaScript?",
        options: ["53", "8", "Error", "undefined"],
        correctAnswer: "53",
        explanation: "JavaScript converts the number 3 to a string and concatenates, resulting in '53'."
      },
      {
        id: 8,
        question: "Which keyword is used to define a constant in JavaScript?",
        options: ["const", "let", "var", "constant"],
        correctAnswer: "const",
        explanation: "The 'const' keyword is used to declare constants that cannot be reassigned."
      },
      {
        id: 9,
        question: "What does 'NaN' stand for?",
        options: ["Not a Number", "Null and Negative", "New Array Number", "None"],
        correctAnswer: "Not a Number",
        explanation: "NaN stands for 'Not a Number' and represents an invalid number operation result."
      },
      {
        id: 10,
        question: "Which method converts a string to lowercase?",
        options: ["toLowerCase()", "toLower()", "lower()", "lowerCase()"],
        correctAnswer: "toLowerCase()",
        explanation: "The toLowerCase() method converts a string to lowercase letters."
      }
    ],
    medium: [
      {
        id: 1,
        question: "What is the difference between '==' and '===' in JavaScript?",
        options: [
          "'==' compares values only, '===' compares values and types",
          "'===' is faster than '=='",
          "They are exactly the same",
          "'==' is stricter than '==='"
        ],
        correctAnswer: "'==' compares values only, '===' compares values and types",
        explanation: "'==' performs type coercion before comparison, while '===' checks both value and type without coercion."
      },
      {
        id: 2,
        question: "What is a closure in JavaScript?",
        options: [
          "A function with access to its outer function's variables",
          "A way to close browser windows",
          "A method to end loops",
          "A type of object"
        ],
        correctAnswer: "A function with access to its outer function's variables",
        explanation: "A closure is a function that has access to variables in its outer (enclosing) lexical scope."
      },
      {
        id: 3,
        question: "Which array method creates a new array with results of calling a function on every element?",
        options: ["map()", "forEach()", "filter()", "reduce()"],
        correctAnswer: "map()",
        explanation: "The map() method creates a new array with the results of calling a function for every array element."
      },
      {
        id: 4,
        question: "What does the 'this' keyword refer to in JavaScript?",
        options: [
          "The object it belongs to",
          "The global window object always",
          "The previous function",
          "The parent element"
        ],
        correctAnswer: "The object it belongs to",
        explanation: "The 'this' keyword refers to the object that is executing the current function."
      },
      {
        id: 5,
        question: "What is the purpose of 'async/await' in JavaScript?",
        options: [
          "To handle asynchronous operations more easily",
          "To speed up code execution",
          "To create parallel threads",
          "To declare variables"
        ],
        correctAnswer: "To handle asynchronous operations more easily",
        explanation: "async/await makes asynchronous code look and behave like synchronous code, making it easier to read."
      },
      {
        id: 6,
        question: "What will 'console.log(1 + '2' + 3)' output?",
        options: ["123", "6", "15", "Error"],
        correctAnswer: "123",
        explanation: "JavaScript converts numbers to strings when concatenating with strings: 1 + '2' = '12', then '12' + 3 = '123'."
      },
      {
        id: 7,
        question: "Which method is used to remove the last element from an array?",
        options: ["pop()", "push()", "shift()", "splice()"],
        correctAnswer: "pop()",
        explanation: "The pop() method removes and returns the last element from an array."
      },
      {
        id: 8,
        question: "What is the output of 'typeof null' in JavaScript?",
        options: ["object", "null", "undefined", "boolean"],
        correctAnswer: "object",
        explanation: "This is a known JavaScript quirk - typeof null returns 'object', which is considered a bug in the language."
      },
      {
        id: 9,
        question: "What does the spread operator (...) do?",
        options: [
          "Expands an array or object",
          "Multiplies numbers",
          "Creates comments",
          "Divides values"
        ],
        correctAnswer: "Expands an array or object",
        explanation: "The spread operator (...) expands an iterable (like an array) into individual elements."
      },
      {
        id: 10,
        question: "What is event bubbling in JavaScript?",
        options: [
          "Events propagate from child to parent elements",
          "Events create bubble animations",
          "Events are sorted by priority",
          "Events are deleted automatically"
        ],
        correctAnswer: "Events propagate from child to parent elements",
        explanation: "Event bubbling is when an event propagates from the target element up through its ancestors."
      }
    ],
    hard: [
      {
        id: 1,
        question: "What is the difference between call(), apply(), and bind()?",
        options: [
          "call() and apply() invoke immediately, bind() returns a new function",
          "They are exactly the same",
          "call() is for objects, apply() is for arrays",
          "bind() is deprecated"
        ],
        correctAnswer: "call() and apply() invoke immediately, bind() returns a new function",
        explanation: "call() and apply() invoke the function immediately with a specified 'this' value, while bind() returns a new function."
      },
      {
        id: 2,
        question: "What is the JavaScript Event Loop?",
        options: [
          "Mechanism that handles asynchronous callbacks",
          "A loop that runs every second",
          "A way to prevent infinite loops",
          "A debugging tool"
        ],
        correctAnswer: "Mechanism that handles asynchronous callbacks",
        explanation: "The Event Loop manages the execution of multiple chunks of code over time, handling async operations."
      },
      {
        id: 3,
        question: "What is prototypal inheritance in JavaScript?",
        options: [
          "Objects inherit properties from other objects",
          "Classes inherit from parent classes",
          "Functions inherit from prototypes only",
          "Variables inherit types"
        ],
        correctAnswer: "Objects inherit properties from other objects",
        explanation: "JavaScript uses prototypal inheritance where objects can inherit properties directly from other objects."
      },
      {
        id: 4,
        question: "What is the purpose of Object.freeze()?",
        options: [
          "Makes an object immutable",
          "Stops JavaScript execution",
          "Freezes animations",
          "Clones an object"
        ],
        correctAnswer: "Makes an object immutable",
        explanation: "Object.freeze() prevents new properties from being added and existing properties from being modified or deleted."
      },
      {
        id: 5,
        question: "What is a Promise in JavaScript?",
        options: [
          "An object representing eventual completion or failure of an async operation",
          "A guaranteed return value",
          "A type of variable",
          "A loop structure"
        ],
        correctAnswer: "An object representing eventual completion or failure of an async operation",
        explanation: "A Promise is an object that may produce a single value in the future: either a resolved value or a rejection reason."
      }
    ]
  },
  
  React: {
    easy: [
      {
        id: 1,
        question: "What does JSX stand for?",
        options: ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "JSON XML"],
        correctAnswer: "JavaScript XML",
        explanation: "JSX stands for JavaScript XML. It allows us to write HTML-like code in React."
      },
      {
        id: 2,
        question: "Which hook is used to manage state in functional components?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctAnswer: "useState",
        explanation: "useState is the primary hook for adding state to functional components."
      },
      {
        id: 3,
        question: "What is a component in React?",
        options: [
          "A reusable piece of UI",
          "A CSS file",
          "A database table",
          "A server endpoint"
        ],
        correctAnswer: "A reusable piece of UI",
        explanation: "Components are the building blocks of React applications, representing reusable pieces of UI."
      },
      {
        id: 4,
        question: "How do you pass data from parent to child component?",
        options: ["Props", "State", "Context", "Redux"],
        correctAnswer: "Props",
        explanation: "Props (properties) are used to pass data from parent to child components in React."
      },
      {
        id: 5,
        question: "What method is used to render a React component to the DOM?",
        options: ["ReactDOM.render()", "React.create()", "render()", "mount()"],
        correctAnswer: "ReactDOM.render()",
        explanation: "ReactDOM.render() is used to render React components into the DOM."
      }
    ],
    medium: [
      {
        id: 1,
        question: "What is the purpose of useEffect hook?",
        options: [
          "Handle side effects in functional components",
          "Create state variables",
          "Style components",
          "Define routes"
        ],
        correctAnswer: "Handle side effects in functional components",
        explanation: "useEffect is used for side effects like data fetching, subscriptions, or manually changing the DOM."
      },
      {
        id: 2,
        question: "What is the Virtual DOM in React?",
        options: [
          "A lightweight copy of the real DOM",
          "A database for React",
          "A testing tool",
          "A CSS framework"
        ],
        correctAnswer: "A lightweight copy of the real DOM",
        explanation: "The Virtual DOM is a programming concept where a virtual representation of the UI is kept in memory."
      },
      {
        id: 3,
        question: "What is prop drilling?",
        options: [
          "Passing props through multiple component levels",
          "Creating holes in components",
          "Debugging props",
          "Testing components"
        ],
        correctAnswer: "Passing props through multiple component levels",
        explanation: "Prop drilling is passing data through multiple nested components to reach a deeply nested component."
      },
      {
        id: 4,
        question: "What does lifting state up mean in React?",
        options: [
          "Moving state to a common parent component",
          "Increasing state values",
          "Deleting state",
          "Copying state to children"
        ],
        correctAnswer: "Moving state to a common parent component",
        explanation: "Lifting state up means moving state to the closest common ancestor of components that need it."
      },
      {
        id: 5,
        question: "What is the difference between controlled and uncontrolled components?",
        options: [
          "Controlled components have React managing their state",
          "Uncontrolled components are faster",
          "Controlled components don't re-render",
          "There is no difference"
        ],
        correctAnswer: "Controlled components have React managing their state",
        explanation: "Controlled components have their form data handled by React state, while uncontrolled components store data in the DOM."
      }
    ],
    hard: [
      {
        id: 1,
        question: "What is React Fiber?",
        options: [
          "A complete rewrite of React's reconciliation algorithm",
          "A new CSS library",
          "A state management tool",
          "A testing framework"
        ],
        correctAnswer: "A complete rewrite of React's reconciliation algorithm",
        explanation: "React Fiber is the new reconciliation engine that enables incremental rendering of the virtual DOM."
      },
      {
        id: 2,
        question: "What are Higher-Order Components (HOC)?",
        options: [
          "Functions that take a component and return a new component",
          "Components at the top of the tree",
          "The most important components",
          "Components with high performance"
        ],
        correctAnswer: "Functions that take a component and return a new component",
        explanation: "HOCs are advanced techniques for reusing component logic by wrapping components with additional functionality."
      },
      {
        id: 3,
        question: "What is the purpose of React.memo()?",
        options: [
          "Memoize components to prevent unnecessary re-renders",
          "Store component data",
          "Create memory leaks",
          "Delete unused components"
        ],
        correctAnswer: "Memoize components to prevent unnecessary re-renders",
        explanation: "React.memo() is a higher-order component that memoizes the result to prevent unnecessary re-renders."
      },
      {
        id: 4,
        question: "What is the difference between useMemo and useCallback?",
        options: [
          "useMemo returns a memoized value, useCallback returns a memoized function",
          "They are exactly the same",
          "useMemo is faster",
          "useCallback is for classes only"
        ],
        correctAnswer: "useMemo returns a memoized value, useCallback returns a memoized function",
        explanation: "useMemo memoizes a computed value, while useCallback memoizes a function definition."
      },
      {
        id: 5,
        question: "What is React Suspense used for?",
        options: [
          "Handle loading states for lazy-loaded components",
          "Suspend animations",
          "Pause JavaScript execution",
          "Debug components"
        ],
        correctAnswer: "Handle loading states for lazy-loaded components",
        explanation: "Suspense lets components 'wait' for something before rendering, typically used with lazy loading."
      }
    ]
  },

  HTML: {
    easy: [
      {
        id: 1,
        question: "What does HTML stand for?",
        options: [
          "HyperText Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlinks and Text Markup Language"
        ],
        correctAnswer: "HyperText Markup Language",
        explanation: "HTML stands for HyperText Markup Language, the standard markup language for web pages."
      },
      {
        id: 2,
        question: "Which tag is used to create a hyperlink?",
        options: ["<a>", "<link>", "<href>", "<url>"],
        correctAnswer: "<a>",
        explanation: "The <a> (anchor) tag is used to create hyperlinks in HTML."
      },
      {
        id: 3,
        question: "Which tag is used to display an image?",
        options: ["<img>", "<image>", "<picture>", "<src>"],
        correctAnswer: "<img>",
        explanation: "The <img> tag is used to embed images in HTML documents."
      },
      {
        id: 4,
        question: "What is the correct HTML tag for the largest heading?",
        options: ["<h1>", "<h6>", "<heading>", "<head>"],
        correctAnswer: "<h1>",
        explanation: "<h1> defines the most important heading, while <h6> defines the least important."
      },
      {
        id: 5,
        question: "Which HTML attribute specifies an alternate text for an image?",
        options: ["alt", "title", "src", "text"],
        correctAnswer: "alt",
        explanation: "The alt attribute provides alternative text for an image if it cannot be displayed."
      },
      {
        id: 6,
        question: "What is the correct HTML for creating a checkbox?",
        options: [
          '<input type="checkbox">',
          '<checkbox>',
          '<input type="check">',
          '<check>'
        ],
        correctAnswer: '<input type="checkbox">',
        explanation: "Checkboxes are created using <input type=\"checkbox\">."
      },
      {
        id: 7,
        question: "Which tag is used to define an unordered list?",
        options: ["<ul>", "<ol>", "<list>", "<li>"],
        correctAnswer: "<ul>",
        explanation: "The <ul> tag defines an unordered (bulleted) list."
      },
      {
        id: 8,
        question: "What does the <br> tag do?",
        options: [
          "Creates a line break",
          "Makes text bold",
          "Creates a border",
          "Defines a paragraph"
        ],
        correctAnswer: "Creates a line break",
        explanation: "The <br> tag inserts a single line break in the document."
      },
      {
        id: 9,
        question: "Which tag is used to define a table row?",
        options: ["<tr>", "<td>", "<table>", "<row>"],
        correctAnswer: "<tr>",
        explanation: "The <tr> tag defines a row in an HTML table."
      },
      {
        id: 10,
        question: "What is the correct HTML for making a text bold?",
        options: ["<strong>", "<bold>", "<b>", "Both <strong> and <b>"],
        correctAnswer: "Both <strong> and <b>",
        explanation: "Both <strong> and <b> can make text bold, but <strong> has semantic meaning."
      }
    ],
    medium: [
      {
        id: 1,
        question: "What is the purpose of the DOCTYPE declaration?",
        options: [
          "Tells the browser which HTML version to use",
          "Links to CSS files",
          "Defines the document title",
          "Creates a comment"
        ],
        correctAnswer: "Tells the browser which HTML version to use",
        explanation: "DOCTYPE tells the browser which version of HTML the page is written in."
      },
      {
        id: 2,
        question: "What is the difference between <div> and <span>?",
        options: [
          "<div> is block-level, <span> is inline",
          "<span> is block-level, <div> is inline",
          "They are exactly the same",
          "<div> is deprecated"
        ],
        correctAnswer: "<div> is block-level, <span> is inline",
        explanation: "<div> is a block-level element that starts on a new line, <span> is inline."
      },
      {
        id: 3,
        question: "What is semantic HTML?",
        options: [
          "Using HTML tags that convey meaning",
          "HTML with better performance",
          "HTML that uses CSS",
          "Compressed HTML"
        ],
        correctAnswer: "Using HTML tags that convey meaning",
        explanation: "Semantic HTML uses tags like <article>, <nav>, <header> that clearly describe their content."
      },
      {
        id: 4,
        question: "What does the 'required' attribute do in a form?",
        options: [
          "Makes a field mandatory",
          "Hides the field",
          "Validates email format",
          "Disables the field"
        ],
        correctAnswer: "Makes a field mandatory",
        explanation: "The required attribute specifies that an input field must be filled out before submitting."
      },
      {
        id: 5,
        question: "What is the purpose of the <meta> tag?",
        options: [
          "Provides metadata about the HTML document",
          "Creates menus",
          "Defines paragraphs",
          "Links JavaScript files"
        ],
        correctAnswer: "Provides metadata about the HTML document",
        explanation: "Meta tags provide information about the HTML document like description, keywords, author, etc."
      }
    ],
    hard: [
      {
        id: 1,
        question: "What is the difference between localStorage and sessionStorage?",
        options: [
          "localStorage persists after browser close, sessionStorage doesn't",
          "sessionStorage is faster",
          "localStorage is encrypted",
          "They are exactly the same"
        ],
        correctAnswer: "localStorage persists after browser close, sessionStorage doesn't",
        explanation: "localStorage data persists even after closing the browser, sessionStorage is cleared when the tab closes."
      },
      {
        id: 2,
        question: "What are data attributes in HTML5?",
        options: [
          "Custom attributes prefixed with data-",
          "Attributes for databases",
          "Required form attributes",
          "Deprecated attributes"
        ],
        correctAnswer: "Custom attributes prefixed with data-",
        explanation: "Data attributes (data-*) allow you to store custom data on HTML elements."
      },
      {
        id: 3,
        question: "What is the purpose of the <canvas> element?",
        options: [
          "Draw graphics via JavaScript",
          "Display images",
          "Create animations automatically",
          "Embed videos"
        ],
        correctAnswer: "Draw graphics via JavaScript",
        explanation: "The <canvas> element is used to draw graphics on the fly via JavaScript."
      },
      {
        id: 4,
        question: "What is ARIA in HTML?",
        options: [
          "Accessibility features for assistive technologies",
          "A new HTML version",
          "Animation framework",
          "Audio recording interface"
        ],
        correctAnswer: "Accessibility features for assistive technologies",
        explanation: "ARIA (Accessible Rich Internet Applications) helps make web content more accessible to people with disabilities."
      },
      {
        id: 5,
        question: "What is the Shadow DOM?",
        options: [
          "Encapsulated DOM tree attached to an element",
          "Hidden elements in HTML",
          "Dark mode for websites",
          "A security feature"
        ],
        correctAnswer: "Encapsulated DOM tree attached to an element",
        explanation: "Shadow DOM provides encapsulation for DOM and CSS, allowing hidden DOM trees to be attached to elements."
      }
    ]
  },

  CSS: {
    easy: [
      {
        id: 1,
        question: "What does CSS stand for?",
        options: [
          "Cascading Style Sheets",
          "Computer Style Sheets",
          "Creative Style Sheets",
          "Colorful Style Sheets"
        ],
        correctAnswer: "Cascading Style Sheets",
        explanation: "CSS stands for Cascading Style Sheets, used to style HTML elements."
      },
      {
        id: 2,
        question: "Which property is used to change the text color?",
        options: ["color", "text-color", "font-color", "text-style"],
        correctAnswer: "color",
        explanation: "The color property is used to set the color of text."
      },
      {
        id: 3,
        question: "How do you make text bold in CSS?",
        options: [
          "font-weight: bold",
          "text-style: bold",
          "font-style: bold",
          "text-weight: bold"
        ],
        correctAnswer: "font-weight: bold",
        explanation: "The font-weight property with value 'bold' makes text bold."
      },
      {
        id: 4,
        question: "Which property is used to change the background color?",
        options: ["background-color", "bg-color", "color-background", "bgcolor"],
        correctAnswer: "background-color",
        explanation: "The background-color property sets the background color of an element."
      },
      {
        id: 5,
        question: "What is the correct CSS syntax for an ID selector?",
        options: ["#id", ".id", "id", "*id"],
        correctAnswer: "#id",
        explanation: "ID selectors use the hash (#) symbol followed by the ID name."
      },
      {
        id: 6,
        question: "Which property is used to change font size?",
        options: ["font-size", "text-size", "size", "font-style"],
        correctAnswer: "font-size",
        explanation: "The font-size property sets the size of text."
      },
      {
        id: 7,
        question: "How do you center text horizontally?",
        options: [
          "text-align: center",
          "align: center",
          "text-center: true",
          "horizontal-align: center"
        ],
        correctAnswer: "text-align: center",
        explanation: "The text-align: center property centers text horizontally within its container."
      },
      {
        id: 8,
        question: "Which property adds space inside an element's border?",
        options: ["padding", "margin", "spacing", "border-spacing"],
        correctAnswer: "padding",
        explanation: "Padding adds space inside an element's border, between the border and content."
      },
      {
        id: 9,
        question: "What does the 'display: none' property do?",
        options: [
          "Hides the element completely",
          "Makes element transparent",
          "Removes element border",
          "Minimizes the element"
        ],
        correctAnswer: "Hides the element completely",
        explanation: "display: none removes the element from the page layout entirely."
      },
      {
        id: 10,
        question: "Which property controls the space between lines of text?",
        options: ["line-height", "text-spacing", "line-spacing", "text-height"],
        correctAnswer: "line-height",
        explanation: "The line-height property sets the space between lines of text."
      }
    ],
    medium: [
      {
        id: 1,
        question: "What is the difference between padding and margin?",
        options: [
          "Padding is inside the border, margin is outside",
          "Margin is inside, padding is outside",
          "They are exactly the same",
          "Padding is for text only"
        ],
        correctAnswer: "Padding is inside the border, margin is outside",
        explanation: "Padding creates space inside an element's border, while margin creates space outside the border."
      },
      {
        id: 2,
        question: "What is the CSS box model?",
        options: [
          "Content, padding, border, and margin",
          "Only width and height",
          "Background and color",
          "Font and text properties"
        ],
        correctAnswer: "Content, padding, border, and margin",
        explanation: "The CSS box model consists of content, padding, border, and margin."
      },
      {
        id: 3,
        question: "What does 'position: relative' do?",
        options: [
          "Positions element relative to its normal position",
          "Positions element relative to viewport",
          "Positions element relative to parent",
          "Removes element from flow"
        ],
        correctAnswer: "Positions element relative to its normal position",
        explanation: "position: relative positions an element relative to where it would normally be."
      },
      {
        id: 4,
        question: "What is Flexbox used for?",
        options: [
          "Creating flexible layouts",
          "Making text flexible",
          "Flexible images",
          "Flexible animations"
        ],
        correctAnswer: "Creating flexible layouts",
        explanation: "Flexbox is a layout model that makes it easier to design flexible responsive layouts."
      },
      {
        id: 5,
        question: "What is the purpose of media queries?",
        options: [
          "Apply styles based on device characteristics",
          "Query databases",
          "Load media files",
          "Create animations"
        ],
        correctAnswer: "Apply styles based on device characteristics",
        explanation: "Media queries allow you to apply CSS styles based on device characteristics like screen size."
      },
      {
        id: 6,
        question: "What does 'z-index' control?",
        options: [
          "Stacking order of elements",
          "Zoom level",
          "Element size",
          "Text alignment"
        ],
        correctAnswer: "Stacking order of elements",
        explanation: "z-index controls the vertical stacking order of positioned elements."
      },
      {
        id: 7,
        question: "What is the difference between 'display: none' and 'visibility: hidden'?",
        options: [
          "display: none removes from layout, visibility: hidden keeps space",
          "They are exactly the same",
          "visibility: hidden removes from layout",
          "display: none is faster"
        ],
        correctAnswer: "display: none removes from layout, visibility: hidden keeps space",
        explanation: "display: none removes the element completely, visibility: hidden hides it but keeps its space."
      },
      {
        id: 8,
        question: "What does 'position: fixed' do?",
        options: [
          "Positions element relative to viewport",
          "Fixes broken CSS",
          "Locks element size",
          "Prevents scrolling"
        ],
        correctAnswer: "Positions element relative to viewport",
        explanation: "position: fixed positions an element relative to the viewport, staying in place when scrolling."
      },
      {
        id: 9,
        question: "What is a CSS pseudo-class?",
        options: [
          "A keyword added to selectors for special states",
          "A fake CSS class",
          "A JavaScript class",
          "An animated class"
        ],
        correctAnswer: "A keyword added to selectors for special states",
        explanation: "Pseudo-classes like :hover define special states of an element."
      },
      {
        id: 10,
        question: "What does 'overflow: hidden' do?",
        options: [
          "Hides content that overflows the element",
          "Hides the entire element",
          "Creates scrollbars",
          "Removes borders"
        ],
        correctAnswer: "Hides content that overflows the element",
        explanation: "overflow: hidden clips any content that overflows the element's box."
      }
    ],
    hard: [
      {
        id: 1,
        question: "What is CSS Grid used for?",
        options: [
          "Creating two-dimensional layouts",
          "Creating grids in images",
          "One-dimensional layouts only",
          "Table layouts only"
        ],
        correctAnswer: "Creating two-dimensional layouts",
        explanation: "CSS Grid is a two-dimensional layout system for creating complex responsive layouts."
      },
      {
        id: 2,
        question: "What are CSS variables (custom properties)?",
        options: [
          "Reusable values defined with --",
          "JavaScript variables",
          "HTML attributes",
          "Deprecated features"
        ],
        correctAnswer: "Reusable values defined with --",
        explanation: "CSS variables are custom properties defined with -- and used with var() function."
      },
      {
        id: 3,
        question: "What is the purpose of 'transform: translate()'?",
        options: [
          "Move element from its current position",
          "Rotate element",
          "Scale element",
          "Change element color"
        ],
        correctAnswer: "Move element from its current position",
        explanation: "translate() moves an element from its current position without affecting document flow."
      },
      {
        id: 4,
        question: "What is CSS specificity?",
        options: [
          "Determines which CSS rule is applied when multiple rules target same element",
          "How specific a selector name is",
          "CSS file size",
          "Loading speed"
        ],
        correctAnswer: "Determines which CSS rule is applied when multiple rules target same element",
        explanation: "Specificity determines which CSS rule applies when multiple rules could apply to an element."
      },
      {
        id: 5,
        question: "What is the purpose of 'will-change' property?",
        options: [
          "Optimize animations by hinting browser about changes",
          "Make elements changeable",
          "Prevent changes to elements",
          "Track property changes"
        ],
        correctAnswer: "Optimize animations by hinting browser about changes",
        explanation: "will-change hints to the browser about what properties will change, allowing optimization."
      }
    ]
  },

  Python: {
    easy: [
      {
        id: 1,
        question: "What is the correct way to create a variable in Python?",
        options: ["x = 5", "var x = 5", "int x = 5", "let x = 5"],
        correctAnswer: "x = 5",
        explanation: "Python uses simple assignment without type declaration: variable_name = value"
      },
      {
        id: 2,
        question: "Which function is used to output text in Python?",
        options: ["print()", "echo()", "console.log()", "write()"],
        correctAnswer: "print()",
        explanation: "The print() function is used to output text and values in Python."
      },
      {
        id: 3,
        question: "What symbol is used for comments in Python?",
        options: ["#", "//", "/*", "<!--"],
        correctAnswer: "#",
        explanation: "The hash (#) symbol is used for single-line comments in Python."
      },
      {
        id: 4,
        question: "What is the correct way to create a list in Python?",
        options: ["[1, 2, 3]", "{1, 2, 3}", "(1, 2, 3)", "<1, 2, 3>"],
        correctAnswer: "[1, 2, 3]",
        explanation: "Lists in Python are created using square brackets []."
      },
      {
        id: 5,
        question: "Which keyword is used to define a function in Python?",
        options: ["def", "function", "func", "define"],
        correctAnswer: "def",
        explanation: "The 'def' keyword is used to define functions in Python."
      }
    ],
    medium: [
      {
        id: 1,
        question: "What is the difference between a list and a tuple in Python?",
        options: [
          "Lists are mutable, tuples are immutable",
          "Tuples are mutable, lists are immutable",
          "They are exactly the same",
          "Lists are faster"
        ],
        correctAnswer: "Lists are mutable, tuples are immutable",
        explanation: "Lists can be modified after creation (mutable), while tuples cannot be changed (immutable)."
      },
      {
        id: 2,
        question: "What does the 'self' parameter represent in Python classes?",
        options: [
          "The instance of the class",
          "The class itself",
          "The parent class",
          "A global variable"
        ],
        correctAnswer: "The instance of the class",
        explanation: "In class methods, 'self' refers to the instance of the class."
      },
      {
        id: 3,
        question: "What is list comprehension in Python?",
        options: [
          "A concise way to create lists",
          "Understanding lists",
          "A type of loop",
          "A debugging tool"
        ],
        correctAnswer: "A concise way to create lists",
        explanation: "List comprehension provides a compact syntax for creating lists based on existing lists."
      },
      {
        id: 4,
        question: "What is the purpose of '__init__' method?",
        options: [
          "Initialize object attributes",
          "Start the program",
          "Import modules",
          "End the program"
        ],
        correctAnswer: "Initialize object attributes",
        explanation: "__init__ is the constructor method called when creating new objects from a class."
      },
      {
        id: 5,
        question: "What does 'with' statement do in Python?",
        options: [
          "Provides automatic resource management",
          "Creates loops",
          "Defines conditions",
          "Imports modules"
        ],
        correctAnswer: "Provides automatic resource management",
        explanation: "The 'with' statement ensures proper acquisition and release of resources."
      }
    ],
    hard: [
      {
        id: 1,
        question: "What are Python decorators?",
        options: [
          "Functions that modify other functions",
          "Comments for functions",
          "Function parameters",
          "Import statements"
        ],
        correctAnswer: "Functions that modify other functions",
        explanation: "Decorators are functions that modify the behavior of other functions or methods."
      },
      {
        id: 2,
        question: "What is a generator in Python?",
        options: [
          "A function that yields values one at a time",
          "A random number creator",
          "A class constructor",
          "A module importer"
        ],
        correctAnswer: "A function that yields values one at a time",
        explanation: "Generators are functions that use 'yield' to return values one at a time, maintaining state."
      },
      {
        id: 3,
        question: "What is the GIL in Python?",
        options: [
          "Global Interpreter Lock for thread safety",
          "General Input Library",
          "Graphic Interface Layer",
          "Generic Import Loader"
        ],
        correctAnswer: "Global Interpreter Lock for thread safety",
        explanation: "The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes simultaneously."
      },
      {
        id: 4,
        question: "What is the difference between '==' and 'is' in Python?",
        options: [
          "'==' compares values, 'is' compares object identity",
          "'is' compares values, '==' compares identity",
          "They are exactly the same",
          "'is' is faster always"
        ],
        correctAnswer: "'==' compares values, 'is' compares object identity",
        explanation: "'==' checks if values are equal, while 'is' checks if two variables refer to the same object in memory."
      },
      {
        id: 5,
        question: "What are metaclasses in Python?",
        options: [
          "Classes that create other classes",
          "Abstract classes",
          "Parent classes",
          "Utility classes"
        ],
        correctAnswer: "Classes that create other classes",
        explanation: "Metaclasses are classes whose instances are classes. They define how classes behave."
      }
    ]
  },

  "Node.js": {
    easy: [
      {
        id: 1,
        question: "What is Node.js?",
        options: [
          "JavaScript runtime built on Chrome's V8 engine",
          "A JavaScript framework",
          "A database",
          "A web browser"
        ],
        correctAnswer: "JavaScript runtime built on Chrome's V8 engine",
        explanation: "Node.js is a JavaScript runtime that allows you to run JavaScript on the server."
      },
      {
        id: 2,
        question: "What is npm?",
        options: [
          "Node Package Manager",
          "New Programming Method",
          "Node Programming Module",
          "Network Package Manager"
        ],
        correctAnswer: "Node Package Manager",
        explanation: "npm is the default package manager for Node.js."
      },
      {
        id: 3,
        question: "Which command installs a package globally?",
        options: ["npm install -g package", "npm install package", "npm global package", "npm add package"],
        correctAnswer: "npm install -g package",
        explanation: "The -g flag installs packages globally, making them available system-wide."
      },
      {
        id: 4,
        question: "What file contains Node.js project metadata?",
        options: ["package.json", "node.json", "config.json", "meta.json"],
        correctAnswer: "package.json",
        explanation: "package.json contains metadata about the project and its dependencies."
      },
      {
        id: 5,
        question: "How do you import a module in Node.js?",
        options: ["require('module')", "import 'module'", "include('module')", "use('module')"],
        correctAnswer: "require('module')",
        explanation: "The require() function is used to import modules in Node.js."
      }
    ],
    medium: [
      {
        id: 1,
        question: "What is the Event Loop in Node.js?",
        options: [
          "Handles asynchronous callbacks",
          "A loop for events only",
          "A debugging tool",
          "A security feature"
        ],
        correctAnswer: "Handles asynchronous callbacks",
        explanation: "The Event Loop handles asynchronous operations in Node.js, allowing non-blocking I/O."
      },
      {
        id: 2,
        question: "What is middleware in Express.js?",
        options: [
          "Functions that execute during request-response cycle",
          "The middle part of code",
          "Database connections",
          "Static files"
        ],
        correctAnswer: "Functions that execute during request-response cycle",
        explanation: "Middleware functions have access to request and response objects and can modify them."
      },
      {
        id: 3,
        question: "What is the purpose of process.env?",
        options: [
          "Access environment variables",
          "Process environmental data",
          "Environment monitoring",
          "Process management"
        ],
        correctAnswer: "Access environment variables",
        explanation: "process.env provides access to environment variables in Node.js."
      },
      {
        id: 4,
        question: "What is a callback function in Node.js?",
        options: [
          "A function passed as argument to be called later",
          "A function that calls back the server",
          "A recursive function",
          "A synchronous function"
        ],
        correctAnswer: "A function passed as argument to be called later",
        explanation: "Callbacks are functions passed as arguments to be executed when an async operation completes."
      },
      {
        id: 5,
        question: "What does 'npm start' do?",
        options: [
          "Runs the start script defined in package.json",
          "Starts the npm service",
          "Initializes a new project",
          "Starts the Node.js installer"
        ],
        correctAnswer: "Runs the start script defined in package.json",
        explanation: "npm start executes the script defined under 'start' in package.json scripts."
      }
    ],
    hard: [
      {
        id: 1,
        question: "What is clustering in Node.js?",
        options: [
          "Running multiple Node processes to handle load",
          "Grouping related code",
          "Database sharding",
          "Code minification"
        ],
        correctAnswer: "Running multiple Node processes to handle load",
        explanation: "Clustering allows you to create child processes (workers) that share server ports."
      },
      {
        id: 2,
        question: "What is the difference between setImmediate() and process.nextTick()?",
        options: [
          "nextTick() executes before I/O, setImmediate() after",
          "They are exactly the same",
          "setImmediate() is faster",
          "nextTick() is deprecated"
        ],
        correctAnswer: "nextTick() executes before I/O, setImmediate() after",
        explanation: "process.nextTick() callbacks are executed before I/O operations, setImmediate() callbacks are executed after."
      },
      {
        id: 3,
        question: "What are Streams in Node.js?",
        options: [
          "Objects for handling data in chunks",
          "Live video feeds",
          "Continuous loops",
          "Network connections"
        ],
        correctAnswer: "Objects for handling data in chunks",
        explanation: "Streams are objects that let you read or write data in chunks, efficiently handling large amounts of data."
      },
      {
        id: 4,
        question: "What is the purpose of Buffer in Node.js?",
        options: [
          "Handle binary data",
          "Buffer network requests",
          "Store temporary variables",
          "Cache responses"
        ],
        correctAnswer: "Handle binary data",
        explanation: "Buffers provide a way to work with binary data directly in Node.js."
      },
      {
        id: 5,
        question: "What is worker_threads module used for?",
        options: [
          "Run JavaScript in parallel threads",
          "Manage worker processes",
          "Thread synchronization",
          "Network threading"
        ],
        correctAnswer: "Run JavaScript in parallel threads",
        explanation: "worker_threads allows running JavaScript code in parallel threads for CPU-intensive operations."
      }
    ]
  }
};

// Function to get random questions
export function getRandomQuestions(topic, difficulty, count) {
  const topicQuestions = quizBank[topic];
  if (!topicQuestions) {
    return [];
  }

  const difficultyQuestions = topicQuestions[difficulty];
  if (!difficultyQuestions || difficultyQuestions.length === 0) {
    return [];
  }

  // Shuffle and return requested number of questions
  const shuffled = [...difficultyQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Function to get questions by marks (for specific marking schemes)
export function getQuestionsByMarks(topic, difficulty, totalMarks, marksPerQuestion) {
  const questionCount = Math.floor(totalMarks / marksPerQuestion);
  return getRandomQuestions(topic, difficulty, questionCount);
}
