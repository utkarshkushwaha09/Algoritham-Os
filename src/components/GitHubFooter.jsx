import React, { useState } from 'react';
import { Star, Github, Sun, Moon } from 'lucide-react';

const GitHubFooter = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <footer className="w-full z-50 border border-white/30">
      {/* Glass effect wrapper */}
      <div 
        className={`
          backdrop-blur-md border-t-2 transition-all duration-300
          ${isDarkTheme 
            ? 'bg-black/80 text-white border-white/30' 
            : 'bg-white/80 text-black border-black/30'
          }
        `}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left side: GitHub repo link */}
          <a 
            href="https://github.com/Abhishek-kroy/scheduling-algo"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-2 transition-colors
              ${isDarkTheme ? 'hover:text-blue-300' : 'hover:text-blue-600'}
            `}
          >
            <Github size={20} className="filter drop-shadow-sm" />
            <span className="font-medium hidden sm:inline">
              Scheduling Algorithm - Check on GitHub
            </span>
          </a>
          
          <div className="flex items-center gap-4">
            {/* Star button */}
            <a 
              href="https://github.com/Abhishek-kroy/scheduling-algo/stargazers"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group"
            >
              <Star 
                size={18} 
                className={`
                  transition-colors filter drop-shadow-sm
                  ${isDarkTheme 
                    ? 'group-hover:fill-yellow-300 group-hover:text-yellow-300' 
                    : 'group-hover:fill-yellow-500 group-hover:text-yellow-500'
                  }
                `}
              />
              <span className={`
                text-sm transition-colors
                ${isDarkTheme 
                  ? 'group-hover:text-yellow-300' 
                  : 'group-hover:text-yellow-500'
                }
              `}>
                Star this repo
              </span>
            </a>
            
            {/* Theme toggle button */}
            <button 
              onClick={toggleTheme}
              className={`
                p-2 rounded-full transition-colors
                ${isDarkTheme 
                  ? 'bg-gray-800/50 hover:bg-gray-700/70' 
                  : 'bg-gray-200/50 hover:bg-gray-300/70'
                }
              `}
              aria-label="Toggle theme"
            >
              {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GitHubFooter;