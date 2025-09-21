import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../App';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Pill, Plus, Download, Search, ArrowLeft, User, Calendar, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Prescriptions = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient');
  
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patient_id: patientId || '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: ''
  });

  useEffect(() => {
    fetchPrescriptions();
    if (user.role === 'doctor' || user.role === 'admin') {
      fetchPatients();
    }
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      const params = patientId ? { patient_id: patientId } : {};
      const response = await axios.get('/prescriptions', { params });
      setPrescriptions(response.data);
    } catch (error) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/users/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to load patients');
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/prescriptions', newPrescription);
      toast.success('Prescription created successfully');
      setIsCreateDialogOpen(false);
      setNewPrescription({
        patient_id: patientId || '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        instructions: ''
      });
      fetchPrescriptions();
    } catch (error) {
      toast.error('Failed to create prescription');
    }
  };

  const addMedication = () => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index, field, value) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.medications?.some(med => 
      med.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || prescription.instructions?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDashboardRoute = () => {
    switch (user.role) {
      case 'patient':
        return '/patient-dashboard';
      case 'doctor':
        return '/doctor-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.full_name : `Patient ID: ${patientId}`;
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
          <Link to={getDashboardRoute()} className="navbar-brand">
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Back to Dashboard
          </Link>
          <div className="navbar-nav">
            <span className="nav-link">Prescriptions</span>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Prescriptions</h1>
          <p className="dashboard-subtitle">
            {user.role === 'patient' 
              ? 'Your medication prescriptions' 
              : 'Patient prescriptions and medication management'
            }
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
          
          {user.role === 'doctor' && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Digital Prescription</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePrescription}>
                  <div className="grid gap-4">
                    <div className="form-group">
                      <Label htmlFor="patient_select">Patient</Label>
                      <select
                        id="patient_select"
                        className="form-select"
                        value={newPrescription.patient_id}
                        onChange={(e) => setNewPrescription(prev => ({ ...prev, patient_id: e.target.value }))}
                        required
                      >
                        <option value="">Select a patient</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <div className="flex justify-between items-center mb-3">
                        <Label>Medications</Label>
                        <Button type="button" onClick={addMedication} className="btn btn-outline btn-sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Medication
                        </Button>
                      </div>
                      
                      {newPrescription.medications.map((medication, index) => (
                        <div key={index} className="grid grid-cols-4 gap-3 mb-3 p-4 border rounded">
                          <div>
                            <Label htmlFor={`med_name_${index}`}>Medicine Name</Label>
                            <Input
                              id={`med_name_${index}`}
                              value={medication.name}
                              onChange={(e) => updateMedication(index, 'name', e.target.value)}
                              placeholder="e.g., Amoxicillin"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`med_dosage_${index}`}>Dosage</Label>
                            <Input
                              id={`med_dosage_${index}`}
                              value={medication.dosage}
                              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                              placeholder="e.g., 500mg"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`med_frequency_${index}`}>Frequency</Label>
                            <Input
                              id={`med_frequency_${index}`}
                              value={medication.frequency}
                              onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                              placeholder="e.g., 3 times daily"
                              required
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <Label htmlFor={`med_duration_${index}`}>Duration</Label>
                              <Input
                                id={`med_duration_${index}`}
                                value={medication.duration}
                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                placeholder="e.g., 7 days"
                                required
                              />
                            </div>
                            {newPrescription.medications.length > 1 && (
                              <Button 
                                type="button" 
                                onClick={() => removeMedication(index)}
                                className="btn btn-outline btn-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="form-group">
                      <Label htmlFor="instructions">Special Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={newPrescription.instructions}
                        onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Special instructions for the patient (e.g., take with food, avoid alcohol)"
                        rows="3"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" onClick={() => setIsCreateDialogOpen(false)} className="btn btn-outline">
                      Cancel
                    </Button>
                    <Button type="submit" className="btn btn-primary">
                      Create Prescription
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Prescriptions List */}
        {filteredPrescriptions.length > 0 ? (
          <div className="grid gap-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title flex items-center">
                        <Pill className="w-5 h-5 mr-2" />
                        Prescription - {prescription.medications?.length || 0} Medication(s)
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {(user.role === 'doctor' || user.role === 'admin') && (
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {getPatientName(prescription.patient_id)}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(prescription.created_at)}
                        </span>
                      </div>
                    </div>
                    <Button className="btn btn-outline btn-sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid gap-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-blue-900">Medications</h4>
                      <div className="grid gap-3">
                        {prescription.medications?.map((medication, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="grid md:grid-cols-4 gap-3">
                              <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Medicine</span>
                                <p className="font-semibold text-gray-900">{medication.name}</p>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Dosage</span>
                                <p className="text-gray-700">{medication.dosage}</p>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Frequency</span>
                                <p className="text-gray-700">{medication.frequency}</p>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Duration</span>
                                <p className="text-gray-700">{medication.duration}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {prescription.instructions && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-blue-900">Special Instructions</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-blue-800 text-sm">{prescription.instructions}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <div className="text-xs text-gray-500">
                        <div className="grid md:grid-cols-3 gap-2">
                          <p>Prescription ID: {prescription.id}</p>
                          <p>Created: {formatDate(prescription.created_at)}</p>
                          {prescription.appointment_id && (
                            <p>Appointment: {prescription.appointment_id}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card">
            <CardContent>
              <div className="text-center py-8">
                <Pill className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prescriptions Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'No prescriptions match your search criteria.'
                    : user.role === 'patient'
                      ? 'You don\'t have any prescriptions yet.'
                      : 'No prescriptions have been created yet.'
                  }
                </p>
                {user.role === 'doctor' && !searchTerm && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)} 
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Prescription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;