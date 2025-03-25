import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ChevronRight, Loader2 } from "lucide-react";

// Remove direct use of useAuth here
export default function HomePage() {
  const [_, navigate] = useLocation();
  
  const handleLogin = () => {
    navigate("/auth");
  };
  
  const handleRegister = () => {
    navigate("/auth");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-bold text-4xl bg-gradient-to-r from-[#d32f2f] to-[#1a4b8c] text-transparent bg-clip-text">VOYAGER</h1>
          <div className="space-x-4">
            <Button variant="default" className="bg-[#1a4b8c] hover:bg-blue-800" onClick={handleLogin}>
              Log In
            </Button>
            <Button variant="default" className="bg-[#d32f2f] hover:bg-red-700" onClick={handleRegister}>
              Register
            </Button>
          </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1a4b8c] to-[#d32f2f] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-bold text-4xl mb-4">Motorcycle Dealership Decision Support System</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">Empower your dealership with data-driven insights and predictive analytics to boost sales and optimize inventory management.</p>
            <Button variant="secondary" size="lg" className="rounded-full" onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Learn More
            </Button>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-bold text-3xl text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                }
                title="Advanced Analytics"
                description="Comprehensive analytics dashboard with real-time KPIs and visualizations to track dealership performance."
                bgColor="bg-[#1a4b8c]"
              />
              
              <FeatureCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                  </svg>
                }
                title="Inventory Management"
                description="Effortlessly track motorcycle inventory, parts, and accessories with automated stock alerts."
                bgColor="bg-[#d32f2f]"
              />
              
              <FeatureCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                }
                title="Predictive Analytics"
                description="Utilize ARIMA and Prophet models to forecast sales trends and optimize inventory purchasing."
                bgColor="bg-[#1a4b8c]"
              />
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="font-bold text-3xl text-center mb-12">How It Works</h2>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center mb-12">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <h3 className="font-semibold text-2xl mb-4">Data-Driven Decision Making</h3>
                  <p className="mb-4">Voyager collects and analyzes data from all aspects of your dealership operations, presenting actionable insights through intuitive dashboards.</p>
                  <p>Our advanced analytics engine processes historical data to identify patterns and predict future trends, helping you make informed business decisions.</p>
                </div>
                <div className="md:w-1/2 bg-white p-4 rounded-lg shadow-md">
                  <div className="rounded-lg bg-gray-200 h-48 w-full flex items-center justify-center text-gray-400">
                    Dashboard analytics visualization
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row-reverse items-center">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pl-8">
                  <h3 className="font-semibold text-2xl mb-4">Role-Based Access Control</h3>
                  <p className="mb-4">Secure, role-based access ensures sales managers and administrators have appropriate permissions tailored to their responsibilities.</p>
                  <p>Administrators have complete system control, while sales managers focus on daily operations, inventory, and customer management.</p>
                </div>
                <div className="md:w-1/2 bg-white p-4 rounded-lg shadow-md">
                  <div className="rounded-lg bg-gray-200 h-48 w-full flex items-center justify-center text-gray-400">
                    Team collaboration with role-based access
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-bold text-3xl text-center mb-12">Contact Information</h2>
            <div className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-lg shadow-md">
              <div className="mb-6">
                <h3 className="font-semibold text-xl mb-3">System Administrator</h3>
                <p className="mb-1"><strong>Name:</strong> Alex Johnson</p>
                <p className="mb-1"><strong>Email:</strong> admin@voyagermoto.com</p>
                <p><strong>Phone:</strong> (555) 123-4567</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-xl mb-3">Technical Support</h3>
                <p className="mb-1"><strong>Email:</strong> support@voyagermoto.com</p>
                <p><strong>Hours:</strong> Monday - Friday, 9AM - 5PM EST</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-xl mb-3">Emergency Contact</h3>
                <p className="mb-1"><strong>After-hours Support:</strong> (555) 987-6543</p>
                <p><strong>Response Time:</strong> Within 2 hours</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-[#1a4b8c] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="font-bold text-2xl">VOYAGER</h2>
              <p>The ultimate motorcycle dealership solution</p>
            </div>
            <div>
              <p>&copy; {new Date().getFullYear()} Voyager DSS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
};

function FeatureCard({ icon, title, description, bgColor }: FeatureCardProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center text-white mb-4 mx-auto`}>
        {icon}
      </div>
      <h3 className="font-semibold text-xl text-center mb-3">{title}</h3>
      <p className="text-center">{description}</p>
    </div>
  );
}
