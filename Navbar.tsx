
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Stream<span className="text-sky-400">X</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Supported Sites</a>
            <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Premium</a>
            <button className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-all border border-slate-700">
              Browser Extension
            </button>
          </div>
          
          <div className="flex md:hidden">
             <button className="text-slate-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
