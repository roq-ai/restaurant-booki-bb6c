import * as yup from 'yup';

export const menuItemValidationSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string().required(),
  price: yup.number().integer().required(),
  ingredients: yup.string().required(),
  allergens: yup.string(),
  restaurant_id: yup.string().nullable(),
});
