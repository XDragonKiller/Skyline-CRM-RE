import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, BarChart, PieChart, Pie, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { ArrowUp, ArrowDown, Home, Users, TrendingUp, BarChart2, Briefcase, DollarSign, MapPin, Clock, Target, Building2, Heart } from 'lucide-react';
import api from '../api/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function RealEstateDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAgency, setUserAgency] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/users/me');
      setUserAgency(response.data.agency);
      setIsAdmin(response.data.role === 'admin');
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/stats?period=${selectedPeriod}`);
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleContainerClick = (path) => {
    navigate(path);
  };

  const renderOverviewMetrics = () => {
    if (!dashboardData) return null;

    const leadSection = dashboardData.leads?.period || dashboardData.leads?.month || {};
    const propertySection = dashboardData.properties?.period || dashboardData.properties?.month || {};
    const dealSection = dashboardData.deals?.period || dashboardData.deals?.month || {};

    const leadMetrics = leadSection.summaryMetrics || {};
    const propertyMetrics = propertySection.summaryMetrics || {};
    const dealMetrics = dealSection.summaryMetrics || {};

    const getPercentChange = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    const metrics = [
      {
        title: 'Active Properties',
        value: propertyMetrics.totalListed || 0,
        change: getPercentChange(propertyMetrics.totalListed, propertyMetrics.prevListed),
        icon: <Home className="w-6 h-6" />,
        color: 'bg-blue-50 text-blue-600',
        path: '/properties'
      },
      {
        title: 'Active Leads',
        value: leadMetrics.totalLeads || 0,
        change: getPercentChange(leadMetrics.totalLeads, leadMetrics.prevLeads),
        icon: <Users className="w-6 h-6" />,
        color: 'bg-green-50 text-green-600',
        path: '/leads'
      },
      {
        title: 'Total Value',
        value: `$${(dealMetrics.totalCommission || 0).toLocaleString()}`,
        change: getPercentChange(dealMetrics.totalCommission, dealMetrics.prevCommission),
        icon: <DollarSign className="w-6 h-6" />,
        color: 'bg-purple-50 text-purple-600',
        path: '/deals'
      },
      {
        title: 'Conversion Rate',
        value: `${leadMetrics.conversionRate || 0}%`,
        change: getPercentChange(leadMetrics.conversionRate, leadMetrics.prevConversionRate),
        icon: <Target className="w-6 h-6" />,
        color: 'bg-orange-50 text-orange-600',
        path: '/leads'
      }
    ].filter(metric => metric.value !== 0 && metric.value !== '$0' && metric.value !== '0%');

    if (metrics.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <img src="/empty-state.svg" alt="No data" className="w-32 h-32 mb-4 opacity-60" />
          <p className="text-gray-400 text-lg">No data to display for this period.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => handleContainerClick(metric.path)}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleContainerClick(metric.path);
              }
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${metric.color}`}>{metric.icon}</div>
              <div className={`flex items-center ${parseFloat(metric.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(metric.change) >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                <span>{Math.abs(metric.change)}%</span>
              </div>
            </div>
            <h3 className="text-gray-500 text-base mb-1 font-medium">{metric.title}</h3>
            <p className="text-3xl font-bold text-gray-800">{metric.value}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderPropertyPortfolio = () => {
    const propertySection = dashboardData.properties?.period || dashboardData.properties?.month;
    if (!propertySection) return null;
    const data = propertySection.propertyTrend || [];
    const typeDistribution = propertySection.propertyTypes || [];
    
    const pieData = typeDistribution.map(item => ({
      name: item.type,
      value: item.count
    })).filter(item => item.value > 0);
    
    const isEmpty = (!data || data.length === 0) && (!pieData || pieData.length === 0);
    if (isEmpty) {
      return (
        <div className="flex flex-col items-center justify-center py-12 mb-12">
          <img src="/empty-state.svg" alt="No data" className="w-32 h-32 mb-4 opacity-60" />
          <p className="text-gray-400 text-lg">No property data to display.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Property Value Trend */}
        <div 
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => handleContainerClick('/properties')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleContainerClick('/properties');
            }
          }}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Property Trend</h3>
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="Listed" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Sold" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">No property trend data.</div>
          )}
        </div>
        {/* Property Type Distribution */}
        <div 
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => handleContainerClick('/properties')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleContainerClick('/properties');
            }
          }}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Property Type Distribution</h3>
          {pieData && pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">No property type data.</div>
          )}
        </div>
      </div>
    );
  };

  const renderLeadInsights = () => {
    const leadSection = dashboardData.leads?.period || dashboardData.leads?.month;
    if (!leadSection) return null;
    const leadData = leadSection.leadsTrend || [];
    const sourceData = leadSection.leadSources || [];
    
    const isEmpty = (!leadData || leadData.length === 0) && (!sourceData || sourceData.length === 0);
    if (isEmpty) {
      return (
        <div className="flex flex-col items-center justify-center py-12 mb-12">
          <img src="/empty-state.svg" alt="No data" className="w-32 h-32 mb-4 opacity-60" />
          <p className="text-gray-400 text-lg">No lead data to display.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Lead Status Trend */}
        <div 
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => handleContainerClick('/leads')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleContainerClick('/leads');
            }
          }}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Lead Trend</h3>
          {leadData && leadData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="Leads" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">No lead trend data.</div>
          )}
        </div>
        {/* Lead Source Distribution */}
        <div 
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => handleContainerClick('/leads')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleContainerClick('/leads');
            }
          }}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Lead Source Distribution</h3>
          {sourceData && sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">No lead source data.</div>
          )}
        </div>
      </div>
    );
  };

  const renderAgencyPerformance = () => {
    const leadSection = dashboardData.leads?.period || dashboardData.leads?.month;
    if (!leadSection?.agentPerformance || !userAgency) return null;
    const agentData = leadSection.agentPerformance || [];
    
    const performanceData = agentData.map(agent => ({
      name: agent.name,
      leads: agent.leads,
      deals: agent.deals
    }));
    
    const isEmpty = !performanceData || performanceData.length === 0;
    if (isEmpty) {
      return (
        <div className="flex flex-col items-center justify-center py-12 mb-12">
          <img src="/empty-state.svg" alt="No data" className="w-32 h-32 mb-4 opacity-60" />
          <p className="text-gray-400 text-lg">No agency performance data to display.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Deal Trend */}
        <div 
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => handleContainerClick('/deals')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleContainerClick('/deals');
            }
          }}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Deal Trend</h3>
          {dashboardData.deals?.period?.dealsTrend && dashboardData.deals.period.dealsTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.deals.period.dealsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="Closed" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Pipeline" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">No deal trend data.</div>
          )}
        </div>
        {/* Agent Performance */}
        <div 
          className={`bg-white p-8 rounded-3xl border border-gray-100 shadow-lg transition-all duration-300 ${isAdmin ? 'hover:shadow-xl cursor-pointer' : ''}`}
          onClick={() => isAdmin && handleContainerClick('/users')}
          style={{ cursor: isAdmin ? 'pointer' : 'default' }}
          role={isAdmin ? "button" : "presentation"}
          tabIndex={isAdmin ? 0 : -1}
          onKeyPress={(e) => {
            if (isAdmin && e.key === 'Enter') {
              handleContainerClick('/users');
            }
          }}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Agent Performance</h3>
          {performanceData && performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Bar dataKey="leads" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deals" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">No agent performance data.</div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500 bg-white p-6 rounded-xl shadow-md">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-8 md:p-16 lg:p-24">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          {userAgency && (
            <p className="text-gray-600 mt-1">Agency: {userAgency}</p>
          )}
        </div>
        <div className="flex space-x-4">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      {renderOverviewMetrics()}

      {/* Property Portfolio */}
      {renderPropertyPortfolio()}

      {/* Lead Insights */}
      {renderLeadInsights()}

      {/* Agency Performance */}
      {renderAgencyPerformance()}
    </div>
  );
}
  