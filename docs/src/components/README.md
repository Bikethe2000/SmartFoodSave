# Components Documentation

This directory contains reusable React components for the Food Waste AI documentation site.

## Available Components

### CodeBlock
A syntax-highlighted code block with copy-to-clipboard functionality.

**Props:**
- `code` (string): The code to display
- `language` (string): Programming language for syntax highlighting (bash, json, env, etc.)

**Usage:**
```jsx
<CodeBlock code={`npm install`} language="bash" />
```

### Alert
A styled alert component for displaying important information.

**Props:**
- `type` (string): Alert type - 'info', 'warning', 'error', 'success'
- `title` (string): Optional alert title
- `children` (React.ReactNode): Alert content

**Usage:**
```jsx
<Alert type="success" title="Success!">
  Your setup is complete.
</Alert>
```

### TableOfContents
A sticky table of contents that highlights the currently viewed section.

**Props:**
- `headings` (array): Array of heading objects with `id`, `text`, and `level` properties

**Usage:**
```jsx
<TableOfContents headings={[
  { id: 'section1', text: 'Section 1', level: 2 },
  { id: 'section2', text: 'Section 2', level: 2 }
]} />
```

## Features

- ✨ Dark mode support
- 📱 Mobile responsive
- ⚡ Fast performance
- ♿ Accessible
- 🎨 Tailwind CSS styling
