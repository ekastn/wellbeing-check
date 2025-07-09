"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronDown, Edit, MoreHorizontal, Plus, Search, Trash, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

// Hapus data dummy teams

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [newTeamMembers, setNewTeamMembers] = useState<string[]>([])
  const [newTeamLead, setNewTeamLead] = useState<string>("");
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.teams.getAll(),
      api.user.getAll ? api.user.getAll() : Promise.resolve([])
    ])
      .then(([teamData, userData]) => {
        setTeams(Array.isArray(teamData) ? teamData : [])
        setUsers(Array.isArray(userData) ? userData : [])
      })
      .catch(() => toast({ title: "Failed to load data", variant: "destructive" }))
      .finally(() => setLoading(false))
  }, [])

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({ title: "Team name required", variant: "destructive" })
      return
    }
    if (!newTeamLead) {
      toast({ title: "Team lead required", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const newTeam = await api.teams.create({
        name: newTeamName,
        description: newTeamDescription,
        members: newTeamMembers,
        lead: newTeamLead,
      })
      setTeams((prev) => [...prev, newTeam])
      setNewTeamName("")
      setNewTeamDescription("")
      setNewTeamMembers([])
      setNewTeamLead("")
      toast({ title: "Team created" })
    } catch {
      toast({ title: "Failed to create team", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Delete this team?")) return
    setLoading(true)
    try {
      await api.teams.delete(id)
      setTeams((prev) => prev.filter((t) => (t.id || t._id) !== id))
      toast({ title: "Team deleted" })
    } catch {
      toast({ title: "Failed to delete team", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTeamId, setEditTeamId] = useState<string>("");
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamDescription, setEditTeamDescription] = useState("");
  const [editTeamMembers, setEditTeamMembers] = useState<string[]>([]);
  const [editTeamLead, setEditTeamLead] = useState<string>("");

  const openEditDialog = (team: any) => {
    setEditTeamId(team.id || team._id);
    setEditTeamName(team.name || "");
    setEditTeamDescription(team.description || "");
    setEditTeamMembers(Array.isArray(team.members) ? team.members.map((m: any) => typeof m === 'object' && m !== null ? m._id || m.id : m) : []);
    setEditTeamLead(typeof team.lead === 'object' && team.lead !== null ? team.lead._id || team.lead.id : team.lead || "");
    setIsEditDialogOpen(true);
  };

  const handleEditTeam = async () => {
    if (!editTeamName.trim()) {
      toast({ title: "Team name required", variant: "destructive" });
      return;
    }
    if (!editTeamLead) {
      toast({ title: "Team lead required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.teams.update(editTeamId, {
        name: editTeamName,
        description: editTeamDescription,
        members: editTeamMembers,
        lead: editTeamLead,
      });
      setTeams((prev) => prev.map((t) => (t.id === editTeamId || t._id === editTeamId ? {
        ...t,
        name: editTeamName,
        description: editTeamDescription,
        members: editTeamMembers,
        lead: editTeamLead,
      } : t)));
      setIsEditDialogOpen(false);
      toast({ title: "Team updated" });
    } catch {
      toast({ title: "Failed to update team", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground">Manage your teams and team members</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Assign this team to a project and add members</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="e.g. UI/UX Team"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team-description">Team Description</Label>
                <textarea
                  id="team-description"
                  placeholder="Brief explanation about the team's focus or role (optional)"
                  className="border rounded px-3 py-2 min-h-[60px]"
                  value={newTeamDescription}
                  onChange={e => setNewTeamDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team-members">Select Team Members</Label>
                <div id="team-members" className="flex flex-col gap-2 max-h-40 overflow-y-auto border rounded p-2">
                  {users.filter((user: any) => user.role === 'member').map((user: any) => (
                    <label key={user.id || user._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={user.id || user._id}
                        checked={newTeamMembers.includes(user.id || user._id)}
                        onChange={e => {
                          const value = user.id || user._id;
                          setNewTeamMembers(prev =>
                            e.target.checked
                              ? [...prev, value]
                              : prev.filter(id => id !== value)
                          );
                        }}
                      />
                      <span>{user.name} ({user.email})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team-lead">Team Lead</Label>
                <select
                  id="team-lead"
                  className="border rounded px-3 py-2"
                  value={newTeamLead}
                  onChange={e => setNewTeamLead(e.target.value)}
                >
                  <option value="">Select team lead</option>
                  {users.filter((user: any) => user.role === 'member').map((user: any) => (
                    <option key={user.id || user._id} value={user.id || user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teams..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Filter
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>All Teams</DropdownMenuItem>
            <DropdownMenuItem>My Teams</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sort by Name</DropdownMenuItem>
            <DropdownMenuItem>Sort by Members</DropdownMenuItem>
            <DropdownMenuItem>Sort by Projects</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => {
          const leadId = typeof team.lead === 'object' && team.lead !== null ? team.lead._id || team.lead.id : team.lead;
          const leadUser = users.find((u: any) => (u.id || u._id) === leadId);
          return (
            <Card key={team.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>{team.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(team)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteTeam(team.id || team._id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {Array.isArray(team.members) && team.members.length > 0 && team.members.slice(0, 4).map((memberId: any, i: number) => {
                      let memberKey: string = "";
                      if (typeof memberId === 'object' && memberId !== null) {
                        memberKey = (memberId as any)._id || (memberId as any).id || "";
                      } else if (typeof memberId === 'string') {
                        memberKey = memberId;
                      }
                      const member = users.find((u: any) => (u.id || u._id) === memberKey);
                      return (
                        <Avatar key={i} className="border-2 border-background">
                          <AvatarImage src={member?.avatar || "/placeholder.svg?height=32&width=32"} alt={member?.name || `Team member ${i + 1}`} />
                          <AvatarFallback>{member?.name?.[0] || 'TM'}</AvatarFallback>
                        </Avatar>
                      );
                    })}
                    {Array.isArray(team.members) && team.members.length > 4 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                        +{team.members.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{Array.isArray(team.members) ? team.members.length : 0} members</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Team Lead</span>
                    <span className="font-medium">{leadUser ? `${leadUser.name} (${leadUser.email})` : '-'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/teams/${team.id}`}>View Team</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No teams found</h3>
          <p className="mt-2 text-sm text-muted-foreground">We couldn&apos;t find any teams matching your search.</p>
          <Button className="mt-4" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update team details and members</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-team-name">Team Name</Label>
              <Input
                id="edit-team-name"
                value={editTeamName}
                onChange={e => setEditTeamName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-team-description">Team Description</Label>
              <textarea
                id="edit-team-description"
                className="border rounded px-3 py-2 min-h-[60px]"
                value={editTeamDescription}
                onChange={e => setEditTeamDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-team-members">Select Team Members</Label>
              <div id="edit-team-members" className="flex flex-col gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {users.filter((user: any) => user.role === 'member').map((user: any) => (
                  <label key={user.id || user._id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={user.id || user._id}
                      checked={editTeamMembers.includes(user.id || user._id)}
                      onChange={e => {
                        const value = user.id || user._id;
                        setEditTeamMembers(prev =>
                          e.target.checked
                            ? [...prev, value]
                            : prev.filter(id => id !== value)
                        );
                      }}
                    />
                    <span>{user.name} ({user.email})</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-team-lead">Team Lead</Label>
              <select
                id="edit-team-lead"
                className="border rounded px-3 py-2"
                value={editTeamLead}
                onChange={e => setEditTeamLead(e.target.value)}
              >
                <option value="">Select team lead</option>
                {users.filter((user: any) => user.role === 'member').map((user: any) => (
                  <option key={user.id || user._id} value={user.id || user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTeam}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
