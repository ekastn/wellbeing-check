"use client"
// Allow custom debug property on window
declare global {
  interface Window {
    __WELL_PROJECTS_RAW?: any;
  }
}

import Link from "next/link"
import { ArrowUpRight, BarChart3, CheckCircle, Clock, Frown, Meh, Smile, Users } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { api, UserProfile } from "@/lib/api"

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<UserProfile[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [checkins, setCheckins] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      api.user.getProfile(),
      api.user.getAll(),
      api.projects.getAll(),
      api.checkins.getAll() // Ambil semua data checkin user untuk grafik
    ])
      .then(([profile, users, projects, checkins]) => {
        setUser(profile)
        setMembers(users)
        setProjects(projects)
        // Debug: log raw projects data to UI and console
        if (typeof window !== 'undefined') {
          window.__WELL_PROJECTS_RAW = projects;
          console.log('RAW PROJECTS DATA:', projects);
        }
        // Jika response checkins berupa object dengan field data, ambil checkins.data
        setCheckins(Array.isArray(checkins) ? checkins : (checkins?.data ?? []))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])


  if (loading) return <div>Loading dashboard...</div>

  // Role-based dashboard logic
  const isAdmin = user?.role === "admin" || user?.role === "project_manager"
  const roleLabel = isAdmin ? (user?.role === "admin" ? "Admin" : "Project Manager") : "Team Member"

  // Check-in & checkout logic for member
  let checkinWarning: string | null = null;
  let userTodayCheckin: any = null;
  if (user && !isAdmin) {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Cari checkin hari ini
    userTodayCheckin = Array.isArray(checkins)
      ? checkins.find((c: any) => {
          if (c.userId !== user.id) return false;
          if (!c.createdAt) return false;
          const checkinDate = new Date(c.createdAt);
          checkinDate.setHours(0, 0, 0, 0);
          return checkinDate.getTime() === today.getTime();
        })
      : null;

    if (!userTodayCheckin) {
      // Belum checkin hari ini
      if (now.getHours() >= 9) {
        checkinWarning = "Anda belum check-in sebelum jam 9 pagi!";
      } else {
        checkinWarning = "Reminder: Anda belum check-in hari ini. Silakan check-in sebelum jam 9 pagi.";
      }
    } else {
      // Sudah checkin, cek checkout
      if (!userTodayCheckin.checkoutAt) {
        const checkinTime = new Date(userTodayCheckin.createdAt);
        const diffMs = now.getTime() - checkinTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours > 9) {
          checkinWarning = "Anda belum checkout, sudah lebih dari 9 jam sejak check-in!";
        }
      }
    }
  }

  // ...existing code...

  // Calculate stats
  const teamMemberCount = Array.isArray(members) ? members.length : 0
  const activeProjectCount = Array.isArray(projects) ? projects.length : 0
  const recentCheckins = Array.isArray(checkins) ? checkins.slice(0, 5) : []
  // Example: calculate check-in rate (dummy logic, adjust as needed)
  const checkinRate = teamMemberCount && Array.isArray(checkins) ? Math.round((checkins.length / (teamMemberCount * 30)) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Reminder & warning for checkin/checkout, now also for admin/project_manager */}
      {checkinWarning && (
        <div className="rounded-md bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 mb-2">
          <span className="font-semibold">{checkinWarning}</span>{!userTodayCheckin && (
            <span> <Link href="/dashboard/checkin" className="underline font-medium">Check in sekarang</Link>.</span>
          )}
        </div>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard <span className="ml-2 text-base font-normal text-muted-foreground">({roleLabel})</span></h2>
          <p className="text-muted-foreground">
            {user ? (
              <>Welcome back, {user.name}! {isAdmin ? "Here’s an overview of your team’s wellbeing." : "Here’s your personal wellbeing overview."}</>
            ) : (
              <>Welcome back! Here&apos;s an overview of your team&apos;s wellbeing.</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/checkin">
              Daily Check-in
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {isAdmin ? (
            <div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamMemberCount}</div>
                    <p className="text-xs text-muted-foreground">Total members</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{checkinRate}%</div>
                    <p className="text-xs text-muted-foreground">(est. this month)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
                    <Smile className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">(coming soon)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeProjectCount}</div>
                    <p className="text-xs text-muted-foreground">Total projects</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Check-ins</CardTitle>
                    <CardDescription>Latest team member check-ins</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentCheckins.map((c, i) => (
                        <div key={c.id || i} className="flex items-center gap-4 rounded-lg border p-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Smile className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{members.find(m => m.id === c.userId)?.name || 'Member'}</p>
                            <p className="text-xs text-muted-foreground">{c.mood || '-'}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">{c.createdAt ? new Date(c.createdAt).toLocaleTimeString() : ''}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/checkin">View all check-ins</Link>
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Team Comfort Tips</CardTitle>
                    <CardDescription>Recommended wellbeing tips for your team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-3">
                        <h3 className="font-medium">Take regular breaks</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Encourage team members to take short breaks every hour to reduce eye strain and mental fatigue.
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <h3 className="font-medium">Team check-in meeting</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Schedule a 15-minute team check-in to discuss progress and address any blockers.
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <h3 className="font-medium">Mindfulness session</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Consider a short guided meditation session to help reduce team stress levels.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/tips">View all tips</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Your Mood History</CardTitle>
                  <CardDescription>Track your mood over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center bg-muted/30 rounded-md">
                  {/* Grafik mood history user */}
                  {user && Array.isArray(checkins) ? (() => {
                    // Mapping mood ke angka
                    const moodToValue = (mood: string) => {
                      if (mood?.toLowerCase() === 'happy') return 2;
                      if (mood?.toLowerCase() === 'neutral') return 1;
                      if (mood?.toLowerCase() === 'stressed') return 0;
                      return null;
                    };
                    // Ambil 14 hari terakhir (berdasarkan tanggal unik, 1 data per hari)
                    let moodHistory: any[] = [];
                    const byDate: Record<string, any> = {};
                    checkins
                      .filter((c: any) => c.userId === user.id && c.mood && c.createdAt)
                      .forEach((c: any) => {
                        const d = new Date(c.createdAt);
                        const key = d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
                        if (!byDate[key] || new Date(c.createdAt) > new Date(byDate[key].createdAt)) {
                          byDate[key] = c;
                        }
                      });
                    moodHistory = Object.values(byDate)
                      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .slice(-14)
                      .map((c: any) => ({
                        date: new Date(c.createdAt).toLocaleDateString(),
                        mood: moodToValue(c.mood),
                        moodLabel: c.mood,
                      }));
                    return moodHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={moodHistory} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} />
                          <YAxis
                            domain={[0, 2]}
                            ticks={[0, 1, 2]}
                            tickFormatter={v => (v === 2 ? 'Happy' : v === 1 ? 'Neutral' : 'Stressed')}
                            fontSize={12}
                          />
                          <Tooltip formatter={(v: number) => (v === 2 ? 'Happy' : v === 1 ? 'Neutral' : 'Stressed')} labelFormatter={l => `Tanggal: ${l}`}/>
                          <Line type="monotone" dataKey="mood" stroke="#8884d8" dot />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-muted-foreground">Belum ada data mood.</div>
                    );
                  })() : <div className="text-muted-foreground">Loading...</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Today's Mood</CardTitle>
                  <CardDescription>Mood check-in Anda hari ini</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[120px]">
                    {userTodayCheckin && userTodayCheckin.mood ? (
                      <>
                        {userTodayCheckin.mood === 'Happy' && <Smile className="h-8 w-8 text-green-500 mb-2" />}
                        {userTodayCheckin.mood === 'Neutral' && <Meh className="h-8 w-8 text-yellow-500 mb-2" />}
                        {userTodayCheckin.mood === 'Stressed' && <Frown className="h-8 w-8 text-red-500 mb-2" />}
                        <span className="text-lg font-semibold">{userTodayCheckin.mood}</span>
                        <span className="text-xs text-muted-foreground mt-1">{userTodayCheckin.createdAt ? new Date(userTodayCheckin.createdAt).toLocaleTimeString() : ''}</span>
                      </>
                    ) : (
                      <span className="italic text-muted-foreground">Belum check-in hari ini.</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription>Projects you are a member of</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {user && Array.isArray(projects) ? (() => {
                        if (isAdmin) return null;
                        // Tampilkan semua project yang user terlibat (baik di teams maupun di members)
                        const involvedProjects: any[] = [];
                        projects.forEach((p: any) => {
                          let found = false;
                          // Cek di teams
                          if (Array.isArray(p.teams)) {
                            p.teams.forEach((t: any) => {
                              if (Array.isArray(t.members)) {
                                t.members.forEach((m: any) => {
                                  const memberId = (typeof m === 'object' && m !== null && m.id !== undefined) ? m.id : m;
                                  const userIdStr = user.id?.toString();
                                  const memberIdStr = memberId?.toString();
                                  if (memberIdStr === userIdStr) {
                                    found = true;
                                  }
                                });
                              }
                            });
                          }
                          // Cek di members langsung (jika ada field members di project)
                          if (Array.isArray(p.members)) {
                            p.members.forEach((m: any) => {
                              const memberId = (typeof m === 'object' && m !== null && m.id !== undefined) ? m.id : m;
                              const userIdStr = user.id?.toString();
                              const memberIdStr = memberId?.toString();
                              if (memberIdStr === userIdStr) {
                                found = true;
                              }
                            });
                          }
                          if (found) involvedProjects.push(p);
                        });
                        return involvedProjects.length === 0 ? (
                          <div className="italic">You are not assigned to any project.</div>
                        ) : (
                          <>
                            {/* <div className="font-semibold text-base mb-2">Projects</div> */}
                            <ul className="list-disc ml-5">
                              {involvedProjects.map((project: any, i) => (
                                <li key={i} className="mb-1">{project.name}</li>
                              ))}
                            </ul>
                          </>
                        );
                      })() : <div className="italic">Loading...</div>}
                    </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
