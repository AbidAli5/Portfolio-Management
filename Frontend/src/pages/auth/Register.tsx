import {Formik, Form, Field} from "formik";
import * as Yup from "yup";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import {toast} from "react-toastify";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import type {RegisterData} from "@/types/auth.types";
import {validatePassword} from "@/utils/validation";

const registerSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required").min(2, "First name must be at least 2 characters"),
  lastName: Yup.string().required("Last name is required").min(2, "Last name must be at least 2 characters"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
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

export default function Register() {
  const {register} = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterData) => {
    try {
      await register(values);
      toast.success("Registration successful! Please check your email for verification.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}>
          {({errors, touched, isSubmitting, values}) => {
            return (
              <Form className="mt-8 space-y-6">
                <div className="space-y-4">
                  <Field as={Input} name="firstName" label="First name" error={touched.firstName && errors.firstName ? errors.firstName : undefined} />
                  <Field as={Input} name="lastName" label="Last name" error={touched.lastName && errors.lastName ? errors.lastName : undefined} />
                  <Field as={Input} name="email" type="email" label="Email address" error={touched.email && errors.email ? errors.email : undefined} />
                  <Field as={Input} name="password" type="password" label="Password" error={touched.password && errors.password ? errors.password : undefined} helperText={values.password && !errors.password ? "Password must be at least 8 characters with uppercase, lowercase, and number" : undefined} />
                  <Field as={Input} name="confirmPassword" type="password" label="Confirm password" error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined} />
                </div>

                <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
                  Register
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
