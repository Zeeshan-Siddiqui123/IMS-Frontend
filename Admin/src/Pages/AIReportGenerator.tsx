import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { message, Modal } from "antd"
import { Sparkles, Send, FileText, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Mail, Download } from "lucide-react"
import { jsPDF } from "jspdf";
// Mock Data
const mockTeams = [
  { id: "1", name: "Frontend Team", leader: "Ali Khan", field: "Development" },
  { id: "2", name: "Backend Team", leader: "Faizan Rehman", field: "Development" },
  { id: "3", name: "Design Team", leader: "Afzal Ali", field: "Design" },
]

const mockMembers = {
  "1": [
    { id: "m1", name: "Hamza Ali", role: "Senior Developer" },
    { id: "m2", name: "Usiad Khan", role: "Junior Developer" },
    { id: "m3", name: "Zubair Khan", role: "Developer" },
  ],
  "2": [
    { id: "m4", name: "Zeeshan Ahmed", role: "Backend Lead" },
    { id: "m5", name: "Ali Zubair", role: "API Developer" },
  ],
  "3": [
    { id: "m6", name: "Ahmed Shah", role: "UI Designer" },
    { id: "m7", name: "Mahmood Alam", role: "UX Designer" },
  ],
}

const AIReportGenerator = () => {
  const [selectedTeam, setSelectedTeam] = useState("")
  const [selectedMember, setSelectedMember] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("weekly")
  const [generating, setGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<any>(null)
  const [sending, setSending] = useState(false)

  const currentMembers = selectedTeam ? mockMembers[selectedTeam as keyof typeof mockMembers] || [] : []

  const generateMockReport = () => {
    const member = currentMembers.find(m => m.id === selectedMember)
    const team = mockTeams.find(t => t.id === selectedTeam)

    return {
      memberName: member?.name || "Team Overview",
      memberRole: member?.role || "All Members",
      teamName: team?.name || "",
      period: selectedPeriod,
      generatedAt: new Date().toLocaleString(),

      attendance: {
        present: 22,
        absent: 2,
        late: 1,
        percentage: 88,
        trend: "up"
      },

      performance: {
        tasksCompleted: 18,
        tasksInProgress: 5,
        tasksPending: 2,
        completionRate: 72,
        quality: "Excellent",
        trend: "up"
      },

      dailyTasks: [
        { date: "2025-10-20", task: "Implemented authentication module", status: "completed", hours: 6 },
        { date: "2025-10-21", task: "Code review and bug fixes", status: "completed", hours: 5 },
        { date: "2025-10-22", task: "API integration for user dashboard", status: "completed", hours: 7 },
        { date: "2025-10-23", task: "Working on payment gateway", status: "in-progress", hours: 4 },
      ],

      improvements: [
        { area: "Time Management", priority: "medium", description: "Consider breaking down larger tasks into smaller chunks for better tracking" },
        { area: "Code Documentation", priority: "low", description: "Add more inline comments for complex logic" },
        { area: "Communication", priority: "high", description: "Improve daily standup participation and updates" },
      ],

      strengths: [
        "Excellent problem-solving skills",
        "Consistently meets deadlines",
        "Great team collaboration",
        "High quality code output"
      ],

      promotionStatus: {
        ready: true,
        timeline: "Next Quarter",
        requirements: [
          { item: "Technical Skills", met: true },
          { item: "Leadership Qualities", met: true },
          { item: "Project Ownership", met: false },
          { item: "Mentoring Others", met: true },
        ]
      },

      aiInsights: [
        "Performance has improved by 15% compared to last month",
        "Attendance is consistent with occasional planned leaves",
        "Strong candidate for promotion based on technical competency",
        "Recommend assigning more challenging projects to accelerate growth"
      ]
    }
  }

  const handleGenerate = async () => {
    if (!selectedTeam) {
      message.warning("Please select a team first")
      return
    }

    setGenerating(true)

    // Simulate AI processing
    setTimeout(() => {
      const report = generateMockReport()
      setGeneratedReport(report)
      setGenerating(false)
      message.success("Report generated successfully!")
    }, 2500)
  }

  const handleSendEmail = () => {
    Modal.confirm({
      title: "Send Report via Email",
      content: `This will send the generated report to the Project Manager of ${mockTeams.find(t => t.id === selectedTeam)?.name}. Continue?`,
      okText: "Send Email",
      cancelText: "Cancel",
      onOk: async () => {
        setSending(true)
        // Simulate email sending
        setTimeout(() => {
          setSending(false)
          message.success("Report sent successfully to Project Manager!")
        }, 1500)
      }
    })
  }

  const handleDownloadReport = async () => {
    if (!generatedReport) return

    message.loading("Generating PDF...", 0)

    // Dynamically import jsPDF

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - 20) {
        doc.addPage()
        yPos = 20
        return true
      }
      return false
    }

    // Header with purple accent
    doc.setFillColor(139, 92, 246)
    doc.rect(0, 0, pageWidth, 15, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont(undefined, 'bold')
    doc.text('AI Performance Report', pageWidth / 2, 10, { align: 'center' })

    // Member Info
    yPos = 25
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text(generatedReport.memberName, 20, yPos)

    yPos += 8
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`${generatedReport.memberRole} • ${generatedReport.teamName}`, 20, yPos)

    yPos += 6
    doc.text(`Period: ${generatedReport.period.charAt(0).toUpperCase() + generatedReport.period.slice(1)} | Generated: ${generatedReport.generatedAt}`, 20, yPos)

    yPos += 10
    doc.setDrawColor(229, 231, 235)
    doc.line(20, yPos, pageWidth - 20, yPos)

    // Metrics Section
    yPos += 15
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(20, yPos, 80, 30, 3, 3, 'F')
    doc.roundedRect(pageWidth / 2 + 5, yPos, 80, 30, 3, 3, 'F')

    // Attendance Metric
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Attendance Rate', 25, yPos + 8)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(139, 92, 246)
    doc.text(`${generatedReport.attendance.percentage}%`, 25, yPos + 20)
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text(`${generatedReport.attendance.present} present • ${generatedReport.attendance.absent} absent`, 25, yPos + 26)

    // Task Completion Metric
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Task Completion', pageWidth / 2 + 10, yPos + 8)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(139, 92, 246)
    doc.text(`${generatedReport.performance.completionRate}%`, pageWidth / 2 + 10, yPos + 20)
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text(`${generatedReport.performance.tasksCompleted} completed • ${generatedReport.performance.tasksInProgress} in progress`, pageWidth / 2 + 10, yPos + 26)

    yPos += 45

    // Daily Tasks Section
    checkPageBreak(40)
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('📋 Daily Tasks Overview', 20, yPos)
    yPos += 8

    generatedReport.dailyTasks.forEach((task: any) => {
      checkPageBreak(20)
      const taskColor = task.status === 'completed' ? [16, 185, 129] : [245, 158, 11]
      doc.setFillColor(249, 250, 251)
      doc.roundedRect(20, yPos, pageWidth - 40, 18, 2, 2, 'F')
      doc.setDrawColor(taskColor[0], taskColor[1], taskColor[2])
      doc.setLineWidth(2)
      doc.line(20, yPos, 20, yPos + 18)

      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(task.task, 25, yPos + 7, { maxWidth: pageWidth - 70 })

      doc.setFont(undefined, 'normal')
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(`${task.date} • ${task.hours}h • ${task.status === 'completed' ? 'Completed' : 'In Progress'}`, 25, yPos + 14)

      yPos += 22
    })

    // Improvements Section
    yPos += 5
    checkPageBreak(40)
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('🎯 Areas for Improvement', 20, yPos)
    yPos += 8

    generatedReport.improvements.forEach((item: any) => {
      checkPageBreak(25)
      const colors: any = {
        high: [239, 68, 68],
        medium: [245, 158, 11],
        low: [59, 130, 246]
      }
      const bgColors: any = {
        high: [254, 226, 226],
        medium: [254, 243, 199],
        low: [219, 234, 254]
      }

      doc.setFillColor(bgColors[item.priority][0], bgColors[item.priority][1], bgColors[item.priority][2])
      doc.roundedRect(20, yPos, pageWidth - 40, 20, 2, 2, 'F')
      doc.setDrawColor(colors[item.priority][0], colors[item.priority][1], colors[item.priority][2])
      doc.setLineWidth(2)
      doc.line(20, yPos, 20, yPos + 20)

      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(item.area, 25, yPos + 7)

      doc.setFillColor(colors[item.priority][0], colors[item.priority][1], colors[item.priority][2])
      doc.roundedRect(pageWidth - 50, yPos + 3, 25, 6, 1, 1, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(7)
      doc.text(item.priority.toUpperCase(), pageWidth - 37.5, yPos + 7, { align: 'center' })

      doc.setFont(undefined, 'normal')
      doc.setFontSize(8)
      doc.setTextColor(50, 50, 50)
      const splitDescription = doc.splitTextToSize(item.description, pageWidth - 55)
      doc.text(splitDescription, 25, yPos + 13)

      yPos += 24
    })

    // Strengths Section
    yPos += 5
    checkPageBreak(50)
    doc.setFillColor(209, 250, 229)
    doc.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3, 'F')
    doc.setDrawColor(16, 185, 129)
    doc.setLineWidth(2)
    doc.line(20, yPos, 20, yPos + 35)

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(6, 95, 70)
    doc.text('💪 Key Strengths', 25, yPos + 8)

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(0, 0, 0)
    let strengthY = yPos + 15
    generatedReport.strengths.forEach((strength: string) => {
      doc.text(`✓ ${strength}`, 25, strengthY)
      strengthY += 5
    })

    yPos += 40

    // Promotion Section
    checkPageBreak(50)
    const promotionColor = generatedReport.promotionStatus.ready ? [209, 250, 229] : [254, 243, 199]
    const promotionBorder = generatedReport.promotionStatus.ready ? [16, 185, 129] : [245, 158, 11]
    const promotionText = generatedReport.promotionStatus.ready ? [6, 95, 70] : [146, 64, 14]

    doc.setFillColor(promotionColor[0], promotionColor[1], promotionColor[2])
    doc.roundedRect(20, yPos, pageWidth - 40, 45, 3, 3, 'F')
    doc.setDrawColor(promotionBorder[0], promotionBorder[1], promotionBorder[2])
    doc.setLineWidth(1)
    doc.roundedRect(20, yPos, pageWidth - 40, 45, 3, 3, 'S')

    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(promotionText[0], promotionText[1], promotionText[2])
    doc.text(`🚀 ${generatedReport.promotionStatus.ready ? 'Ready for Promotion' : 'Promotion In Progress'}`, 25, yPos + 10)

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.text(`Timeline: ${generatedReport.promotionStatus.timeline}`, 25, yPos + 18)

    doc.setFont(undefined, 'bold')
    doc.text('Requirements:', 25, yPos + 26)
    doc.setFont(undefined, 'normal')

    let reqY = yPos + 32
    generatedReport.promotionStatus.requirements.forEach((req: any) => {
      doc.setTextColor(req.met ? 6 : 150, req.met ? 95 : 150, req.met ? 70 : 150)
      doc.text(`${req.met ? '✓' : '○'} ${req.item}`, 25, reqY)
      reqY += 5
    })

    yPos += 50

    // AI Insights
    checkPageBreak(50)
    doc.setFillColor(237, 233, 254)
    doc.roundedRect(20, yPos, pageWidth - 40, 40, 3, 3, 'F')
    doc.setDrawColor(139, 92, 246)
    doc.setLineWidth(2)
    doc.line(20, yPos, 20, yPos + 40)

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(91, 33, 182)
    doc.text('🤖 AI-Generated Insights', 25, yPos + 8)

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    let insightY = yPos + 15
    generatedReport.aiInsights.forEach((insight: string) => {
      const splitInsight = doc.splitTextToSize(`• ${insight}`, pageWidth - 55)
      doc.text(splitInsight, 25, insightY)
      insightY += splitInsight.length * 4
    })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('This report was automatically generated by AI Report Generator', pageWidth / 2, pageHeight - 15, { align: 'center' })
    doc.text('Confidential - For Internal Use Only', pageWidth / 2, pageHeight - 10, { align: 'center' })

    // Save PDF
    doc.save(`${generatedReport.memberName.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`)

    message.destroy()
    message.success("PDF downloaded successfully!")
  }

  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Report Generator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Generate comprehensive performance reports with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Report Configuration
                </CardTitle>
                <CardDescription>Select parameters for report generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Team Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Team</label>
                  <Select value={selectedTeam} onValueChange={(value) => {
                    setSelectedTeam(value)
                    setSelectedMember("")
                    setGeneratedReport(null)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Member Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Member (Optional)</label>
                  <Select
                    value={selectedMember}
                    onValueChange={setSelectedMember}
                    disabled={!selectedTeam}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {currentMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Period Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Period</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  className="w-full h-11 mt-4"
                  onClick={handleGenerate}
                  disabled={generating || !selectedTeam}
                >
                  {generating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>

                {generatedReport && (
                  <>
                    <Button
                      className="w-full h-11"
                      variant="secondary"
                      onClick={handleSendEmail}
                      disabled={sending}
                    >
                      {sending ? (
                        <>
                          <Mail className="w-4 h-4 mr-2 animate-pulse" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send to PM
                        </>
                      )}
                    </Button>

                    <Button
                      className="w-full h-11"
                      variant="outline"
                      onClick={handleDownloadReport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Report Display */}
          <div className="lg:col-span-2">
            {!generatedReport ? (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    No Report Generated Yet
                  </h3>
                  <p className="text-gray-500">
                    Configure parameters and click "Generate Report" to create an AI-powered analysis
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Report Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{generatedReport.memberName}</CardTitle>
                        <CardDescription className="mt-1">
                          {generatedReport.memberRole} • {generatedReport.teamName}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          Generated: {generatedReport.generatedAt}
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                        {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Metrics Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Attendance Rate</p>
                          <p className="text-3xl font-bold mt-1">{generatedReport.attendance.percentage}%</p>
                        </div>
                        <div className={`p-3 rounded-full ${generatedReport.attendance.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {generatedReport.attendance.trend === 'up' ?
                            <TrendingUp className="w-6 h-6 text-green-600" /> :
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          }
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {generatedReport.attendance.present} present • {generatedReport.attendance.absent} absent
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Task Completion</p>
                          <p className="text-3xl font-bold mt-1">{generatedReport.performance.completionRate}%</p>
                        </div>
                        <div className={`p-3 rounded-full ${generatedReport.performance.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {generatedReport.performance.trend === 'up' ?
                            <TrendingUp className="w-6 h-6 text-green-600" /> :
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          }
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {generatedReport.performance.tasksCompleted} completed • {generatedReport.performance.tasksInProgress} in progress
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabbed Content */}
                <Card>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="tasks" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="tasks">Daily Tasks</TabsTrigger>
                        <TabsTrigger value="improvements">Improvements</TabsTrigger>
                        <TabsTrigger value="promotion">Promotion</TabsTrigger>
                        <TabsTrigger value="insights">AI Insights</TabsTrigger>
                      </TabsList>

                      <TabsContent value="tasks" className="space-y-3 mt-4">
                        {generatedReport.dailyTasks.map((task: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50 dark:bg-neutral-800">
                            <div className={`mt-1 ${task.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {task.status === 'completed' ?
                                <CheckCircle2 className="w-5 h-5" /> :
                                <Clock className="w-5 h-5" />
                              }
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <p className="font-medium">{task.task}</p>
                                <Badge variant="outline" className="text-xs">
                                  {task.hours}h
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{task.date}</p>
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="improvements" className="space-y-3 mt-4">
                        {generatedReport.improvements.map((item: any, idx: number) => (
                          <Alert key={idx} className={
                            item.priority === 'high' ? 'border-red-200 bg-red-50' :
                              item.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                                'border-blue-200 bg-blue-50'
                          }>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex items-start justify-between">
                                <p className="font-semibold">{item.area}</p>
                                <Badge variant="outline" className="text-xs">
                                  {item.priority}
                                </Badge>
                              </div>
                              <p className="text-sm mt-1">{item.description}</p>
                            </AlertDescription>
                          </Alert>
                        ))}

                        <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {generatedReport.strengths.map((strength: string, idx: number) => (
                              <li key={idx} className="text-sm text-green-700 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>

                      <TabsContent value="promotion" className="mt-4">
                        <div className={`p-4 rounded-lg border-2 ${generatedReport.promotionStatus.ready ?
                          'bg-green-50 border-green-300' :
                          'bg-yellow-50 border-yellow-300'
                          }`}>
                          <div className="flex items-center gap-3 mb-4">
                            {generatedReport.promotionStatus.ready ?
                              <CheckCircle2 className="w-8 h-8 text-green-600" /> :
                              <AlertCircle className="w-8 h-8 text-yellow-600" />
                            }
                            <div>
                              <h3 className="font-bold text-lg">
                                {generatedReport.promotionStatus.ready ? 'Ready for Promotion' : 'Promotion In Progress'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Expected timeline: {generatedReport.promotionStatus.timeline}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="font-semibold mb-2">Requirements:</p>
                            {generatedReport.promotionStatus.requirements.map((req: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 p-2 rounded bg-white">
                                {req.met ?
                                  <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                  <AlertCircle className="w-5 h-5 text-gray-400" />
                                }
                                <span className={req.met ? 'text-gray-900' : 'text-gray-500'}>
                                  {req.item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="insights" className="space-y-3 mt-4">
                        <Alert className="border-purple-200 bg-purple-50">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <AlertDescription>
                            <p className="font-semibold text-purple-900 mb-2">AI-Generated Insights</p>
                            <ul className="space-y-2">
                              {generatedReport.aiInsights.map((insight: string, idx: number) => (
                                <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                                  <span className="text-purple-600 font-bold">•</span>
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIReportGenerator