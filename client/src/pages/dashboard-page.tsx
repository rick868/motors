import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import StatsCard from "@/components/dashboard/stats-card";
import SalesChart from "@/components/dashboard/sales-chart";
import TopSellers from "@/components/dashboard/top-sellers";
import InventoryTable from "@/components/dashboard/inventory-table";
import PredictionChart from "@/components/dashboard/prediction-chart";
import { useLocation } from "wouter";
import { 
  DollarSign, 
  ClipboardList, 
  Calculator, 
  ThumbsUp,
  Loader2
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  
  // Sample data for charts - in a real app this would come from the API
  const salesData = [
    { month: "Jan", sales: 35240 },
    { month: "Feb", sales: 28500 },
    { month: "Mar", sales: 42600 },
    { month: "Apr", sales: 32100 },
    { month: "May", sales: 48000 },
    { month: "Jun", sales: 38500 },
    { month: "Jul", sales: 52000 },
    { month: "Aug", sales: 45500 },
    { month: "Sep", sales: 51000 },
    { month: "Oct", sales: 48000 },
    { month: "Nov", sales: 55000 },
    { month: "Dec", sales: 49500 },
  ];
  
  const topSellersData = [
    { id: 1, model: "Explorer 750R", imageUrl: "", unitsSold: 73, price: 12990, progress: 85 },
    { id: 2, model: "Voyager Cruiser", imageUrl: "", unitsSold: 68, price: 15750, progress: 78 },
    { id: 3, model: "Speedster 1000", imageUrl: "", unitsSold: 54, price: 18490, progress: 62 },
    { id: 4, model: "Trail Blazer 450", imageUrl: "", unitsSold: 41, price: 9995, progress: 47 },
    { id: 5, model: "Voyager Touring", imageUrl: "", unitsSold: 37, price: 22750, progress: 42 },
  ];
  
  const inventoryData = [
    { id: 1, model: "Explorer 750R", sku: "M12345", category: "Sport", stock: 24, imageUrl: "", status: "in_stock" },
    { id: 2, model: "Voyager Cruiser", sku: "M12346", category: "Cruiser", stock: 18, imageUrl: "", status: "in_stock" },
    { id: 3, model: "Speedster 1000", sku: "M12347", category: "Sport", stock: 5, imageUrl: "", status: "low_stock" },
    { id: 4, model: "Voyager Touring", sku: "M12348", category: "Touring", stock: 0, imageUrl: "", status: "out_of_stock" },
  ];
  
  const predictionData = [
    { date: "2023-09-01", actual: 42000 },
    { date: "2023-09-15", actual: 45000 },
    { date: "2023-10-01", actual: 48000 },
    { date: "2023-10-15", actual: 46000 },
    { date: "2023-11-01", actual: 52000 },
    { date: "Today", actual: 55000, predicted: 55000 },
    { date: "2023-11-15", predicted: 57000, lowerBound: 54000, upperBound: 60000 },
    { date: "2023-12-01", predicted: 60000, lowerBound: 56000, upperBound: 64000 },
    { date: "2023-12-15", predicted: 65000, lowerBound: 60000, upperBound: 70000 },
    { date: "2024-01-01", predicted: 70000, lowerBound: 64000, upperBound: 76000 },
  ];
  
  // Fetch dashboard data - in a real app you would implement this with actual queries
  const { data: topSelling, isLoading: isLoadingTopSelling } = useQuery({
    queryKey: ["/api/dashboard/top-selling"],
    queryFn: () => {
      // Simulating data for demo, would normally fetch from API
      return Promise.resolve(topSellersData);
    },
  });
  
  const handleViewAllInventory = () => {
    navigate("/inventory");
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0 lg:pl-64">
        <TopNav title="Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total Sales"
              value="$246,580"
              change={12.5}
              icon={<DollarSign className="h-6 w-6 text-green-600" />}
              iconColor="bg-green-100"
            />
            
            <StatsCard
              title="Total Inventory"
              value="134 units"
              change={-4.3}
              icon={<ClipboardList className="h-6 w-6 text-blue-600" />}
              iconColor="bg-blue-100"
            />
            
            <StatsCard
              title="Average Order Value"
              value="$12,580"
              change={8.2}
              icon={<Calculator className="h-6 w-6 text-yellow-600" />}
              iconColor="bg-yellow-100"
            />
            
            <StatsCard
              title="Customer Satisfaction"
              value="92.4%"
              change={1.2}
              icon={<ThumbsUp className="h-6 w-6 text-[#d32f2f]" />}
              iconColor="bg-red-100"
            />
          </div>
          
          {/* Main Section - Charts & Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left column - Sales Chart */}
            <div className="lg:col-span-2">
              <SalesChart data={salesData} />
            </div>
            
            {/* Right column - Top Selling Models */}
            <div>
              {isLoadingTopSelling ? (
                <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-sm p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <TopSellers items={topSelling || []} />
              )}
            </div>
          </div>
          
          {/* Bottom Section - Inventory & Prediction */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Status */}
            <InventoryTable 
              items={inventoryData} 
              onViewAll={handleViewAllInventory} 
            />
            
            {/* Sales Prediction */}
            <PredictionChart
              data={predictionData}
              predictedSales={87240}
              confidence={85}
              growth={12.4}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
