import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
} from '@chakra-ui/react';
import { useFormik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { FiEdit3 } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { createTable } from 'apiSdk/tables';
import { Error } from 'components/error';
import { tableValidationSchema } from 'validationSchema/tables';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { RestaurantInterface } from 'interfaces/restaurant';
import { getRestaurants } from 'apiSdk/restaurants';
import { TableInterface } from 'interfaces/table';

function TableCreatePage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleSubmit = async (values: TableInterface, { resetForm }: FormikHelpers<any>) => {
    setError(null);
    try {
      await createTable(values);
      resetForm();
      router.push('/tables');
    } catch (error) {
      setError(error);
    }
  };

  const formik = useFormik<TableInterface>({
    initialValues: {
      number: 0,
      seats: 0,
      restaurant_id: (router.query.restaurant_id as string) ?? null,
    },
    validationSchema: tableValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <AppLayout>
      <Box bg="white" p={4} rounded="md" shadow="md">
        <Box mb={4}>
          <Text as="h1" fontSize="2xl" fontWeight="bold">
            Create Table
          </Text>
        </Box>
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        <form onSubmit={formik.handleSubmit}>
          <FormControl id="number" mb="4" isInvalid={!!formik.errors?.number}>
            <FormLabel>Number</FormLabel>
            <NumberInput
              name="number"
              value={formik.values?.number}
              onChange={(valueString, valueNumber) =>
                formik.setFieldValue('number', Number.isNaN(valueNumber) ? 0 : valueNumber)
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {formik.errors.number && <FormErrorMessage>{formik.errors?.number}</FormErrorMessage>}
          </FormControl>
          <FormControl id="seats" mb="4" isInvalid={!!formik.errors?.seats}>
            <FormLabel>Seats</FormLabel>
            <NumberInput
              name="seats"
              value={formik.values?.seats}
              onChange={(valueString, valueNumber) =>
                formik.setFieldValue('seats', Number.isNaN(valueNumber) ? 0 : valueNumber)
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {formik.errors.seats && <FormErrorMessage>{formik.errors?.seats}</FormErrorMessage>}
          </FormControl>
          <AsyncSelect<RestaurantInterface>
            formik={formik}
            name={'restaurant_id'}
            label={'Select Restaurant'}
            placeholder={'Select Restaurant'}
            fetcher={getRestaurants}
            renderOption={(record) => (
              <option key={record.id} value={record.id}>
                {record?.name}
              </option>
            )}
          />
          <Button isDisabled={formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
            Submit
          </Button>
        </form>
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'table',
  operation: AccessOperationEnum.CREATE,
})(TableCreatePage);
