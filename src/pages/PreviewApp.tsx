import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneMockup } from '@/components/PhoneMockup';
import { ArrowLeft, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  name: string;
  description: string;
  createdAt: Date;
  screens: any[];
  components: any[];
}

const PreviewApp = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProject({
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as Project);
        } else {
          toast.error('Project not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{project.description}</p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Created {project.createdAt?.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Screens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.screens?.map((screen: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1">{screen.name}</h4>
                      <p className="text-sm text-muted-foreground">{screen.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {project.components && project.components.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.components.map((component: any, index: number) => (
                      <div key={index} className="p-2 border rounded">
                        <p className="text-sm font-medium">{component.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex items-start justify-center sticky top-8">
            <PhoneMockup>
              <div className="h-full p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
                {project.screens?.map((screen: any, index: number) => (
                  <div key={index} className="mb-6 p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{screen.name}</h3>
                    <p className="text-sm text-muted-foreground">{screen.description}</p>
                  </div>
                ))}
              </div>
            </PhoneMockup>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PreviewApp;
