import { Box, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { useFetchAllOrders } from "../hooks/Admin/query";


const Order = () => {
    const { data: orders } = useFetchAllOrders();
    return (
        <Box pr={5}>
            <Typography variant="h4" gutterBottom>
                Order
            </Typography>
            <TextField fullWidth placeholder="Search..." variant="outlined" sx={{ mb: 2 }} />
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow hover selected>
                            {["Total Amount", "Status", "Created At"].map((col) => (
                                <TableCell key={col}>{col}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders?.data?.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row?.totalAmount}</TableCell>
                                <TableCell>{row?.status}</TableCell>
                                <TableCell>{row?.createdAt}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    )
}

export default Order