import {Formik, Form, Field} from "formik";
import * as Yup from "yup";
import {useNavigate} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "react-toastify";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import * as transactionService from "@/services/transaction.service";
import * as investmentService from "@/services/investment.service";
import type {TransactionFormData} from "@/types/transaction.types";
import {TRANSACTION_TYPES, TRANSACTION_STATUS, ROUTES} from "@/utils/constants";

const transactionSchema = Yup.object().shape({
  investmentId: Yup.string().required("Investment is required"),
  type: Yup.string().required("Transaction type is required"),
  quantity: Yup.number().required("Quantity is required").positive("Quantity must be positive"),
  price: Yup.number().required("Price is required").positive("Price must be positive"),
  fees: Yup.number().min(0, "Fees must be positive"),
  date: Yup.string().required("Date is required"),
  status: Yup.string().required("Status is required"),
  notes: Yup.string(),
});

export default function TransactionForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {data: investments} = useQuery({
    queryKey: ["investments-list"],
    queryFn: () => investmentService.getInvestments({page: 1, limit: 100}),
  });

  const createMutation = useMutation({
    mutationFn: (data: TransactionFormData) => transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["transactions"]});
      toast.success("Transaction created successfully");
      navigate(ROUTES.TRANSACTIONS);
    },
    onError: () => {
      toast.error("Failed to create transaction");
    },
  });

  const investmentOptions =
    investments?.data.data.data.map((inv) => ({
      value: inv.id,
      label: `${inv.name} (${inv.symbol || inv.type})`,
    })) || [];

  const initialValues: TransactionFormData = {
    investmentId: "",
    type: "buy",
    quantity: 0,
    price: 0,
    fees: 0,
    date: new Date().toISOString().split("T")[0],
    status: "completed",
    notes: "",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Transaction</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={transactionSchema}
          onSubmit={(values) => {
            createMutation.mutate({...values});
          }}>
          {({errors, touched, isSubmitting, values}) => {
            const calculatedAmount = values.quantity * values.price + (values.fees || 0);
            return (
              <Form className="space-y-6">
                <Field as={Select} name="investmentId" label="Investment" options={[{value: "", label: "Select investment"}, ...investmentOptions]} error={touched.investmentId && errors.investmentId ? errors.investmentId : undefined} />
                <Field as={Select} name="type" label="Transaction Type" options={TRANSACTION_TYPES} error={touched.type && errors.type ? errors.type : undefined} />
                <div className="grid grid-cols-2 gap-4">
                  <Field as={Input} name="quantity" type="number" label="Quantity" error={touched.quantity && errors.quantity ? errors.quantity : undefined} />
                  <Field as={Input} name="price" type="number" label="Price" error={touched.price && errors.price ? errors.price : undefined} />
                </div>
                <Field as={Input} name="fees" type="number" label="Fees (Optional)" error={touched.fees && errors.fees ? errors.fees : undefined} />
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Calculated Amount</p>
                  <p className="text-xl font-semibold text-gray-900">${calculatedAmount.toFixed(2)}</p>
                </div>
                <Field as={Input} name="date" type="date" label="Date" error={touched.date && errors.date ? errors.date : undefined} />
                <Field as={Select} name="status" label="Status" options={TRANSACTION_STATUS} error={touched.status && errors.status ? errors.status : undefined} />
                <Field as={Input} name="notes" label="Notes (Optional)" error={touched.notes && errors.notes ? errors.notes : undefined} />

                <div className="flex gap-4">
                  <Button type="submit" variant="primary" loading={isSubmitting || createMutation.isPending}>
                    Create Transaction
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(ROUTES.TRANSACTIONS)}>
                    Cancel
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
