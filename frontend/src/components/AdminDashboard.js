import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Users, Calendar, FileText, DollarSign, Settings, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, appointmentsRes] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/users/patients'),
        axios.get('/appointments')
      ]);

      setStats(statsRes.data);
      setRecentUsers(usersRes.data.slice(0, 5));
      setRecentAppointments(appointmentsRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const classes = {
      patient: 'badge badge-info',
      doctor: 'badge badge-success',
      admin: 'badge badge-warning'
    };
    return <span className={classes[role] || 'badge badge-info'}>{role}</span>;
  };

  const getStatusBadge = (status) => {
    const classes = {
      scheduled: 'badge badge-info',
      completed: 'badge badge-success',
      cancelled: 'badge badge-danger'
    };
    return <span className={classes[status] || 'badge badge-info'}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            MedConnect - Admin Portal
          </Link>
          <div className="navbar-nav">
            <span className="nav-link">Admin: {user.full_name}</span>
            <Button onClick={logout} className="btn btn-outline">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">System Overview & Management</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <Users className="medical-icon-large mb-3" />
            <div className="stat-number">{stats.total_users || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <Shield className="medical-icon-large mb-3" />
            <div className="stat-number">{stats.total_doctors || 0}</div>
            <div className="stat-label">Doctors</div>
          </div>
          <div className="stat-card">
            <Users className="medical-icon-large mb-3" />
            <div className="stat-number">{stats.total_patients || 0}</div>
            <div className="stat-label">Patients</div>
          </div>
          <div className="stat-card">
            <Calendar className="medical-icon-large mb-3" />
            <div className="stat-number">{stats.total_appointments || 0}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 mb-4">
          <Card className="card">
            <CardHeader>
              <h3 className="card-title">System Management</h3>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button className="btn btn-primary w-full">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </Button>
              <Button className="btn btn-success w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Appointments
              </Button>
              <Button className="btn btn-outline w-full">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button className="btn btn-outline w-full">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="card col-span-2">
            <CardHeader>
              <h3 className="card-title">System Health</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">98%</div>
                  <div className="text-sm text-gray-600">System Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600">Monitoring</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">v2.1</div>
                  <div className="text-sm text-gray-600">Version</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Database Performance</span>
                  <span className="text-sm font-semibold text-green-600">Excellent</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-2">
          <Card className="card">
            <CardHeader>
              <h3 className="card-title">Recent Users</h3>
            </CardHeader>
            <CardContent>
              {recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                      <div>
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined: {formatDate(user.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        <Button className="btn btn-outline btn-sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No recent users</p>
              )}
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <h3 className="card-title">Recent Appointments</h3>
            </CardHeader>
            <CardContent>
              {recentAppointments.length > 0 ? (
                <div className="space-y-3">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            Patient: {appointment.patient_id.substring(0, 8)}...
                          </p>
                          <p className="text-sm text-gray-600">
                            Doctor: {appointment.doctor_id.substring(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(appointment.appointment_date)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(appointment.status)}
                          <Button className="btn btn-outline btn-sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No recent appointments</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Admin Tools */}
        <div className="mt-6">
          <Card className="card">
            <CardHeader>
              <h3 className="card-title">Administrative Tools</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <Button className="btn btn-outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Financial Reports
                </Button>
                <Button className="btn btn-outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button className="btn btn-outline">
                  <Settings className="w-4 h-4 mr-2" />
                  System Config
                </Button>
                <Button className="btn btn-outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;