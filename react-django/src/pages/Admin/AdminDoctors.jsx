import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    Grid,
    Pagination,
    Stack,
    Tooltip,
    Avatar,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    InputAdornment,
    Badge
} from '@mui/material';
import {
    MedicalServices,
    Block,
    CheckCircle,
    Search,
    FilterList,
    Refresh,
    Email,
    Work,
    Person,
    Visibility,
    Star,
    CalendarToday,
    LocalHospital,
    Warning
} from '@mui/icons-material';
import axios from 'axios';
import AdminSidebar from "../../Components/Admin/AdminSidebar";

function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [doctorDetailOpen, setDoctorDetailOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'blocked'

    const doctorsPerPage = 8;
    const token = localStorage.getItem('access');
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        fetchDoctors();
    }, [token]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseURL}/api/admin/admin/doctors_list/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setDoctors(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error fetching doctors list. Please check your network or authorization.');
        } finally {
            setLoading(false);
        }
    };

    // Filter doctors based on search term and status
    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = 
            doctor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = 
            filterStatus === 'all' || 
            (filterStatus === 'active' && doctor.is_active) ||
            (filterStatus === 'blocked' && !doctor.is_active);

        return matchesSearch && matchesStatus;
    });

    // Toggle the active status of a doctor
    const toggleActiveStatus = async (doctorId) => {
        try {
            const response = await axios.post(`${baseURL}/api/admin/admin/doctors/${doctorId}/toggle/`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const updatedDoctors = doctors.map(doctor =>
                doctor.id === doctorId ? { ...doctor, is_active: response.data.is_active } : doctor
            );
            setDoctors(updatedDoctors);
            
            const doctor = doctors.find(d => d.id === doctorId);
            setSuccessMessage(
                response.data.is_active 
                    ? `Dr. ${doctor.first_name} ${doctor.last_name} has been activated successfully!`
                    : `Dr. ${doctor.first_name} ${doctor.last_name} has been blocked successfully!`
            );
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error(err);
            setError('Error toggling doctor status.');
        }
    };

    const openConfirmDialog = (doctor) => {
        setSelectedDoctor(doctor);
        setConfirmDialogOpen(true);
    };

    const closeConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setSelectedDoctor(null);
    };

    const openDoctorDetail = (doctor) => {
        setSelectedDoctor(doctor);
        setDoctorDetailOpen(true);
    };

    const closeDoctorDetail = () => {
        setDoctorDetailOpen(false);
        setSelectedDoctor(null);
    };

    const handleConfirmAction = () => {
        if (selectedDoctor) {
            toggleActiveStatus(selectedDoctor.id);
            closeConfirmDialog();
        }
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
    const indexOfLastDoctor = currentPage * doctorsPerPage;
    const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
    const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const getStatusChip = (isActive) => {
        return isActive ? (
            <Chip
                icon={<CheckCircle />}
                label="Active"
                color="success"
                variant="filled"
                size="small"
            />
        ) : (
            <Chip
                icon={<Block />}
                label="Blocked"
                color="error"
                variant="outlined"
                size="small"
            />
        );
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getExperienceColor = (experience) => {
        const exp = parseInt(experience) || 0;
        if (exp >= 10) return 'success';
        if (exp >= 5) return 'warning';
        return 'info';
    };

    // Summary statistics
    const activeDoctorsCount = doctors.filter(doctor => doctor.is_active).length;
    const blockedDoctorsCount = doctors.filter(doctor => !doctor.is_active).length;
    const totalExperience = doctors.reduce((sum, doctor) => sum + (parseInt(doctor.experience) || 0), 0);
    const averageExperience = doctors.length > 0 ? (totalExperience / doctors.length).toFixed(1) : 0;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
            <AdminSidebar />
            
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        gutterBottom 
                        sx={{ 
                            fontWeight: 700,
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <MedicalServices sx={{ color: 'primary.main' }} />
                        Doctor Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage doctor accounts, profiles, and access permissions
                    </Typography>
                </Box>

                {/* Alerts */}
                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {successMessage}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Doctors
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {doctors.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Active Doctors
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {activeDoctorsCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Blocked Doctors
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {blockedDoctorsCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Avg. Experience
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {averageExperience}yrs
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Controls Section */}
                <Card sx={{ mb: 3, p: 2 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    placeholder="Search doctors by name, specialization, or email..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
                                    <Button
                                        variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                                        onClick={() => setFilterStatus('all')}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={filterStatus === 'active' ? 'contained' : 'outlined'}
                                        color="success"
                                        onClick={() => setFilterStatus('active')}
                                    >
                                        Active
                                    </Button>
                                    <Button
                                        variant={filterStatus === 'blocked' ? 'contained' : 'outlined'}
                                        color="error"
                                        onClick={() => setFilterStatus('blocked')}
                                    >
                                        Blocked
                                    </Button>
                                    <Tooltip title="Refresh">
                                        <IconButton onClick={fetchDoctors}>
                                            <Refresh />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        {!isMobile && (
                            <Card>
                                <CardContent>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                    <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Specialization</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Experience</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {currentDoctors.map((doctor) => (
                                                    <TableRow 
                                                        key={doctor.id}
                                                        sx={{ 
                                                            '&:hover': { bgcolor: 'grey.50' },
                                                            bgcolor: doctor.is_active ? 'background.paper' : 'error.light'
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                                    {getInitials(doctor.first_name, doctor.last_name)}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="subtitle1" fontWeight="600">
                                                                        Dr. {doctor.first_name} {doctor.last_name}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        ID: {doctor.id}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={doctor.specification} 
                                                                variant="outlined" 
                                                                size="small"
                                                                icon={<LocalHospital />}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                icon={<Work />}
                                                                label={`${doctor.experience} years`}
                                                                color={getExperienceColor(doctor.experience)}
                                                                variant="filled"
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack spacing={0.5}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Email fontSize="small" color="action" />
                                                                    <Typography variant="body2">
                                                                        {doctor.email}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusChip(doctor.is_active)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title="View Details">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => openDoctorDetail(doctor)}
                                                                    >
                                                                        <Visibility />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={doctor.is_active ? 'Block Doctor' : 'Activate Doctor'}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => openConfirmDialog(doctor)}
                                                                        color={doctor.is_active ? 'error' : 'success'}
                                                                    >
                                                                        {doctor.is_active ? <Block /> : <CheckCircle />}
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        )}

                        {/* Mobile Card View */}
                        {isMobile && (
                            <Box>
                                {currentDoctors.map((doctor) => (
                                    <Card key={doctor.id} sx={{ mb: 2, border: doctor.is_active ? undefined : '2px solid #f44336' }}>
                                        <CardContent>
                                            <Stack spacing={2}>
                                                {/* Doctor Header */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        {getInitials(doctor.first_name, doctor.last_name)}
                                                    </Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h6">
                                                            Dr. {doctor.first_name} {doctor.last_name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            ID: {doctor.id}
                                                        </Typography>
                                                    </Box>
                                                    {getStatusChip(doctor.is_active)}
                                                </Box>

                                                {/* Doctor Details */}
                                                <Stack spacing={1}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <LocalHospital fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {doctor.specification}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Work fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {doctor.experience} years experience
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Email fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {doctor.email}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                {/* Actions */}
                                                <Stack direction="row" spacing={1} justifyContent="space-between">
                                                    <Button
                                                        startIcon={<Visibility />}
                                                        onClick={() => openDoctorDetail(doctor)}
                                                        size="small"
                                                    >
                                                        Details
                                                    </Button>
                                                    <Button
                                                        startIcon={doctor.is_active ? <Block /> : <CheckCircle />}
                                                        onClick={() => openConfirmDialog(doctor)}
                                                        color={doctor.is_active ? 'error' : 'success'}
                                                        variant="outlined"
                                                        size="small"
                                                    >
                                                        {doctor.is_active ? 'Block' : 'Activate'}
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}

                        {/* Pagination */}
                        {totalPages > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}

                        {currentDoctors.length === 0 && !loading && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                No doctors found matching your search criteria.
                            </Alert>
                        )}
                    </>
                )}

                {/* Confirmation Dialog */}
                <Dialog open={confirmDialogOpen} onClose={closeConfirmDialog}>
                    <DialogTitle>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning color="warning" />
                            Confirm Doctor Action
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to {selectedDoctor?.is_active ? 'block' : 'activate'} {' '}
                            <strong>Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name}</strong>?
                        </Typography>
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {selectedDoctor?.is_active 
                                ? 'Blocking this doctor will prevent them from accessing the platform and providing services.'
                                : 'Activating this doctor will grant them access to the platform and allow them to provide services.'
                            }
                        </Alert>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeConfirmDialog}>Cancel</Button>
                        <Button
                            onClick={handleConfirmAction}
                            variant="contained"
                            color={selectedDoctor?.is_active ? 'error' : 'success'}
                            startIcon={selectedDoctor?.is_active ? <Block /> : <CheckCircle />}
                        >
                            {selectedDoctor?.is_active ? 'Block Doctor' : 'Activate Doctor'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Doctor Detail Dialog */}
                <Dialog open={doctorDetailOpen} onClose={closeDoctorDetail} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Typography variant="h6">Doctor Details</Typography>
                    </DialogTitle>
                    <DialogContent>
                        {selectedDoctor && (
                            <Stack spacing={3} sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                                        {getInitials(selectedDoctor.first_name, selectedDoctor.last_name)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5">
                                            Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Doctor ID: {selectedDoctor.id}
                                        </Typography>
                                        {getStatusChip(selectedDoctor.is_active)}
                                    </Box>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Specialization
                                        </Typography>
                                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocalHospital fontSize="small" />
                                            {selectedDoctor.specification}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Experience
                                        </Typography>
                                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Work fontSize="small" />
                                            {selectedDoctor.experience} years
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Email Address
                                        </Typography>
                                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Email fontSize="small" />
                                            {selectedDoctor.email}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Account Status
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedDoctor.is_active ? 'Active - Can provide services' : 'Blocked - Cannot provide services'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Stack>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDoctorDetail}>Close</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                closeDoctorDetail();
                                openConfirmDialog(selectedDoctor);
                            }}
                            color={selectedDoctor?.is_active ? 'error' : 'success'}
                        >
                            {selectedDoctor?.is_active ? 'Block Doctor' : 'Activate Doctor'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}

export default AdminDoctors;
