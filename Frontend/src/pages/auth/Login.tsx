import {Formik, Form, Field} from "formik";
import * as Yup from "yup";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import {toast} from "react-toastify";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import type {LoginCredentials} from "@/types/auth.types";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const {login} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      await login(values);

      // Wait a brief moment to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      toast.success("Login successful!");

      // Determine redirect path based on user role
      const userStr = localStorage.getItem("user");
      let redirectPath = "/dashboard";

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?.role === "admin") {
            redirectPath = "/admin/dashboard";
          } else {
            // Only use the 'from' path if it's not the default dashboard
            redirectPath = from !== "/dashboard" ? from : "/dashboard";
          }
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }

      // Navigate after toast
      setTimeout(() => {
        navigate(redirectPath, {replace: true});
      }, 100);
    } catch (error: any) {
      console.error("Login error in component:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        <Formik initialValues={{email: "", password: ""}} validationSchema={loginSchema} onSubmit={handleSubmit}>
          {({errors, touched, isSubmitting}) => (
            <Form className="mt-8 space-y-6">
              <div className="space-y-4">
                <Field as={Input} name="email" type="email" label="Email address" error={touched.email && errors.email ? errors.email : undefined} />
                <Field as={Input} name="password" type="password" label="Password" error={touched.password && errors.password ? errors.password : undefined} />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
                Sign in
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
