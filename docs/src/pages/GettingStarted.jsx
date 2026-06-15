import React from 'react';
import { Zap } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import Alert from '../components/Alert';

export default function GettingStarted() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={32} />
          <h1 className="text-4xl font-bold">Getting Started</h1>
        </div>
        <p className="text-lg text-green-100">
          Quick start guide to set up Food Waste AI
        </p>
      </div>

      <div className="prose prose-slate max-w-none doc-content space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-900">Prerequisites</h2>
          <p className="text-slate-700">Before you begin, ensure you have:</p>
          <ul className="space-y-2 text-slate-700 ml-6">
            <li>Node.js (v16 or higher)</li>
            <li>npm or yarn package manager</li>
            <li>Firebase account and project</li>
            <li>Git for version control</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">5-Minute Setup</h2>
          <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Step 1: Clone the Repository</h3>
              <CodeBlock code={`git clone <repository-url>\ncd Food_waste_AI`} language="bash" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Step 2: Install Dependencies</h3>
              <CodeBlock code={`cd site\nnpm install`} language="bash" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Step 3: Configure Firebase</h3>
              <p className="text-slate-700 mb-2">Create a <code className="bg-slate-100 text-red-600 px-2 py-1 rounded">.env.local</code> file with your Firebase credentials:</p>
              <CodeBlock 
                code={`VITE_FIREBASE_API_KEY=your_api_key\nVITE_FIREBASE_AUTH_DOMAIN=your_auth_domain\nVITE_FIREBASE_PROJECT_ID=your_project_id\n...`}
                language="env"
              />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Step 4: Start Development Server</h3>
              <CodeBlock code={`npm run dev`} language="bash" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">First Steps</h2>
          <p className="text-slate-700">Once the development server is running:</p>
          <ol className="space-y-2 text-slate-700 ml-6 list-decimal">
            <li>Open your browser to <code className="bg-slate-100 text-red-600 px-2 py-1 rounded">http://localhost:5173</code></li>
            <li>Create a new account or sign in</li>
            <li>Access the dashboard to view waste predictions</li>
            <li>Explore different sections to understand the system</li>
          </ol>
          <Alert type="success" title="Ready to go!">
            You're now running a fully functional instance of Food Waste AI locally.
          </Alert>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Common Issues</h2>
          <div className="space-y-4">
            <Alert type="warning" title="Firebase Authentication Error">
              Make sure your Firebase credentials are correctly set in the <code className="bg-slate-100 text-red-600 px-1">.env.local</code> file.
            </Alert>
            <Alert type="info" title="Port Already in Use">
              If port 5173 is already in use, Vite will automatically try the next available port.
            </Alert>
          </div>
        </section>
      </div>
    </div>
  );
}
