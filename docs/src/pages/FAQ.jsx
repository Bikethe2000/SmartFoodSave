import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Food Waste AI?",
      answer: "Food Waste AI is an intelligent system designed to predict and reduce food waste in commercial kitchens. It uses machine learning to analyze waste patterns and provide actionable recommendations."
    },
    {
      question: "How does the prediction algorithm work?",
      answer: "The system analyzes historical data about food orders, consumption patterns, and waste to predict future waste. It uses machine learning models to identify trends and provide confidence scores for predictions."
    },
    {
      question: "What browsers are supported?",
      answer: "Food Waste AI works with all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your preferred browser."
    },
    {
      question: "How is my data secured?",
      answer: "All data is encrypted in transit and at rest. We use Firebase's enterprise-grade security and follow industry best practices for data protection."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export your waste logs and predictions in CSV format through the Settings page."
    },
    {
      question: "What's the pricing model?",
      answer: "We offer flexible pricing plans starting with a free tier. Check our pricing page for detailed information about enterprise plans."
    },
    {
      question: "How often are predictions updated?",
      answer: "Predictions are generated in real-time based on new data entries. The system continuously learns from your data to improve accuracy."
    },
    {
      question: "Is there an API for integration?",
      answer: "Yes, we provide a REST API for custom integrations. See the API Reference section for complete documentation."
    },
    {
      question: "What support options are available?",
      answer: "We offer email support, documentation, and community forums. Premium plans include priority support and dedicated account managers."
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page. You'll receive an email with instructions to reset your password."
    }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-8 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle size={32} />
          <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        </div>
        <p className="text-lg text-pink-100">
          Find answers to common questions
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition"
            >
              <h3 className="text-lg font-semibold text-slate-900 text-left">
                {faq.question}
              </h3>
              <ChevronDown
                size={24}
                className={`text-slate-600 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="border-t border-slate-200 p-4 bg-slate-50">
                <p className="text-slate-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Didn't find your answer?</h3>
        <p className="text-slate-700 mb-4">
          We're here to help! Contact our support team or check out our other documentation sections.
        </p>
        <a
          href="mailto:support@foodwasteai.com"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
