import React from 'react';

export default function App(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400">
            D
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Darukaa<span className="text-emerald-400">.Earth</span>
          </span>
        </div>
        <div className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          Phase 1: Foundation
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur shadow-2xl">
          <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11.07M9 11l3 3m0 0l3-3m-3 3V8"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Darukaa.Earth Platform</h1>
          <p className="text-sm text-slate-400 mb-6">
            Full-Stack Geospatial Data Analytics Platform for Carbon &amp; Biodiversity Projects.
          </p>
          <div className="inline-flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Application shell initialized</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Darukaa.Earth. All rights reserved.
      </footer>
    </div>
  );
}
