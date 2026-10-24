import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  iconColor?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
}: StatsCardProps) {
  return (
    <div className="group rounded-lg border border-border bg-card p-5 shadow-[0_2px_10px_rgb(27_57_46/4%)] transition-shadow hover:shadow-[0_8px_24px_rgb(27_57_46/8%)] sm:p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tabular-nums tracking-normal text-card-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "text-sm font-medium",
                changeType === "positive" && "text-primary",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn("rounded-md bg-primary/10 p-3 transition-transform group-hover:-translate-y-0.5", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
