"use client"

import { useEffect, useState } from "react"
import { BarChart3, Calendar, ChevronDown, Download, FileDown, Filter, Meh, Smile, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"




// @ts-ignore
import jsPDF from "jspdf"
import "jspdf-autotable"

// Tambahkan deklarasi ekstensi agar TypeScript tidak error
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function ReportsPage() {
  // Helper: summary per user
  function getUserSummaries(data: any[], users: any[]) {
    // Group by userId
    const summaries: { [userId: string]: { name: string, role: string, hadir: number, absen: number, moodCount: Record<string, number> } } = {};
    data.forEach(row => {
      const user = users.find(u => u.id === row.userId);
      if (!user) return;
      if (!summaries[row.userId]) {
        summaries[row.userId] = {
          name: user.name,
          role: user.role,
          hadir: 0,
          absen: 0,
          moodCount: {}
        };
      }
      if (row.status === "present") {
        summaries[row.userId].hadir++;
        if (row.mood) {
          summaries[row.userId].moodCount[row.mood] = (summaries[row.userId].moodCount[row.mood] || 0) + 1;
        }
      } else if (row.status === "absent") {
        summaries[row.userId].absen++;
      }
    });
    return Object.values(summaries);
  }
  // Export PDF
  const handleExportPDF = async () => {
    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.default;
    let doc: jsPDF;
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.jsPDF = jsPDF;
      const autoTable = await import("jspdf-autotable");
      doc = new jsPDF();
      // Patch: force attach autoTable to doc prototype if not present
      if (typeof doc.autoTable !== "function" && typeof autoTable.default === "function") {
        // @ts-ignore
        doc.autoTable = function(...args) { return autoTable.default(doc, ...args); };
      }
    } else {
      doc = new jsPDF();
    }
    // Judul dan periode
    let periode = "Semua Periode";
    if (filterPeriod === "monthly") periode = `Bulan ${month}/${year}`;
    else if (filterPeriod === "yearly") periode = `Tahun ${year}`;
    doc.setFontSize(16);
    doc.text("Laporan Wellbeing & Absensi", 14, 16);
    doc.setFontSize(11);
    doc.text(`Periode: ${periode}`, 14, 24);

    // Ringkasan
    const total = filteredData.length;
    const hadir = filteredData.filter(d => d.status === "present").length;
    const absen = filteredData.filter(d => d.status === "absent").length;
    const moodList = filteredData.map(d => d.mood).filter(Boolean);
    const moodSummary = moodList.length > 0 ? moodList.join(", ") : "-";
    doc.text(`Total Data: ${total} | Hadir: ${hadir} | Absen: ${absen}`, 14, 38);
    doc.text(`Mood: ${moodSummary}`, 14, 44);

    // Data tabel
    const tableData = filteredData.map((row, i) => {
      const user = users.find((u) => u.id === row.userId);
      let dateStr = row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';
      return [
        i + 1,
        user ? user.name : row.userId,
        user ? user.role : '-',
        row.status,
        row.mood,
        dateStr,
      ];
    });
    // --- Tambah summary per user ke PDF ---
    const userSummaries = getUserSummaries(filteredData, users);
    let summaryTable = userSummaries.map(u => [
      u.name,
      u.role,
      u.hadir,
      u.absen,
      Object.keys(u.moodCount).length > 0
        ? Object.entries(u.moodCount).map(([mood, count]) => `${mood}: ${count}x`).join(", ")
        : "-"
    ]);
    doc.autoTable({
      head: [["Name", "Role", "Hadir", "Absen", "Mood Distribution"]],
      body: summaryTable,
      startY: 50,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [52, 152, 219] },
      margin: { left: 10, right: 10 },
      theme: 'grid',
      tableLineColor: [52, 152, 219],
      tableLineWidth: 0.1
    });
    // --- Detail table ---
    // Cari posisi Y terakhir dari summary table
    // @ts-ignore
    const lastY = (doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY ? (doc as any).lastAutoTable.finalY + 10 : 50 + (userSummaries.length * 8) + 20;
    doc.autoTable({
      head: [["No", "Name", "Member", "Status", "Mood", "Date"]],
      body: tableData,
      startY: lastY,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 10, right: 10 },
    });
    doc.save("laporan-wellbeing.pdf");
  };
  // State untuk filter
  const [filterPeriod, setFilterPeriod] = useState<string>("all"); // all, monthly, yearly
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"))
  const [data, setData] = useState<any[]>([])
  const { toast } = useToast()

  // Fetch all checkin data and user data on mount (manager: see all data)
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    async function fetchAll() {
      try {
        // Fetch all checkins (all members, for manager)
        const res = await api.checkins.getAll();
        let checkins: any[] = Array.isArray(res) ? res : (res?.data || []);
        // Fetch all users (all members)
        const userList = await api.user.getAll();
        setUsers(userList);
        setData(checkins);
      } catch (err: any) {
        toast({ title: "Gagal mengambil data", description: err?.message || String(err), variant: "destructive" });
      }
    }
    fetchAll();
  }, []);

  // State untuk hasil filter manual
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Fungsi untuk filter data saat tombol diklik
  const handleFilter = () => {
    setFilteredData(
      data.filter((row) => {
        // Filter period
        const createdAt = row.createdAt ? new Date(row.createdAt) : null;
        if (filterPeriod === "monthly" && createdAt) {
          const m = (createdAt.getMonth() + 1).toString().padStart(2, "0");
          const y = createdAt.getFullYear();
          if (m !== month.padStart(2, "0") || y !== Number(year)) return false;
        }
        if (filterPeriod === "yearly" && createdAt) {
          const y = createdAt.getFullYear();
          if (y !== Number(year)) return false;
        }
        return true;
      })
    );
  };

  // Inisialisasi: tampilkan semua data saat pertama kali
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const userSummaries = getUserSummaries(filteredData, users);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Filter and export team wellbeing or absence reports</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        {/* Filter Period */}
        <div>
          <Label>Filter Period</Label>
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Month & Year input jika period monthly/yearly */}
        {filterPeriod === "monthly" && (
          <div>
            <Label>Month</Label>
            <Input type="number" min={1} max={12} value={month} onChange={e => setMonth(e.target.value.padStart(2, "0"))} className="w-[100px]" />
          </div>
        )}
        {(filterPeriod === "monthly" || filterPeriod === "yearly") && (
          <div>
            <Label>Year</Label>
            <Input type="number" min={2000} max={2100} value={year} onChange={e => setYear(Number(e.target.value))} className="w-[100px]" />
          </div>
        )}
        <Button onClick={handleFilter} variant="secondary" className="h-10">Filter</Button>
        <Button onClick={handleExportPDF} variant="outline" className="h-10 ml-2">
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      {/* Summary Table per User */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Summary per Member</CardTitle>
            <CardDescription>Rekap kehadiran dan distribusi mood tiap member</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="min-w-max text-sm border-collapse w-full">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Role</th>
                  <th className="border px-2 py-1">Hadir</th>
                  <th className="border px-2 py-1">Absen</th>
                  <th className="border px-2 py-1">Mood Distribution</th>
                </tr>
              </thead>
              <tbody>
                {userSummaries.length > 0 ? userSummaries.map((u, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{u.name}</td>
                    <td className="border px-2 py-1">{u.role}</td>
                    <td className="border px-2 py-1">{u.hadir}</td>
                    <td className="border px-2 py-1">{u.absen}</td>
                    <td className="border px-2 py-1">{
                      Object.keys(u.moodCount).length > 0
                        ? Object.entries(u.moodCount).map(([mood, count]) => `${mood}: ${count}x`).join(", ")
                        : "-"
                    }</td>
                  </tr>
                )) : (
                  <tr><td className="border px-2 py-1 text-center" colSpan={5}>No data</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Detail Table */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Preview of the filtered report data</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="min-w-max text-sm border-collapse w-full">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Member</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Mood</th>
                  <th className="border px-2 py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((row, i) => {
                  // Cari user dari userId
                  const user = users.find((u) => u.id === row.userId);
                  // Format tanggal
                  let dateStr = row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';
                  return (
                    <tr key={i}>
                      <td className="border px-2 py-1">{user ? user.name : row.userId}</td>
                      <td className="border px-2 py-1">{user ? user.role : '-'}</td>
                      <td className="border px-2 py-1">{row.status}</td>
                      <td className="border px-2 py-1">{row.mood}</td>
                      <td className="border px-2 py-1">{dateStr}</td>
                    </tr>
                  );
                }) : (
                  <tr><td className="border px-2 py-1 text-center" colSpan={5}>No data</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Missing component imports
const Search = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const MoreHorizontal = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
)
