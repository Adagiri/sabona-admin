import { Box, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { useFetchAllUsers } from "../hooks/Admin/query";

const Driver = () => {
    const { data: drivers } = useFetchAllUsers("RIDER");
    return (
        <Box pr={5}>
            <Typography variant="h4" gutterBottom>
                Driver
            </Typography>
            <TextField fullWidth placeholder="Search..." variant="outlined" sx={{ mb: 2 }} />
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow hover selected>
                            {["First Name", "Last Name", "Type", "Phone", "Email", "Status", "Created At"].map((col) => (
                                <TableCell key={col}>{col}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {drivers?.data?.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.firstName}</TableCell>
                                <TableCell>{row.lastName}</TableCell>
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{row.phone}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                <TableCell>{row.createdAt}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    )
}

export default Driver