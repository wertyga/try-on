import * as yup from 'yup';

export const REGISTER_FORM_SCHEMA = yup
  .object({
    email: yup
      .string()
      .required('This field should not be empty')
      .email('E-mail must be a valid e-mail'),
    password: yup.string().required('This field should not be empty').min(6),
    username: yup.string().required('This field should not be empty'),
    confirmPassword: yup
      .string()
      .required('This field should not be empty')
      .oneOf([yup.ref('password')], 'passwords must match'),
  })
  .required();
