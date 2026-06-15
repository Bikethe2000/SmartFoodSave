import React, { useState, useEffect } from 'react';

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      
      for (let i = headingElements.length - 1; i >= 0; i--) {
        if (headingElements[i].getBoundingClientRect().top <= 100) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleClick = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="space-y-2">
      {headings.map((heading) => (
        <button
          key={heading.id}
          onClick={() => handleClick(heading.id)}
          className={`block text-left text-sm px-3 py-1 rounded transition ${
            activeId === heading.id
              ? 'bg-blue-100 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          style={{ paddingLeft: `${(heading.level - 2) * 1.5 + 0.75}rem` }}
        >
          {heading.text}
        </button>
      ))}
    </nav>
  );
}
