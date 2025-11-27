import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';

const DragDropUpload = ({ onFilesAdded, existingImages = [], onRemoveExisting }) => {
    const [previews, setPreviews] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        // Create preview URLs
        const newPreviews = acceptedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            caption: ''
        }));

        setPreviews(prev => [...prev, ...newPreviews]);
        onFilesAdded(acceptedFiles);
    }, [onFilesAdded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        multiple: true
    });

    const removePreview = (index) => {
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${isDragActive
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                    }`}
            >
                <input {...getInputProps()} />
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                {isDragActive ? (
                    <p className="text-purple-600 dark:text-purple-400 font-medium">
                        Drop photos here...
                    </p>
                ) : (
                    <>
                        <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                            Drag & drop photos here
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            or click to browse (JPEG, PNG, GIF, WebP)
                        </p>
                    </>
                )}
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Current Photos
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {existingImages.map((img, index) => (
                            <motion.div
                                key={img.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group"
                            >
                                <img
                                    src={img.image_url}
                                    alt={img.caption || `Photo ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => onRemoveExisting(img.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    aria-label="Remove photo"
                                >
                                    <X size={16} />
                                </button>
                                {img.caption && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                        {img.caption}
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* New Photo Previews */}
            {previews.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        New Photos to Upload
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {previews.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group"
                            >
                                <img
                                    src={item.preview}
                                    alt={`New photo ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                                />
                                <button
                                    onClick={() => removePreview(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    aria-label="Remove photo"
                                >
                                    <X size={16} />
                                </button>
                                <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                                    NEW
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DragDropUpload;
