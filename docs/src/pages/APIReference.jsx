import React from 'react';
import { Code } from 'lucide-react';

export default function APIReference() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <Code size={32} />
          <h1 className="text-4xl font-bold">API Reference</h1>
        </div>
        <p className="text-lg text-indigo-100">
          Complete API documentation
        </p>
      </div>

      <div className="prose prose-slate max-w-none doc-content space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-900">Authentication Endpoints</h2>
          
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">POST /auth/login</h3>
            <p className="text-slate-700 mb-2">Authenticate user with email and password.</p>
            <p className="text-sm text-slate-600 mb-2"><strong>Request:</strong></p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-sm"><code>{`{
  "email": "user@example.com",
  "password": "password123"
}`}</code></pre>
            <p className="text-sm text-slate-600 mb-2"><strong>Response:</strong></p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-sm"><code>{`{
  "token": "jwt_token",
  "user": {
    "uid": "user_id",
    "email": "user@example.com"
  }
}`}</code></pre>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">POST /auth/signup</h3>
            <p className="text-slate-700 mb-2">Register a new user account.</p>
            <p className="text-sm text-slate-600 mb-2"><strong>Request:</strong></p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-sm"><code>{`{
  "email": "newuser@example.com",
  "password": "password123"
}`}</code></pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Predictions Endpoints</h2>
          
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">GET /api/predictions</h3>
            <p className="text-slate-700 mb-2">Get all predictions for the current user.</p>
            <p className="text-sm text-slate-600 mb-2"><strong>Headers:</strong></p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-sm"><code>Authorization: Bearer {`<token>`}</code></pre>
            <p className="text-sm text-slate-600 mb-2"><strong>Response:</strong></p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-sm"><code>{`[
  {
    "id": "pred_123",
    "foodItem": "Apple",
    "quantity": 50,
    "unit": "kg",
    "wastePercentage": 15,
    "confidence": 0.92,
    "timestamp": "2024-01-15T10:30:00Z"
  }
]`}</code></pre>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">POST /api/predictions</h3>
            <p className="text-slate-700 mb-2">Create a new prediction.</p>
            <p className="text-sm text-slate-600 mb-2"><strong>Request:</strong></p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-sm"><code>{`{
  "foodItem": "Apple",
  "quantity": 50,
  "unit": "kg"
}`}</code></pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Recommendations Endpoints</h2>
          
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">GET /api/recommendations</h3>
            <p className="text-slate-700 mb-2">Get AI-generated recommendations for waste reduction.</p>
            <p className="text-sm text-slate-600 mb-2"><strong>Headers:</strong></p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-sm"><code>Authorization: Bearer {`<token>`}</code></pre>
            <p className="text-sm text-slate-600 mb-2"><strong>Response:</strong></p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-sm"><code>{`[
  {
    "id": "rec_123",
    "title": "Optimize ordering",
    "description": "Reduce orders by 10%",
    "impact": "Could save 2.5kg per week"
  }
]`}</code></pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Error Codes</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="text-left py-2 px-4 font-semibold text-slate-900">Code</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-900">Message</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-4 text-slate-700">400</td>
                <td className="py-2 px-4 text-slate-700">Bad Request - Invalid parameters</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-4 text-slate-700">401</td>
                <td className="py-2 px-4 text-slate-700">Unauthorized - Invalid or missing token</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-4 text-slate-700">404</td>
                <td className="py-2 px-4 text-slate-700">Not Found - Resource does not exist</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-slate-700">500</td>
                <td className="py-2 px-4 text-slate-700">Server Error - Internal server error</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
