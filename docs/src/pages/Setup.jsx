import React from 'react';
import { Cog } from 'lucide-react';

export default function Setup() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <Cog size={32} />
          <h1 className="text-4xl font-bold">Setup Guide</h1>
        </div>
        <p className="text-lg text-orange-100">
          Complete configuration instructions
        </p>
      </div>

      <div className="prose prose-slate max-w-none doc-content space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-900">Backend Setup</h2>
          <p className="text-slate-700">The backend requires Node.js and Firebase Admin credentials.</p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Installation</h3>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto"><code>cd backend
npm install</code></pre>

          <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Environment Variables</h3>
          <p className="text-slate-700 mb-2">Create a <code className="bg-slate-100 text-red-600 px-2 py-1 rounded">.env</code> file with:</p>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto"><code>PORT=5000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_API_KEY=your_api_key</code></pre>

          <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Running the Server</h3>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto"><code>npm run server</code></pre>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Frontend Setup</h2>
          <p className="text-slate-700">The frontend is a React application built with Vite.</p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Installation</h3>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto"><code>cd site
npm install</code></pre>

          <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Environment Variables</h3>
          <p className="text-slate-700 mb-2">Create a <code className="bg-slate-100 text-red-600 px-2 py-1 rounded">.env.local</code> file:</p>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto"><code>VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id</code></pre>

          <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Development Server</h3>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto"><code>npm run dev</code></pre>

          <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">Production Build</h3>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto"><code>npm run build</code></pre>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Firebase Configuration</h2>
          <p className="text-slate-700 mb-4">Follow these steps to configure Firebase:</p>
          
          <ol className="space-y-3 text-slate-700 ml-6 list-decimal">
            <li>Go to the <a href="https://console.firebase.google.com/" className="text-blue-500 hover:underline">Firebase Console</a></li>
            <li>Create a new project or select an existing one</li>
            <li>Enable Firestore Database</li>
            <li>Enable Authentication (Email/Password)</li>
            <li>Generate a service account key for backend</li>
            <li>Copy web app credentials for frontend</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Database Schema</h2>
          <p className="text-slate-700">Firestore collections structure:</p>
          <ul className="space-y-2 text-slate-700 ml-6">
            <li><strong>users:</strong> User account information</li>
            <li><strong>predictions:</strong> Waste predictions with timestamps</li>
            <li><strong>recommendations:</strong> AI-generated recommendations</li>
            <li><strong>logs:</strong> Data logs and waste entries</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
