# Lemur AI - Landing Page

A modern, responsive landing page for Lemur AI, an AI-powered business automation platform for IT consulting firms.

## Prerequisites

Before you begin, you need to install Node.js on your computer.

### Installing Node.js

#### Option 1: Download from Website (Recommended for Beginners)
1. Go to https://nodejs.org/
2. Download the LTS (Long Term Support) version for your operating system
3. Run the installer and follow the installation steps
4. Restart your computer after installation

#### Option 2: Using Terminal Commands

**For Windows (using Chocolatey):**
First install Chocolatey package manager, then:
```bash
choco install nodejs
```

**For macOS (using Homebrew):**
First install Homebrew package manager, then:
```bash
brew install node
```

**For Ubuntu/Debian Linux:**
```bash
sudo apt update
sudo apt install nodejs npm
```

**For CentOS/RHEL/Fedora Linux:**
```bash
sudo dnf install nodejs npm
```

### Opening Terminal/Command Prompt

**Windows:**
- Press `Windows + R`, type `cmd`, press Enter
- Or search "Command Prompt" in Start menu

**macOS:**
- Press `Cmd + Space`, type "Terminal", press Enter
- Or go to Applications > Utilities > Terminal

**Linux:**
- Press `Ctrl + Alt + T`
- Or search "Terminal" in your applications

### Verify Installation

Open your terminal or command prompt and run:

```bash
node --version
npm --version
```

You should see version numbers for both commands (e.g., v18.17.0 and 9.6.7).

## Getting Started

### Step 1: Download the Project

1. Download the project files to your computer
2. Extract the files if they are in a zip folder
3. Open your terminal or command prompt
4. Navigate to the project folder:

```bash
cd path/to/project
```

### Step 2: Install Dependencies

Run this command to install all required packages:

```bash
npm install
```

This will download all the necessary files the project needs to run.

### Step 3: Start the Development Server

Run this command to start the project:

```bash
npm run dev
```

### Step 4: View the Website

1. After running the command, you will see a message like:
   ```
   Local:   http://localhost:5173/
   ```
2. Open your web browser
3. Go to http://localhost:5173/
4. You should see the Lemur AI landing page

## Making Changes

1. Keep the terminal running with `npm run dev`
2. Open the project files in a code editor
3. Make your changes to the files
4. Save the files
5. The website will automatically update in your browser

## Stopping the Server

To stop the development server:
- Press `Ctrl + C` in the terminal (Windows/Linux)
- Press `Cmd + C` in the terminal (Mac)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Main pages (LandingPage.tsx)
├── stores/        # State management
├── utils/         # Helper functions
└── styles/        # CSS and styling files
```

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

### Common Issues

**Error: "command not found: npm"**
- Node.js is not installed or not in your PATH
- Reinstall Node.js from nodejs.org

**Error: "Cannot find module"**
- Run `npm install` to install dependencies

**Port already in use**
- Another application is using port 5173
- Close other development servers or use a different port

**Changes not showing**
- Make sure you saved the file
- Check the terminal for error messages
- Try refreshing the browser

### Getting Help

If you encounter issues:
1. Check the terminal for error messages
2. Make sure all files are saved
3. Try stopping the server (Ctrl+C) and running `npm run dev` again
4. Ensure you're in the correct project directory

## Technologies Used

- React - JavaScript library for building user interfaces
- TypeScript - Typed JavaScript for better development
- Vite - Fast build tool and development server
- Tailwind CSS - Utility-first CSS framework
- Framer Motion - Animation library

## Browser Support

This project works best in modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Next Steps

Once you have the project running:
1. Explore the code in the `src` folder
2. Try making small changes to see how they affect the website
3. Read the component files to understand how they work
4. Experiment with the styling and content
