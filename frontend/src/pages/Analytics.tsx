import { useEffect, useState } from 'react';
import { BarChart3, Users, Clock, Video, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { analyticsApi } from '../services/api';
import { useThemeStore, themeColors } from '../stores/themeStore';
import type { DailyStats } from '../types';

interface DashboardData {
  todayMeetings: number;
  todayParticipants: number;
  totalMeetings: number;
  totalUsers: number;
  avgDuration: number;
  peakUsers: number;
}

export function Analytics() {
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];
  
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, dailyRes] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getDailyStats(7)
        ]);
        setDashboard(dashRes.data);
        setDailyStats(dailyRes.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" 
             style={{ borderColor: theme.primary, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const stats = [
    { 
      icon: Video, 
      label: 'Cuộc họp hôm nay', 
      value: dashboard?.todayMeetings || 0,
      color: theme.primary 
    },
    { 
      icon: Users, 
      label: 'Người tham gia hôm nay', 
      value: dashboard?.todayParticipants || 0,
      color: '#23a559' 
    },
    { 
      icon: Clock, 
      label: 'Thời lượng TB (phút)', 
      value: dashboard?.avgDuration || 0,
      color: '#eb459e' 
    },
    { 
      icon: TrendingUp, 
      label: 'Cao điểm đồng thời', 
      value: dashboard?.peakUsers || 0,
      color: '#f0b232' 
    },
  ];

  const maxMeetings = Math.max(...dailyStats.map(d => d.totalMeetings), 1);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 style={{ color: theme.primary }} />
            Thống kê sử dụng
          </h1>
          <p className="text-[#b5bac1] mt-2">
            Theo dõi hoạt động cuộc họp và người dùng
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-[#b5bac1] text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calendar size={18} style={{ color: theme.primary }} />
              Cuộc họp 7 ngày qua
            </h3>
            <div className="flex items-end gap-2 h-48">
              {dailyStats.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full rounded-t transition-all hover:opacity-80"
                    style={{ 
                      height: `${(day.totalMeetings / maxMeetings) * 100}%`,
                      minHeight: '4px',
                      backgroundColor: theme.primary 
                    }}
                  />
                  <div className="text-[#6d6f78] text-xs mt-2">
                    {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </div>
                  <div className="text-white text-sm font-medium">
                    {day.totalMeetings}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">Tổng quan</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#b5bac1]">Tổng cuộc họp</span>
                  <span className="text-white font-medium">{dashboard?.totalMeetings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b5bac1]">Tổng người dùng</span>
                  <span className="text-white font-medium">{dashboard?.totalUsers || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">AI Bot</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5865f2] to-[#eb459e] rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🤖</span>
                </div>
                <div>
                  <div className="text-white font-medium">AI Assistant</div>
                  <div className="text-[#b5bac1] text-sm">Sẵn sàng tham gia cuộc họp</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
