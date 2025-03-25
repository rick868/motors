import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type TopSellersItemProps = {
  id: number;
  model: string;
  imageUrl: string;
  unitsSold: number;
  price: number;
  progress: number;
};

type TopSellersProps = {
  items: TopSellersItemProps[];
};

export default function TopSellers({ items }: TopSellersProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-lg">Top Selling Models</h2>
        </div>
        
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center">
              <div className="w-12 h-12 rounded-md overflow-hidden mr-4 bg-gray-100 flex-shrink-0">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.model} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{item.model}</h4>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-500">{item.unitsSold} units sold</span>
                  <span className="font-medium">{formatPrice(item.price)}</span>
                </div>
                <Progress value={item.progress} className="h-1.5 mt-2" indicatorColor="bg-[#d32f2f]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
