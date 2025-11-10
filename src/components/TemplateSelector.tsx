import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ShoppingBag, Users, UtensilsCrossed, Plane, LayoutDashboard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  features: string[];
  color: string;
}

const templates: Template[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Full-featured shopping app with cart, payments, and product catalog',
    icon: ShoppingBag,
    category: 'Retail',
    features: ['Product Catalog', 'Shopping Cart', 'Payment Integration', 'Order Tracking'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'social',
    name: 'Social Network',
    description: 'Connect users with posts, likes, comments, and real-time messaging',
    icon: Users,
    category: 'Social',
    features: ['User Profiles', 'Feed', 'Messaging', 'Notifications'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'food-delivery',
    name: 'Food Delivery',
    description: 'Restaurant discovery, menu browsing, and delivery tracking',
    icon: UtensilsCrossed,
    category: 'Delivery',
    features: ['Restaurant Listings', 'Menu Management', 'Order Tracking', 'Live Location'],
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'travel',
    name: 'Travel Booking',
    description: 'Search flights, hotels, and create travel itineraries',
    icon: Plane,
    category: 'Travel',
    features: ['Search & Filter', 'Booking System', 'Itinerary Builder', 'Reviews'],
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'Data visualization with charts, metrics, and real-time updates',
    icon: LayoutDashboard,
    category: 'Business',
    features: ['Charts & Graphs', 'Real-time Data', 'Export Reports', 'Team Collaboration'],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'custom',
    name: 'Custom App',
    description: 'Start from scratch with AI-generated UI based on your prompt',
    icon: Sparkles,
    category: 'Custom',
    features: ['AI-Powered', 'Fully Customizable', 'Any Industry', 'Unique Design'],
    color: 'from-pink-500 to-pink-600'
  }
];

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateSelector = ({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
        <p className="text-sm text-muted-foreground">
          Start with a pre-built design or create a custom app from scratch
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate === template.id;

          return (
            <Card
              key={template.id}
              className={cn(
                "relative cursor-pointer transition-all hover:shadow-lg",
                isSelected && "ring-2 ring-primary shadow-lg"
              )}
              onClick={() => onSelectTemplate(template.id)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className={cn("w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center", template.color)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{template.name}</h4>
                    <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Key Features:</p>
                  <ul className="space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="text-xs flex items-center gap-1">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
