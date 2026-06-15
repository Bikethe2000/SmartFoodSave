import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen size={32} />
          <h1 className="text-4xl font-bold">Documentation</h1>
        </div>
        <p className="text-lg text-blue-100">
          Complete guide to the Food Waste AI system
        </p>
      </div>

      <div className="prose prose-slate max-w-none doc-content space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
          <p className="text-slate-700">
            Food Waste AI is an intelligent system designed to predict and reduce food waste in commercial kitchens and food service operations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Key Features</h2>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>Predictive Analytics:</strong> AI-powered predictions for food waste patterns</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>Real-time Monitoring:</strong> Track waste in real-time with detailed logging</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>Dashboard:</strong> Interactive visualization of waste data and trends</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>Recommendations:</strong> Actionable suggestions to reduce waste</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">System Architecture</h2>
          <p className="text-slate-700">
            The system consists of three main components:
          </p>
          <ul className="space-y-2 text-slate-700 ml-6">
            <li><strong>Frontend:</strong> React-based dashboard for user interaction</li>
            <li><strong>Backend:</strong> Express server with Firebase integration</li>
            <li><strong>Database:</strong> Firestore for data storage and retrieval</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Getting Help</h2>
          <p className="text-slate-700">
            Navigate through the documentation using the menu on the left. Each section covers different aspects of the system:
          </p>
          <ul className="space-y-2 text-slate-700 ml-6">
            <li><strong>Getting Started:</strong> Quick start guide</li>
            <li><strong>Setup Guide:</strong> Installation and configuration</li>
            <li><strong>API Reference:</strong> Technical API documentation</li>
            <li><strong>FAQ:</strong> Frequently asked questions</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
