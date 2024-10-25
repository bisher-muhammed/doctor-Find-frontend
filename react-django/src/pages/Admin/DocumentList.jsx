import React, { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Button, CircularProgress, Collapse, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Typography, IconButton,
    Box, Modal, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { ExpandLess, ExpandMore, Preview } from '@mui/icons-material';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import Cookies from 'js-cookie';
import AdminSidebar from '../../Components/Admin/AdminSidebar';

const baseURL = 'http://127.0.0.1:8000';

const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDoctor, setOpenDoctor] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0); // Current page
    const [itemsPerPage] = useState(5); // Items per page

    const navigate = useNavigate();
    const token = localStorage.getItem('access');
    const csrfToken = Cookies.get('csrftoken');

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/admin/admin/fetch_documents/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDocuments(response.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/admin/login/');
                } else {
                    setError('Error fetching documents. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, [token, navigate]);

    const handleOpen = useCallback((document) => {
        setSelectedDocument(document);
        setPreviewOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setPreviewOpen(false);
        setSelectedDocument(null);
    }, []);

    const handleVerify = async (doctor_id) => {
        if (!doctor_id) {
            console.error('No doctor ID provided.');
            return;
        }

        setVerifyLoading(true);

        try {
            const doctorDocuments = groupedDocuments[doctor_id]?.documents || [];
            if (doctorDocuments.length === 0) {
                console.error('No documents found for the provided doctor ID.');
                return;
            }

            const documentIds = doctorDocuments.map(doc => doc.id);

            await axios.post(
                `${baseURL}/api/admin/admin/verify_documents/`,
                { document_ids: documentIds, doctor_id },
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

            alert('Documents verified successfully');
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/admin/login/');
            } else {
                alert('Error verifying documents');
            }
        } finally {
            setVerifyLoading(false);
        }
    };

    const getFileType = (fileUrl) => {
        if (!fileUrl) {
            console.error('Invalid file URL:', fileUrl);
            return 'unknown';
        }

        const fileExtension = fileUrl.split('.').pop().toLowerCase();
        return fileExtension === 'pdf'
            ? 'application/pdf'
            : ['jpg', 'jpeg', 'png'].includes(fileExtension)
            ? 'image'
            : 'unknown';
    };

    const renderPreview = (docUrl, docType) => {
        if (!docUrl) {
            return <Typography color="error">Document URL is missing or invalid.</Typography>;
        }

        const fullUrl = docUrl.startsWith('http') ? docUrl : `${baseURL}${docUrl.startsWith('/') ? docUrl.slice(1) : docUrl}`;

        if (docType === 'image') {
            return (
                <img
                    src={fullUrl}
                    alt="Preview"
                    style={{ Width: '50%', height: '50%' }}
                    onError={(e) => {
                        console.error('Error loading image:', e.target.src);
                        e.target.src = ''; // Clear the image source to prevent broken image icon
                    }}
                />
            );
        } else if (docType === 'application/pdf') {
            return (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
                    <Viewer fileUrl={fullUrl} plugins={[defaultLayoutPluginInstance]} />
                </Worker>
            );
        } else {
            return (
                <Typography color="error">
                    Preview not available. <a href={fullUrl} download>Download</a>
                </Typography>
            );
        }
    };

    const groupedDocuments = useMemo(() => documents.reduce((groups, doc) => {
        const { doctor_username, doctor_specification, doctor_id } = doc;
        if (!groups[doctor_id]) {
            groups[doctor_id] = { doctor_id, doctor_username, specification: doctor_specification, documents: [] };
        }
        groups[doctor_id].documents.push(doc);
        return groups;
    }, {}), [documents]);

    const totalPages = Math.ceil(Object.keys(groupedDocuments).length / itemsPerPage); // Total number of pages
    const currentItems = Object.values(groupedDocuments).slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage); // Current items based on page

    return (
        <Box sx={{ display: 'flex', padding: 2 }}>
            <AdminSidebar />
            <Box sx={{ flexGrow: 1, padding: 2 }}>
                <Typography variant="h4" gutterBottom textAlign="center">
                    Document List
                </Typography>
                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Typography color="error" textAlign="center">{error}</Typography>
                ) : (
                    <>
                        {/* For Large Screens: Table Format */}
                        <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Doctor ID</TableCell>
                                        <TableCell>Doctor Name</TableCell>
                                        <TableCell>Specification</TableCell>
                                        <TableCell>Documents</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentItems.map(({ doctor_id, doctor_username, specification, documents }) => (
                                        <Fragment key={doctor_id}>
                                            <TableRow>
                                                <TableCell>{doctor_id}</TableCell>
                                                <TableCell>{doctor_username}</TableCell>
                                                <TableCell>{specification}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => setOpenDoctor(openDoctor === doctor_id ? null : doctor_id)}
                                                        aria-label={`Toggle documents for doctor ${doctor_username}`}
                                                    >
                                                        {openDoctor === doctor_id ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    {documents.every(doc => doc.is_verified) ? 'Verified' : 'Not Verified'}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleVerify(doctor_id)}
                                                        disabled={verifyLoading || documents.every(doc => doc.is_verified)}
                                                        aria-label={`Verify documents for doctor ${doctor_username}`}
                                                    >
                                                        {verifyLoading ? <CircularProgress size={24} /> : 'Verify'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ padding: 0 }}>
                                                    <Collapse in={openDoctor === doctor_id} timeout="auto" unmountOnExit>
                                                        <TableContainer component={Paper}>
                                                            <Table>
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>Document ID</TableCell>
                                                                        <TableCell>Document Type</TableCell>
                                                                        <TableCell>Preview</TableCell>
                                                                        <TableCell>Status</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {documents.map(doc => (
                                                                        <TableRow key={doc.id}>
                                                                            <TableCell>{doc.id}</TableCell>
                                                                            <TableCell>{getFileType(doc.file)}</TableCell>
                                                                            <TableCell>
                                                                                <IconButton onClick={() => handleOpen(doc.file)}>
                                                                                    <Preview />
                                                                                </IconButton>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {doc.is_verified ? 'Verified' : 'Not Verified'}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                                disabled={currentPage === 0}
                            >
                                Previous
                            </Button>
                            <Typography variant="body1" sx={{ margin: '0 16px' }}>
                                Page {currentPage + 1} of {totalPages}
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                                disabled={currentPage === totalPages - 1}
                            >
                                Next
                            </Button>
                        </Box>

                        {/* Modal for Document Preview */}
                        <Modal open={previewOpen} onClose={handleClose}>
                            <Box sx={{ width: '50%', margin: 'auto', marginTop: '5%', backgroundColor: 'black', padding: 2 }}>
                                {selectedDocument && renderPreview(selectedDocument, getFileType(selectedDocument))}
                            </Box>
                        </Modal>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default DocumentList;
