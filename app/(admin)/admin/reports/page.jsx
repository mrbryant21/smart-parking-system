import { getReportsData } from "@/lib/reports/actions";
import { ReportsCharts } from "./ReportsCharts";

export default async function AdminReportsPage() {
  const data = await getReportsData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-muted-foreground">Occupancy and usage analytics.</p>
      </div>
      {data ? (
        <ReportsCharts data={data} />
      ) : (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Not authorized.
        </p>
      )}
    </div>
  );
}
