import {
    Box,
    Typography,
    Paper,
    Chip,
    Divider,
    Stack,
    Grid2,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";
import { CheckCircle, Home, Phone, Email } from "@mui/icons-material";
import { getDriverTipsAction, useGetUserDetails } from "../hooks/Admin/query";
import { useNavigate, useParams } from "react-router-dom";
import MediaItem from "../components/MediaItem";
import { StringUtil } from "../utils/stringUtil";
import { useForm, Controller } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';

interface DateRangeFormData {
    dateFrom: Dayjs | null;
    dateTo: Dayjs | null;
}

interface Tip {
    id: string;
    amount: number;
    orderId: string;
    createdAt: string;
}

interface DriverTips {
    id: string;
    receivedTips: Tip[]
}

const UserDetails = () => {
    const params = useParams();
    const navigate = useNavigate();   
    const { data: userDetails } = useGetUserDetails(params.userId as string);
    const [driverTips, setDriverTips] = useState<DriverTips>();
    // const { data: driverTips } = useGetDriverTips(params.userId as string, {startDate:  '', endDate: '' });
    const {
        control: dateControl,
        handleSubmit: handleDateSubmit,
        watch,
    } = useForm<DateRangeFormData>({
        defaultValues: {
            dateFrom: null,  // Explicitly set null to keep it controlled
            dateTo: null,    // Explicitly set null to keep it controlled
        },
    });

    const onDateRangeSubmit = useCallback(async (data: DateRangeFormData) => {
        try {
            const res = await getDriverTipsAction(params.userId as string, { startDate: data.dateFrom?.format("YYYY-MM-DD") ?? '', endDate: data.dateTo?.endOf("day").toISOString() ?? '' });
            setDriverTips(res);

        } catch (error: any) {
            showError(error.message);
        }
    }, [getDriverTipsAction, params.userId, setDriverTips]);

    const showError = useCallback((errorMessage: string) => {
        toast(errorMessage, { type: "error" });
    }, []);


    const validateNotFuture = (value: Dayjs | null) => {
        if (value && value.isAfter(dayjs(), "day")) {
            return "Please select a date on or before today.";
        }
        return true;
    };

    const dateFrom = watch("dateFrom");
    const dateTo = watch("dateTo");

    const isIncomplete = !dateFrom || !dateTo;

    const validateDateTo = (value: Dayjs | null) => {

        if (value && value.isAfter(dayjs(), "day")) {
            return "Please select a date on or before today.";
        }
        
        if (dateFrom && value && value.isBefore(dateFrom, "day")) {
            return "End date should be on or after the start date.";
        }
        return true;
    };

    return (
        <Box p={4}>
            <ToastContainer />
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

            {userDetails?.data.type === "RIDER" ?
                <Box mt={4}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Driver Tips
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <form onSubmit={handleDateSubmit(onDateRangeSubmit)}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Controller
                                    name="dateFrom"
                                    control={dateControl}
                                    rules={{ validate: validateNotFuture }}
                                    render={({ field, fieldState: { error } }) => (
                                        <DatePicker
                                            {...field}
                                            label="Date From"
                                            onChange={(date) => field.onChange(date)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!error,
                                                    helperText: error ? error.message : "",
                                                },
                                            }}
                                        />
                                    )}
                                />


                                <Controller
                                    name="dateTo"
                                    control={dateControl}
                                    rules={{ validate: validateDateTo }}
                                    render={({ field, fieldState: { error } }) => (
                                        <DatePicker
                                            {...field}
                                            label="Date To"
                                            onChange={(date) => field.onChange(date)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!error,
                                                    helperText: error ? error.message : "",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Stack>
                            <Box mt={2}>
                                <Button disabled={isIncomplete} variant="contained" type="submit">
                                Search
                                </Button>
                            </Box>
                        </form>
                    </LocalizationProvider>

                    {driverTips && <Box mt={4}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="#333">
                                Total Tips: {driverTips?.receivedTips.reduce((acc, tip) => acc + tip.amount, 0)} SAR
                            </Typography>
                        </Box>
                        <Table>
                    <TableHead>
                        <TableRow
                            hover selected
                        >
                            {["Amount", "Order Id", "Transaction Date"].map((col) => (
                                <TableCell style={{ fontWeight: 'bold' }} key={col}>{col}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {driverTips?.receivedTips && driverTips?.receivedTips.length > 0 ? (
                            driverTips?.receivedTips.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.amount ?? 'N/A'} SAR</TableCell>
                                    <TableCell style={{cursor: 'pointer'}} onClick={()=> navigate(`/order-details/${row.orderId}`)}>{row.orderId ?? 'N/A'}</TableCell>
                                    <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No tips received
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                    </Box>}
                    
                </Box> : <></>}
        </Box>
    )
}

export default UserDetails