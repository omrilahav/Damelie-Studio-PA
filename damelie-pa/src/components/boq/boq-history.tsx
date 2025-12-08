import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileSpreadsheet, 
  Search, 
  Calendar,
  Building2 
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface BoQItem {
  id: string;
  category: string;
  item: string;
  unit: string;
  quantity: number | null;
  unitPrice: number;
  source: string | null;
  date: Date;
  project: {
    id: string;
    name: string;
  } | null;
}

interface BoQHistoryProps {
  items: BoQItem[];
}

export function BoQHistory({ items }: BoQHistoryProps) {
  if (items.length === 0) {
    return (
      <Card className="border-0 shadow-sm p-8 text-center">
        <FileSpreadsheet className="w-8 h-8 text-stone-300 mx-auto mb-3" />
        <h3 className="font-medium text-stone-900 mb-1">No price history yet</h3>
        <p className="text-sm text-stone-500">
          Add BoQ items to build your price reference database
        </p>
      </Card>
    );
  }

  // Group by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, BoQItem[]>);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Price History (Last 3 Years)</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search items..."
              className="pl-9 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <Badge variant="secondary">{category}</Badge>
                <span className="text-sm font-normal text-stone-400">
                  {categoryItems.length} items
                </span>
              </h3>
              
              <div className="rounded-xl border border-stone-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      <th className="text-left p-3 font-medium text-stone-600">Item</th>
                      <th className="text-left p-3 font-medium text-stone-600">Unit</th>
                      <th className="text-right p-3 font-medium text-stone-600">Price</th>
                      <th className="text-left p-3 font-medium text-stone-600">Source</th>
                      <th className="text-left p-3 font-medium text-stone-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryItems.map((item, index) => (
                      <tr 
                        key={item.id}
                        className={cn(
                          "hover:bg-stone-50 transition-colors",
                          index !== categoryItems.length - 1 && "border-b border-stone-50"
                        )}
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-stone-900">{item.item}</p>
                            {item.project && (
                              <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3" />
                                {item.project.name}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-stone-600">{item.unit}</td>
                        <td className="p-3 text-right font-semibold text-stone-900">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="p-3 text-stone-500">
                          {item.source || "—"}
                        </td>
                        <td className="p-3 text-stone-400 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.date)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

