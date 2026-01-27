import React, { useState, useEffect, useCallback } from 'react';
import { Upload, CheckCircle, XCircle, Clock, FileText, X } from 'lucide-react';
import apiClient from '../lib/api';

const VerificationDocumentUpload = () => {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState(null);

    // Fetch user's existing documents
    const fetchDocuments = useCallback(async () => {
        try {
            const response = await apiClient.get('/verification-documents/');
            setDocuments(response.data);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files[0];
        handleFileSelection(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleFileSelection(file);
    };

    const handleFileSelection = (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setError(null);
        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('document_image', selectedFile);

            await apiClient.post('/verification-documents/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Reset form and refresh documents
            setSelectedFile(null);
            setPreviewUrl(null);
            await fetchDocuments();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'approved':
                return {
                    icon: CheckCircle,
                    color: 'text-green-500',
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'Approved'
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-red-500',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'Rejected'
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-yellow-500',
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'Pending Review'
                };
        }
    };

    const isVerified = documents.some(doc => doc.status === 'approved');

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className={`bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-300 ${isVerified ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isVerified ? 'bg-green-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
                        {isVerified ? <CheckCircle className="w-5 h-5 text-white" /> : <FileText className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{isVerified ? 'Profile Verified' : 'Verify Your Profile'}</h3>
                        <p className="text-sm text-gray-500">{isVerified ? 'Your identity has been successfully confirmed.' : 'Upload your ID document for verification'}</p>
                    </div>
                </div>

                {!selectedFile ? (
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${dragActive
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 bg-gray-50'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="document-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileInput}
                        />
                        <label
                            htmlFor="document-upload"
                            className="flex flex-col items-center justify-center cursor-pointer"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-base font-medium text-gray-700 mb-1">
                                Drop your document here or click to browse
                            </p>
                            <p className="text-sm text-gray-500">
                                Passport, National ID, or Driver's License • Max 10MB
                            </p>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden border-2 border-purple-200">
                            <img
                                src={previewUrl}
                                alt="Document preview"
                                className="w-full h-64 object-contain bg-gray-50"
                            />
                            <button
                                onClick={clearSelection}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Uploading...' : 'Upload Document'}
                            </button>
                            <button
                                onClick={clearSelection}
                                disabled={uploading}
                                className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Uploaded Documents History */}
            {documents.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Documents</h4>
                    <div className="space-y-3">
                        {documents.map((doc) => {
                            const statusConfig = getStatusConfig(doc.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={doc.id}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 ${statusConfig.border} ${statusConfig.bg}`}
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            src={doc.image_url}
                                            alt="Document thumbnail"
                                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                                        </p>
                                        {doc.reviewed_at && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Reviewed {new Date(doc.reviewed_at).toLocaleDateString()}
                                            </p>
                                        )}
                                        {doc.admin_notes && doc.status === 'rejected' && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Reason: {doc.admin_notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className={`flex items-center gap-2 ${statusConfig.color} font-medium text-sm`}>
                                        <StatusIcon className="w-5 h-5" />
                                        <span>{statusConfig.text}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Info Section */}
            {documents.length === 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h4 className="text-base font-semibold text-gray-900 mb-2">Why verify your profile?</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                            <span>Gain trust and credibility with verified badge</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                            <span>Get more profile views and connections</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                            <span>Stand out from unverified profiles</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default VerificationDocumentUpload;
