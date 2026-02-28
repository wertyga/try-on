import * as yup from 'yup';

export const CHANGE_EMAIL_FORM_SCHEMA = yup
  .object({
    newEmail: yup
      .string()
      .required('This field should not be empty')
      .email('E-mail must be a valid e-mail'),
    password: yup.string().required().min(6),
  })
  .required();
