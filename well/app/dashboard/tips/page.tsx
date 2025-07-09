"use client"

import { useState } from "react"
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Coffee,
  Filter,
  Heart,
  MessageSquare,
  Search,
  ThumbsUp,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

// Sample tips data
const tips = [
  {
    id: 1,
    title: "Regular Team Check-ins",
    description: "Schedule brief daily check-ins to maintain team connection and address any concerns early.",
    category: "team",
    likes: 24,
    isLiked: false,
  },
  {
    id: 2,
    title: "Mindfulness Breaks",
    description:
      "Encourage team members to take short mindfulness breaks throughout the day to reduce stress and improve focus.",
    category: "wellness",
    likes: 42,
    isLiked: true,
  },
  {
    id: 3,
    title: "Workload Distribution",
    description: "Regularly review and adjust workloads to ensure no team member is overwhelmed with tasks.",
    category: "productivity",
    likes: 18,
    isLiked: false,
  },
  {
    id: 4,
    title: "Recognition Program",
    description: "Implement a peer recognition program to boost morale and acknowledge team members' contributions.",
    category: "team",
    likes: 31,
    isLiked: false,
  },
  {
    id: 5,
    title: "Ergonomic Workspace",
    description:
      "Provide guidance on setting up ergonomic workspaces to prevent physical strain during long work hours.",
    category: "wellness",
    likes: 27,
    isLiked: false,
  },
  {
    id: 6,
    title: "Focus Time Blocks",
    description: "Designate specific hours for focused work with minimal interruptions to improve productivity.",
    category: "productivity",
    likes: 35,
    isLiked: true,
  },
  {
    id: 7,
    title: "Team Building Activities",
    description: "Schedule regular virtual or in-person team building activities to strengthen relationships.",
    category: "team",
    likes: 29,
    isLiked: false,
  },
  {
    id: 8,
    title: "Healthy Snack Options",
    description: "Provide healthy snack options in the office or encourage healthy eating habits for remote workers.",
    category: "wellness",
    likes: 22,
    isLiked: false,
  },
  {
    id: 9,
    title: "Project Management Tools",
    description: "Utilize effective project management tools to keep everyone aligned and track progress efficiently.",
    category: "productivity",
    likes: 33,
    isLiked: false,
  },
]

export default function TipsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [likedTips, setLikedTips] = useState<number[]>(tips.filter((tip) => tip.isLiked).map((tip) => tip.id))
  const { toast } = useToast()

  const filteredTips = tips.filter((tip) => {
    const matchesSearch =
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "team") return matchesSearch && tip.category === "team"
    if (activeTab === "wellness") return matchesSearch && tip.category === "wellness"
    if (activeTab === "productivity") return matchesSearch && tip.category === "productivity"
    if (activeTab === "liked") return matchesSearch && likedTips.includes(tip.id)

    return matchesSearch
  })

  const handleLike = (tipId: number) => {
    if (likedTips.includes(tipId)) {
      setLikedTips(likedTips.filter((id) => id !== tipId))
      toast({
        title: "Tip removed from favorites",
        description: "The tip has been removed from your favorites.",
      })
    } else {
      setLikedTips([...likedTips, tipId])
      toast({
        title: "Tip added to favorites",
        description: "The tip has been added to your favorites.",
      })
    }
  }

  // const getCategoryIcon = (category: string) => {
  //   switch (category) {
  //     case "team":
  //       return <Users className="h-4 w-4" />
  //     case "wellness":
  //       return <Heart className="h-4 w-4" />
  //     case "productivity":
  //       return <Calendar className="h-4 w-4" />
  //     default:
  //       return <MessageSquare className="h-4 w-4" />
  //   }
  // }

  // const getCategoryColor = (category: string) => {
  //   switch (category) {
  //     case "team":
  //       return "bg-blue-100 text-blue-800 hover:bg-blue-200"
  //     case "wellness":
  //       return "bg-green-100 text-green-800 hover:bg-green-200"
  //     case "productivity":
  //       return "bg-purple-100 text-purple-800 hover:bg-purple-200"
  //     default:
  //       return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  //   }
  // }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Comfort Tips</h2>
          <p className="text-muted-foreground">Recommendations to improve team wellbeing and productivity</p>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTips.map((tip) => (
              <Card key={tip.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{tip.title}</CardTitle>
                      {/* <Badge
                        variant="secondary"
                        className={`flex w-fit items-center gap-1 ${getCategoryColor(tip.category)}`}
                      >
                        {getCategoryIcon(tip.category)}
                        <span className="capitalize">{tip.category}</span>
                      </Badge> */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{tip.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTips.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No tips found</h3>
              <p className="mt-2 text-sm text-muted-foreground">We couldn&apos;t find any tips matching your search.</p>
              <Button className="mt-4" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
