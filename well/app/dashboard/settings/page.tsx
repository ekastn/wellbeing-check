"use client"

import { useState } from "react"
import { Bell, Check, Globe, Lock, Mail, Moon, Save, Sun, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth();

  const handleSave = () => {
    setIsSaving(true)

    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Update your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">Name</Label>
                  <Input id="first-name" value={user?.name ?? ""} readOnly />
                </div>
                {/* Jika ingin split first/last name, perlu field di backend */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email ?? ""} readOnly />
              </div>
              {/* Job title, department, bio: jika belum ada di database, bisa dikosongkan atau hidden */}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language" className="w-full sm:w-[240px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc-8">
                  <SelectTrigger id="timezone" className="w-full sm:w-[240px]">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-12">UTC-12:00</SelectItem>
                    <SelectItem value="utc-11">UTC-11:00</SelectItem>
                    <SelectItem value="utc-10">UTC-10:00</SelectItem>
                    <SelectItem value="utc-9">UTC-09:00</SelectItem>
                    <SelectItem value="utc-8">UTC-08:00 (Pacific Time)</SelectItem>
                    <SelectItem value="utc-7">UTC-07:00 (Mountain Time)</SelectItem>
                    <SelectItem value="utc-6">UTC-06:00 (Central Time)</SelectItem>
                    <SelectItem value="utc-5">UTC-05:00 (Eastern Time)</SelectItem>
                    <SelectItem value="utc-4">UTC-04:00</SelectItem>
                    <SelectItem value="utc-3">UTC-03:00</SelectItem>
                    <SelectItem value="utc-2">UTC-02:00</SelectItem>
                    <SelectItem value="utc-1">UTC-01:00</SelectItem>
                    <SelectItem value="utc">UTC±00:00</SelectItem>
                    <SelectItem value="utc+1">UTC+01:00</SelectItem>
                    <SelectItem value="utc+2">UTC+02:00</SelectItem>
                    <SelectItem value="utc+3">UTC+03:00</SelectItem>
                    <SelectItem value="utc+4">UTC+04:00</SelectItem>
                    <SelectItem value="utc+5">UTC+05:00</SelectItem>
                    <SelectItem value="utc+5.5">UTC+05:30</SelectItem>
                    <SelectItem value="utc+6">UTC+06:00</SelectItem>
                    <SelectItem value="utc+7">UTC+07:00</SelectItem>
                    <SelectItem value="utc+8">UTC+08:00</SelectItem>
                    <SelectItem value="utc+9">UTC+09:00</SelectItem>
                    <SelectItem value="utc+9.5">UTC+09:30</SelectItem>
                    <SelectItem value="utc+10">UTC+10:00</SelectItem>
                    <SelectItem value="utc+11">UTC+11:00</SelectItem>
                    <SelectItem value="utc+12">UTC+12:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="mm-dd-yyyy">
                  <SelectTrigger id="date-format" className="w-full sm:w-[240px]">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY/MM/DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-checkin">Automatic Check-in Reminders</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive reminders for daily check-ins and check-outs
                  </div>
                </div>
                <Switch id="auto-checkin" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-summary">Weekly Mood Summary</Label>
                  <div className="text-sm text-muted-foreground">Receive a weekly summary of your mood data</div>
                </div>
                <Switch id="weekly-summary" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">In-App Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications within the application
                        </div>
                      </div>
                    </div>
                    <Switch id="in-app" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                      </div>
                    </div>
                    <Switch id="email" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Browser Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive notifications in your browser</div>
                      </div>
                    </div>
                    <Switch id="browser" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Types</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">Check-in Reminders</div>
                      <div className="text-sm text-muted-foreground">Daily reminders for morning check-ins</div>
                    </div>
                    <Switch id="checkin-reminder" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">Check-out Reminders</div>
                      <div className="text-sm text-muted-foreground">Daily reminders for afternoon check-outs</div>
                    </div>
                    <Switch id="checkout-reminder" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">Team Updates</div>
                      <div className="text-sm text-muted-foreground">Notifications about team changes and updates</div>
                    </div>
                    <Switch id="team-updates" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">Mood Summaries</div>
                      <div className="text-sm text-muted-foreground">Weekly summaries of team mood data</div>
                    </div>
                    <Switch id="mood-summaries" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">Wellbeing Tips</div>
                      <div className="text-sm text-muted-foreground">
                        Notifications with wellbeing tips and recommendations
                      </div>
                    </div>
                    <Switch id="wellbeing-tips" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup defaultValue="system" className="grid grid-cols-3 gap-4">
                  <div>
                    <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                    <Label
                      htmlFor="theme-light"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Sun className="mb-3 h-6 w-6" />
                      Light
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                    <Label
                      htmlFor="theme-dark"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Moon className="mb-3 h-6 w-6" />
                      Dark
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                    <Label
                      htmlFor="theme-system"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="mb-3 flex h-6 w-6 items-center justify-center rounded-full border-2">
                        <div className="h-2.5 w-5 rounded-full bg-foreground" />
                      </div>
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Sidebar Position</Label>
                <RadioGroup defaultValue="left" className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="left" id="sidebar-left" className="peer sr-only" />
                    <Label
                      htmlFor="sidebar-left"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="mb-3 flex h-6 w-6 items-center justify-center">
                        <div className="h-5 w-1 rounded-r-sm bg-foreground" />
                        <div className="h-5 w-4 rounded-r-sm bg-muted" />
                      </div>
                      Left
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="right" id="sidebar-right" className="peer sr-only" />
                    <Label
                      htmlFor="sidebar-right"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="mb-3 flex h-6 w-6 items-center justify-center">
                        <div className="h-5 w-4 rounded-l-sm bg-muted" />
                        <div className="h-5 w-1 rounded-l-sm bg-foreground" />
                      </div>
                      Right
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Density</Label>
                <RadioGroup defaultValue="default" className="grid grid-cols-3 gap-4">
                  <div>
                    <RadioGroupItem value="compact" id="density-compact" className="peer sr-only" />
                    <Label
                      htmlFor="density-compact"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="mb-3 space-y-1">
                        <div className="h-1 w-6 rounded-full bg-foreground" />
                        <div className="h-1 w-6 rounded-full bg-foreground" />
                        <div className="h-1 w-6 rounded-full bg-foreground" />
                      </div>
                      Compact
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="default" id="density-default" className="peer sr-only" />
                    <Label
                      htmlFor="density-default"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="mb-3 space-y-2">
                        <div className="h-1 w-6 rounded-full bg-foreground" />
                        <div className="h-1 w-6 rounded-full bg-foreground" />
                        <div className="h-1 w-6 rounded-full bg-foreground" />
                      </div>
                      Default
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="comfortable" id="density-comfortable" className="peer sr-only" />
                    <Label
                      htmlFor="density-comfortable"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="mb-3 space-y-2.5">
                        <div className="h-1 w-6 rounded-full bg-foreground" />
                        <div className="h-1 w-6 rounded-full bg-foreground" />
                        <div className="h-1 w-6 rounded-full bg-foreground" />
                      </div>
                      Comfortable
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="animations">Interface Animations</Label>
                  <div className="text-sm text-muted-foreground">Enable animations throughout the interface</div>
                </div>
                <Switch id="animations" defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <div className="text-sm text-muted-foreground">Minimize animations for accessibility</div>
                </div>
                <Switch id="reduced-motion" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Password Requirements</h3>
                    <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        <span>Minimum 8 characters</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        <span>At least one uppercase letter</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        <span>At least one number</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        <span>At least one special character</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">Add an extra layer of security to your account</div>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Privacy Settings</h3>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="font-medium">Profile Visibility</div>
                    <div className="text-sm text-muted-foreground">Control who can see your profile information</div>
                  </div>
                  <Select defaultValue="team">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="team">Team Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="font-medium">Mood Data Sharing</div>
                    <div className="text-sm text-muted-foreground">
                      Control how your mood data is shared with the team
                    </div>
                  </div>
                  <Select defaultValue="anonymous">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select sharing option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Details</SelectItem>
                      <SelectItem value="anonymous">Anonymous</SelectItem>
                      <SelectItem value="none">Do Not Share</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-collection">Data Collection</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow anonymous data collection for service improvement
                    </div>
                  </div>
                  <Switch id="data-collection" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-destructive/10 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <User className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-medium text-destructive">Deactivate Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable your account. You can reactivate it later.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" className="text-destructive">
                    Deactivate Account
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-destructive/10 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <User className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-medium text-destructive">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
