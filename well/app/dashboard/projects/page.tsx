"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  Users,
  Calendar,
} from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [newProjectStartDate, setNewProjectStartDate] = useState("")
  const [newProjectEndDate, setNewProjectEndDate] = useState("")
  const [newProjectTeams, setNewProjectTeams] = useState<string[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.projects.getAll(),
      api.teams.getAll()
    ])
      .then(([projectData, teamData]) => {
        setProjects(Array.isArray(projectData) ? projectData : [])
        setTeams(Array.isArray(teamData) ? teamData : [])
      })
      .catch(() => {
        setProjects([])
        setTeams([])
        toast({ title: "Failed to load projects or teams", variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredProjects = (projects || []).filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.teamName || project.team || "").toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && project.status === "in-progress"
    if (activeTab === "completed") return matchesSearch && project.status === "completed"

    return matchesSearch
  })

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for the project.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      const newProject = await api.projects.create({
        name: newProjectName,
        description: newProjectDescription,
        startDate: newProjectStartDate,
        endDate: newProjectEndDate,
        teams: newProjectTeams,
      })
      setProjects((prev) => [...prev, newProject])
      toast({
        title: "Project created",
        description: `${newProjectName} has been created successfully.`,
      })
      setNewProjectName("")
      setNewProjectDescription("")
      setNewProjectStartDate("")
      setNewProjectEndDate("")
      setNewProjectTeams([])
      setIsCreateDialogOpen(false)
    } catch (e) {
      toast({ title: "Failed to create project", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string>("");
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [editProjectStartDate, setEditProjectStartDate] = useState("");
  const [editProjectEndDate, setEditProjectEndDate] = useState("");
  const [editProjectTeams, setEditProjectTeams] = useState<string[]>([]);

  const openEditDialog = (project: any) => {
    setEditProjectId(project.id || project._id);
    setEditProjectName(project.name || "");
    setEditProjectDescription(project.description || "");
    setEditProjectStartDate(project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : "");
    setEditProjectEndDate(project.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : "");
    setEditProjectTeams(Array.isArray(project.teams) ? project.teams.map((t: any) => typeof t === 'object' && t !== null ? t._id || t.id : t) : []);
    setIsEditDialogOpen(true);
  };

  const handleEditProject = async () => {
    if (!editProjectName.trim()) {
      toast({ title: "Project name required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.projects.update(editProjectId, {
        name: editProjectName,
        description: editProjectDescription,
        startDate: editProjectStartDate,
        endDate: editProjectEndDate,
        teams: editProjectTeams,
      });
      setProjects((prev) => prev.map((p) => (p.id === editProjectId || p._id === editProjectId ? {
        ...p,
        name: editProjectName,
        description: editProjectDescription,
        startDate: editProjectStartDate,
        endDate: editProjectEndDate,
        teams: editProjectTeams,
      } : p)));
      setIsEditDialogOpen(false);
      toast({ title: "Project updated" });
    } catch {
      toast({ title: "Failed to update project", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    setLoading(true);
    try {
      await api.projects.delete(id);
      setProjects((prev) => prev.filter((p) => (p.id || p._id) !== id));
      toast({ title: "Project deleted" });
    } catch {
      toast({ title: "Failed to delete project", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage your team projects and track progress</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project for your team</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="e.g. Website Redesign"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-description">Description</Label>
                <textarea
                  id="project-description"
                  placeholder="Brief description of the project"
                  className="border rounded px-3 py-2 min-h-[60px]"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-start-date">Start Date</Label>
                <Input id="project-start-date" type="date" value={newProjectStartDate} onChange={e => setNewProjectStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-end-date">End Date</Label>
                <Input id="project-end-date" type="date" value={newProjectEndDate} onChange={e => setNewProjectEndDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-teams">Assign Teams</Label>
                <div id="project-teams" className="flex flex-col gap-2 max-h-40 overflow-y-auto border rounded p-2">
                  {teams.map((team: any) => (
                    <label key={team.id || team._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={team.id || team._id}
                        checked={newProjectTeams.includes(team.id || team._id)}
                        onChange={e => {
                          const value = team.id || team._id;
                          setNewProjectTeams(prev =>
                            e.target.checked
                              ? [...prev, value]
                              : prev.filter(id => id !== value)
                          );
                        }}
                      />
                      <span>{team.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Sort
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                <DropdownMenuItem>Due Date (Earliest)</DropdownMenuItem>
                <DropdownMenuItem>Due Date (Latest)</DropdownMenuItem>
                <DropdownMenuItem>Progress (Highest)</DropdownMenuItem>
                <DropdownMenuItem>Progress (Lowest)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const assignedTeams = Array.isArray(project.teams) ? project.teams : [];
              return (
                <Card key={project.id}>
                  <CardHeader className="pb-3">
                    <div className="space-y-1">
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Start Date</span>
                        <span className="font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">End Date</span>
                        <span className="font-medium">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</span>
                      </div>
                      <div className="flex flex-col col-span-2">
                        <span className="text-muted-foreground">Assigned Teams</span>
                        <span className="font-medium">
                          {assignedTeams.length === 0 ? '-' : assignedTeams.map((teamId: any, idx: number) => {
                            let teamKey: string = "";
                            if (typeof teamId === 'object' && teamId !== null) {
                              teamKey = (teamId as any)._id || (teamId as any).id || "";
                            } else if (typeof teamId === 'string') {
                              teamKey = teamId;
                            }
                            const team = teams.find((t: any) => (t.id || t._id) === teamKey);
                            return team ? (
                              <span key={teamKey}>
                                {team.name}{idx < assignedTeams.length - 1 ? ', ' : ''}
                              </span>
                            ) : null;
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>View Project</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(project)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProject(project.id || project._id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We couldn&apos;t find any projects matching your search.
              </p>
              <Button className="mt-4" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-3">
                  <div className="space-y-1">
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">End Date</span>
                      <span className="font-medium">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>View Project</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-3">
                  <div className="space-y-1">
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">End Date</span>
                      <span className="font-medium">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>View Project</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details and assigned teams</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-project-name">Project Name</Label>
              <Input
                id="edit-project-name"
                value={editProjectName}
                onChange={e => setEditProjectName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project-description">Description</Label>
              <textarea
                id="edit-project-description"
                className="border rounded px-3 py-2 min-h-[60px]"
                value={editProjectDescription}
                onChange={e => setEditProjectDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project-start-date">Start Date</Label>
              <Input id="edit-project-start-date" type="date" value={editProjectStartDate} onChange={e => setEditProjectStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project-end-date">End Date</Label>
              <Input id="edit-project-end-date" type="date" value={editProjectEndDate} onChange={e => setEditProjectEndDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project-teams">Assign Teams</Label>
              <div id="edit-project-teams" className="flex flex-col gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {teams.map((team: any) => (
                  <label key={team.id || team._id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={team.id || team._id}
                      checked={editProjectTeams.includes(team.id || team._id)}
                      onChange={e => {
                        const value = team.id || team._id;
                        setEditProjectTeams(prev =>
                          e.target.checked
                            ? [...prev, value]
                            : prev.filter(id => id !== value)
                        );
                      }}
                    />
                    <span>{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
