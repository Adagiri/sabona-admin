import {
    Box,
    Typography,
    Paper,
    IconButton,
} from "@mui/material";
import { PictureAsPdf, OpenInNew, Delete } from "@mui/icons-material";
import { useDeleteMedia } from "../hooks/Admin/mutation";
import { Media } from "../hooks/Admin/interface";
import { useNavigate } from "react-router-dom";

const isPDF = (url: string) => url.toLowerCase().includes('.pdf');

const MediaItem = ({ file }: { file: Media }) => {
    const navigate = useNavigate();   
    const handlePDFClick = () => {
        window.open(file.location, '_blank');
    };

    const { mutateAsync: deleteMedia } = useDeleteMedia()

    const handleDelete = async (mediaId: number) => {
        try {
            await deleteMedia(mediaId)
            navigate(0);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                borderRadius: 2,
                height: '200px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'scale(1.02)',
                }
            }}
        >
            {file.location && isPDF(file.location) ? (
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                    onClick={handlePDFClick}
                >
                    <PictureAsPdf sx={{ fontSize: 60, color: '#e53935' }} />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                        View PDF
                    </Typography>
                    <IconButton
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255,255,255,0.9)',
                        }}
                    >
                        <OpenInNew fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 8,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            color: 'red'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.id)
                        }}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            ) : (
                <Box
                    sx={{
                        height: '100%',
                        position: 'relative',
                        '&:hover .overlay': {
                            opacity: 1,
                        },
                    }}
                >
                    <img
                        src={file.location}
                        alt="Media content"
                        style={{
                            maxWidth: 200,
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: '8px',
                        }}
                    />
                    <Box
                        className="overlay"
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            p: 1,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                            onClick={() => window.open(file.location, '_blank')}
                        >
                            <OpenInNew fontSize="small" />
                        </IconButton>
                    </Box>
                        <IconButton
                            size="small"
                            sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 0,
                                bgcolor: 'rgba(255,255,255,0.9)',
                                color: 'red'
                            }}
                            onClick={() => handleDelete(file.id)}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                </Box>
            )}
        </Paper>
    );
};

export default MediaItem;