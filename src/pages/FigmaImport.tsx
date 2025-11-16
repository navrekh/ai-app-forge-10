import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Link as LinkIcon, FileImage, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

export default function FigmaImport() {
  const navigate = useNavigate();
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFigmaImport = async () => {
    if (!figmaUrl.trim()) {
      toast.error('Please enter a Figma URL');
      return;
    }

    if (!figmaUrl.includes('figma.com')) {
      toast.error('Please enter a valid Figma URL');
      return;
    }

    setIsProcessing(true);
    toast.info('Processing your Figma design...');

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/dashboard', { state: { figmaUrl } });
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.fig')) {
        toast.error('Please upload a .fig file');
        return;
      }
      
      setIsProcessing(true);
      toast.info('Processing your Figma file...');

      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/dashboard', { state: { figmaFile: file.name } });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Import from Figma</h1>
            <p className="text-lg text-muted-foreground">
              Convert your Figma designs into a fully functional mobile app
            </p>
          </div>

          <div className="grid gap-6">
            {/* Figma URL Import */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Import via Figma URL</CardTitle>
                    <CardDescription>Paste your Figma design link</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://www.figma.com/file/..."
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFigmaImport();
                    }
                  }}
                />
                <Button 
                  onClick={handleFigmaImport} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Import from URL'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Figma File Upload */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <FileImage className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle>Upload .fig File</CardTitle>
                    <CardDescription>Upload your Figma design file directly</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <label htmlFor="figma-upload" className="block">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary cursor-pointer transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">Figma files (.fig) only</p>
                  </div>
                  <input
                    id="figma-upload"
                    type="file"
                    accept=".fig"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                </label>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
              <p>Don't have a Figma design? <Button variant="link" className="p-0" onClick={() => navigate('/templates')}>Choose a template</Button></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
