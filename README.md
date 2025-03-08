# LLM Chat UI

A modern chat interface for Large Language Models (LLMs) built with React, TypeScript, and Vite.

![img.png](img.png)

## Features

- Clean and intuitive chat interface
- Model selection capability
- Real-time chat interactions
- Markdown support with syntax highlighting
- Settings configuration through modal window
- Responsive sidebar for chat management

## Tech Stack

- React 19
- TypeScript
- Vite 6
- Markdown rendering with markdown-to-jsx
- Syntax highlighting via starry-night
- Modern ESLint configuration

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/valaises/llm-chat.git
cd llm-chatui
```

2. Install dependencies:
```bash
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

This will start the Vite development server with hot module replacement.

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

The project is organized into several key directories:

- **src/**: Contains the main application code, including components, hooks, and utilities.
- **public/**: Holds static assets such as images and the main HTML file.
- **tests/**: Includes unit and integration tests for the application.
- **dist/**: The output directory for production builds.
- **.github/**: Contains GitHub-specific files, including workflows for CI/CD.
