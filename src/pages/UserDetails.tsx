import {
    Box,
    Typography,
    Paper,
    Chip,
    Divider,
    Stack,
    Grid2,
} from "@mui/material";
import { CheckCircle, Home, Phone, Email } from "@mui/icons-material";
import { useGetUserDetails } from "../hooks/Admin/query";
import { useParams } from "react-router-dom";
import MediaItem from "../components/MediaItem";
import { StringUtil } from "../utils/stringUtil";
const UserDetails = () => {
    const params = useParams();
    const { data: userDetails } = useGetUserDetails(params.userId as string);
    
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                {StringUtil.convertToPascalCase(userDetails?.data.type === 'RIDER' ? 'driver' : userDetails?.data.type ?? 'User')} Details
            </Typography>
            <Paper
                elevation={6}
                sx={{
                    mb: 4,
                    borderRadius: 3,
                    p: 4,
                    bgcolor: "white",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                }}
            >
                <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: 'space-between' }} spacing={4}>

                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="#333"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <Home fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
                            User Name
                        </Typography>
                        <Typography variant="body1" color="#555" sx={{ ml: 3.5 }}>
                            {userDetails?.data.firstName} {userDetails?.data.lastName}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="#333"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <Phone fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
                            Phone number
                        </Typography>
                        <Typography variant="body1" color="#555" sx={{ ml: 3.3 }}>
                            {userDetails?.data.phone?.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="#333"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <Email fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
                            Email Address
                        </Typography>
                        <Typography variant="body1" color="#555" sx={{ ml: 3.3 }}>
                            {userDetails?.data.email}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="#333"
                            sx={{ display: "flex", alignItems: "center" }}
                        >
                            <CheckCircle fontSize="small" sx={{ mr: 1, color: "#00796b" }} />
                            User Status
                        </Typography>
                        <Chip
                            label={'ACTIVE'}
                            sx={{
                                fontWeight: "bold",
                                textTransform: "none",
                                bgcolor: "#e0f7fa",
                                color: "#00796b",
                                ml: 3.5,
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                                boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                            }}
                        />
                    </Box>
                </Stack>
            </Paper>

            <Typography variant="h5" gutterBottom fontWeight="bold">
                Media Files
            </Typography>
            <Divider sx={{ mb: 3 }} />


           {userDetails?.data.medias.length ? <Grid2 container spacing={3} sx={{ mb: 4 }}>
                {userDetails?.data.medias.map((file) => (
                    <Box key={file.id} minWidth={200}>
                        <MediaItem file={file}/>
                    </Box>
                ))}
            </Grid2>: <Typography variant="body1" color="#555" >
                No media files available
            </Typography>}

        </Box>
    )
}

export default UserDetails