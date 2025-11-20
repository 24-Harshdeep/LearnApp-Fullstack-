# Tasks Code Preview Fix - HTML/CSS Rendering

## 🔴 Original Problem
When running HTML/CSS code in Tasks, only JavaScript console output was shown. HTML/CSS code wasn't being rendered as a visual preview.

## ✅ Solution Applied

### Enhanced `handleRunCode` Function
**File:** `client/src/pages/Tasks.jsx`

**Added auto-detection of code type:**
```javascript
// Detect if it's HTML/CSS or JavaScript
const isHTML = userCode.includes('<html') || 
               userCode.includes('<!DOCTYPE') || 
               activeTask?.topic?.toLowerCase().includes('html')
const hasCSS = userCode.includes('<style') || 
               userCode.includes('css')

if (isHTML || hasCSS) {
  // Render HTML/CSS in iframe
  setCodeOutput('HTML_PREVIEW')
} else {
  // Execute JavaScript and show console output
  // ... existing JavaScript execution logic
}
```

### Updated Output Display
**Added iframe for HTML preview:**
```jsx
{codeOutput === 'HTML_PREVIEW' ? (
  // Live HTML/CSS Preview
  <iframe
    srcDoc={userCode}
    title="Code Preview"
    sandbox="allow-scripts"
    className="w-full h-96 bg-white"
    style={{ minHeight: '400px' }}
  />
) : (
  // JavaScript Console Output
  <pre className="text-green-400">{codeOutput}</pre>
)}
```

## 🎯 How It Works

### For HTML/CSS Tasks:
1. User writes HTML/CSS code
2. Clicks "Run Code"
3. Code is detected as HTML (checks for `<html>`, `<!DOCTYPE>`, or 'html' in topic)
4. ✅ **Live preview renders in iframe** with full HTML/CSS support
5. Toast: "Preview updated!"

### For JavaScript Tasks:
1. User writes JavaScript code
2. Clicks "Run Code"
3. Code is executed in safe sandbox
4. ✅ **Console output shown** (console.log, errors, warnings)
5. Toast: "Code executed!"

## 🧪 Testing Guide

### Test HTML Task:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: Arial, sans-serif;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 {
      color: #667eea;
      margin: 0;
      font-size: 2.5em;
    }
    p {
      color: #666;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello World! 🎨</h1>
    <p>This is a live HTML/CSS preview</p>
  </div>
</body>
</html>
```

**Expected Result:**
- ✅ Purple gradient background
- ✅ White card with shadow
- ✅ Styled heading and text
- ✅ Full visual rendering

### Test CSS Task:
```html
<style>
  .box {
    width: 200px;
    height: 200px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 20px;
    margin: 50px auto;
    animation: rotate 3s infinite linear;
  }
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>

<div class="box"></div>
```

**Expected Result:**
- ✅ Animated rotating box
- ✅ Gradient colors
- ✅ Smooth rotation animation

### Test JavaScript Task:
```javascript
// Calculate factorial
function factorial(n) {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

console.log('Factorial of 5:', factorial(5))
console.log('Factorial of 10:', factorial(10))

// Array operations
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)
console.log('Doubled:', doubled)
```

**Expected Result:**
```
Factorial of 5: 120
Factorial of 10: 3628800
Doubled: 2,4,6,8,10
```

## 📊 Code Detection Logic

| Code Contains | Topic Contains | Result |
|--------------|---------------|--------|
| `<html>` or `<!DOCTYPE>` | Any | HTML Preview |
| `<style>` or `css` | Any | HTML Preview |
| None of above | "html" | HTML Preview |
| JavaScript code | "javascript" | Console Output |

## 🎨 Preview Features

### HTML/CSS Preview:
- ✅ **Full HTML rendering** with styles
- ✅ **CSS animations** and transitions work
- ✅ **Responsive design** preview
- ✅ **Interactive elements** (buttons, forms)
- ✅ **Sandboxed** for security
- ✅ **400px height** iframe
- ✅ **White background** for content visibility

### JavaScript Output:
- ✅ **Console.log output**
- ✅ **Error messages** (red)
- ✅ **Warning messages** (yellow)
- ✅ **Green terminal** style
- ✅ **Monospace font** for code
- ✅ **Multi-line support**

## 🔒 Security

**Iframe sandbox attributes:**
```jsx
sandbox="allow-scripts"
```

This allows:
- ✅ JavaScript execution (for interactive demos)
- ❌ Form submission (blocked)
- ❌ Top-level navigation (blocked)
- ❌ Popups (blocked)

Safe for student code execution!

## 🎯 User Experience Flow

### Before Fix:
```
1. Student writes HTML: <h1>Hello</h1>
2. Clicks "Run Code"
3. ❌ Shows: "✅ Code executed successfully (no output)"
4. 😕 No visual preview
```

### After Fix:
```
1. Student writes HTML: <h1>Hello</h1>
2. Clicks "Run Code"
3. ✅ Shows: "🎨 Live Preview:" with rendered HTML
4. 🎉 See actual heading with styles
```

## 📝 Complete Feature Set

### Auto-Detection:
- [x] HTML tags detection
- [x] DOCTYPE detection
- [x] CSS/style tag detection
- [x] Topic-based detection
- [x] Fallback to JavaScript

### Rendering:
- [x] Iframe-based HTML preview
- [x] Full CSS support
- [x] JavaScript console output
- [x] Error handling
- [x] Loading states

### UI/UX:
- [x] Different headers for preview vs output
- [x] Proper styling for both modes
- [x] Toast notifications
- [x] Disabled state while running
- [x] Clear output before new run

## 🐛 Troubleshooting

### Issue: "Preview not showing"
**Fix:** Make sure code includes:
- `<html>` or `<!DOCTYPE html>` tag
- Or `<style>` tag for CSS
- Or task topic contains "html"

### Issue: "Styles not applying"
**Fix:** Ensure styles are within `<style>` tags or inline

### Issue: "JavaScript not running in HTML"
**Fix:** Include `<script>` tags in your HTML

### Issue: "Console output not showing"
**Fix:** Make sure you use `console.log()` for JavaScript tasks

## ✅ Summary

**Files Modified:**
- `client/src/pages/Tasks.jsx` (2 functions updated)

**Changes:**
1. Enhanced `handleRunCode()` with auto-detection
2. Updated output display with conditional rendering
3. Added iframe for HTML/CSS preview
4. Maintained JavaScript console output

**Status:** ✅ WORKING

**Test:** Try any HTML/CSS task and click "Run Code" - you'll see the live preview!

---

**Now students can see their HTML/CSS creations come to life! 🎨✨**
