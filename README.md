# GrammarCheck

A simple desktop app that fixes grammar, spelling, and punctuation. With just an input field and a "Check" button, it leverages AI to correct your text and explain the changes.

## Features

- **Simple Interface**: Clean, distraction-free UI with an input field and a single "Check" button
- **AI-Powered Corrections**: Uses Gemini API to intelligently fix grammar, spelling, and punctuation errors
- **Explanations**: Get detailed explanations for each correction made
- **Cross-Platform**: Available for macOS, Linux, and Windows
- **Lightweight**: Fast and efficient desktop application built with Electron

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd grammarcheck
```

2. Install dependencies:
```bash
npm install
```

3. Configure your Gemini API key:
   - Create or update your configuration to include your Gemini API key

## Usage

### Development Mode

Run the app in development mode:
```bash
npm start
```

### Building

Build the app for your platform:

**macOS:**
```bash
npm run build:mac
```

**Linux:**
```bash
npm run build:linux
```

**Windows:**
```bash
npm run build:win
```

**All platforms:**
```bash
npm run build
```

Built applications will be available in the `dist` folder.

## How It Works

1. Enter or paste your text into the input field
2. Click the "Check" button
3. Review the corrected text and explanations for each change
4. Use the improved text in your work

## Tech Stack

- **Electron**: Cross-platform desktop application framework
- **Gemini API**: AI-powered grammar and spelling correction
- **JavaScript**: Core application logic
- **HTML/CSS**: User interface

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
