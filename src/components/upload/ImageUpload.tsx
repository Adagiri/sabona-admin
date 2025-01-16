import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CollectionsIcon from '@mui/icons-material/Collections';

interface ImageUploadProps {
    variant?: 'sm' | 'base' | 'large' | 'max-width';
    error?: string;
    selectedImage: boolean;
    handleImageClick: () => void;
    fileInputRef: (el: HTMLInputElement | null) => void;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    selectedImage,
    error,
    handleImageClick,
    fileInputRef,
    handleImageChange,
    isLoading,
}) => {

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {
                isLoading ? <CircularProgress />
                    :
                    <>
                        {!selectedImage ? (
                            <Box
                                className='hover:bg-neutral-100 p-2 flex items-center gap-x-2 cursor-pointer'
                                onClick={handleImageClick}
                            >
                                Upload
                                <CollectionsIcon />
                            </Box>
                        ) : (
                            <Box
                                onClick={handleImageClick}
                                className='text-teal-600 hover:bg-neutral-100 p-2 flex items-center gap-x-2 cursor-pointer' 
                            >
                                Uploaded
                                <AddPhotoAlternateIcon />
                            </Box>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/jpeg, image/png, image/gif, image/bmp, image/tif, .pdf"
                            onChange={handleImageChange}
                        />

                        {error && (
                            <Typography
                                variant="caption"
                                sx={{
                                    fontStyle: 'italic',
                                    color: 'error.main',
                                    mt: 1,
                                    textAlign: 'center',
                                }}
                            >
                                {error}
                            </Typography>
                        )}
                    </>

            }
        </Box>
    );
};

export default React.memo(ImageUpload);