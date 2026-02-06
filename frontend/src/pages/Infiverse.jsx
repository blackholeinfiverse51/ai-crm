import React, { useState, useEffect, useCallback } from 'react';
import { 
  UsersRound, Activity, Clock, TrendingUp, Award, 
  Calendar, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Eye, EyeOff, Shield, BarChart3, LogIn, LogOut, Save
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import Alert from '../components/common/ui/Alert';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { Modal, ModalFooter } from '../components/common/ui/Modal';
import { employeeAPI } from '../services/api/employeeAPI';
import { userAPI } from '../services/api/userAPI';
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Infiverse = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);
  const [employeeMetrics, setEmployeeMetrics] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    facial_recognition_opt_in: false,
  });

  // Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await userAPI.getCurrentUser();
      const user = response.data;
      setCurrentUser(user);
      
      // Use user ID as employee ID
      if (user.user_id || user.id) {
        const employeeId = user.user_id || user.id;
        await fetchEmployeeData(employeeId);
      }
    } catch (err) {
      console.warn('Failed to fetch current user:', err);
      setError('Failed to load user information');
    }
  }, []);

  // Fetch employee data
  const fetchEmployeeData = useCallback(async (employeeId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch employee metrics
      try {
        const metricsResponse = await employeeAPI.getEmployeeMetrics(employeeId);
        setEmployeeMetrics(metricsResponse.data);
      } catch (err) {
        console.warn('Failed to fetch employee metrics:', err);
      }

      // Fetch attendance records
      try {
        const attendanceResponse = await employeeAPI.getEmployeeAttendance(employeeId);
        const records = attendanceResponse.data || [];
        setAttendanceRecords(records.map(record => ({
          date: record.date,
          status: record.status,
          checkIn: record.check_in,
          checkOut: record.check_out,
          hoursWorked: record.hours_worked,
        })));
      } catch (err) {
        console.warn('Failed to fetch attendance:', err);
      }

      // Fetch privacy settings
      try {
        const privacyResponse = await employeeAPI.updateEmployeePrivacy(employeeId, {});
        // This is a PUT endpoint, so we'll just set defaults
      } catch (err) {
        console.warn('Failed to fetch privacy settings:', err);
      }

    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (currentUser) {
        const employeeId = currentUser.user_id || currentUser.id;
        if (employeeId) {
          fetchEmployeeData(employeeId);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCurrentUser, currentUser, fetchEmployeeData]);

  const handleCheckIn = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const employeeId = currentUser.user_id || currentUser.id;
      await employeeAPI.checkIn({
        employee_id: employeeId,
        timestamp: new Date().toISOString(),
      });
      setSuccess('Check-in successful');
      setTimeout(() => {
        fetchEmployeeData(employeeId);
        setSuccess(null);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const employeeId = currentUser.user_id || currentUser.id;
      await employeeAPI.checkOut({
        employee_id: employeeId,
        timestamp: new Date().toISOString(),
      });
      setSuccess('Check-out successful');
      setTimeout(() => {
        fetchEmployeeData(employeeId);
        setSuccess(null);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const employeeId = currentUser.user_id || currentUser.id;
      await employeeAPI.updateEmployeePrivacy(employeeId, privacySettings);
      setSuccess('Privacy settings updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const performanceHistory = employeeMetrics?.performance_history || [];
  const achievements = employeeMetrics?.achievements || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Employee Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Track your performance, attendance, and achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            if (currentUser) {
              const employeeId = currentUser.user_id || currentUser.id;
              if (employeeId) fetchEmployeeData(employeeId);
            }
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" onClose={() => setError(null)}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {success}
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={handleCheckIn} className="h-20" disabled={loading}>
          <LogIn className="h-5 w-5 mr-2" />
          Check In
        </Button>
        <Button onClick={handleCheckOut} variant="outline" className="h-20" disabled={loading}>
          <LogOut className="h-5 w-5 mr-2" />
          Check Out
        </Button>
      </div>

      {/* Metrics */}
      {employeeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Performance Score"
            value={employeeMetrics.performance_score?.toFixed(1) || '0.0'}
            icon={TrendingUp}
            variant="primary"
          />
          <MetricCard
            title="Tasks Completed"
            value={employeeMetrics.tasks_completed?.toLocaleString() || '0'}
            icon={CheckCircle}
            variant="success"
          />
          <MetricCard
            title="Pending Reviews"
            value={employeeMetrics.pending_reviews?.toLocaleString() || '0'}
            icon={Award}
            variant="warning"
          />
          <MetricCard
            title="Achievements"
            value={achievements.length.toLocaleString()}
            icon={Award}
            variant="accent"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'attendance'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'performance'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'privacy'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Privacy
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Award className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{achievement.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {achievement.date ? formatDate(new Date(achievement.date)) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No achievements yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {performanceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" name="Performance Score" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No performance data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner text="Loading attendance..." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours Worked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === 'present' ? 'success' : 'warning'}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.checkIn || 'N/A'}</TableCell>
                      <TableCell>{record.checkOut || 'N/A'}</TableCell>
                      <TableCell>{record.hoursWorked || '0'} hours</TableCell>
                    </TableRow>
                  ))}
                  {attendanceRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && employeeMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Current Performance Score</span>
                <p className="text-2xl font-bold">{employeeMetrics.performance_score?.toFixed(1) || '0.0'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                <p className="text-2xl font-bold">{employeeMetrics.tasks_completed || 0}</p>
              </div>
            </div>
            {performanceHistory.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Performance History</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#8884d8" name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Facial Recognition Opt-In</div>
                    <div className="text-sm text-muted-foreground">
                      Allow facial recognition for attendance tracking
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.facial_recognition_opt_in}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, facial_recognition_opt_in: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
              </label>
            </div>
            <div className="flex justify-end">
              <Button onClick={handlePrivacyUpdate} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Privacy Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Infiverse;
