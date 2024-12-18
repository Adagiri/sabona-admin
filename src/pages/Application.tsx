import { Box, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";

const Application = () => {
    const sampleData = [
        { firstName: "John", lastName: "Doe", type: "Regular", phone: "123-456-7890", email: "john@example.com", status: "Active" },
        { firstName: "Jane", lastName: "Smith", type: "Premium", phone: "098-765-4321", email: "jane@example.com", status: "Inactive" },
      ];
      
  return (
    <Box pr={5}>
    <Typography variant="h4" gutterBottom>
      Applications
    </Typography>
    <TextField fullWidth placeholder="Search..." variant="outlined" sx={{ mb: 2 }} />
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            {["First Name", "Last Name", "Type", "Phone", "Email", "Status"].map((col) => (
              <TableCell key={col}>{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sampleData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.firstName}</TableCell>
              <TableCell>{row.lastName}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  </Box>
  )
}

export default Application