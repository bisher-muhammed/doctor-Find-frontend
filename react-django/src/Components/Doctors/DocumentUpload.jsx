import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Card,
    CardContent,
    CardActions,
    Grid,
    LinearProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Error as ErrorIcon,
    InsertDriveFile as FileIcon,
    Image as ImageIcon,
    PictureAsPdf as PdfIcon
} from '@mui/icons-material';

const DocumentUpload = ({ doctorId }) => {
    const [documents, setDocuments] = useState([]);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [dragOver, setDragOver] = useState(false);
    
    
    const token = localStorage.getItem('access');
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;

    // Fetch existing documents on component mount
    useEffect(() => {
        fetchDocuments();
    }, [doctorId]);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get(`${baseURL}/api/doctors/doctor/${doctorId}/documents/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUploadedDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('image')) return <ImageIcon />;
        if (fileType === 'application/pdf') return <PdfIcon />;
        return <FileIcon />;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon color="success" />;
            case 'pending':
                return <ScheduleIcon color="warning" />;
            case 'rejected':
                return <ErrorIcon color="error" />;
            default:
                return <ScheduleIcon color="warning" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        if (!allowedTypes.includes(file.type)) {
            return 'File type not supported. Please upload PDF, DOC, DOCX, JPG, PNG, TXT, XLSX, or PPTX files.';
        }

        if (file.size > maxSize) {
            return 'File size exceeds 10MB limit.';
        }

        return null;
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        addFiles(files);
    };

    const addFiles = (files) => {
        const validFiles = [];
        const errors = [];

        files.forEach(file => {
            const error = validateFile(file);
            if (error) {
                errors.push(`${file.name}: ${error}`);
            } else if (!documents.some(doc => doc.name === file.name)) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: File already selected`);
            }
        });

        if (errors.length > 0) {
            showSnackbar(errors.join('\n'), 'error');
        }

        if (validFiles.length > 0) {
            setDocuments(prevDocuments => [...prevDocuments, ...validFiles]);
            showSnackbar(`${validFiles.length} file(s) added successfully`, 'success');
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragOver(false);
        const files = Array.from(event.dataTransfer.files);
        addFiles(files);
    };

    const handleRemoveDocument = (index) => {
        setDocuments(prevDocuments => prevDocuments.filter((_, i) => i !== index));
        showSnackbar('File removed', 'info');
    };

    const handlePreview = (document) => {
        setSelectedDocument(document);
        setPreviewOpen(true);
    };

    const handleSubmit = async () => {
        if (documents.length === 0) {
            showSnackbar('Please select at least one document to upload.', 'warning');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        documents.forEach(doc => {
            formData.append('file', doc);
        });

        try {
            await axios.post(`${baseURL}/api/doctors/doctor/${doctorId}/documents/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            setDocuments([]);
            setUploadProgress(0);
            showSnackbar('Documents uploaded successfully! Please wait for verification.', 'success');
            fetchDocuments(); // Refresh the documents list
        } catch (error) {
            console.error('Error uploading documents:', error);
            showSnackbar('Failed to upload documents. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box>
            {/* Upload Section */}
            <Paper 
                elevation={2} 
                sx={{ 
                    p: 3, 
                    mb: 3,
                    border: dragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
                    bgcolor: dragOver ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                    transition: 'all 0.3s ease'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                        Upload Documents
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Drag and drop files here or click to browse
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT, XLSX, PPTX (Max 10MB each)
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        disabled={uploading}
                    >
                        Choose Files
                        <input
                            type="file"
                            multiple
                            hidden
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.txt,.xlsx,.pptx"
                        />
                    </Button>

                    {documents.length > 0 && (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={uploading}
                            startIcon={<UploadIcon />}
                        >
                            Upload {documents.length} File{documents.length > 1 ? 's' : ''}
                        </Button>
                    )}
                </Box>

                {uploading && (
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                            Uploading... {uploadProgress}%
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Selected Files Preview */}
            {documents.length > 0 && (
                <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Selected Files ({documents.length})
                    </Typography>
                    <Grid container spacing={2}>
                        {documents.map((doc, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card variant="outlined" sx={{ height: '100%' }}>
                                    <CardContent sx={{ pb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            {getFileIcon(doc.type)}
                                            <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }} noWrap>
                                                {doc.name}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatFileSize(doc.size)}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                                        <Tooltip title="Preview">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handlePreview(doc)}
                                                disabled={!doc.type.includes('image') && doc.type !== 'application/pdf'}
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Remove">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleRemoveDocument(index)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}

            {/* Uploaded Documents */}
            {uploadedDocuments.length > 0 && (
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Uploaded Documents
                    </Typography>
                    <List>
                        {uploadedDocuments.map((doc, index) => (
                            <React.Fragment key={doc.id || index}>
                                <ListItem>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                        {getFileIcon(doc.file_type || 'application/octet-stream')}
                                    </Box>
                                    <ListItemText
                                        primary={doc.file_name || `Document ${index + 1}`}
                                        secondary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                <Chip
                                                    icon={getStatusIcon(doc.status)}
                                                    label={doc.status || 'pending'}
                                                    size="small"
                                                    color={getStatusColor(doc.status)}
                                                    variant="outlined"
                                                />
                                                {doc.uploaded_at && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        {doc.file_url && (
                                            <Tooltip title="View Document">
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => window.open(doc.file_url, '_blank')}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < uploadedDocuments.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Preview Dialog */}
            <Dialog 
                open={previewOpen} 
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        {selectedDocument?.name}
                    </Typography>
                    <IconButton onClick={() => setPreviewOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedDocument && (
                        <Box sx={{ minHeight: 400 }}>
                            {selectedDocument.type.includes('image') ? (
                                <img 
                                    src={URL.createObjectURL(selectedDocument)} 
                                    alt="Preview" 
                                    style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }}
                                />
                            ) : selectedDocument.type === 'application/pdf' ? (
                                <Box sx={{ height: 500 }}>
                                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
                                        <Viewer fileUrl={URL.createObjectURL(selectedDocument)} />
                                    </Worker>
                                </Box>
                            ) : (
                                <Alert severity="info">
                                    Preview not available for this file type. 
                                    <Button 
                                        component="a" 
                                        href={URL.createObjectURL(selectedDocument)} 
                                        download={selectedDocument.name}
                                        sx={{ ml: 1 }}
                                    >
                                        Download
                                    </Button>
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DocumentUpload;