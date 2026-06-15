# Food Waste AI - Documentation Site

A comprehensive documentation website for the Food Waste AI system. Built with React, Vite, and Tailwind CSS.

## Overview

This documentation site includes:
- Complete system documentation
- Getting started guide
- Setup instructions
- API reference
- FAQ section

## Features

- 📱 Responsive design
- 🔐 Firebase authentication
- 📚 Multiple documentation pages
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast development with Vite
- 🔄 Real-time updates

## Prerequisites

- Node.js v16 or higher
- npm or yarn
- Firebase account

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file with your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Start Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run server` - Start backend server (requires separate setup)

## Documentation Sections

### Dashboard
- Overview of the Food Waste AI system
- Key features and capabilities
- System architecture

### Getting Started
- Prerequisites
- 5-minute setup guide
- First steps and common issues

### Setup Guide
- Backend configuration
- Frontend setup
- Firebase configuration
- Database schema

### API Reference
- Authentication endpoints
- Predictions endpoints
- Recommendations endpoints
- Error codes

### FAQ
- Common questions
- Technical details
- Support information

## Project Structure

```
docs/
├── public/              # Static assets
├── src/
│   ├── pages/          # Documentation pages
│   ├── App.jsx         # Main app component
│   ├── api.js          # API client
│   ├── firebase.js     # Firebase config
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point
├── server/             # Backend server
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
└── index.html          # HTML template
```

## Authentication

The documentation site uses Firebase Authentication. Users must sign in with email and password to access the documentation.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `PORT` | Backend server port (default: 5000) |

## Support

For issues or questions, please refer to the documentation or contact support.

## License

This project is part of the Food Waste AI system.
