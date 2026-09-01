import { redirect } from 'next/navigation';

export default function GrowthWeeklyRedirect() {
  redirect('/admin/growth/report');
}
