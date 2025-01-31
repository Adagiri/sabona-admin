import {
    Box,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Pagination,
    CircularProgress,
    Alert,
    Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAllCoupons } from "../hooks/Admin/query";
import { DISCOUNT_TYPE } from "../hooks/Admin/interface";
import { Clear, Done } from "@mui/icons-material";

const Voucher = () => {
    const navigate = useNavigate();
    const { pageNumber } = useParams<{ pageNumber: string }>();
    const [page, setPage] = useState<number>(Number(pageNumber) || 1);
    const [limit] = useState(10);
    const { data: coupons, isLoading, isError, refetch } = useGetAllCoupons({ page, limit });
    const scrollRef = useRef<HTMLElement | null>(null);
    console.log("coupons", coupons)


    const totalPages = useMemo(() => Math.ceil((coupons?.count ?? 0) / limit), [coupons, limit]);
    const handleNvigateNewVoucher = useCallback(() => {
        navigate("/createVoucher")
    }, [navigate])

    useEffect(()=> {
        refetch()
    },[page])

    useEffect(() => {
        if (!pageNumber) {
            navigate(`/voucher/1`, { replace: true });
        } else {
            setPage(Number(pageNumber));
        }
    }, [pageNumber, navigate]);

    const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        navigate(`/voucher/${value}`);
    }, [page, navigate])

    const columns = [
        "Code",
        "Name",
        "Discount",
        "Usage Limit",
        "Single Use",
        // "Type",
        "Start Date",
        "Expiry Date",
        "Status",
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [page]);

    const handleNagivateToUsage = useCallback((voucherId:string)=> {
        navigate(`/voucherUsage/${voucherId}`)
    },[navigate])
    return (
        <Box pb={10} ref={scrollRef}>
            <Typography variant="h4" gutterBottom mb={5}>
                Vouchers
            </Typography>
            <Box display={"flex"} justifyContent={"center"}>
                
                <Button onClick={handleNvigateNewVoucher} variant="contained">Create New Voucher</Button>
            </Box>
            <Box mt={2} mr={5} overflow={"scroll"}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" mt={3}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Alert severity="error">Failed to load coupons. Please try again later.</Alert>
                ) : coupons?.coupons?.length === 0 ? (
                    <Alert severity="info">No coupons available.</Alert>
                ) : (
                    <Paper elevation={3}>
                        <Table>
                            <TableHead>
                                <TableRow hover>
                                    {columns.map((col) => (
                                        <TableCell key={col} style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                            {col}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {coupons?.coupons?.map((coupon: any) => (
                                    <TableRow key={coupon.id} style={{cursor: 'pointer'}} onClick={()=> handleNagivateToUsage(coupon.id)}>
                                        <TableCell>{String(coupon.code).toUpperCase()}</TableCell>
                                        <TableCell>{coupon.name}</TableCell>
                                        <TableCell>{coupon.discount}{coupon.type === DISCOUNT_TYPE.FIXED ? " SAR" : "%"}</TableCell>
                                        <TableCell>{coupon.usageLimit ? coupon.usageLimit : "N/A"}</TableCell>
                                        <TableCell>{coupon.singleUse ? <Done/> : <Clear/> }</TableCell>
                                        {/* <TableCell>{coupon.type}</TableCell> */}
                                        <TableCell>{coupon.startDate ? new Date(coupon.startDate).toLocaleString() : "N/A"}</TableCell>
                                        <TableCell>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleString() : "N/A"}</TableCell>
                                        <TableCell style={coupon.isActive ? { color: 'green' } : { color: 'red' }}>{coupon.isActive ? "Active" : "Inactive"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Box display="flex" justifyContent="center" mt={2} pb={2}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default Voucher;
