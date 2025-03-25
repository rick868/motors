import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
  iconColor: string;
  changeLabel?: string;
};

export default function StatsCard({
  title,
  value,
  change,
  icon,
  iconColor,
  changeLabel = "from last month"
}: StatsCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="font-mono text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={`p-2 rounded-lg ${iconColor}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span 
            className={`flex items-center font-medium text-sm ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-gray-500 text-sm ml-2">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
