import React, { useEffect, useState } from 'react';
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
    InputAdornment
} from '@mui/material';
import {
    Person,
    Block,
    CheckCircle,
    Search,
    FilterList,
    Refresh,
    Email,
    Phone,
    Warning,
    Visibility,
    Edit
} from '@mui/icons-material';
import axios from 'axios';
import AdminSidebar from "../../Components/Admin/AdminSidebar";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [userDetailOpen, setUserDetailOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const usersPerPage = 8;
    const token = localStorage.getItem('access');
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseURL}/api/admin/admin/users_list/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setUsers(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error fetching users list. Please check your network or authorization.');
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user?.phone_number?.includes(searchTerm)
    );

    // Toggle the active status of a user
    const toggleActiveStatus = async (userId) => {
        try {
            const response = await axios.post(`${baseURL}/api/admin/admin/users/${userId}/toggle/`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const updatedUsers = users.map(user =>
                user.id === userId
                    ? { ...user, is_active: response.data.is_active }
                    : user
            );
            setUsers(updatedUsers);
            
            const user = users.find(u => u.id === userId);
            setSuccessMessage(
                response.data.is_active 
                    ? `User ${user.user?.username} has been activated successfully!`
                    : `User ${user.user?.username} has been blocked successfully!`
            );
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error(err);
            setError('Error toggling user status.');
        }
    };

    const openConfirmDialog = (user) => {
        setSelectedUser(user);
        setConfirmDialogOpen(true);
    };

    const closeConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setSelectedUser(null);
    };

    const openUserDetail = (user) => {
        setSelectedUser(user);
        setUserDetailOpen(true);
    };

    const closeUserDetail = () => {
        setUserDetailOpen(false);
        setSelectedUser(null);
    };

    const handleConfirmAction = () => {
        if (selectedUser) {
            toggleActiveStatus(selectedUser.id);
            closeConfirmDialog();
        }
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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

    const getInitials = (username) => {
        return username ? username.charAt(0).toUpperCase() : 'U';
    };

    // Summary statistics
    const activeUsersCount = users.filter(user => user.is_active).length;
    const blockedUsersCount = users.filter(user => !user.is_active).length;

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
                        <Person sx={{ color: 'primary.main' }} />
                        User Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage user accounts and access permissions
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
                                    Total Users
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {users.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Active Users
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {activeUsersCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Blocked Users
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {blockedUsersCount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Filtered Results
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {filteredUsers.length}
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
                                    placeholder="Search users by name, email, or phone..."
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
                                <Stack direction="row" spacing={2} justifyContent="flex-end">
                                    <Tooltip title="Refresh">
                                        <IconButton onClick={fetchUsers}>
                                            <Refresh />
                                        </IconButton>
                                    </Tooltip>
                                    <Button startIcon={<FilterList />} variant="outlined">
                                        Filter
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
                                                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {currentUsers.map((user) => (
                                                    <TableRow 
                                                        key={user.id}
                                                        sx={{ 
                                                            '&:hover': { bgcolor: 'grey.50' },
                                                            bgcolor: user.is_active ? 'background.paper' : 'error.light'
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                                    {getInitials(user.user?.username)}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="subtitle1" fontWeight="600">
                                                                        {user.user?.username || 'N/A'}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        User ID: {user.id}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack spacing={0.5}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Email fontSize="small" color="action" />
                                                                    <Typography variant="body2">
                                                                        {user.user?.email || 'N/A'}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Phone fontSize="small" color="action" />
                                                                    <Typography variant="body2">
                                                                        {user.user?.phone_number || 'N/A'}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusChip(user.is_active)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title="View Details">
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => openUserDetail(user)}
                                                                    >
                                                                        <Visibility />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={user.is_active ? 'Block User' : 'Activate User'}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => openConfirmDialog(user)}
                                                                        color={user.is_active ? 'error' : 'success'}
                                                                    >
                                                                        {user.is_active ? <Block /> : <CheckCircle />}
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
                                {currentUsers.map((user) => (
                                    <Card key={user.id} sx={{ mb: 2, border: user.is_active ? undefined : '2px solid #f44336' }}>
                                        <CardContent>
                                            <Stack spacing={2}>
                                                {/* User Header */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        {getInitials(user.user?.username)}
                                                    </Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h6">
                                                            {user.user?.username || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            ID: {user.id}
                                                        </Typography>
                                                    </Box>
                                                    {getStatusChip(user.is_active)}
                                                </Box>

                                                {/* Contact Info */}
                                                <Stack spacing={1}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Email fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {user.user?.email || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Phone fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {user.user?.phone_number || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                {/* Actions */}
                                                <Stack direction="row" spacing={1} justifyContent="space-between">
                                                    <Button
                                                        startIcon={<Visibility />}
                                                        onClick={() => openUserDetail(user)}
                                                        size="small"
                                                    >
                                                        Details
                                                    </Button>
                                                    <Button
                                                        startIcon={user.is_active ? <Block /> : <CheckCircle />}
                                                        onClick={() => openConfirmDialog(user)}
                                                        color={user.is_active ? 'error' : 'success'}
                                                        variant="outlined"
                                                        size="small"
                                                    >
                                                        {user.is_active ? 'Block' : 'Activate'}
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

                        {currentUsers.length === 0 && !loading && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                No users found matching your search criteria.
                            </Alert>
                        )}
                    </>
                )}

                {/* Confirmation Dialog */}
                <Dialog open={confirmDialogOpen} onClose={closeConfirmDialog}>
                    <DialogTitle>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning color="warning" />
                            Confirm User Action
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to {selectedUser?.is_active ? 'block' : 'activate'} user{' '}
                            <strong>{selectedUser?.user?.username}</strong>?
                        </Typography>
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {selectedUser?.is_active 
                                ? 'Blocking this user will prevent them from accessing the platform.'
                                : 'Activating this user will grant them access to the platform.'
                            }
                        </Alert>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeConfirmDialog}>Cancel</Button>
                        <Button
                            onClick={handleConfirmAction}
                            variant="contained"
                            color={selectedUser?.is_active ? 'error' : 'success'}
                            startIcon={selectedUser?.is_active ? <Block /> : <CheckCircle />}
                        >
                            {selectedUser?.is_active ? 'Block User' : 'Activate User'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* User Detail Dialog */}
                <Dialog open={userDetailOpen} onClose={closeUserDetail} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Typography variant="h6">User Details</Typography>
                    </DialogTitle>
                    <DialogContent>
                        {selectedUser && (
                            <Stack spacing={3} sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                                        {getInitials(selectedUser.user?.username)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5">
                                            {selectedUser.user?.username}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            User ID: {selectedUser.id}
                                        </Typography>
                                        {getStatusChip(selectedUser.is_active)}
                                    </Box>
                                </Box>

                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Email Address
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedUser.user?.email || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Phone Number
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedUser.user?.phone_number || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Account Status
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedUser.is_active ? 'Active' : 'Blocked'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeUserDetail}>Close</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                closeUserDetail();
                                openConfirmDialog(selectedUser);
                            }}
                            color={selectedUser?.is_active ? 'error' : 'success'}
                        >
                            {selectedUser?.is_active ? 'Block User' : 'Activate User'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}

export default AdminUsers;
