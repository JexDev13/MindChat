import { CalendarView } from "@/components/appointments/CalendarView";

export default function AppointmentsPage() {
  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex-1">
        <CalendarView />
      </div>
    </div>
  );
}
