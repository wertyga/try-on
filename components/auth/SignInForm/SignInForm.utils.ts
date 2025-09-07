import * as yup from 'yup';

export const SIGNIN_FORM_SCHEMA = yup
  .object({
    email: yup
      .string()
      .required('This field should not be empty')
      .email('E-mail must be a valid e-mail'),
    password: yup.string().required().min(6),
  })
  .required();
