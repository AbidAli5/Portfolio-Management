import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import * as authService from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatters';
import { validatePassword } from '@/utils/validation';

const profileSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .test('password-strength', 'Password does not meet requirements', (value) => {
      if (!value) return false;
      return validatePassword(value).valid;
    }),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

export default function Profile() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; email: string }) =>
      authService.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data.data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: () => {
      toast.error('Failed to change password');
    },
  });

  if (isLoading || !user) {
    return <Loading fullScreen />;
  }

  const profileData = profile?.data.data || user;
  const initialProfileValues = {
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    email: profileData.email,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        <Formik
          initialValues={initialProfileValues}
          validationSchema={profileSchema}
          onSubmit={(values) => {
            updateMutation.mutate(values);
          }}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <Field
                as={Input}
                name="firstName"
                label="First Name"
                error={touched.firstName && errors.firstName ? errors.firstName : undefined}
              />
              <Field
                as={Input}
                name="lastName"
                label="Last Name"
                error={touched.lastName && errors.lastName ? errors.lastName : undefined}
              />
              <Field
                as={Input}
                name="email"
                type="email"
                label="Email"
                error={touched.email && errors.email ? errors.email : undefined}
              />
              <div className="pt-4">
                <p className="text-sm text-gray-600">
                  Member since: {formatDate(profileData.createdAt)}
                </p>
                <p className="text-sm text-gray-600">
                  Role: <span className="font-medium">{profileData.role}</span>
                </p>
              </div>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting || updateMutation.isPending}
              >
                Update Profile
              </Button>
            </Form>
          )}
        </Formik>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={passwordSchema}
          onSubmit={(values, { resetForm }) => {
            changePasswordMutation.mutate(
              {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              },
              {
                onSuccess: () => {
                  resetForm();
                },
              }
            );
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <Field
                as={Input}
                name="currentPassword"
                type="password"
                label="Current Password"
                error={
                  touched.currentPassword && errors.currentPassword
                    ? errors.currentPassword
                    : undefined
                }
              />
              <Field
                as={Input}
                name="newPassword"
                type="password"
                label="New Password"
                error={touched.newPassword && errors.newPassword ? errors.newPassword : undefined}
                helperText="Password must be at least 8 characters with uppercase, lowercase, and number"
              />
              <Field
                as={Input}
                name="confirmPassword"
                type="password"
                label="Confirm New Password"
                error={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : undefined
                }
              />
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting || changePasswordMutation.isPending}
              >
                Change Password
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

