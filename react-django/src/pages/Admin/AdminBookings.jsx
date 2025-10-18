import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
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
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Badge,
    Button  // Add this import
} from '@mui/material';
import {
    Search,
    FilterList,
    Refresh,
    CalendarToday,
    Person,
    LocalHospital,
    Payment,
    Visibility,
    Download,
    CheckCircle,
    Cancel,
    Schedule,
    TrendingUp,
} from '@mui/icons-material';
import AdminSidebar from '../../Components/Admin/AdminSidebar';

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [successMessage, setSuccessMessage] = useState('');

    const bookingsPerPage = 8;
    const navigate = useNavigate();
    const token = localStorage.getItem('access');
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
        } else {
            fetchCompletedBookings();
        }
    }, [token, navigate]);

    const fetchCompletedBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${baseURL}/api/admin/admin/bookings/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const sortedBookings = Array.isArray(response.data)
                ? response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                : [];
            setBookings(sortedBookings);
            setFilteredBookings(sortedBookings);
            setSuccessMessage('Bookings loaded successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Unauthorized access. Please log in again.');
                navigate('/admin/login');
            } else {
                setError('Failed to fetch bookings. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        filterBookings();
    }, [searchTerm, statusFilter, bookings]);

    const filterBookings = () => {
        let filtered = bookings;

        if (searchTerm) {
            filtered = filtered.filter((booking) =>
                booking.doctor?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.id.toString().includes(searchTerm)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((booking) => booking.status === statusFilter);
        }

        setFilteredBookings(filtered);
        setCurrentPage(1);
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            'Completed': { color: 'success', icon: <CheckCircle /> },
            'Confirmed': { color: 'primary', icon: <CheckCircle /> },
            'Pending': { color: 'warning', icon: <Schedule /> },
            'Cancelled': { color: 'error', icon: <Cancel /> },
            'No Show': { color: 'error', icon: <Cancel /> }
        };

        const config = statusConfig[status] || { color: 'default', icon: <Schedule /> };

        return (
            <Chip
                icon={config.icon}
                label={status}
                color={config.color}
                variant="filled"
                size="small"
            />
        );
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    const getAmountColor = (amount) => {
        return amount > 1000 ? 'success' : 'info';
    };

    const getStatusColor = (status) => {
        const colors = {
            'Completed': '#4caf50',
            'Confirmed': '#2196f3',
            'Pending': '#ff9800',
            'Cancelled': '#f44336',
            'No Show': '#f44336'
        };
        return colors[status] || '#9e9e9e';
    };

    // Statistics
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.slots?.amount || 0), 0);
    const completedBookings = filteredBookings.filter(booking => booking.status === 'Completed').length;
    const pendingBookings = filteredBookings.filter(booking => booking.status === 'Pending').length;
    const cancelledBookings = filteredBookings.filter(booking => booking.status === 'Cancelled').length;

    // Pagination
    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleExport = () => {
        // Implement export functionality
        console.log('Export functionality to be implemented');
    };

    // Mobile Card Component
    const MobileBookingCard = ({ booking }) => (
        <Card sx={{ mb: 2, borderLeft: `4px solid ${getStatusColor(booking.status)}` }}>
            <CardContent>
                <Stack spacing={2}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="h6" fontWeight="600">
                                Booking #{booking.id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {moment(booking.created_at).format('MMM DD, YYYY h:mm A')}
                            </Typography>
                        </Box>
                        {getStatusChip(booking.status)}
                    </Box>

                    {/* User and Doctor Info */}
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Patient
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    {getInitials(booking.user?.username)}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        {booking.user?.username || 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {booking.user?.email || booking.user?.phone_number}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Doctor
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                    <LocalHospital fontSize="small" />
                                </Avatar>
                                <Typography variant="body2" fontWeight="500">
                                    Dr. {booking.doctor?.username}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Amount and Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                            icon={<Payment />}
                            label={`₹${booking.slots?.amount || 0}`}
                            color={getAmountColor(booking.slots?.amount)}
                            variant="outlined"
                        />
                        <Tooltip title="View Details">
                            <IconButton size="small">
                                <Visibility />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

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
                        <CalendarToday sx={{ color: 'primary.main' }} />
                        Booking Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage and monitor all patient appointments and bookings
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
                                    Total Bookings
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {filteredBookings.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Completed
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {completedBookings}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Pending
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {pendingBookings}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Revenue
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    ₹{totalRevenue}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Controls Section */}
                <Card sx={{ mb: 3, p: 2 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by doctor, patient, or booking ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Status"
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <MenuItem value="all">All Status</MenuItem>
                                        <MenuItem value="Completed">Completed</MenuItem>
                                        <MenuItem value="Confirmed">Confirmed</MenuItem>
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Stack direction="row" spacing={2} justifyContent="flex-end">
                                    <Tooltip title="Refresh">
                                        <IconButton onClick={fetchCompletedBookings}>
                                            <Refresh />
                                        </IconButton>
                                    </Tooltip>
                                    <Button
                                        startIcon={<Download />}
                                        variant="outlined"
                                        onClick={handleExport}
                                    >
                                        Export
                                    </Button>
                                    <Button
                                        startIcon={<FilterList />}
                                        variant="contained"
                                    >
                                        Advanced Filter
                                    </Button>
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
                                                    <TableCell sx={{ fontWeight: 600 }}>Booking ID</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {currentBookings.map((booking) => (
                                                    <TableRow 
                                                        key={booking.id}
                                                        sx={{ 
                                                            '&:hover': { bgcolor: 'grey.50' },
                                                            borderLeft: `4px solid ${getStatusColor(booking.status)}`
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="600">
                                                                #{booking.id}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                                    {getInitials(booking.user?.username)}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight="500">
                                                                        {booking.user?.username || 'N/A'}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {booking.user?.email || booking.user?.phone_number}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                                                    <LocalHospital fontSize="small" />
                                                                </Avatar>
                                                                <Typography variant="body2" fontWeight="500">
                                                                    Dr. {booking.doctor?.username}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {moment(booking.created_at).format('MMM DD, YYYY')}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {moment(booking.created_at).format('h:mm A')}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusChip(booking.status)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                icon={<Payment />}
                                                                label={`₹${booking.slots?.amount || 0}`}
                                                                color={getAmountColor(booking.slots?.amount)}
                                                                variant="outlined"
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Tooltip title="View Details">
                                                                <IconButton size="small">
                                                                    <Visibility />
                                                                </IconButton>
                                                            </Tooltip>
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
                                {currentBookings.map((booking) => (
                                    <MobileBookingCard key={booking.id} booking={booking} />
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

                        {currentBookings.length === 0 && !loading && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                No bookings found matching your search criteria.
                            </Alert>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}

export default AdminBookings;
