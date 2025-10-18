import React, { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Button, CircularProgress, Collapse, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Typography, IconButton,
    Box, Modal, Card, CardContent, CardHeader, Chip, Alert,
    Grid, Pagination, Stack, Tooltip, Avatar, LinearProgress,
    useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
    ExpandLess, ExpandMore, Preview, VerifiedUser, GppMaybe,
    Description, Image, Download, CheckCircle, Cancel,
    Person, MedicalServices, Visibility, Security
} from '@mui/icons-material';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import Cookies from 'js-cookie';
import AdminSidebar from '../../Components/Admin/AdminSidebar';

const baseURL = import.meta.env.VITE_REACT_APP_API_URL;

const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDoctor, setOpenDoctor] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(5);
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('access');
    const csrfToken = Cookies.get('csrftoken');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${baseURL}/api/admin/admin/fetch_documents/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDocuments(response.data);
                setError(null);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/admin/login/');
                } else {
                    setError('Failed to load documents. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, [token, navigate]);

    const handleOpen = useCallback((documentUrl) => {
        setSelectedDocument(documentUrl);
        setPreviewOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setPreviewOpen(false);
        setSelectedDocument(null);
    }, []);

    const openVerifyDialog = (doctorId, doctorUsername) => {
        setSelectedDoctor({ id: doctorId, username: doctorUsername });
        setVerifyDialogOpen(true);
    };

    const closeVerifyDialog = () => {
        setVerifyDialogOpen(false);
        setSelectedDoctor(null);
    };

    const handleVerify = async () => {
        if (!selectedDoctor?.id) {
            console.error('No doctor ID provided.');
            return;
        }

        setVerifyLoading(true);
        const doctorDocuments = groupedDocuments[selectedDoctor.id]?.documents || [];

        try {
            const documentIds = doctorDocuments.map(doc => doc.id);

            await axios.post(
                `${baseURL}/api/admin/admin/verify_documents/`,
                { document_ids: documentIds, doctor_id: selectedDoctor.id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-CSRFToken': csrfToken,
                    },
                }
            );

            setDocuments(prevDocs => prevDocs.map(doc =>
                documentIds.includes(doc.id) ? { ...doc, is_verified: true } : doc
            ));

            setSuccessMessage(`Documents for Dr. ${selectedDoctor.username} verified successfully!`);
            setTimeout(() => setSuccessMessage(''), 5000);
            closeVerifyDialog();
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/admin/login/');
            } else {
                alert('Error verifying documents. Please try again.');
            }
        } finally {
            setVerifyLoading(false);
        }
    };

    const getFileType = (fileUrl) => {
        if (!fileUrl) return 'unknown';

        const fileExtension = fileUrl.split('.').pop().toLowerCase();
        return fileExtension === 'pdf'
            ? 'application/pdf'
            : ['jpg', 'jpeg', 'png'].includes(fileExtension)
            ? 'image'
            : 'unknown';
    };

    const getFileTypeIcon = (fileUrl) => {
        const fileType = getFileType(fileUrl);
        switch (fileType) {
            case 'application/pdf':
                return <Description color="error" />;
            case 'image':
                return <Image color="primary" />;
            default:
                return <Description color="disabled" />;
        }
    };

    const getStatusChip = (isVerified) => {
        return isVerified ? (
            <Chip
                icon={<VerifiedUser />}
                label="Verified"
                color="success"
                variant="filled"
                size="small"
            />
        ) : (
            <Chip
                icon={<GppMaybe />}
                label="Pending"
                color="warning"
                variant="outlined"
                size="small"
            />
        );
    };

    const renderPreview = (docUrl) => {
        if (!docUrl) {
            return (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Document URL is missing or invalid.
                </Alert>
            );
        }

        const fullUrl = docUrl.startsWith('http') ? docUrl : `${baseURL}${docUrl.startsWith('/') ? docUrl.slice(1) : docUrl}`;
        const fileType = getFileType(docUrl);

        return (
            <Box sx={{ height: '80vh', width: '100%' }}>
                {fileType === 'image' ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <img
                            src={fullUrl}
                            alt="Document Preview"
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%', 
                                objectFit: 'contain' 
                            }}
                            onError={(e) => {
                                console.error('Error loading image:', fullUrl);
                                e.target.alt = 'Failed to load image';
                            }}
                        />
                    </Box>
                ) : fileType === 'application/pdf' ? (
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
                        <Viewer 
                            fileUrl={fullUrl} 
                            plugins={[defaultLayoutPluginInstance]}
                            theme={{
                                theme: theme.palette.mode
                            }}
                        />
                    </Worker>
                ) : (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Preview not available
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Download />}
                            href={fullUrl}
                            download
                        >
                            Download File
                        </Button>
                    </Box>
                )}
            </Box>
        );
    };

    const groupedDocuments = useMemo(() => documents.reduce((groups, doc) => {
        const { doctor_username, doctor_specification, doctor_id } = doc;
        if (!groups[doctor_id]) {
            groups[doctor_id] = { 
                doctor_id, 
                doctor_username, 
                specification: doctor_specification, 
                documents: [] 
            };
        }
        groups[doctor_id].documents.push(doc);
        return groups;
    }, {}), [documents]);

    const totalPages = Math.ceil(Object.keys(groupedDocuments).length / itemsPerPage);
    const currentItems = Object.values(groupedDocuments).slice(
        currentPage * itemsPerPage, 
        (currentPage + 1) * itemsPerPage
    );

    const allVerified = (documents) => documents.every(doc => doc.is_verified);

    // Mobile Card View
    const MobileDoctorCard = ({ doctor }) => (
        <Card sx={{ mb: 2, border: allVerified(doctor.documents) ? '2px solid #4caf50' : '2px solid #ff9800' }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <Person />
                    </Avatar>
                }
                title={
                    <Typography variant="h6" component="div">
                        Dr. {doctor.doctor_username}
                    </Typography>
                }
                subheader={
                    <Box sx={{ mt: 1 }}>
                        <Chip 
                            icon={<MedicalServices />} 
                            label={doctor.specification} 
                            size="small" 
                            variant="outlined" 
                        />
                    </Box>
                }
                action={
                    <IconButton
                        onClick={() => setOpenDoctor(openDoctor === doctor.doctor_id ? null : doctor.doctor_id)}
                    >
                        {openDoctor === doctor.doctor_id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                }
            />
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">
                        {doctor.documents.length} document(s)
                    </Typography>
                    {getStatusChip(allVerified(doctor.documents))}
                </Stack>
                
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={verifyLoading ? <CircularProgress size={16} /> : <Security />}
                    onClick={() => openVerifyDialog(doctor.doctor_id, doctor.doctor_username)}
                    disabled={verifyLoading || allVerified(doctor.documents)}
                    color={allVerified(doctor.documents) ? "success" : "primary"}
                >
                    {allVerified(doctor.documents) ? 'Verified' : 'Verify Documents'}
                </Button>

                <Collapse in={openDoctor === doctor.doctor_id} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Description />
                            Documents List
                        </Typography>
                        <List dense>
                            {doctor.documents.map((doc, index) => (
                                <ListItem key={doc.id} divider={index !== doctor.documents.length - 1}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getFileTypeIcon(doc.file)}
                                                <Typography variant="body2">
                                                    Document {doc.id}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={getFileType(doc.file)}
                                    />
                                    <ListItemSecondaryAction>
                                        <Stack direction="row" spacing={1}>
                                            <Tooltip title="Preview">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleOpen(doc.file)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            {getStatusChip(doc.is_verified)}
                                        </Stack>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
            <AdminSidebar />
            
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {/* Header */}
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
                        <Security sx={{ color: 'primary.main' }} />
                        Document Verification
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Review and verify doctor documents for platform approval
                    </Typography>
                </Box>

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

                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={40} />
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Loading documents...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Total Doctors
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {Object.keys(groupedDocuments).length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Pending Verification
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {Object.values(groupedDocuments).filter(doctor => 
                                                !allVerified(doctor.documents)
                                            ).length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Verified
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {Object.values(groupedDocuments).filter(doctor => 
                                                allVerified(doctor.documents)
                                            ).length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Total Documents
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {documents.length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Mobile View */}
                        {isMobile ? (
                            <Box>
                                {currentItems.map((doctor) => (
                                    <MobileDoctorCard key={doctor.doctor_id} doctor={doctor} />
                                ))}
                            </Box>
                        ) : (
                            /* Desktop Table View */
                            <Card>
                                <CardContent>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                    <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Specialization</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Documents</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {currentItems.map((doctor) => (
                                                    <Fragment key={doctor.doctor_id}>
                                                        <TableRow 
                                                            sx={{ 
                                                                '&:hover': { bgcolor: 'grey.50' },
                                                                bgcolor: allVerified(doctor.documents) ? 'success.light' : 'background.paper'
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                                        <Person />
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography variant="subtitle1" fontWeight="600">
                                                                            Dr. {doctor.doctor_username}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            ID: {doctor.doctor_id}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip 
                                                                    label={doctor.specification} 
                                                                    variant="outlined" 
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {doctor.documents.length} document(s)
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getStatusChip(allVerified(doctor.documents))}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Stack direction="row" spacing={1}>
                                                                    <Tooltip title="View Documents">
                                                                        <IconButton
                                                                            onClick={() => setOpenDoctor(openDoctor === doctor.doctor_id ? null : doctor.doctor_id)}
                                                                        >
                                                                            {openDoctor === doctor.doctor_id ? <ExpandLess /> : <ExpandMore />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        startIcon={verifyLoading ? <CircularProgress size={16} /> : <CheckCircle />}
                                                                        onClick={() => openVerifyDialog(doctor.doctor_id, doctor.doctor_username)}
                                                                        disabled={verifyLoading || allVerified(doctor.documents)}
                                                                        color={allVerified(doctor.documents) ? "success" : "primary"}
                                                                    >
                                                                        {allVerified(doctor.documents) ? 'Verified' : 'Verify'}
                                                                    </Button>
                                                                </Stack>
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell colSpan={5} sx={{ p: 0, border: 'none' }}>
                                                                <Collapse in={openDoctor === doctor.doctor_id} timeout="auto" unmountOnExit>
                                                                    <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                                                                        <Typography variant="h6" gutterBottom>
                                                                            Doctor Documents
                                                                        </Typography>
                                                                        <Grid container spacing={2}>
                                                                            {doctor.documents.map((doc) => (
                                                                                <Grid item xs={12} md={6} key={doc.id}>
                                                                                    <Card variant="outlined">
                                                                                        <CardContent>
                                                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                                                {getFileTypeIcon(doc.file)}
                                                                                                <Box sx={{ flexGrow: 1 }}>
                                                                                                    <Typography variant="subtitle2">
                                                                                                        Document {doc.id}
                                                                                                    </Typography>
                                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                                        {getFileType(doc.file)}
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                                <Stack direction="row" spacing={1}>
                                                                                                    <Tooltip title="Preview">
                                                                                                        <IconButton 
                                                                                                            size="small" 
                                                                                                            onClick={() => handleOpen(doc.file)}
                                                                                                        >
                                                                                                            <Preview />
                                                                                                        </IconButton>
                                                                                                    </Tooltip>
                                                                                                    {getStatusChip(doc.is_verified)}
                                                                                                </Stack>
                                                                                            </Stack>
                                                                                        </CardContent>
                                                                                    </Card>
                                                                                </Grid>
                                                                            ))}
                                                                        </Grid>
                                                                    </Box>
                                                                </Collapse>
                                                            </TableCell>
                                                        </TableRow>
                                                    </Fragment>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage + 1}
                                    onChange={(event, value) => setCurrentPage(value - 1)}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}

                        {/* Document Preview Modal */}
                        <Dialog 
                            open={previewOpen} 
                            onClose={handleClose}
                            maxWidth="lg"
                            fullWidth
                            sx={{
                                '& .MuiDialog-paper': {
                                    height: '90vh'
                                }
                            }}
                        >
                            <DialogTitle>
                                <Typography variant="h6">Document Preview</Typography>
                            </DialogTitle>
                            <DialogContent dividers>
                                {selectedDocument && renderPreview(selectedDocument)}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>Close</Button>
                            </DialogActions>
                        </Dialog>

                        {/* Verification Confirmation Dialog */}
                        <Dialog open={verifyDialogOpen} onClose={closeVerifyDialog}>
                            <DialogTitle>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Security color="primary" />
                                    Verify Documents
                                </Typography>
                            </DialogTitle>
                            <DialogContent>
                                <Typography>
                                    Are you sure you want to verify all documents for Dr. {selectedDoctor?.username}?
                                </Typography>
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    This action cannot be undone. Please ensure all documents are properly reviewed.
                                </Alert>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={closeVerifyDialog}>Cancel</Button>
                                <Button
                                    onClick={handleVerify}
                                    variant="contained"
                                    disabled={verifyLoading}
                                    startIcon={verifyLoading ? <CircularProgress size={16} /> : <CheckCircle />}
                                >
                                    {verifyLoading ? 'Verifying...' : 'Verify Documents'}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default DocumentList;
