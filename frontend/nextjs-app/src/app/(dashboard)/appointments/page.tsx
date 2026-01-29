import { CalendarView } from "@/components/appointments/CalendarView";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function CalendarLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex-1">
        <Suspense fallback={<CalendarLoading />}>
          <CalendarView />
        </Suspense>
      </div>
    </div>
  );
}
