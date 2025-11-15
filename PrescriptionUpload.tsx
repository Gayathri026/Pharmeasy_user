import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Phone, MapPin, Calendar } from 'lucide-react';

const PrescriptionUpload = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Upload CTA */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-full">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order with Prescription</h2>
                  <p className="text-muted-foreground">
                    Upload prescription and we will deliver your medicines
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/upload-prescription')} 
                className="w-full group"
                size="lg"
              >
                <Upload className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Upload Prescription
              </Button>
              
              <p className="text-sm text-center mt-4 text-muted-foreground">
                <span className="font-semibold text-primary">1 Lakh+</span> users prefer this method
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-secondary/10 p-3 rounded-lg mb-2 inline-block">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Licensed Pharmacists</p>
                </div>
                <div className="text-center">
                  <div className="bg-secondary/10 p-3 rounded-lg mb-2 inline-block">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Genuine medicines</p>
                </div>
                <div className="text-center">
                  <div className="bg-secondary/10 p-3 rounded-lg mb-2 inline-block">
                    <Phone className="h-5 w-5 text-secondary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Secure calls</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right side - How it works */}
          <div>
            <h3 className="text-xl font-bold mb-6">How does this work?</h3>
            <div className="space-y-6">
              {[
                { step: 1, title: 'Upload a photo of your prescription', icon: Upload },
                { step: 2, title: 'Add delivery address and place the order', icon: MapPin },
                { step: 3, title: 'We will call you to confirm the medicines', icon: Phone },
                { step: 4, title: 'Now, sit back! your medicines will get delivered at your doorstep', icon: Calendar },
              ].map(({ step, title, icon: Icon }) => (
                <div key={step} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {step}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm text-foreground">{title}</p>
                  </div>
                  <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrescriptionUpload;
