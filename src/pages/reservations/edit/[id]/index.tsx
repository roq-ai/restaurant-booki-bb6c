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
  Center,
} from '@chakra-ui/react';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { FiEdit3 } from 'react-icons/fi';
import { useFormik, FormikHelpers } from 'formik';
import { getReservationById, updateReservationById } from 'apiSdk/reservations';
import { Error } from 'components/error';
import { reservationValidationSchema } from 'validationSchema/reservations';
import { ReservationInterface } from 'interfaces/reservation';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { TableInterface } from 'interfaces/table';
import { UserInterface } from 'interfaces/user';
import { getTables } from 'apiSdk/tables';
import { getUsers } from 'apiSdk/users';

function ReservationEditPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<ReservationInterface>(
    () => (id ? `/reservations/${id}` : null),
    () => getReservationById(id),
  );
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (values: ReservationInterface, { resetForm }: FormikHelpers<any>) => {
    setFormError(null);
    try {
      const updated = await updateReservationById(id, values);
      mutate(updated);
      resetForm();
      router.push('/reservations');
    } catch (error) {
      setFormError(error);
    }
  };

  const formik = useFormik<ReservationInterface>({
    initialValues: data,
    validationSchema: reservationValidationSchema,
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
            Edit Reservation
          </Text>
        </Box>
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        {formError && (
          <Box mb={4}>
            <Error error={formError} />
          </Box>
        )}
        {isLoading || (!formik.values && !error) ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <FormControl id="date" mb="4">
              <FormLabel>Date</FormLabel>
              <Box display="flex" maxWidth="100px" alignItems="center">
                <DatePicker
                  dateFormat={'dd/MM/yyyy'}
                  selected={formik.values?.date ? new Date(formik.values?.date) : null}
                  onChange={(value: Date) => formik.setFieldValue('date', value)}
                />
                <Box zIndex={2}>
                  <FiEdit3 />
                </Box>
              </Box>
            </FormControl>
            <FormControl id="time" mb="4">
              <FormLabel>Time</FormLabel>
              <Box display="flex" maxWidth="100px" alignItems="center">
                <DatePicker
                  dateFormat={'dd/MM/yyyy'}
                  selected={formik.values?.time ? new Date(formik.values?.time) : null}
                  onChange={(value: Date) => formik.setFieldValue('time', value)}
                />
                <Box zIndex={2}>
                  <FiEdit3 />
                </Box>
              </Box>
            </FormControl>
            <FormControl id="number_of_guests" mb="4" isInvalid={!!formik.errors?.number_of_guests}>
              <FormLabel>Number Of Guests</FormLabel>
              <NumberInput
                name="number_of_guests"
                value={formik.values?.number_of_guests}
                onChange={(valueString, valueNumber) =>
                  formik.setFieldValue('number_of_guests', Number.isNaN(valueNumber) ? 0 : valueNumber)
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {formik.errors.number_of_guests && <FormErrorMessage>{formik.errors?.number_of_guests}</FormErrorMessage>}
            </FormControl>
            <FormControl id="guest_contact_information" mb="4" isInvalid={!!formik.errors?.guest_contact_information}>
              <FormLabel>Guest Contact Information</FormLabel>
              <Input
                type="text"
                name="guest_contact_information"
                value={formik.values?.guest_contact_information}
                onChange={formik.handleChange}
              />
              {formik.errors.guest_contact_information && (
                <FormErrorMessage>{formik.errors?.guest_contact_information}</FormErrorMessage>
              )}
            </FormControl>
            <AsyncSelect<TableInterface>
              formik={formik}
              name={'table_id'}
              label={'Select Table'}
              placeholder={'Select Table'}
              fetcher={getTables}
              renderOption={(record) => (
                <option key={record.id} value={record.id}>
                  {record?.number}
                </option>
              )}
            />
            <AsyncSelect<UserInterface>
              formik={formik}
              name={'user_id'}
              label={'Select User'}
              placeholder={'Select User'}
              fetcher={getUsers}
              renderOption={(record) => (
                <option key={record.id} value={record.id}>
                  {record?.email}
                </option>
              )}
            />
            <Button isDisabled={formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
              Submit
            </Button>
          </form>
        )}
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'reservation',
  operation: AccessOperationEnum.UPDATE,
})(ReservationEditPage);
