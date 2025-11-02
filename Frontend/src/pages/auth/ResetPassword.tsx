import {Formik, Form, Field} from "formik";
import * as Yup from "yup";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {toast} from "react-toastify";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import * as authService from "@/services/auth.service";
import {validatePassword} from "@/utils/validation";

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .required("Password is required")
    .test("password-strength", "Password does not meet requirements", (value) => {
      if (!value) return false;
      return validatePassword(value).valid;
    }),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid reset link</h2>
          <p className="text-gray-600 mb-4">The password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-primary-600 hover:text-primary-500">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (values: {password: string}) => {
    try {
      await authService.resetPassword({token, password: values.password});
      toast.success("Password reset successful! You can now login with your new password.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Password reset failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Set new password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Enter your new password below.</p>
        </div>
        <Formik initialValues={{password: "", confirmPassword: ""}} validationSchema={resetPasswordSchema} onSubmit={handleSubmit}>
          {({errors, touched, isSubmitting}) => (
            <Form className="mt-8 space-y-6">
              <div className="space-y-4">
                <Field as={Input} name="password" type="password" label="New password" error={touched.password && errors.password ? errors.password : undefined} helperText="Password must be at least 8 characters with uppercase, lowercase, and number" />
                <Field as={Input} name="confirmPassword" type="password" label="Confirm new password" error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined} />
              </div>

              <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
                Reset password
              </Button>

              <div className="text-center">
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Back to login
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
