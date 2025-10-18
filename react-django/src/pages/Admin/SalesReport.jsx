import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Grid,
    Pagination,
    Stack,
    useTheme,
    useMediaQuery,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Print,
    Download,
    CalendarToday,
    Payment,
    AccountBalanceWallet,
    Refresh,
    Visibility
} from '@mui/icons-material';
import AdminSidebar from "../../Components/Admin/AdminSidebar";

const SalesReport = () => {
    const [bookings, setBookings] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [walletTransactions, setWalletTransactions] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const navigate = useNavigate();
    const token = localStorage.getItem('access');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const fetchSalesReport = async (date) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await axios.get(`${baseURL}/api/admin/admin/sales_report/`, {
                params: { date },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setBookings(response.data.bookings || []);
            setTransactions(response.data.transactions || []);
            setWalletTransactions(response.data.wallet_transactions || []);
            setTotalAmount(response.data.total_amount || 0);
            setSuccess('Sales report loaded successfully');
            setLoading(false);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Unauthorized access. Please log in again.');
                navigate('/login');
            } else {
                setError('Failed to fetch sales report. Please try again.');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchSalesReport(selectedDate);
        }
    }, [selectedDate, token]);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setCurrentPage(1);
    };

    const handleRefresh = () => {
        fetchSalesReport(selectedDate);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Implement export functionality
        console.log('Export functionality to be implemented');
    };

    // Combine transactions and wallet transactions
    const combinedTransactions = [
        ...transactions.map(transaction => ({
            ...transaction,
            method: 'Razorpay',
            type: 'payment',
            icon: <Payment sx={{ fontSize: 18 }} />
        })),
        ...walletTransactions.map(walletTransaction => ({
            id: walletTransaction.id,
            amount: walletTransaction.amount,
            status: walletTransaction.status,
            method: 'Wallet',
            username: walletTransaction.username,
            type: 'wallet',
            icon: <AccountBalanceWallet sx={{ fontSize: 18 }} />
        }))
    ];

    // Pagination logic
    const totalPages = Math.ceil(combinedTransactions.length / itemsPerPage);
    const displayedTransactions = combinedTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'success':
                return 'success';
            case 'pending':
                return 'warning';
            case 'failed':
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getMethodColor = (method) => {
        return method === 'Razorpay' ? 'primary' : 'secondary';
    };

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
                            gap: 1
                        }}
                    >
                        <CalendarToday sx={{ color: 'primary.main' }} />
                        Sales Report
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View and analyze daily transaction reports
                    </Typography>
                </Box>

                {/* Controls Section */}
                <Card sx={{ mb: 3, p: 2 }}>
                    <CardContent>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={6} lg={4}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Select Date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    inputProps={{
                                        max: format(new Date(), 'yyyy-MM-dd')
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6} lg={8}>
                                <Stack direction="row" spacing={2} flexWrap="wrap">
                                    <Button
                                        variant="contained"
                                        startIcon={<Print />}
                                        onClick={handlePrint}
                                        sx={{ mb: 1 }}
                                    >
                                        Print Report
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Download />}
                                        onClick={handleExport}
                                        sx={{ mb: 1 }}
                                    >
                                        Export CSV
                                    </Button>
                                    <Tooltip title="Refresh Data">
                                        <IconButton 
                                            onClick={handleRefresh}
                                            sx={{ mb: 1 }}
                                        >
                                            <Refresh />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Alerts */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Revenue
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    ₹{totalAmount.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Transactions
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {combinedTransactions.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Razorpay Payments
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {transactions.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Wallet Transactions
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {walletTransactions.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Transactions Table */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Visibility />
                                    Transaction Details
                                </Typography>
                                
                                {displayedTransactions.length === 0 ? (
                                    <Alert severity="info">
                                        No transactions found for the selected date.
                                    </Alert>
                                ) : (
                                    <>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table>
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                        <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>User Name</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {displayedTransactions.map((transaction, index) => (
                                                        <TableRow 
                                                            key={index}
                                                            sx={{ 
                                                                '&:hover': { bgcolor: 'grey.50' },
                                                                '&:last-child td, &:last-child th': { border: 0 }
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    {transaction.icon}
                                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                                        {transaction.id}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                    ₹{transaction.amount}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip 
                                                                    label={transaction.status} 
                                                                    color={getStatusColor(transaction.status)}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip 
                                                                    label={transaction.method} 
                                                                    color={getMethodColor(transaction.method)}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {transaction.username || 'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                                <Pagination
                                                    count={totalPages}
                                                    page={currentPage}
                                                    onChange={(event, value) => setCurrentPage(value)}
                                                    color="primary"
                                                    showFirstButton
                                                    showLastButton
                                                />
                                            </Box>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Mobile View */}
                        {isMobile && displayedTransactions.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Transactions (Mobile View)
                                </Typography>
                                {displayedTransactions.map((transaction, index) => (
                                    <Card key={index} sx={{ mb: 2, p: 2 }}>
                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    Transaction ID
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                    {transaction.id}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    Amount
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    ₹{transaction.amount}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    Status
                                                </Typography>
                                                <Chip 
                                                    label={transaction.status} 
                                                    color={getStatusColor(transaction.status)}
                                                    size="small"
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    Method
                                                </Typography>
                                                <Chip 
                                                    label={transaction.method} 
                                                    color={getMethodColor(transaction.method)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    User Name
                                                </Typography>
                                                <Typography variant="body2">
                                                    {transaction.username || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default SalesReport;
