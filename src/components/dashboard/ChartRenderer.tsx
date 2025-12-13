"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Radar, RadarChart, RadialBar, RadialBarChart, XAxis, YAxis, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Label } from "recharts"
import { saveAs } from "file-saver"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

interface ChartRendererProps {
  type: "area" | "bar" | "line" | "pie" | "radar" | "radial"
  title?: string
  description?: string
  data: any[]
  config: ChartConfig
  xAxisKey?: string
  dataKey?: string // For single series charts like Pie/Radial
}

export function ChartRenderer({
  type,
  title,
  description,
  data,
  config,
  xAxisKey = "name",
  dataKey = "value",
}: ChartRendererProps) {
  const chartRef = React.useRef<HTMLDivElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!chartRef.current) return

    try {
      // Find the SVG element
      const svg = chartRef.current.querySelector("svg")
      if (!svg) return

      // Clone the SVG to modify it for export
      const svgClone = svg.cloneNode(true) as SVGElement
      
      // Get computed styles and resolve CSS variables to actual colors
      const computedStyle = getComputedStyle(document.documentElement)
      
      // Replace CSS variable references with actual color values in the SVG
      const replaceVarColors = (element: Element) => {
        const style = element.getAttribute('style')
        if (style) {
          let newStyle = style
          // Replace common CSS variables
          const varMatches = style.matchAll(/var\(--([^)]+)\)/g)
          for (const match of varMatches) {
            const varName = match[1]
            const value = computedStyle.getPropertyValue(`--${varName}`).trim()
            if (value) {
              newStyle = newStyle.replace(match[0], value)
            }
          }
          element.setAttribute('style', newStyle)
        }
        
        // Check fill and stroke attributes
        const fill = element.getAttribute('fill')
        if (fill && fill.startsWith('var(')) {
          const varName = fill.match(/var\(--([^)]+)\)/)?.[1]
          if (varName) {
            const value = computedStyle.getPropertyValue(`--${varName}`).trim()
            if (value) element.setAttribute('fill', value)
          }
        }
        
        const stroke = element.getAttribute('stroke')
        if (stroke && stroke.startsWith('var(')) {
          const varName = stroke.match(/var\(--([^)]+)\)/)?.[1]
          if (varName) {
            const value = computedStyle.getPropertyValue(`--${varName}`).trim()
            if (value) element.setAttribute('stroke', value)
          }
        }
        
        // Recursively process children
        Array.from(element.children).forEach(replaceVarColors)
      }
      
      replaceVarColors(svgClone)

      // Create a canvas with extra space for title
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const padding = 40
      const titleHeight = title ? 60 : 0
      const descHeight = description ? 24 : 0
      const headerHeight = titleHeight + descHeight + (title || description ? 20 : 0)
      
      const svgWidth = svg.clientWidth
      const svgHeight = svg.clientHeight
      
      canvas.width = (svgWidth + padding * 2) * 2 // Higher resolution
      canvas.height = (svgHeight + headerHeight + padding * 2) * 2

      if (ctx) {
        ctx.scale(2, 2)
        
        // Dark background matching the card
        ctx.fillStyle = "#18181b" // zinc-900
        ctx.fillRect(0, 0, svgWidth + padding * 2, svgHeight + headerHeight + padding * 2)
        
        // Draw rounded rectangle border
        const borderRadius = 12
        ctx.strokeStyle = "#27272a" // zinc-800
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(0.5, 0.5, svgWidth + padding * 2 - 1, svgHeight + headerHeight + padding * 2 - 1, borderRadius)
        ctx.stroke()
        
        // Draw title
        if (title) {
          ctx.fillStyle = "#fafafa" // zinc-50
          ctx.font = "600 18px system-ui, -apple-system, sans-serif"
          ctx.fillText(title, padding, padding + 24)
        }
        
        // Draw description
        if (description) {
          ctx.fillStyle = "#a1a1aa" // zinc-400
          ctx.font = "400 14px system-ui, -apple-system, sans-serif"
          ctx.fillText(description, padding, padding + titleHeight + 16)
        }
        
        // Draw the SVG chart
        const svgData = new XMLSerializer().serializeToString(svgClone)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(svgBlob)
        
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, padding, headerHeight + padding, svgWidth, svgHeight)
          
          canvas.toBlob((blob) => {
            if (blob) {
              // Sanitize filename
              const filename = (title || "chart").replace(/[^a-z0-9]/gi, '_').toLowerCase()
              saveAs(blob, `${filename}.png`)
            }
            URL.revokeObjectURL(url)
          })
        }
        img.src = url
      }
    } catch (error) {
      console.error("Error downloading chart:", error)
    }
  }

  const renderChart = () => {
    switch (type) {
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--surbee-border)" strokeOpacity={0.5} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'var(--surbee-fg-secondary)' }}
              tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 3) : value}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(config).map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`var(--color-${key})`}
                fillOpacity={0.4}
                stroke={`var(--color-${key})`}
                stackId="a"
              />
            ))}
          </AreaChart>
        )
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--surbee-border)" strokeOpacity={0.5} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: 'var(--surbee-fg-secondary)' }}
              tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 3) : value}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(config).map((key) => (
              <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
            ))}
          </BarChart>
        )
      case "line":
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--surbee-border)" strokeOpacity={0.5} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'var(--surbee-fg-secondary)' }}
              tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 3) : value}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(config).map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        )
      case "pie":
        return (
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={xAxisKey}
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const total = data.reduce((acc, curr) => acc + (curr[dataKey] || 0), 0);
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          style={{ fill: 'var(--surbee-fg-primary)', fontSize: '1.875rem', fontWeight: 'bold' }}
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          style={{ fill: 'var(--surbee-fg-secondary)' }}
                        >
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
             <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        )
      case "radar":
        return (
          <RadarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid stroke="var(--surbee-border)" strokeOpacity={0.5} />
            <PolarAngleAxis dataKey={xAxisKey} tick={{ fill: 'var(--surbee-fg-secondary)' }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: 'var(--surbee-fg-secondary)' }} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(config).map((key) => (
               <Radar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                fillOpacity={0.6}
              />
            ))}
          </RadarChart>
        )
      case "radial":
        return (
          <RadialBarChart
            data={data}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid gridType="circle" radialLines={false} stroke="var(--surbee-border)" strokeOpacity={0.3} />
            <RadialBar background dataKey={dataKey} cornerRadius={10} />
             <ChartLegend content={<ChartLegendContent />} />
             <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey={xAxisKey} />} />
          </RadialBarChart>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-lg group relative border-[var(--surbee-border)] bg-[var(--surbee-bg-secondary)] dark:border-zinc-800 dark:bg-zinc-900/50">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-[var(--surbee-fg-primary)]">{title}</CardTitle>
                <CardDescription className="text-[var(--surbee-fg-secondary)]">{description}</CardDescription>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDownload}
            >
                <Download className="h-4 w-4 text-[var(--surbee-fg-secondary)]" />
            </Button>
        </div>
      </CardHeader>
      <CardContent ref={chartRef}>
        <ChartContainer config={config}>
          {renderChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
