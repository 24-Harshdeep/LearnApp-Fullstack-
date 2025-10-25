import { useState, useRef, useEffect } from 'react'
import { Play, Copy, Check, RotateCcw, X } from 'lucide-react'

const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'auto', // 'auto' for automatic detection
  height = '400px',
  readOnly = false,
  showRunButton = true,
  placeholder = ''
}) => {
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState('html') // Default to HTML
  const [htmlPreview, setHtmlPreview] = useState('') // For HTML preview
  const textareaRef = useRef(null)

  // Get dynamic placeholder based on detected language
  const getPlaceholder = () => {
    if (placeholder) return placeholder
    
    const placeholders = {
      html: '<!-- Write your HTML here... Type ! and press Enter for boilerplate -->',
      css: '/* Write your CSS styles here... */',
      javascript: '// Write your JavaScript code here...',
      jsx: '// Write your React JSX code here...'
    }
    return placeholders[currentLanguage] || '// Write your code here...'
  }

  // Auto-detect language based on code content
  const detectLanguage = (code) => {
    // Default to HTML when editor is empty
    if (!code || !code.trim()) return 'html'
    
    // Check for JSX/React patterns
    const hasJSXTags = /<[A-Z][a-zA-Z0-9]*/.test(code) || // React components like <MyComponent>
                       /return\s*\(?\s*</.test(code) ||    // return (<div>
                       /=>\s*</.test(code)                  // arrow function returning JSX
    
    const hasReactKeywords = /\b(useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef|React|Component|props|setState)\b/.test(code)
    const hasFunctionComponent = /function\s+[A-Z][a-zA-Z0-9]*\s*\(/.test(code) || /const\s+[A-Z][a-zA-Z0-9]*\s*=/.test(code)
    
    // Check for JavaScript patterns
    const hasJSKeywords = /\b(function|const|let|var|class|import|export|require|console\.log|if|else|for|while|return)\b/.test(code)
    const hasArrowFunction = /=>\s*[{(]/.test(code) || /\(\s*\)\s*=>/.test(code)
    
    // Check for HTML (DOCTYPE, html tag, or multiple HTML elements)
    const hasHTMLDoctype = /<!DOCTYPE html>/i.test(code)
    const hasHTMLStructure = /<html/i.test(code) || /<head/i.test(code) || /<body/i.test(code)
    const hasHTMLTags = /<[a-z]+[^>]*>/.test(code) || /<\/[a-z]+>/.test(code)
    
    // Check for CSS
    const hasCSSSyntax = /[.#]?[a-zA-Z-_]+\s*{[^}]*}/.test(code) // selector { properties }
    const hasCSSProperties = /[a-z-]+\s*:\s*[^;]+;/.test(code)
    const isOnlyCSS = hasCSSSyntax && !hasHTMLTags && !hasJSKeywords
    
    // Determine language priority
    if (hasHTMLDoctype || hasHTMLStructure) return 'html'
    if (isOnlyCSS || (hasCSSProperties && hasCSSSyntax && !hasHTMLTags && !hasJSKeywords)) return 'css'
    
    // If has React keywords or JSX patterns, it's React
    if (hasReactKeywords || (hasJSXTags && hasFunctionComponent)) return 'jsx'
    
    // If has JavaScript keywords or functions without HTML tags, it's JavaScript
    if ((hasJSKeywords || hasArrowFunction) && !hasHTMLTags) return 'javascript'
    
    // If has HTML tags but no JS keywords, it's HTML
    if (hasHTMLTags && !hasJSKeywords && !hasReactKeywords) return 'html'
    
    // Default to HTML (user is likely starting to write HTML)
    return 'html'
  }

  // Update detected language when code changes
  useEffect(() => {
    if (language === 'auto') {
      const detected = detectLanguage(value)
      setDetectedLanguage(detected)
    } else {
      setDetectedLanguage(language)
    }
  }, [value, language])

  // Use detected language for all operations
  const currentLanguage = language === 'auto' ? detectedLanguage : language

  // Clear output when code changes (optional - auto-clear old errors)
  useEffect(() => {
    // Only auto-clear if there's an error message
    if (output && output.includes('❌')) {
      const timer = setTimeout(() => {
        // Clear error after 10 seconds of code change
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [value, output])

  // Syntax highlighting patterns
  const highlightCode = (code) => {
    if (!code) return placeholder

    let highlighted = code
    
    // JavaScript/React syntax highlighting
    if (currentLanguage === 'javascript' || currentLanguage === 'jsx') {
      // Keywords
      highlighted = highlighted.replace(
        /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|new|this|super|extends|async|await|try|catch|throw|typeof|instanceof|in|of|break|continue|switch|case|do)\b/g,
        '<span class="text-purple-400 font-semibold">$1</span>'
      )
      
      // Strings
      highlighted = highlighted.replace(
        /(["'`])(.*?)\1/g,
        '<span class="text-green-400">$1$2$1</span>'
      )
      
      // Numbers
      highlighted = highlighted.replace(
        /\b(\d+)\b/g,
        '<span class="text-blue-400">$1</span>'
      )
      
      // Comments
      highlighted = highlighted.replace(
        /(\/\/.*$)/gm,
        '<span class="text-gray-500 italic">$1</span>'
      )
      
      // Function names
      highlighted = highlighted.replace(
        /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
        '<span class="text-yellow-400">$1</span>('
      )
    }
    
    // HTML syntax highlighting
    if (currentLanguage === 'html') {
      // Tags
      highlighted = highlighted.replace(
        /(&lt;\/?)([a-zA-Z0-9]+)(.*?)(&gt;)/g,
        '$1<span class="text-blue-400">$2</span>$3$4'
      )
      
      // Attributes
      highlighted = highlighted.replace(
        /\s([a-zA-Z-]+)=/g,
        ' <span class="text-purple-400">$1</span>='
      )
    }
    
    // CSS syntax highlighting
    if (currentLanguage === 'css') {
      // Properties
      highlighted = highlighted.replace(
        /([a-zA-Z-]+):/g,
        '<span class="text-blue-400">$1</span>:'
      )
      
      // Values
      highlighted = highlighted.replace(
        /:\s*([^;]+);/g,
        ': <span class="text-green-400">$1</span>;'
      )
      
      // Selectors
      highlighted = highlighted.replace(
        /^([.#]?[a-zA-Z0-9_-]+)\s*{/gm,
        '<span class="text-yellow-400">$1</span> {'
      )
    }
    
    return highlighted
  }

  const handleRun = () => {
    if (isRunning) return
    
    setIsRunning(true)
    setOutput('')
    
    // Small delay to show the running state
    setTimeout(() => {
      try {
        // Check if code is empty
        if (!value.trim()) {
          setOutput('⚠️ Please write some code first!')
          setIsRunning(false)
          return
        }

        // Handle different languages differently
        if (currentLanguage === 'html') {
          // HTML Preview - render in iframe
          setHtmlPreview(value)
          setOutput('📄 HTML Preview (rendered below)')
          setIsRunning(false)
          return
        }

        if (currentLanguage === 'css') {
          // CSS Preview - show with sample HTML
          const cssPreviewHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    ${value}
  </style>
</head>
<body>
  <div class="container">
    <h1>CSS Preview</h1>
    <p>This is a sample paragraph to show your CSS styles.</p>
    <button>Sample Button</button>
  </div>
</body>
</html>
          `
          setHtmlPreview(cssPreviewHTML)
          setOutput('🎨 CSS Preview (applied to sample HTML below)')
          setIsRunning(false)
          return
        }

        if (currentLanguage === 'jsx') {
          // JSX/React handling - Try to execute as JavaScript (ignoring JSX tags)
          setHtmlPreview('')
          
          // Try to extract and execute JavaScript logic from JSX
          const logs = []
          const originalLog = console.log
          const originalError = console.error
          const originalWarn = console.warn
          
          // Override console methods temporarily
          console.log = (...args) => {
            logs.push('📝 ' + args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '))
          }
          
          console.error = (...args) => {
            logs.push('❌ Error: ' + args.map(arg => String(arg)).join(' '))
          }
          
          console.warn = (...args) => {
            logs.push('⚠️ Warning: ' + args.map(arg => String(arg)).join(' '))
          }
          
          let result
          try {
            // Try to execute - will work for function definitions, hooks, etc.
            // eslint-disable-next-line no-eval
            result = eval(value)
          } catch (evalError) {
            // Restore console methods
            console.log = originalLog
            console.error = originalError
            console.warn = originalWarn
            
            // Show info message for JSX that can't execute
            setOutput(`⚛️ React JSX Code\n\n${evalError.message}\n\nThis JSX code needs a React environment to render. However:\n• Function definitions and hooks are valid\n• Try calling the function to see output\n• Use console.log() to debug\n\n💡 Tip: To see this rendered, use CodeSandbox or a React app.`)
            setIsRunning(false)
            return
          }
          
          // Restore console methods
          console.log = originalLog
          console.error = originalError
          console.warn = originalWarn
          
          // Display output
          if (logs.length > 0) {
            setOutput(logs.join('\n'))
          } else if (result !== undefined) {
            setOutput(`✅ Result: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`)
          } else {
            setOutput('⚛️ React component defined!\n\n💡 This is a React component. To see it render:\n• Use a React environment\n• Or call the function to see what it returns')
          }
          
          setIsRunning(false)
          return
        }

        // JavaScript execution (only for currentLanguage === 'javascript')
        if (currentLanguage === 'javascript') {
          // Clear HTML preview for JavaScript
          setHtmlPreview('')
          // Capture console.log output
          const logs = []
          const originalLog = console.log
          const originalError = console.error
          const originalWarn = console.warn
          
          // Override console methods temporarily
          console.log = (...args) => {
            logs.push('📝 ' + args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '))
          }
          
          console.error = (...args) => {
            logs.push('❌ Error: ' + args.map(arg => String(arg)).join(' '))
          }
          
          console.warn = (...args) => {
            logs.push('⚠️ Warning: ' + args.map(arg => String(arg)).join(' '))
          }
          
          // Execute code
          let result
          try {
            // eslint-disable-next-line no-eval
            result = eval(value)
          } catch (evalError) {
            // Restore console methods
            console.log = originalLog
            console.error = originalError
            console.warn = originalWarn
            
            setOutput(`❌ Error: ${evalError.message}\n\n💡 Tip: Make sure your JavaScript syntax is correct.`)
            setIsRunning(false)
            return
          }
          
          // Restore console methods
          console.log = originalLog
          console.error = originalError
          console.warn = originalWarn
          
          // Display output
          if (logs.length > 0) {
            setOutput(logs.join('\n'))
          } else if (result !== undefined) {
            setOutput(`✅ Result: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`)
          } else {
            setOutput('✅ Code executed successfully!\n\n💡 No output to display. Try using console.log() to see values.')
          }
          
          setIsRunning(false)
        } else {
          // Unknown language
          setOutput('⚠️ Language not supported for execution.')
          setIsRunning(false)
        }
      } catch (error) {
        setOutput(`❌ Unexpected error: ${error.message}`)
        setIsRunning(false)
      }
    }, 300)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    onChange('')
    setOutput('')
    setHtmlPreview('')
  }

  const handleKeyDown = (e) => {
    // Tab key support
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      
      // Set cursor position after tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2
      }, 0)
    }

    // HTML boilerplate shortcut: ! + Enter
    if (e.key === 'Enter' && currentLanguage === 'html') {
      const cursorPosition = e.target.selectionStart
      const textBeforeCursor = value.substring(0, cursorPosition)
      const lastLine = textBeforeCursor.split('\n').pop()
      
      if (lastLine.trim() === '!') {
        e.preventDefault()
        
        const boilerplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>`
        
        // Replace the ! with boilerplate
        const before = value.substring(0, cursorPosition - 1)
        const after = value.substring(cursorPosition)
        onChange(before + boilerplate + after)
        
        // Position cursor inside body tag
        setTimeout(() => {
          const bodyPosition = before.length + boilerplate.indexOf('<body>') + 9
          e.target.selectionStart = e.target.selectionEnd = bodyPosition
          e.target.focus()
        }, 0)
      }
    }
  }

  const getLanguageLabel = () => {
    const labels = {
      javascript: 'JavaScript',
      jsx: 'React JSX',
      html: 'HTML',
      css: 'CSS',
      python: 'Python'
    }
    const lang = language === 'auto' ? `${labels[currentLanguage] || currentLanguage.toUpperCase()} (auto)` : labels[currentLanguage] || currentLanguage.toUpperCase()
    return lang
  }

  const getRunButtonLabel = () => {
    if (currentLanguage === 'html') return 'Preview'
    if (currentLanguage === 'css') return 'Preview'
    if (currentLanguage === 'jsx') return 'Info'
    return 'Run'
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
      {/* Editor Header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm text-gray-400 ml-2">{getLanguageLabel()}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          {showRunButton && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`px-3 py-1 ${isRunning ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg text-sm flex items-center gap-1.5 transition-colors disabled:cursor-not-allowed`}
              title={`${getRunButtonLabel()} code`}
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
              {isRunning ? 'Loading...' : getRunButtonLabel()}
            </button>
          )}
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          readOnly={readOnly}
          spellCheck="false"
          className="w-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
          style={{ 
            height,
            lineHeight: '1.5',
            tabSize: 2,
          }}
        />
        
        {/* Line numbers (optional enhancement) */}
        <div className="absolute top-0 left-0 p-4 text-gray-600 font-mono text-sm pointer-events-none select-none">
          {value.split('\n').map((_, i) => (
            <div key={i} style={{ lineHeight: '1.5' }}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Output Console */}
      {output && (
        <div className="border-t border-gray-700 bg-gray-950">
          <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400 font-semibold flex items-center justify-between">
            <span>OUTPUT</span>
            <button
              onClick={() => {
                setOutput('')
                setHtmlPreview('')
              }}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="Clear output"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <pre className="p-4 text-sm font-mono text-gray-100 overflow-x-auto whitespace-pre-wrap bg-gray-900">
            {output}
          </pre>
        </div>
      )}

      {/* HTML/CSS Preview */}
      {htmlPreview && (
        <div className="border-t border-gray-700 bg-white">
          <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400 font-semibold flex items-center justify-between">
            <span>LIVE PREVIEW</span>
            <button
              onClick={() => setHtmlPreview('')}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white p-4">
            <iframe
              srcDoc={htmlPreview}
              title="HTML Preview"
              sandbox="allow-scripts"
              className="w-full border border-gray-300 rounded bg-white"
              style={{ minHeight: '300px', height: 'auto' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeEditor
