import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneMockup } from '@/components/PhoneMockup';
import { ArrowLeft, Calendar, Download, Code } from 'lucide-react';
import { toast } from 'sonner';
import { ComponentEditor } from '@/components/ComponentEditor';
import { AddComponentDialog } from '@/components/AddComponentDialog';
import { EditableComponent } from '@/components/EditableComponent';
import { ViewCodeDialog } from '@/components/ViewCodeDialog';
import { generateReactNativeCode } from '@/utils/codeGenerator';
import { DownloadAPKButton } from '@/components/DownloadAPKButton';

interface Project {
  name: string;
  description: string;
  created_at: string;
  app_data: any;
}

const PreviewApp = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editableComponents, setEditableComponents] = useState<any[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [viewCodeOpen, setViewCodeOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProject(data);
          // Initialize editable components from app_data
          const appData = data.app_data as any;
          if (appData?.editableComponents) {
            setEditableComponents(appData.editableComponents);
          }
        } else {
          toast.error('Project not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
        navigate('/dashboard');
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

  const selectedComponent = editableComponents.find(c => c.id === selectedComponentId);
  const generatedCode = generateReactNativeCode(project, editableComponents);

  const handleComponentUpdate = (updates: any) => {
    setEditableComponents(prev =>
      prev.map(comp =>
        comp.id === selectedComponentId ? { ...comp, ...updates } : comp
      )
    );
  };

  const handleAddComponent = (newComponent: any) => {
    setEditableComponents(prev => [...prev, newComponent]);
    toast.success('Component added');
  };

  const handleSaveChanges = async () => {
    try {
      const appData = project.app_data as any;
      const { error } = await supabase
        .from('projects')
        .update({
          app_data: {
            ...appData,
            editableComponents: editableComponents,
          },
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    }
  };


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
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{project.description}</p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="mr-2 h-4 w-4" />
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <p className="text-sm font-medium">Export Options</p>
                  <div className="flex gap-2">
                    <DownloadAPKButton appHistoryId={id!} />
                    <Button
                      disabled
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download IPA
                    </Button>
                  </div>
                  <Button
                    onClick={() => setViewCodeOpen(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Code className="mr-2 h-4 w-4" />
                    View Code
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Export features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Screens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.app_data?.screens?.map((screen: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1">{screen.name}</h4>
                      <p className="text-sm text-muted-foreground">{screen.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {project.app_data?.components && project.app_data.components.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.app_data.components.map((component: any, index: number) => (
                      <div key={index} className="p-2 border rounded">
                        <p className="text-sm font-medium">{component.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Phone Preview */}
          <div className="flex items-start justify-center sticky top-8 lg:col-span-1">
            <PhoneMockup>
              <div className="h-full p-6 overflow-y-auto space-y-4">
                <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
                
                {/* Editable Components */}
                {editableComponents.map((component) => (
                  <EditableComponent
                    key={component.id}
                    component={component}
                    isSelected={selectedComponentId === component.id}
                    onClick={() => setSelectedComponentId(component.id)}
                  />
                ))}

                {/* Original Screens */}
                {project.app_data?.screens?.map((screen: any, index: number) => (
                  <div key={index} className="mb-6 p-4 border rounded-lg opacity-60">
                    <h3 className="font-semibold mb-2">{screen.name}</h3>
                    <p className="text-sm text-muted-foreground">{screen.description}</p>
                  </div>
                ))}
              </div>
            </PhoneMockup>
          </div>

          {/* Editor Panel */}
          <div className="space-y-6 lg:col-span-1">
            <AddComponentDialog onAdd={handleAddComponent} />
            <ComponentEditor
              selectedComponent={selectedComponent}
              onUpdate={handleComponentUpdate}
              onSave={handleSaveChanges}
            />
          </div>
        </div>
      </main>

      <ViewCodeDialog
        code={generatedCode}
        open={viewCodeOpen}
        onOpenChange={setViewCodeOpen}
      />
    </div>
  );
};

export default PreviewApp;
