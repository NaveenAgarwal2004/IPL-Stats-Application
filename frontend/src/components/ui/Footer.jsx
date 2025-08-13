import React, { memo, useState, useEffect } from 'react';
import { Heart, Code, Database, Cloud, Github, ExternalLink } from 'lucide-react';

export const Footer = memo(({ darkMode }) => {
  const [metaData, setMetaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetaData = async () => {
      try {
        // Try to read from the public folder
        const response = await fetch('/meta.json');
        if (response.ok) {
          const data = await response.json();
          setMetaData(data);
        } else {
          // Fallback metadata if file not found
          setMetaData({
            credits: "© 2025 IPL Live Stats & Fantasy Team Builder | Data compiled from publicly available IPL statistics, including ESPNcricinfo, Cricbuzz, and IPL official archives. Dataset partially simulated for educational and demonstration purposes."
          });
        }
      } catch (error) {
        console.warn('Could not load meta.json, using fallback data:', error);
        // Fallback metadata
        setMetaData({
          credits: "© 2025 IPL Live Stats & Fantasy Team Builder | Data compiled from publicly available IPL statistics, including ESPNcricinfo, Cricbuzz, and IPL official archives. Dataset partially simulated for educational and demonstration purposes."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMetaData();
  }, []);

  if (isLoading) return null;

  return (
    <footer className={`${
      darkMode 
        ? 'bg-gray-800 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    } border-t backdrop-blur-md bg-opacity-95 transition-all duration-300`}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IPL Live Stats
                </h3>
                <p className="text-sm text-gray-500">Fantasy Team Builder</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Your ultimate destination for IPL statistics, live match updates, and fantasy team building. 
              Experience cricket like never before with real-time data and insights.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for cricket fans</span>
            </div>
          </div>

          {/* Data Sources */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-500" />
              Data Sources
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Cricket API</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                    Live
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Weather API</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                    OpenWeather
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">IPL Archives</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full">
                    Historical
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-4">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">250+</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Players</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">10</div>
                <div className="text-sm text-green-700 dark:text-green-300">Teams</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Live</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Updates</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border border-yellow-200 dark:border-yellow-700">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">24/7</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Service</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Credits */}
      <div className={`${
        darkMode 
          ? 'bg-gray-900/50 border-gray-700' 
          : 'bg-gray-50/50 border-gray-200'
      } border-t px-4 sm:px-6 lg:px-8 py-4`}>
        <div className="max-w-7xl mx-auto">
          {/* Credits from meta.json */}
          {metaData?.credits && (
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-4xl mx-auto">
                {metaData.credits}
              </p>
            </div>
          )}

          {/* Footer Links & Info */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>© 2025 IPL Live Stats</span>
              <span>•</span>
              <button className="hover:text-blue-600 transition-colors">Privacy</button>
              <span>•</span>
              <button className="hover:text-blue-600 transition-colors">Terms</button>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Github className="w-3 h-3" />
                <button className="hover:text-blue-600 transition-colors">Source</button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});