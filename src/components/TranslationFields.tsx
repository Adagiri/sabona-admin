import React from 'react';
import { Stack, TextField, Typography, Box } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface TranslationFieldsProps {
  control: Control<any>;
  fieldName: string;
  label: string;
  errors?: FieldErrors;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

const TranslationFields: React.FC<TranslationFieldsProps> = ({
  control,
  fieldName,
  label,
  errors,
  required = true,
  multiline = false,
  rows = 1,
}) => {
  return (
    <Box>
      <Typography variant='subtitle2' gutterBottom sx={{ fontWeight: 600 }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      <Stack spacing={2}>
        {/* English Input */}
        <Controller
          name={`${fieldName}.en`}
          control={control}
          rules={required ? { required: `${label} (English) is required` } : {}}
          render={({ field }) => (
            <TextField
              {...field}
              label={`${label} (English)`}
              fullWidth
              multiline={multiline}
              rows={rows}
              error={!!(errors?.[fieldName] as FieldErrors)?.en}
              helperText={
                (errors?.[fieldName] as FieldErrors)?.en?.message as string
              }
              placeholder={`Enter ${label.toLowerCase()} in English`}
            />
          )}
        />

        {/* Arabic Input */}
        <Controller
          name={`${fieldName}.ar`}
          control={control}
          rules={required ? { required: `${label} (Arabic) is required` } : {}}
          render={({ field }) => (
            <TextField
              {...field}
              label={`${label} (Arabic)`}
              fullWidth
              multiline={multiline}
              rows={rows}
              error={!!(errors?.[fieldName] as FieldErrors)?.ar}
              helperText={
                (errors?.[fieldName] as FieldErrors)?.ar?.message as string
              }
              placeholder={`أدخل ${label.toLowerCase()} بالعربية`}
              inputProps={{ dir: 'rtl' }}
            />
          )}
        />
      </Stack>
    </Box>
  );
};

export default TranslationFields;
