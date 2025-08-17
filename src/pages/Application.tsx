import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, ToggleButtonGroup, ToggleButton, Pagination, Button, CircularProgress, Alert } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetApplications } from "../hooks/Admin/query";
import { useApproveApplication } from "../hooks/Admin/mutation";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";

const Application = () => {
  const [selectedType, setSelectedType] = useState<"VENDOR" | "RIDER">("VENDOR");
const { pageNumber } = useParams<{ pageNumber: string }>();
const [page, setPage] = useState<number>(Number(pageNumber) || 1);
  const [limit] = useState(10);
  const [approvingRow, setApprovingRow] = useState<string | null>(null); 
  const { mutateAsync: approveApplication } = useApproveApplication();
  const { data: applications, isLoading: isLoadingApplications, refetch: refetchApplications, error, isError } = useGetApplications({
    type: selectedType,
    page,
    limit,
  });

  useEffect(() => {
    if (error) {
      showError((error?.response?.data as { message: string })?.message || "Unknown error");
    }
  }, [error]);

  const totalPages = useMemo(() => Math.ceil((applications?.count ?? 0) / limit), [applications, limit]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!pageNumber) {
      navigate(`/application/1`, { replace: true });
    } else {
      setPage(Number(pageNumber));
    }
  }, [pageNumber, navigate]);
  

  const handlePageChange = useCallback(
    (_: any, value: number) => {
      setPage(value);
      navigate(`/application/${value}`);
    },
    [navigate]
  );
  
  const handleChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newType: "VENDOR" | "RIDER") => {
      if (newType !== null) {
        setSelectedType(newType);
        setPage(1);
        navigate(`/application/1`); 
      }
    },
    [navigate]
  );

  const currentStart = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const currentEnd = useMemo(() => Math.min(page * limit, applications?.count || 0), [page, limit, applications?.count]);

  const handleApprove = useCallback(
    async (userId: string) => {
      setApprovingRow(userId);
      try {
        await approveApplication(userId);
        await refetchApplications();
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Failed to approve application.";
        showError(errorMessage);
      } finally {
        setApprovingRow(null);
      }
    },
    [approveApplication, refetchApplications]
  );

  const showError = useCallback((errorMessage: string) => {
    toast(errorMessage, { type: "error" });
  }, []);

  return (
    <Box pr={5}>
      <ToastContainer />
      <Typography variant='h4' gutterBottom mb={5}>
        Applications
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <ToggleButtonGroup
          color='primary'
          value={selectedType}
          exclusive
          onChange={handleChange}
          aria-label='Platform'
        >
          <ToggleButton value='VENDOR'>Vendor</ToggleButton>
          <ToggleButton value='RIDER'>Rider</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoadingApplications ? (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          height='200px'
        >
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          height='200px'
        >
          <Alert severity='error'>
            Failed to load applications. Please try again later.
          </Alert>
        </Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow hover selected>
                {[
                  'First Name',
                  'Last Name',
                  'Type',
                  'Phone',
                  'Email',
                  // 'Status',
                ].map((col) => (
                  <TableCell style={{ fontWeight: 'bold' }} key={col}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {applications?.data && applications?.data?.length > 0 ? (
                applications.data.map((row, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/application-details/${row.id}`)}
                  >
                    <TableCell>{row.firstName ?? 'N/A'}</TableCell>
                    <TableCell>{row.lastName ?? 'N/A'}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email ?? 'N/A'}</TableCell>
                    {/* <TableCell>
                      <Button
                        variant='outlined'
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleApprove(row.id);
                        }}
                        disabled={approvingRow === row.id}
                        sx={{ minWidth: 100 }}
                      >
                        {approvingRow === row.id ? (
                          <CircularProgress size={17} />
                        ) : (
                          'Approve'
                        )}
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    No applications
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mt={2}
            py={2}
            px={2}
          >
            <Box
              flex='1'
              display='flex'
              justifyContent='center'
              marginLeft={20}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color='primary'
              />
            </Box>
            {applications && (
              <Typography variant='body2' sx={{ ml: 3 }}>
                Showing{' '}
                {applications?.data?.length > 0
                  ? `${currentStart}- ${currentEnd}`
                  : 0}{' '}
                of {applications?.count || 0} items
              </Typography>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Application



