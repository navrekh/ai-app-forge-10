import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, ShoppingBag, MessageCircle, Calendar, Plane, UtensilsCrossed, Zap } from 'lucide-react';
import { Header } from '@/components/Header';

const templates = [
  {
    id: 'social-media',
    name: 'Social Media App',
    description: 'Modern social networking with feeds, stories, and messaging',
    icon: MessageCircle,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce App',
    description: 'Full-featured shopping app with cart and checkout',
    icon: ShoppingBag,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'booking',
    name: 'Booking App',
    description: 'Appointment booking and scheduling system',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'travel',
    name: 'Travel Booking',
    description: 'Flight and hotel booking platform',
    icon: Plane,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'food-delivery',
    name: 'Food Delivery',
    description: 'Restaurant ordering and delivery app',
    icon: UtensilsCrossed,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'dashboard',
    name: 'Neon Dashboard',
    description: 'Modern analytics and management dashboard',
    icon: Zap,
    color: 'from-indigo-500 to-purple-500',
  },
];

export default function Templates() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    navigate('/dashboard', { state: { templateId } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose a Template</h1>
            <p className="text-lg text-muted-foreground">
              Start with a pre-built template and customize it to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      onClick={() => handleSelectTemplate(template.id)} 
                      className="w-full"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Start from Scratch Instead
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
