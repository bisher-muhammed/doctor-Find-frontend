import React, { useState } from 'react';
import axios from 'axios';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';


const DocumentUpload = ({ doctorId }) => {
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [verificationStatus, setVerificationStatus] = useState(null);
    const token = localStorage.getItem('access');
   

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = files.filter(file => !documents.some(doc => doc.name === file.name));
        setDocuments(prevDocuments => [...prevDocuments, ...newFiles]);
    };

    const handleRemoveDocument = (index) => {
        setDocuments(prevDocuments => prevDocuments.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (documents.length === 0) {
            alert('Please select at least one document to upload.');
            return;
        }

        const formData = new FormData();
        documents.forEach(doc => {
            formData.append('file', doc);
        });

        try {
            await axios.post(`http://127.0.0.1:8000/api/doctors/doctor/${doctorId}/documents/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                    
                },
            });
            setDocuments([]);
            setSubmissionMessage('Documents uploaded successfully. Please wait for verification.');
            setVerificationStatus(null);
        } catch (error) {
            console.error('Error uploading documents:', error);
            alert('Failed to upload documents. Please try again.');
        }
    };

    return (
        <div className="document-upload">
            <input 
                type="file" 
                multiple 
                onChange={handleFileChange} 
                accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.txt,.xlsx,.pptx" 
            />
            <button onClick={handleSubmit}>Submit Documents</button>
            {submissionMessage && <p>{submissionMessage}</p>}
            {verificationStatus && <p>{verificationStatus}</p>}
            <div className="document-preview">
                {documents.length > 0 && (
                    <ul>
                        {documents.map((doc, index) => (
                            <li key={index}>
                                <div>
                                    <strong>File:</strong> {doc.name}
                                </div>
                                {doc.type.includes('image') ? (
                                    <img src={URL.createObjectURL(doc)} alt="Preview" width="100px" />
                                ) : doc.type === 'application/pdf' ? (
                                    <div style={{ height: '200px', overflow: 'auto' }}>
                                        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js`}>
                                            <Viewer fileUrl={URL.createObjectURL(doc)} />
                                        </Worker>
                                    </div>
                                ) : (
                                    <div>
                                        <p>Preview not available. <a href={URL.createObjectURL(doc)} download={doc.name}>Download</a></p>
                                    </div>
                                )}
                                <br />
                                <button onClick={() => handleRemoveDocument(index)}>Remove</button>
                                {/* The verify button is not relevant here, as verification should be handled in DocumentList */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DocumentUpload;
