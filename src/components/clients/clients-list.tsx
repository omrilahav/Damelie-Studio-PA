import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  FolderKanban,
  ChevronRight 
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  _count: {
    projects: number;
  };
}

interface ClientsListProps {
  clients: Client[];
}

export function ClientsList({ clients }: ClientsListProps) {
  if (clients.length === 0) {
    return (
      <Card className="border-0 shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="font-semibold text-stone-900 mb-2">No clients yet</h3>
        <p className="text-sm text-stone-500 mb-4">
          Add your first client to get started
        </p>
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          Add Client
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client, index) => (
        <Link
          key={client.id}
          href={`/clients/${client.id}`}
          className={cn(
            "group block animate-fade-in"
          )}
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          <Card className="border-0 shadow-sm p-5 hover:shadow-md transition-all card-hover h-full">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 font-semibold">
                  {getInitials(client.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-stone-900 truncate group-hover:text-stone-700">
                      {client.name}
                    </h3>
                    {client.company && (
                      <p className="text-sm text-stone-500 truncate">
                        {client.company}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
                </div>

                <div className="mt-3 space-y-1.5">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {client.phone}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <FolderKanban className="w-3 h-3" />
                    {client._count.projects} projects
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

