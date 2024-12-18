import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, ToggleButtonGroup, ToggleButton, Pagination, Button, CircularProgress, Alert } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetApplications } from "../hooks/Admin/query";
import { useApproveApplication } from "../hooks/Admin/mutation";
import { ToastContainer, toast } from 'react-toastify';



const Application = () => {
  const [selectedType, setSelectedType] = useState<"VENDOR" | "RIDER">('VENDOR');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { mutateAsync: approveApplication, isPending: IsApproving, error: errorApprovingApplication } = useApproveApplication();
  const { data: applications, isLoading: isLoadingApplications, refetch: refetchApplications, error, isError } = useGetApplications({
    type: selectedType,
    page,
    limit,
  });

  useEffect(() => {
    if (error) {
      showError((error?.response?.data as { message: string })?.message || 'Unknown error');
    }
  }, [error])

  useEffect(() => {
    if (errorApprovingApplication) {
      showError((errorApprovingApplication as any)?.response?.data?.message);
    }
  }, [errorApprovingApplication])

  const totalPages = useMemo(() => Math.ceil((applications?.count ?? 0) / limit), [applications, limit]);
  const handlePageChange = useCallback((_: any, value: number) => {
    setPage(value);
  }, [setPage]);

  const handleChange = useCallback((
    _: React.MouseEvent<HTMLElement>,
    newType: "VENDOR" | "RIDER",
  ) => {
    if (newType !== null) {
      setSelectedType(newType);
    }
  }, [setSelectedType]);

  const handleApprove = useCallback(async (userId: string) => {
    try {
      await approveApplication(userId);
      refetchApplications();
    } catch (error: any) {
      console.log("error", error);
    }
  }, [approveApplication])

  const showError = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: "error" });
  }, []);

  return (
    <Box pr={5}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom mb={5}>
        Applications
      </Typography>
      {/* <TextField fullWidth placeholder="Search..." variant="outlined" sx={{ mb: 2 }} /> */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <ToggleButtonGroup
          color="primary"
          value={selectedType}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          <ToggleButton value="VENDOR">Vendor</ToggleButton>
          <ToggleButton value="RIDER">Rider</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoadingApplications ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : isError ? (
        // Show error message when there's an error
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Alert severity="error">Failed to load applications. Please try again later.</Alert>
        </Box>
      ) : (
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
              {applications?.data && applications?.data?.length > 0 ? (
                applications.data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.firstName ?? "N/A"}</TableCell>
                    <TableCell>{row.lastName ?? "N/A"}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email ?? "N/A"}</TableCell>
                    <TableCell>
                      <Button variant="outlined" onClick={() => handleApprove(row.id)}>
                        {IsApproving ? <CircularProgress size="10px" /> : `Approve`}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No applications
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" mt={2} py={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Paper>)}
    </Box>
  )
}

export default Application