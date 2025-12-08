import { Header } from "@/components/layout/header";
import { ClientsList } from "@/components/clients/clients-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";

async function getClients() {
  return db.client.findMany({
    include: {
      _count: {
        select: { projects: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <Header 
        title="Clients" 
        subtitle={`${clients.length} clients`}
      />
      
      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search clients..."
              className="pl-9 w-64"
            />
          </div>
          <Link href="/clients/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Client
            </Button>
          </Link>
        </div>

        <ClientsList clients={clients} />
      </div>
    </>
  );
}

