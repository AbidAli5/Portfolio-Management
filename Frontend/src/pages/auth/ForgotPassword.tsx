import {Formik, Form, Field} from "formik";
import * as Yup from "yup";
import {Link} from "react-router-dom";
import {toast} from "react-toastify";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import * as authService from "@/services/auth.service";

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

export default function ForgotPassword() {
  const handleSubmit = async (values: {email: string}) => {
    try {
      await authService.forgotPassword(values);
      toast.success("If an account exists with this email, a password reset link has been sent.");
    } catch (error: any) {
      // Don't reveal if email exists or not for security
      toast.success("If an account exists with this email, a password reset link has been sent.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
        </div>
        <Formik initialValues={{email: ""}} validationSchema={forgotPasswordSchema} onSubmit={handleSubmit}>
          {({errors, touched, isSubmitting}) => (
            <Form className="mt-8 space-y-6">
              <Field as={Input} name="email" type="email" label="Email address" error={touched.email && errors.email ? errors.email : undefined} />

              <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
                Send reset link
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
