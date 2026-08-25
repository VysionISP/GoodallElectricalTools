import { PageHeader } from "@/components/ui";
import { CustomerForm } from "../customer-form";
import { createCustomerAction } from "@/lib/actions/customers";

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="New customer" />
      <CustomerForm action={createCustomerAction} submitLabel="Create customer" />
    </div>
  );
}
