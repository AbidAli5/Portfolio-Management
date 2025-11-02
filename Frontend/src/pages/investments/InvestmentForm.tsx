import {Formik, Form, Field} from "formik";
import * as Yup from "yup";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "react-toastify";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import * as investmentService from "@/services/investment.service";
import type {InvestmentFormData} from "@/types/investment.types";
import {INVESTMENT_TYPES, INVESTMENT_STATUS, ROUTES} from "@/utils/constants";

const investmentSchema = Yup.object().shape({
  name: Yup.string().required("Investment name is required"),
  type: Yup.string().required("Investment type is required"),
  amount: Yup.number().required("Amount is required").positive("Amount must be positive"),
  currentValue: Yup.number().required("Current value is required").min(0, "Current value must be positive"),
  purchaseDate: Yup.string().required("Purchase date is required"),
  status: Yup.string().required("Status is required"),
  description: Yup.string(),
  symbol: Yup.string(),
});

export default function InvestmentForm() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const {data: investment, isLoading} = useQuery({
    queryKey: ["investment", id],
    queryFn: () => investmentService.getInvestment(id!),
    enabled: isEdit,
  });

  const createMutation = useMutation({
    mutationFn: (data: InvestmentFormData) => investmentService.createInvestment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["investments"]});
      toast.success("Investment created successfully");
      navigate(ROUTES.INVESTMENTS);
    },
    onError: () => {
      toast.error("Failed to create investment");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<InvestmentFormData>) => investmentService.updateInvestment(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["investments"]});
      queryClient.invalidateQueries({queryKey: ["investment", id]});
      toast.success("Investment updated successfully");
      navigate(ROUTES.INVESTMENTS);
    },
    onError: () => {
      toast.error("Failed to update investment");
    },
  });

  if (isEdit && isLoading) {
    return <Loading fullScreen />;
  }

  const initialValues: InvestmentFormData = investment?.data.data
    ? {
        name: investment.data.data.name,
        type: investment.data.data.type,
        amount: investment.data.data.amount,
        currentValue: investment.data.data.currentValue,
        purchaseDate: investment.data.data.purchaseDate.split("T")[0],
        status: investment.data.data.status,
        description: investment.data.data.description || "",
        symbol: investment.data.data.symbol || "",
      }
    : {
        name: "",
        type: "stock",
        amount: 0,
        currentValue: 0,
        purchaseDate: new Date().toISOString().split("T")[0],
        status: "active",
        description: "",
        symbol: "",
      };

  const handleSubmit = (values: InvestmentFormData) => {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{isEdit ? "Edit Investment" : "Add Investment"}</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <Formik initialValues={initialValues} validationSchema={investmentSchema} onSubmit={handleSubmit} enableReinitialize>
          {({errors, touched, isSubmitting}) => (
            <Form className="space-y-6">
              <Field as={Input} name="name" label="Investment Name" error={touched.name && errors.name ? errors.name : undefined} />
              <Field as={Select} name="type" label="Type" options={INVESTMENT_TYPES} error={touched.type && errors.type ? errors.type : undefined} />
              <div className="grid grid-cols-2 gap-4">
                <Field as={Input} name="amount" type="number" label="Initial Amount" error={touched.amount && errors.amount ? errors.amount : undefined} />
                <Field as={Input} name="currentValue" type="number" label="Current Value" error={touched.currentValue && errors.currentValue ? errors.currentValue : undefined} />
              </div>
              <Field as={Input} name="purchaseDate" type="date" label="Purchase Date" error={touched.purchaseDate && errors.purchaseDate ? errors.purchaseDate : undefined} />
              <Field as={Select} name="status" label="Status" options={INVESTMENT_STATUS} error={touched.status && errors.status ? errors.status : undefined} />
              <Field as={Input} name="symbol" label="Symbol (Optional)" error={touched.symbol && errors.symbol ? errors.symbol : undefined} />
              <Field as={Input} name="description" label="Description (Optional)" error={touched.description && errors.description ? errors.description : undefined} />

              <div className="flex gap-4">
                <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                  {isEdit ? "Update" : "Create"} Investment
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(ROUTES.INVESTMENTS)}>
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
