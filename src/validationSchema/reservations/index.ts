import * as yup from 'yup';

export const reservationValidationSchema = yup.object().shape({
  date: yup.date().required(),
  time: yup.date().required(),
  number_of_guests: yup.number().integer().required(),
  guest_contact_information: yup.string().required(),
  table_id: yup.string().nullable(),
  user_id: yup.string().nullable(),
});
