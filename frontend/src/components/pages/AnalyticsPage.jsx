// src/components/pages/AnalyticsPage.jsx
import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import { BarChart3, TrendingUp, Users, Trophy, PieChart, Activity, RefreshCw } from 'lucide-react';
import { useAnalytics, usePlayersData } from '../../hooks/usePlayersData';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  DoughnutController,
  RadarController,
  RadialLinearScale,
  PolarAreaController
} from 'chart.js';

// Register Chart.js components only once
let chartsRegistered = false;

if (!chartsRegistered) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarController,
    LineController,
    DoughnutController,
    RadarController,
    PolarAreaController,
    RadialLinearScale
  );
  chartsRegistered = true;
}

export const AnalyticsPage = memo(({ darkMode, fantasyTeam }) => {
  const { data: analyticsResponse, loading, error, refetch } = useAnalytics();
  const { data: playersResponse, loading: playersLoading } = usePlayersData();
  
  const [activeChart, setActiveChart] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartsCreated, setChartsCreated] = useState(false);
  
  // Chart refs
  const topScorersRef = useRef(null);
  const wicketsDistributionRef = useRef(null);
  const teamComparisonRef = useRef(null);
  const fantasyPerformanceRef = useRef(null);
  const roleDistributionRef = useRef(null);
  const performanceTrendRef = useRef(null);

  // Store chart instances in refs to avoid state updates
  const chartInstancesRef = useRef({});

  const players = playersResponse?.data || [];
  const analyticsData = analyticsResponse?.data || [];

  // Process data for charts - memoized properly
  const chartData = React.useMemo(() => {
    if (players.length === 0) return null;

    // Top 10 run scorers
    const topScorers = [...players]
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 10);

    // Wickets distribution by team
    const wicketsByTeam = players.reduce((acc, player) => {
      acc[player.team] = (acc[player.team] || 0) + player.wickets;
      return acc;
    }, {});

    // Role distribution
    const roleDistribution = players.reduce((acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1;
      return acc;
    }, {});

    // Team performance metrics
    const teamStats = players.reduce((acc, player) => {
      if (!acc[player.team]) {
        acc[player.team] = { runs: 0, wickets: 0, matches: 0, players: 0 };
      }
      acc[player.team].runs += player.runs;
      acc[player.team].wickets += player.wickets;
      acc[player.team].matches += player.matches;
      acc[player.team].players += 1;
      return acc;
    }, {});

    // Fantasy team performance
    const fantasyStats = fantasyTeam.reduce((acc, player) => {
      acc.totalRuns += player.runs;
      acc.totalWickets += player.wickets;
      acc.totalMatches += player.matches;
      acc.roleDistribution[player.role] = (acc.roleDistribution[player.role] || 0) + 1;
      return acc;
    }, { 
      totalRuns: 0, 
      totalWickets: 0, 
      totalMatches: 0, 
      roleDistribution: {} 
    });

    return {
      topScorers,
      wicketsByTeam,
      roleDistribution,
      teamStats,
      fantasyStats
    };
  }, [players, fantasyTeam]);

  // Chart colors - memoized to prevent recreation
  const colors = React.useMemo(() => ({
    primary: darkMode ? '#3B82F6' : '#2563EB',
    secondary: darkMode ? '#10B981' : '#059669',
    accent: darkMode ? '#F59E0B' : '#D97706',
    danger: darkMode ? '#EF4444' : '#DC2626',
    purple: darkMode ? '#8B5CF6' : '#7C3AED',
    pink: darkMode ? '#EC4899' : '#DB2777',
    indigo: darkMode ? '#6366F1' : '#4F46E5',
    teal: darkMode ? '#14B8A6' : '#0D9488'
  }), [darkMode]);

  const chartColors = React.useMemo(() => [
    colors.primary, colors.secondary, colors.accent, colors.danger,
    colors.purple, colors.pink, colors.indigo, colors.teal
  ], [colors]);

  // Improved chart cleanup function
  const destroyAllCharts = useCallback(() => {
    Object.values(chartInstancesRef.current).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        try {
          chart.destroy();
        } catch (error) {
          console.warn('Error destroying chart:', error);
        }
      }
    });
    chartInstancesRef.current = {};
    setChartsCreated(false);
  }, []);

  // Enhanced refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Destroy all existing charts first
      destroyAllCharts();
      
      // Trigger data refresh
      await refetch();
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsRefreshing(false);
    }
  }, [refetch, destroyAllCharts]);

  // Create individual chart function
  const createChart = useCallback((ref, chartKey, config) => {
    if (!ref.current || !chartData) return null;

    // Destroy existing chart if it exists
    if (chartInstancesRef.current[chartKey]) {
      try {
        chartInstancesRef.current[chartKey].destroy();
      } catch (error) {
        console.warn('Error destroying existing chart:', error);
      }
    }

    try {
      const ctx = ref.current.getContext('2d');
      const chart = new ChartJS(ctx, config);
      chartInstancesRef.current[chartKey] = chart;
      return chart;
    } catch (error) {
      console.error(`Error creating ${chartKey} chart:`, error);
      return null;
    }
  }, [chartData]);

  // Create all charts - only when data changes or on first load
  useEffect(() => {
    if (!chartData || isRefreshing || chartsCreated) return;

    const createAllCharts = () => {
      // Top Scorers Chart
      if (topScorersRef.current) {
        createChart(topScorersRef, 'topScorers', {
          type: 'bar',
          data: {
            labels: chartData.topScorers.map(p => p.name.split(' ').slice(-1)[0]),
            datasets: [{
              label: 'Runs',
              data: chartData.topScorers.map(p => p.runs),
              backgroundColor: colors.primary,
              borderColor: colors.primary,
              borderWidth: 1,
              borderRadius: 4,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: (tooltipItems) => chartData.topScorers[tooltipItems[0].dataIndex].name,
                  label: (context) => {
                    const player = chartData.topScorers[context.dataIndex];
                    return [
                      `Runs: ${player.runs}`,
                      `Team: ${player.team}`,
                      `Matches: ${player.matches}`
                    ];
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: darkMode ? '#374151' : '#E5E7EB'
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280'
                }
              },
              x: {
                grid: {
                  color: darkMode ? '#374151' : '#E5E7EB'
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                  maxRotation: 45
                }
              }
            }
          }
        });
      }

      // Wickets Distribution Pie Chart
      if (wicketsDistributionRef.current) {
        const teamNames = Object.keys(chartData.wicketsByTeam);
        const wicketValues = Object.values(chartData.wicketsByTeam);
        
        createChart(wicketsDistributionRef, 'wicketsDistribution', {
          type: 'doughnut',
          data: {
            labels: teamNames,
            datasets: [{
              data: wicketValues,
              backgroundColor: chartColors.slice(0, teamNames.length),
              borderWidth: 2,
              borderColor: darkMode ? '#1F2937' : '#FFFFFF'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: darkMode ? '#E5E7EB' : '#374151',
                  padding: 20,
                  usePointStyle: true
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const total = wicketValues.reduce((sum, val) => sum + val, 0);
                    const percentage = ((context.raw / total) * 100).toFixed(1);
                    return `${context.label}: ${context.raw} wickets (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }

      // Team Comparison Chart
      if (teamComparisonRef.current) {
        const teams = Object.keys(chartData.teamStats);
        
        createChart(teamComparisonRef, 'teamComparison', {
          type: 'bar',
          data: {
            labels: teams,
            datasets: [{
              label: 'Total Runs',
              data: teams.map(team => chartData.teamStats[team].runs),
              backgroundColor: colors.primary,
              yAxisID: 'y'
            }, {
              label: 'Total Wickets',
              data: teams.map(team => chartData.teamStats[team].wickets),
              backgroundColor: colors.secondary,
              yAxisID: 'y1'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: darkMode ? '#E5E7EB' : '#374151'
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: darkMode ? '#374151' : '#E5E7EB'
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                  maxRotation: 45
                }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Runs',
                  color: darkMode ? '#9CA3AF' : '#6B7280'
                },
                grid: {
                  color: darkMode ? '#374151' : '#E5E7EB'
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Wickets',
                  color: darkMode ? '#9CA3AF' : '#6B7280'
                },
                grid: {
                  drawOnChartArea: false,
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280'
                }
              }
            }
          }
        });
      }

      // Fantasy Team Performance Radar Chart
      if (fantasyPerformanceRef.current && fantasyTeam.length > 0) {
        createChart(fantasyPerformanceRef, 'fantasyPerformance', {
          type: 'radar',
          data: {
            labels: ['Total Runs', 'Total Wickets', 'Experience (Matches)', 'Balance Score', 'Role Diversity'],
            datasets: [{
              label: 'Fantasy Team',
              data: [
                chartData.fantasyStats.totalRuns / 100, // Normalize
                chartData.fantasyStats.totalWickets * 10, // Scale up
                chartData.fantasyStats.totalMatches / 10, // Normalize
                (chartData.fantasyStats.totalRuns + chartData.fantasyStats.totalWickets) / 50,
                Object.keys(chartData.fantasyStats.roleDistribution).length * 25
              ],
              backgroundColor: `${colors.primary}33`,
              borderColor: colors.primary,
              borderWidth: 2,
              pointBackgroundColor: colors.primary,
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: colors.primary
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: darkMode ? '#E5E7EB' : '#374151'
                }
              }
            },
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                grid: {
                  color: darkMode ? '#374151' : '#E5E7EB'
                },
                angleLines: {
                  color: darkMode ? '#374151' : '#E5E7EB'
                },
                pointLabels: {
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                  font: {
                    size: 12
                  }
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                  showLabelBackdrop: false
                }
              }
            }
          }
        });
      }

      // Role Distribution Chart
      if (roleDistributionRef.current) {
        const roles = Object.keys(chartData.roleDistribution);
        
        createChart(roleDistributionRef, 'roleDistribution', {
          type: 'polarArea',
          data: {
            labels: roles,
            datasets: [{
              data: Object.values(chartData.roleDistribution),
              backgroundColor: chartColors.slice(0, roles.length).map(color => `${color}80`),
              borderColor: chartColors.slice(0, roles.length),
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: darkMode ? '#E5E7EB' : '#374151',
                  padding: 20,
                  usePointStyle: true
                }
              }
            },
            scales: {
              r: {
                grid: {
                  color: darkMode ? '#374151' : '#E5E7EB'
                },
                angleLines: {
                  color: darkMode ? '#374151' : '#E5E7EB'
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                  showLabelBackdrop: false
                }
              }
            }
          }
        });
      }

      // Performance Trend Line Chart
      if (performanceTrendRef.current) {
        // Create mock trend data based on top performers
        const trendData = chartData.topScorers.slice(0, 6).map((player, index) => ({
          x: index + 1,
          y: player.runs,
          player: player.name
        }));
        
        createChart(performanceTrendRef, 'performanceTrend', {
          type: 'line',
          data: {
            datasets: [{
              label: 'Performance Trend',
              data: trendData,
              borderColor: colors.primary,
              backgroundColor: `${colors.primary}20`,
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: colors.primary,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: darkMode ? '#E5E7EB' : '#374151'
                }
              },
              tooltip: {
                callbacks: {
                  title: (tooltipItems) => trendData[tooltipItems[0].dataIndex].player,
                  label: (context) => `Runs: ${context.raw.y}`
                }
              }
            },
            scales: {
              x: {
                type: 'linear',
                title: {
                  display: true,
                  text: 'Player Ranking',
                  color: darkMode ? '#9CA3AF' : '#6B7280'
                },
                grid: {
                  color: darkMode ? '#374151' : '#E5E7EB'
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Total Runs',
                  color: darkMode ? '#9CA3AF' : '#6B7280'
                },
                grid: {
                  color: darkMode ? '#374151' : '#E5E7EB'
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280'
                }
              }
            }
          }
        });
      }

      setChartsCreated(true);
    };

    // Small delay to ensure DOM elements are ready
    const timeout = setTimeout(createAllCharts, 100);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [chartData, createChart, colors, chartColors, darkMode, fantasyTeam.length, isRefreshing, chartsCreated]);

  // Handle dark mode changes - only update existing charts
  useEffect(() => {
    if (!chartsCreated || !chartData || isRefreshing) return;

    // Destroy and recreate charts when dark mode changes
    destroyAllCharts();
    
    // Trigger chart recreation after a short delay
    const timeout = setTimeout(() => {
      // This will trigger the main chart creation effect
    }, 100);

    return () => clearTimeout(timeout);
  }, [darkMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyAllCharts();
    };
  }, [destroyAllCharts]);

  // Calculate key metrics - memoized properly
  const metrics = React.useMemo(() => {
    if (!chartData) return null;
    
    const totalPlayers = players.length;
    const totalRuns = players.reduce((sum, p) => sum + p.runs, 0);
    const totalWickets = players.reduce((sum, p) => sum + p.wickets, 0);
    const totalTeams = Object.keys(chartData.teamStats).length;
    const avgRunsPerPlayer = totalPlayers > 0 ? Math.round(totalRuns / totalPlayers) : 0;
    const avgWicketsPerPlayer = totalPlayers > 0 ? Math.round(totalWickets / totalPlayers) : 0;
    
    return {
      totalPlayers,
      totalRuns,
      totalWickets,
      totalTeams,
      avgRunsPerPlayer,
      avgWicketsPerPlayer,
      fantasyTeamSize: fantasyTeam.length,
      fantasyTeamRuns: chartData.fantasyStats.totalRuns,
      fantasyTeamWickets: chartData.fantasyStats.totalWickets
    };
  }, [chartData, players, fantasyTeam]);

  if (loading || playersLoading) return <LoadingSpinner darkMode={darkMode} message="Loading analytics..." />;
  if (error) return <ErrorBoundary error={error} darkMode={darkMode} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center">
          <BarChart3 className="mr-3 text-blue-500" />
          Analytics Dashboard
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 border-l-4 border-blue-500`}>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Players</p>
                <p className="text-2xl font-bold">{metrics.totalPlayers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 border-l-4 border-green-500`}>
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Runs</p>
                <p className="text-2xl font-bold">{metrics.totalRuns.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Avg: {metrics.avgRunsPerPlayer}/player</p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 border-l-4 border-red-500`}>
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Wickets</p>
                <p className="text-2xl font-bold">{metrics.totalWickets.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Avg: {metrics.avgWicketsPerPlayer}/player</p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 border-l-4 border-purple-500`}>
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Fantasy Team</p>
                <p className="text-2xl font-bold">{metrics.fantasyTeamSize}/11</p>
                <p className="text-xs text-gray-400">{metrics.fantasyTeamRuns}R • {metrics.fantasyTeamWickets}W</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'distribution', label: 'Distribution', icon: PieChart },
          { id: 'fantasy', label: 'Fantasy Analysis', icon: Trophy }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveChart(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeChart === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Loading State for Refresh */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="animate-spin text-blue-600" size={24} />
            <span className="text-lg">Refreshing charts...</span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Run Scorers */}
        {(activeChart === 'overview' || activeChart === 'performance') && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-2 text-green-500" size={20} />
              Top Run Scorers
            </h3>
            <div className="h-80">
              <canvas ref={topScorersRef} id="topScorersChart"></canvas>
            </div>
          </div>
        )}

        {/* Wickets Distribution */}
        {(activeChart === 'overview' || activeChart === 'distribution') && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <PieChart className="mr-2 text-red-500" size={20} />
              Wickets by Team
            </h3>
            <div className="h-80">
              <canvas ref={wicketsDistributionRef} id="wicketsChart"></canvas>
            </div>
          </div>
        )}

        {/* Team Comparison */}
        {(activeChart === 'overview' || activeChart === 'performance') && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart3 className="mr-2 text-blue-500" size={20} />
              Team Performance Comparison
            </h3>
            <div className="h-80">
              <canvas ref={teamComparisonRef} id="teamComparisonChart"></canvas>
            </div>
          </div>
        )}

        {/* Fantasy Team Performance */}
        {(activeChart === 'fantasy' || activeChart === 'overview') && fantasyTeam.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Trophy className="mr-2 text-purple-500" size={20} />
              Fantasy Team Analysis
            </h3>
            <div className="h-80">
              <canvas ref={fantasyPerformanceRef} id="fantasyChart"></canvas>
            </div>
          </div>
        )}

        {/* Role Distribution */}
        {(activeChart === 'distribution' || activeChart === 'overview') && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="mr-2 text-indigo-500" size={20} />
              Player Role Distribution
            </h3>
            <div className="h-80">
              <canvas ref={roleDistributionRef} id="roleChart"></canvas>
            </div>
          </div>
        )}

        {/* Performance Trend */}
        {(activeChart === 'performance') && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="mr-2 text-teal-500" size={20} />
              Performance Trend
            </h3>
            <div className="h-80">
              <canvas ref={performanceTrendRef} id="trendChart"></canvas>
            </div>
          </div>
        )}
      </div>

      {/* No Fantasy Team Message */}
      {fantasyTeam.length === 0 && activeChart === 'fantasy' && (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Fantasy Team</h3>
          <p className="text-gray-400">Build a fantasy team to see detailed performance analytics</p>
        </div>
      )}

      {/* Empty State */}
      {!chartData && !isRefreshing && (
        <div className="text-center py-12">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No analytics data available</h3>
          <p className="text-gray-400">Check back later for comprehensive statistics and insights</p>
        </div>
      )}
    </div>
  );
});