"use client"

import { useEffect, useRef, useState } from "react"
import * as faceapi from "face-api.js"
import { Camera, Check, Clock, Frown, Meh, Smile, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function CheckInPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [faceResult, setFaceResult] = useState<{
    gender?: string
    age?: number
    expression?: string
  } | null>(null)
  const [todayCheckins, setTodayCheckins] = useState<any[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { toast } = useToast()

  // State untuk kontrol tab dan waktu disable
  const [activeTab, setActiveTab] = useState<string>("checkin");
  const [checkinDisabledUntil, setCheckinDisabledUntil] = useState<Date | null>(null);
  const [checkoutEnabled, setCheckoutEnabled] = useState(false);

  useEffect(() => {
    // Load all required face-api models
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        faceapi.nets.ageGenderNet.loadFromUri("/models"),
      ])
    }
    loadModels()
  }, [])

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString())
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isLoading && user) {
      const fetchToday = async () => {
        setLoadingToday(true);
        try {
          const data = await api.checkins.getToday();
          setTodayCheckins(data || []);
          // Cek apakah sudah checkin hari ini
          const checkin = (data || []).find((c: any) => c.type === "checkin");
          if (checkin) {
            // Set waktu disable checkin selama 8 jam dari waktu checkin
            const checkinTime = new Date(checkin.createdAt);
            const disableUntil = new Date(checkinTime.getTime() + 8 * 60 * 60 * 1000);
            setCheckinDisabledUntil(disableUntil);
            // Jika sudah lewat 8 jam, enable checkout
            setCheckoutEnabled(new Date() >= disableUntil);
            // Jika sudah checkin, langsung pindah ke tab checkout
            setActiveTab("checkout");
          } else {
            setCheckinDisabledUntil(null);
            setCheckoutEnabled(false);
            setActiveTab("checkin");
          }
        } catch (e) {
          setTodayCheckins([]);
          setCheckinDisabledUntil(null);
          setCheckoutEnabled(false);
        } finally {
          setLoadingToday(false);
        }
      };
      fetchToday();
    }
  }, [user, isLoading]);

  const openCamera = async () => {
    setIsCameraOpen(true)
    if (navigator.mediaDevices && videoRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
      videoRef.current.play()
    }
  }

  const handleCaptureSelfie = async () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      // Deteksi wajah dengan landmark dan ekspresi
      const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
      if (detections.length > 0) {
        setSelfiePreview(canvas.toDataURL("image/png"))
        setIsCameraOpen(false)
        const info = detections[0]
        let mainExpression = "-"
        if (info.expressions) {
          const keys = Object.keys(info.expressions) as (keyof typeof info.expressions)[]
          mainExpression = keys.reduce((a, b) =>
            info.expressions[a] > info.expressions[b] ? a : b
          )
        }
        setFaceResult({
          gender: info.gender,
          age: info.age,
          expression: mainExpression,
        })
        toast({
          title: "Selfie captured",
          description: `Wajah terdeteksi. Gender: ${info.gender}, Umur: ${info.age ? info.age.toFixed(0) : '-'}, Ekspresi utama: ${mainExpression}`,
        })
      } else {
        setFaceResult(null)
        toast({
          title: "Wajah tidak terdeteksi",
          description: "Pastikan wajah Anda terlihat jelas di kamera.",
          variant: "destructive",
        })
      }
    }
  }

  const handleSubmit = async (type: "checkin" | "checkout") => {
    if (type === "checkout" && !selectedMood) {
      toast({
        title: "Mood selection required",
        description: "Please select your current mood before submitting.",
        variant: "destructive",
      })
      return
    }

    if (!selfiePreview) {
      toast({
        title: "Selfie required",
        description: "Please take a selfie before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Optionally upload selfie to backend and get URL, or just send base64
      // If backend expects URL, use: const selfieUrl = await api.uploadImage(selfiePreview)
      const payload = {
        type,
        mood: type === "checkin" ? (faceResult?.expression || "unknown") : (selectedMood || "unknown"),
        description,
        selfieImage: selfiePreview, // base64 string
        faceData: faceResult || undefined,
      }
      await api.checkins.create(payload)
      setIsSubmitting(false)
      toast({
        title: type === "checkin" ? "Check-in successful" : "Check-out successful",
        description:
          type === "checkin"
            ? "Your morning check-in has been recorded."
            : "Your afternoon check-out has been recorded.",
      })
      // Reset form
      setSelectedMood(null)
      setDescription("")
      setSelfiePreview(null)
      setFaceResult(null)
      if (type === "checkin") {
        // Setelah checkin, redirect ke dashboard
        router.push("/dashboard");
      }
    } catch (error: any) {
      setIsSubmitting(false)
      toast({
        title: "Submission failed",
        description: error?.message || "Failed to submit check-in/out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const hasCheckedIn = todayCheckins.some((c) => c.type === "checkin");
  const hasCheckedOut = todayCheckins.some((c) => c.type === "checkout");

  const now = new Date();
  const isCheckinDisabled = (checkinDisabledUntil && now < checkinDisabledUntil) || hasCheckedIn;
  const isCheckoutTabEnabled = checkoutEnabled && hasCheckedIn && !hasCheckedOut;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daily Check-in/out</h2>
        <p className="text-muted-foreground">Record your daily mood and wellbeing status</p>
      </div>

      {isCameraOpen && (
        <div className="flex flex-col items-center gap-2 mb-4">
          <video ref={videoRef} width={320} height={240} autoPlay muted className="rounded-lg border" />
          <Button onClick={handleCaptureSelfie} className="mt-2">
            Capture
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checkin" disabled={isCheckinDisabled}>Morning Check-in</TabsTrigger>
          <TabsTrigger value="checkout" disabled={!isCheckoutTabEnabled}>Afternoon Check-out</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin">
          <Card>
            <CardHeader>
              <CardTitle>Morning Check-in</CardTitle>
              <CardDescription>
                How are you feeling this morning? This helps us understand your wellbeing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Current Time</h3>
                <div className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  {currentTime}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Take a selfie</h3>
                <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-6">
                  {selfiePreview ? (
                    <div className="relative w-full flex flex-col items-center">
                      <img
                        src={selfiePreview || "/placeholder.svg"}
                        alt="Selfie preview"
                        className="h-48 w-48 rounded-lg object-cover"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => { setSelfiePreview(null); setFaceResult(null); }}
                      >
                        Retake
                      </Button>
                      {faceResult && (
                        <div className="mt-4 p-3 rounded-lg border bg-muted text-sm w-full max-w-xs">
                          <div><b>Gender:</b> {faceResult.gender ?? '-'}</div>
                          <div><b>Umur:</b> {faceResult.age ? faceResult.age.toFixed(0) : '-'}</div>
                          <div><b>Ekspresi utama:</b> {faceResult.expression ?? '-'}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                        <Camera className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Take a selfie to record your current state</p>
                      </div>
                      <div className="flex gap-4">
                        <Button onClick={openCamera}>
                          <Camera className="mr-2 h-4 w-4" />
                          Take Selfie
                        </Button>
                        <Button variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">How are you feeling about today?</h3>
                <Textarea
                  placeholder="Share your thoughts about the day ahead..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSubmit("checkin")}
                disabled={isSubmitting || hasCheckedIn}>
                {hasCheckedIn ? (
                  "Sudah check-in hari ini"
                ) : isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Complete Check-in
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="checkout">
          <Card>
            <CardHeader>
              <CardTitle>Afternoon Check-out</CardTitle>
              <CardDescription>How was your day? Let us know how you're feeling as you finish work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Current Time</h3>
                <div className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  {currentTime}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Take a selfie</h3>
                <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-6">
                  {selfiePreview ? (
                    <div className="relative w-full flex flex-col items-center">
                      <img
                        src={selfiePreview || "/placeholder.svg"}
                        alt="Selfie preview"
                        className="h-48 w-48 rounded-lg object-cover"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => setSelfiePreview(null)}
                      >
                        Retake
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                        <Camera className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Take a selfie to record your current state</p>
                      </div>
                      <div className="flex gap-4">
                        <Button onClick={openCamera}>
                          <Camera className="mr-2 h-4 w-4" />
                          Take Selfie
                        </Button>
                        <Button variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Reflect on your day</h3>
                <Textarea
                  placeholder="Share your thoughts about how your day went..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSubmit("checkout")}
                disabled={isSubmitting || !hasCheckedIn || hasCheckedOut}>
                {hasCheckedOut ? (
                  "Sudah check-out hari ini"
                ) : isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Complete Check-out
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
