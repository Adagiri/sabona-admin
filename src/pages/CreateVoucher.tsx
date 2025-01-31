import { useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs, { Dayjs } from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DISCOUNT_TYPE } from "../hooks/Admin/interface";
import { useCreateCoupon } from "../hooks/Admin/mutation";
import { useNavigate } from "react-router-dom";


interface FormDataInterface {
  code: string;
  name: string;
  type: DISCOUNT_TYPE;
  discount: number;
  maxDiscount?: number; 
  minOrderAmount?: number;
  expiryDate: Dayjs;
  usageLimit?: number | any;  // Allow null value
  singleUse: boolean;
  isActive: boolean;
  startDate?: Dayjs;
}

// Validation schema with Yup
const schema = yup.object<FormDataInterface>().shape({
  code: yup.string().required("Coupon Code is required"),
  name: yup.string().required("Coupon Name is required"),
  type: yup.mixed<DISCOUNT_TYPE>().required().oneOf([DISCOUNT_TYPE.PERCENTAGE, DISCOUNT_TYPE.FIXED]),
  discount: yup
    .number()
    .positive("Discount value must be greater than 0")
    .required("Discount value is required")
    .when("type", {
      is: DISCOUNT_TYPE.PERCENTAGE,
      then: (schema) =>
        schema.max(100, "Discount value must not be greater than 100"),
      otherwise: (schema) => schema, // Leave unchanged for FIXED type
    }),
  maxDiscount: yup
    .number()
    .optional()
    .transform((value) => (isNaN(value) ? undefined : value)),
  minOrderAmount: yup
    .number()
    .positive("Min Order Amount must be greater than 0")
    .optional()
    .when("type", {
      is: DISCOUNT_TYPE.FIXED,
      then: (schema) => schema.required("Min Order Amount is required"),
    }),
  expiryDate: yup
    .mixed<Dayjs>()
    .required("Expiry Date is required")
    .test("is-future", "Expiry Date must be in the future", (value) => {
      return value ? value.isAfter(dayjs()) : false;
    }),
    usageLimit: yup.number().optional().nullable(),  // Transform null/empty to undefined
    singleUse: yup.boolean().required(),
    isActive: yup.boolean().required(),
    startDate: yup.mixed<Dayjs>().optional()
    .test('conditional-validation', 'Start Date must be in the future and before Expiry Date', function (value) {
      const { isActive, expiryDate } = this.parent;
      if (!isActive) {
        if (!value) {
          return this.createError({ message: 'Start Date is required' });
        }
        if (value && value.isBefore(dayjs())) {
          return this.createError({ message: 'Start Date must be in the future' });
        }
        if (value && expiryDate && value.isAfter(expiryDate)) {
          return this.createError({ message: 'Start Date must be before Expiry Date' });
        }
      }
      return true;
    }),
});

const CreateVoucher = () => {
  const { mutateAsync: createCoupon, isPending: isCreatingCoupon } = useCreateCoupon();
  const navigate = useNavigate();
  const { control,handleSubmit, watch, formState: { errors } } = useForm<FormDataInterface>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      type: DISCOUNT_TYPE.PERCENTAGE,
      discount: 0,
      maxDiscount: undefined,
      minOrderAmount: undefined,
      expiryDate: dayjs().add(1, 'day'), //tomorrow
      usageLimit: undefined,
      singleUse: true,
      isActive: true,
      // startDate: dayjs(),
    },
  });


  const watchType = watch("type");
  const watchIsActive = watch("isActive");

  console.log("errors", errors)

  const onSubmit = useCallback(async (data: FormDataInterface) => {
    const payload = {
      ...data,
      startDate: data.isActive ? dayjs().toISOString() : data.startDate?.toISOString(),
      expiryDate: data.expiryDate.toISOString(),
    };
    try {
      await createCoupon(payload);
      navigate("/voucher")
    } catch (e: any) {
      console.log("catch error", e)
      showError(e?.response?.data?.message || e.message)
    }
  }, [createCoupon, toast, navigate]);

  const showError = (message: string) => {
    toast.error(message);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box pb={10}>
        <ToastContainer />
        <Typography variant="h4" gutterBottom textAlign={"center"} mb={5}>
          Create Voucher
        </Typography>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 500, margin: "auto" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              {/* Coupon Code */}
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Coupon Code"
                    fullWidth
                    error={!!errors.code}
                    helperText={errors.code?.message}
                  />
                )}
              />

              {/* Coupon Name */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Coupon Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />

              {/* Discount Type */}
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Discount Type"
                    fullWidth
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value={DISCOUNT_TYPE.PERCENTAGE}>Percentage</MenuItem>
                    <MenuItem value={DISCOUNT_TYPE.FIXED}>Fixed</MenuItem>
                  </TextField>
                )}
              />

              {/* Discount Value */}
              <Controller
                name="discount"
                control={control}
                render={({ field }) => (
                  <Box width={'100%'} display={"flex"} justifyContent={"center"}>
                    <Box display={"flex"} alignItems={"center"} p={1} gap={1}>
                      <TextField
                        {...field}
                        label="Discount Value"
                        type="number"
                        error={!!errors.discount}
                        helperText={errors.discount?.message}
                        variant="standard" // Removes the border

                        slotProps={{
                          input: {
                            disableUnderline: true, // Removes the underline
                            style: { fontSize: "5rem", fontWeight: "bold" }, // Extra large text
                          },
                        }}
                        sx={{
                          width: 145,
                          flexGrow: 1, // Allow TextField to expand and take available space
                        }}
                      />
                      {watchType === DISCOUNT_TYPE.PERCENTAGE ? (
                        <Typography variant="h2" fontWeight="extrabold">
                          %
                        </Typography>
                      ) : <Typography variant="h4" fontWeight="extrabold">
                      SAR
                    </Typography>}
                      <Typography variant="h6" fontWeight="bold">
                        OFF
                      </Typography>
                    </Box>
                  </Box>
                )}
              />


              {/* Max Discount for Percentage */}
              {watchType === DISCOUNT_TYPE.PERCENTAGE && (
                <Controller
                  name="maxDiscount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Max Discount"
                      type="number"
                      fullWidth
                      error={!!errors.maxDiscount}
                      helperText={errors.maxDiscount?.message}
                    />
                  )}
                />
              )}

              {/* Min Order Amount for Fixed */}
              {watchType === DISCOUNT_TYPE.FIXED && (
                <Controller
                  name="minOrderAmount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Min Order Amount"
                      type="number"
                      fullWidth
                      error={!!errors.minOrderAmount}
                      helperText={errors.minOrderAmount?.message}
                    />
                  )}
                />
              )}

              {/* Usage Limit */}
              <Controller
                name="usageLimit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Usage Limit (Optional)"
                    type="number"
                    fullWidth
                    value={field.value || ''}  // Make sure empty input is handled
                    onChange={(e) => {
                      const value = e.target.value;
                      // If input is empty, set the value to null or undefined
                      field.onChange(value === '' ? null : value);
                    }}
                  />
                )}
              />

              {/* Expiry Date */}
              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <>
                    <DateTimePicker
                      {...field}
                      label="Expiry Date"
                      onChange={(date) => field.onChange(date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                    {errors?.expiryDate && <Typography fontSize={12} color="error">{errors.expiryDate.message}</Typography>}
                  </>
                )}
              />

              {/* Start Date (Optional) */}
              {!watchIsActive && (
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <>
                      <DateTimePicker
                        {...field}
                        label="Start Date"
                        onChange={(date) => field.onChange(date)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                      {errors?.startDate && <Typography fontSize={12} color="error">{errors.startDate.message}</Typography>}
                    </>
                  )}
                />
              )}

              {/* Single Use & Active */}
              <Box display={"flex"} justifyContent={"center"}>
                <Controller
                  name="singleUse"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Single Use"
                    />
                  )}
                />
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Active"
                    />
                  )}
                />
              </Box>

              <Button variant="contained" type="submit">
                {isCreatingCoupon ? <CircularProgress color="primary" /> : 'Create'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateVoucher;
