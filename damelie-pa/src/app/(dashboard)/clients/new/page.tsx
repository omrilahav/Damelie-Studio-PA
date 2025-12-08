import { Header } from "@/components/layout/header";
import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <>
      <Header 
        title="New Client" 
        subtitle="Add a new client to your portfolio"
      />
      
      <div className="p-6 max-w-2xl">
        <ClientForm />
      </div>
    </>
  );
}

