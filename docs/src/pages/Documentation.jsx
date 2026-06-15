import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import Alert from '../components/Alert';
import TableOfContents from '../components/TableOfContents';

export default function Documentation() {
  const headings = [
    { id: 'overview', text: 'Overview', level: 2 },
    { id: 'features', text: 'Key Features', level: 2 },
    { id: 'architecture', text: 'System Architecture', level: 2 },
    { id: 'getting-help', text: 'Getting Help', level: 2 },
  ];
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents - Sidebar on desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 p-4 bg-slate-100 rounded-lg">
            <h3 className="font-bold text-slate-900 mb-4">Contents</h3>
            <TableOfContents headings={headings} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <section id="overview">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
            <p className="text-slate-700 leading-relaxed">
              Food Waste AI is an intelligent system designed to predict and reduce food waste in commercial kitchens and food service operations. It leverages machine learning to analyze patterns and provide actionable insights.
            </p>
            <Alert type="info" title="What makes it special?">
              The system combines historical data analysis with real-time monitoring to provide accurate waste predictions and reduction strategies.
            </Alert>
          </section>

          <section id="features">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Key Features</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">✓</span>
                <span><strong>Predictive Analytics:</strong> AI-powered predictions for food waste patterns with confidence scores</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">✓</span>
                <span><strong>Real-time Monitoring:</strong> Track waste in real-time with detailed logging and timestamps</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">✓</span>
                <span><strong>Interactive Dashboard:</strong> Visualize waste data and trends with charts and statistics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">✓</span>
                <span><strong>Smart Recommendations:</strong> Actionable suggestions based on your waste patterns</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">✓</span>
                <span><strong>Secure Storage:</strong> Enterprise-grade data protection with Firebase</span>
              </li>
            </ul>
          </section>

          <section id="architecture">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">System Architecture</h2>
            <p className="text-slate-700 mb-4">
              The system consists of three main components working together:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-slate-900 mb-2">🎨 Frontend</h3>
                <p className="text-sm text-slate-700">React-based dashboard for user interaction and visualization</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-bold text-slate-900 mb-2">⚙️ Backend</h3>
                <p className="text-sm text-slate-700">Express server with REST API for data processing</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-slate-900 mb-2">💾 Database</h3>
                <p className="text-sm text-slate-700">Firestore for real-time data storage and retrieval</p>
              </div>
            </div>

            <Alert type="success" title="Scalable Design">
              The modular architecture allows for easy scaling and future feature additions without disrupting existing functionality.
            </Alert>
          </section>

          <section id="getting-help">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Getting Help</h2>
            <p className="text-slate-700 mb-4">
              This documentation site provides comprehensive resources organized by topic:
            </p>
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div>
                <strong className="text-slate-900">Getting Started:</strong>
                <span className="text-slate-700 ml-2">Quick start guide to set up the system</span>
              </div>
              <div>
                <strong className="text-slate-900">Setup Guide:</strong>
                <span className="text-slate-700 ml-2">Detailed installation and configuration instructions</span>
              </div>
              <div>
                <strong className="text-slate-900">API Reference:</strong>
                <span className="text-slate-700 ml-2">Technical API documentation with examples</span>
              </div>
              <div>
                <strong className="text-slate-900">FAQ:</strong>
                <span className="text-slate-700 ml-2">Answers to frequently asked questions</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
