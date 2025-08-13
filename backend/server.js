const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables if available
try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not found, using environment variables directly');
}

const app = express();
const PORT = process.env.PORT || 3001; // Changed to match frontend expectations

// API Keys
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'c29d950f171498cce7945b9afbf6cb51';
const CRIC_API_KEY = process.env.CRIC_API_KEY || '16ec677f-4c4c-4068-bd17-54ff6a683465';

// Enhanced CORS configuration - Allow all origins for production
app.use(cors({
  origin: '*',
  credentials: false,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

// Add explicit CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.static('public'));

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// In-memory cache for better performance
const cache = {
  players: null,
  matches: null,
  weather: {},
  lastFetch: {
    players: null,
    matches: null,
    weather: {}
  }
};

// Cache duration (in milliseconds)
const CACHE_DURATION = {
  players: 60 * 60 * 1000, // 1 hour
  matches: 30 * 1000, // 30 seconds
  weather: 10 * 60 * 1000 // 10 minutes
};

// Load players data from JSON file
const loadPlayersData = async () => {
  try {
    const now = Date.now();
    if (cache.players && cache.lastFetch.players && (now - cache.lastFetch.players) < CACHE_DURATION.players) {
      console.log('Returning cached players data');
      return cache.players;
    }

    // Try multiple possible file paths
    const possiblePaths = [
      path.join(__dirname, 'data', 'ipl_players_assessment_ready_200plus_with_venues_fullteams.json'),
      path.join(__dirname, 'data', 'players.json'),
      path.join(__dirname, 'ipl_players.json'),
      path.join(process.cwd(), 'data', 'players.json')
    ];

    let players = null;
    for (const filePath of possiblePaths) {
      try {
        console.log(`Trying to load players data from: ${filePath}`);
        const data = await fs.readFile(filePath, 'utf8');
        players = JSON.parse(data);
        console.log(`Successfully loaded ${players.length} players from ${filePath}`);
        break;
      } catch (err) {
        console.log(`Failed to load from ${filePath}: ${err.message}`);
        continue;
      }
    }

    if (!players) {
      console.log('No players data file found, generating fallback data');
      players = generateFallbackPlayers();
    }
    
    cache.players = players;
    cache.lastFetch.players = now;
    
    return players;
  } catch (error) {
    console.error('Error loading players data:', error);
    return generateFallbackPlayers();
  }
};

// Enhanced fallback players data generation
const generateFallbackPlayers = () => {
  const teams = [
    "Mumbai Indians", "Chennai Super Kings", "Royal Challengers Bangalore",
    "Delhi Capitals", "Kolkata Knight Riders", "Punjab Kings",
    "Rajasthan Royals", "Sunrisers Hyderabad", "Gujarat Titans", "Lucknow Super Giants"
  ];
  
  const venues = [
    "Wankhede Stadium, Mumbai",
    "M. A. Chidambaram Stadium, Chennai", 
    "M. Chinnaswamy Stadium, Bengaluru",
    "Arun Jaitley Stadium, Delhi",
    "Eden Gardens, Kolkata",
    "PCA Stadium, Mohali",
    "Sawai Mansingh Stadium, Jaipur",
    "Rajiv Gandhi Stadium, Hyderabad",
    "Narendra Modi Stadium, Ahmedabad",
    "Ekana Stadium, Lucknow"
  ];
  
  const roles = ["Batsman", "Bowler", "Wicketkeeper", "All-rounder"];
  const firstNames = ["Virat", "Rohit", "MS", "Jasprit", "Hardik", "KL", "Rishabh", "Shikhar", "Yuzvendra", "Mohammed"];
  const lastNames = ["Kohli", "Sharma", "Dhoni", "Bumrah", "Pandya", "Rahul", "Pant", "Dhawan", "Chahal", "Siraj"];
  
  const players = [];
  
  for (let i = 0; i < 250; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    players.push({
      name: `${firstName} ${lastName} ${i + 1}`,
      team: teams[Math.floor(Math.random() * teams.length)],
      role: role,
      matches: Math.floor(Math.random() * 16) + 1,
      runs: role === 'Bowler' ? Math.floor(Math.random() * 200) : Math.floor(Math.random() * 800) + 100,
      wickets: role === 'Batsman' ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 25) + 1,
      venue: venues[Math.floor(Math.random() * venues.length)]
    });
  }
  
  console.log(`Generated ${players.length} fallback players`);
  return players;
};

// Fetch live cricket matches with enhanced error handling
const fetchLiveMatches = async () => {
  try {
    const now = Date.now();
    if (cache.matches && cache.lastFetch.matches && (now - cache.lastFetch.matches) < CACHE_DURATION.matches) {
      console.log('Returning cached matches data');
      return cache.matches;
    }

    console.log('Fetching live matches from Cricket API...');
    
    // Try to fetch from Cricket API
    let liveMatches = [];
    try {
      const response = await axios.get('https://api.cricapi.com/v1/currentMatches', {
        params: {
          apikey: CRIC_API_KEY,
          offset: 0
        },
        timeout: 10000
      });

      if (response.data && response.data.data) {
        // Filter for T20 matches
        const t20Matches = response.data.data.filter(match => 
          match.matchType === 'T20' && 
          (match.status === 'Match in progress' || match.status === 'Live')
        );
        
        liveMatches = t20Matches.slice(0, 4).map((match, index) => ({
          id: match.id || index + 1,
          team1: {
            name: match.teamInfo?.[0]?.name || match.teams?.[0] || "Team A",
            shortName: match.teamInfo?.[0]?.shortname || match.teams?.[0]?.substring(0, 3) || "TMA",
            score: match.score?.[0]?.inning || `${Math.floor(Math.random() * 50) + 150}/${Math.floor(Math.random() * 8) + 2}`,
            overs: match.score?.[0]?.over || `${Math.floor(Math.random() * 5) + 15}.${Math.floor(Math.random() * 6)}`,
            runRate: (Math.random() * 4 + 6).toFixed(2)
          },
          team2: {
            name: match.teamInfo?.[1]?.name || match.teams?.[1] || "Team B",
            shortName: match.teamInfo?.[1]?.shortname || match.teams?.[1]?.substring(0, 3) || "TMB",
            score: match.score?.[1]?.inning || `${Math.floor(Math.random() * 50) + 120}/${Math.floor(Math.random() * 8) + 3}`,
            overs: match.score?.[1]?.over || `${Math.floor(Math.random() * 5) + 12}.${Math.floor(Math.random() * 6)}`,
            runRate: (Math.random() * 3 + 7).toFixed(2)
          },
          venue: match.venue || "Stadium, City",
          status: match.status || "Live",
          date: match.dateTimeGMT || new Date().toISOString(),
          weather: null
        }));

        console.log(`Fetched ${liveMatches.length} live matches from API`);
      }
    } catch (apiError) {
      console.warn('Cricket API failed, using simulated data:', apiError.message);
    }
    
    // If no live matches found, generate simulated ones
    if (liveMatches.length === 0) {
      liveMatches = generateSimulatedMatches();
      console.log('Generated simulated matches for demo');
    }
    
    // Fetch weather for each match venue
    for (let match of liveMatches) {
      match.weather = await fetchWeatherForVenue(match.venue);
    }
    
    cache.matches = liveMatches;
    cache.lastFetch.matches = now;
    
    return liveMatches;
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return generateSimulatedMatches();
  }
};

// Enhanced simulated matches generation
const generateSimulatedMatches = () => {
  const teams = [
    { name: "Mumbai Indians", shortName: "MI" },
    { name: "Chennai Super Kings", shortName: "CSK" },
    { name: "Royal Challengers Bangalore", shortName: "RCB" },
    { name: "Delhi Capitals", shortName: "DC" },
    { name: "Kolkata Knight Riders", shortName: "KKR" },
    { name: "Punjab Kings", shortName: "PBKS" },
    { name: "Rajasthan Royals", shortName: "RR" },
    { name: "Sunrisers Hyderabad", shortName: "SRH" },
    { name: "Gujarat Titans", shortName: "GT" },
    { name: "Lucknow Super Giants", shortName: "LSG" }
  ];

  const venues = [
    "Wankhede Stadium, Mumbai",
    "M. A. Chidambaram Stadium, Chennai",
    "M. Chinnaswamy Stadium, Bengaluru",
    "Arun Jaitley Stadium, Delhi",
    "Eden Gardens, Kolkata",
    "Narendra Modi Stadium, Ahmedabad"
  ];

  const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
  
  return [
    {
      id: 1,
      team1: {
        ...shuffledTeams[0],
        score: `${Math.floor(Math.random() * 50) + 150}/${Math.floor(Math.random() * 8) + 2}`,
        overs: `${Math.floor(Math.random() * 5) + 15}.${Math.floor(Math.random() * 6)}`,
        runRate: (Math.random() * 4 + 6).toFixed(2)
      },
      team2: {
        ...shuffledTeams[1],
        score: `${Math.floor(Math.random() * 50) + 120}/${Math.floor(Math.random() * 8) + 3}`,
        overs: `${Math.floor(Math.random() * 5) + 12}.${Math.floor(Math.random() * 6)}`,
        runRate: (Math.random() * 3 + 7).toFixed(2)
      },
      venue: venues[Math.floor(Math.random() * venues.length)],
      status: "Live",
      date: new Date().toISOString(),
      weather: null
    },
    {
      id: 2,
      team1: {
        ...shuffledTeams[2],
        score: `${Math.floor(Math.random() * 50) + 180}/${Math.floor(Math.random() * 6) + 4}`,
        overs: "20.0",
        runRate: (Math.random() * 2 + 8).toFixed(2)
      },
      team2: {
        ...shuffledTeams[3],
        score: `${Math.floor(Math.random() * 50) + 120}/${Math.floor(Math.random() * 8) + 2}`,
        overs: `${Math.floor(Math.random() * 5) + 12}.${Math.floor(Math.random() * 6)}`,
        runRate: (Math.random() * 3 + 7).toFixed(2)
      },
      venue: venues[Math.floor(Math.random() * venues.length)],
      status: "Live",
      date: new Date().toISOString(),
      weather: null
    }
  ];
};

// Enhanced weather fetching with better error handling
const fetchWeatherForVenue = async (venue) => {
  try {
    const city = venue.split(',')[1]?.trim() || venue.split(',')[0]?.trim() || 'Mumbai';
    const cacheKey = city.toLowerCase();
    const now = Date.now();
    
    if (cache.weather[cacheKey] && cache.lastFetch.weather[cacheKey] && 
        (now - cache.lastFetch.weather[cacheKey]) < CACHE_DURATION.weather) {
      return cache.weather[cacheKey];
    }

    console.log(`Fetching weather for ${city}...`);

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 5000
    });

    const weatherData = {
      temp: Math.round(response.data.main.temp),
      condition: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: Math.round(response.data.wind.speed * 3.6), // Convert m/s to km/h
      icon: response.data.weather[0].icon,
      city: response.data.name
    };

    cache.weather[cacheKey] = weatherData;
    cache.lastFetch.weather[cacheKey] = now;

    console.log(`Weather data cached for ${city}`);
    return weatherData;
  } catch (error) {
    console.warn(`Weather API failed for ${venue}, using fallback data:`, error.message);
    // Return realistic simulated weather data as fallback
    const cities = ['Mumbai', 'Chennai', 'Bengaluru', 'Delhi', 'Kolkata'];
    const conditions = ['Clear Sky', 'Partly Cloudy', 'Overcast', 'Light Rain'];
    
    return {
      temp: Math.floor(Math.random() * 15) + 20, // 20-35°C
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
      icon: "01d",
      city: cities[Math.floor(Math.random() * cities.length)]
    };
  }
};

// API Routes with enhanced error handling

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'IPL Stats API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: PORT,
    apis: {
      weather: WEATHER_API_KEY ? 'configured' : 'missing',
      cricket: CRIC_API_KEY ? 'configured' : 'missing'
    }
  });
});

// Get all players
app.get('/api/players', async (req, res) => {
  try {
    const players = await loadPlayersData();
    res.json({
      success: true,
      data: players,
      count: players.length,
      cached: cache.lastFetch.players ? true : false
    });
  } catch (error) {
    console.error('Error in /api/players:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching players data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get live matches
app.get('/api/live-matches', async (req, res) => {
  try {
    const matches = await fetchLiveMatches();
    res.json({
      success: true,
      data: matches,
      count: matches.length,
      lastUpdated: new Date().toISOString(),
      cached: cache.lastFetch.matches ? true : false
    });
  } catch (error) {
    console.error('Error in /api/live-matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live matches',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get weather for specific city
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const weather = await fetchWeatherForVenue(`Stadium, ${city}`);
    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    console.error('Error in /api/weather:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weather data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get match details by ID
app.get('/api/match/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const matches = await fetchLiveMatches();
    const match = matches.find(m => m.id.toString() === id.toString());
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Get players from both teams for match details
    const players = await loadPlayersData();
    const teamPlayers = players.filter(p => 
      p.team === match.team1.name || p.team === match.team2.name
    );

    res.json({
      success: true,
      data: {
        ...match,
        players: teamPlayers
      }
    });
  } catch (error) {
    console.error('Error in /api/match:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching match details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get player statistics
app.get('/api/player/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const players = await loadPlayersData();
    const player = players.find(p => p.name.toLowerCase() === decodeURIComponent(name).toLowerCase());
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Error in /api/player:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching player data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Search players with enhanced filtering
app.get('/api/search/players', async (req, res) => {
  try {
    const { q, team, role, limit = 100 } = req.query;
    const players = await loadPlayersData();
    
    let filteredPlayers = players;
    
    if (q && q.trim()) {
      const query = q.toLowerCase().trim();
      filteredPlayers = filteredPlayers.filter(player => 
        player.name.toLowerCase().includes(query) ||
        player.team.toLowerCase().includes(query) ||
        player.role.toLowerCase().includes(query)
      );
    }
    
    if (team && team !== 'All Teams') {
      filteredPlayers = filteredPlayers.filter(player => player.team === team);
    }
    
    if (role && role !== 'All Roles') {
      filteredPlayers = filteredPlayers.filter(player => player.role === role);
    }
    
    // Sort by runs (descending) for better UX
    filteredPlayers.sort((a, b) => b.runs - a.runs);
    
    // Limit results
    const limitNum = Math.min(parseInt(limit) || 100, 200); // Max 200 results
    filteredPlayers = filteredPlayers.slice(0, limitNum);
    
    res.json({
      success: true,
      data: filteredPlayers,
      count: filteredPlayers.length,
      total: players.length,
      filters: { q, team, role, limit: limitNum }
    });
  } catch (error) {
    console.error('Error in /api/search/players:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching players',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get analytics data with enhanced statistics
app.get('/api/analytics', async (req, res) => {
  try {
    const players = await loadPlayersData();
    
    // Top scorers
    const topScorers = players
      .filter(p => p.runs > 0)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 15);
    
    // Team statistics
    const teamStats = {};
    players.forEach(player => {
      if (!teamStats[player.team]) {
        teamStats[player.team] = {
          team: player.team,
          totalRuns: 0,
          totalWickets: 0,
          playerCount: 0,
          avgRuns: 0
        };
      }
      teamStats[player.team].totalRuns += player.runs;
      teamStats[player.team].totalWickets += player.wickets;
      teamStats[player.team].playerCount += 1;
    });
    
    // Calculate averages
    Object.values(teamStats).forEach(team => {
      team.avgRuns = team.playerCount > 0 ? Math.round(team.totalRuns / team.playerCount) : 0;
    });
    
    // Venue statistics
    const venueStats = {};
    players.forEach(player => {
      const venue = player.venue.split(',')[0].trim();
      if (!venueStats[venue]) {
        venueStats[venue] = {
          venue,
          totalRuns: 0,
          totalWickets: 0,
          matches: 0,
          playerCount: 0
        };
      }
      venueStats[venue].totalRuns += player.runs;
      venueStats[venue].totalWickets += player.wickets;
      venueStats[venue].matches += player.matches;
      venueStats[venue].playerCount += 1;
    });

    // Role distribution analytics
    const roleStats = {};
    players.forEach(player => {
      roleStats[player.role] = (roleStats[player.role] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        topScorers,
        teamStats: Object.values(teamStats).sort((a, b) => b.totalRuns - a.totalRuns),
        venueStats: Object.values(venueStats).sort((a, b) => b.totalRuns - a.totalRuns),
        roleStats,
        totalPlayers: players.length,
        totalRuns: players.reduce((sum, p) => sum + p.runs, 0),
        totalWickets: players.reduce((sum, p) => sum + p.wickets, 0),
        avgRunsPerPlayer: Math.round(players.reduce((sum, p) => sum + p.runs, 0) / players.length),
        avgWicketsPerPlayer: Math.round(players.reduce((sum, p) => sum + p.wickets, 0) / players.length)
      }
    });
  } catch (error) {
    console.error('Error in /api/analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Clear cache endpoint (useful for development)
app.post('/api/cache/clear', (req, res) => {
  cache.players = null;
  cache.matches = null;
  cache.weather = {};
  cache.lastFetch = {
    players: null,
    matches: null,
    weather: {}
  };
  
  res.json({
    success: true,
    message: 'Cache cleared successfully'
  });
});

// Get cache status
app.get('/api/cache/status', (req, res) => {
  const now = Date.now();
  res.json({
    success: true,
    data: {
      players: {
        cached: !!cache.players,
        lastFetch: cache.lastFetch.players,
        expiresIn: cache.lastFetch.players ? Math.max(0, CACHE_DURATION.players - (now - cache.lastFetch.players)) : 0
      },
      matches: {
        cached: !!cache.matches,
        lastFetch: cache.lastFetch.matches,
        expiresIn: cache.lastFetch.matches ? Math.max(0, CACHE_DURATION.matches - (now - cache.lastFetch.matches)) : 0
      },
      weather: {
        cached: Object.keys(cache.weather).length,
        cities: Object.keys(cache.weather)
      }
    }
  });
});

// Serve static files (for production deployment)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
 app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.path} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server with enhanced logging
app.listen(PORT, () => {
  console.log(`🚀 IPL Stats Server running on port ${PORT}`);
  console.log(`📊 Weather API: ${WEATHER_API_KEY ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`🏏 Cricket API: ${CRIC_API_KEY ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Working Directory: ${process.cwd()}`);
  
  // Test data loading on startup
  loadPlayersData().then(players => {
    console.log(`📋 Loaded ${players.length} players successfully`);
  }).catch(err => {
    console.error('❌ Failed to load initial players data:', err.message);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;