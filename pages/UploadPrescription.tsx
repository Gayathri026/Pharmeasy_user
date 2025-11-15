// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/hooks/useAuth';
// import { prescriptionService } from '@/firebase/services';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast';
// import Header from '@/components/Header';
// import { Upload, ArrowLeft, FileCheck } from 'lucide-react';
// import { cartStore } from '@/lib/cartStore';

// const UploadPrescription = () => {
//   const navigate = useNavigate();
//   const { user, loading: authLoading } = useAuth();
//   const { toast } = useToast();
//   const [uploading, setUploading] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const [address, setAddress] = useState('');
//   const [notes, setNotes] = useState('');
//   const [cartItemCount, setCartItemCount] = useState(0);

//   useEffect(() => {
//     const unsubscribe = cartStore.subscribe((items) => {
//       const count = items.reduce((sum, item) => sum + item.quantity, 0);
//       setCartItemCount(count);
//     });
//     const initialCount = cartStore.getItemCount();
//     setCartItemCount(initialCount);
//     return unsubscribe;
//   }, []);

//   useEffect(() => {
//     if (!authLoading && !user) {
//       toast({
//         title: 'Login Required',
//         description: 'Please login to upload prescription',
//         variant: 'destructive',
//       });
//       navigate('/auth');
//     }
//   }, [user, authLoading, navigate, toast]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0];
//       const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
//       if (!validTypes.includes(selectedFile.type)) {
//         toast({
//           title: 'Invalid File',
//           description: 'Please upload an image or PDF file',
//           variant: 'destructive',
//         });
//         return;
//       }
//       if (selectedFile.size > 5 * 1024 * 1024) {
//         toast({
//           title: 'File Too Large',
//           description: 'File size must be less than 5MB',
//           variant: 'destructive',
//         });
//         return;
//       }
//       setFile(selectedFile);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!file || !address) {
//       toast({
//         title: 'Missing Information',
//         description: 'Please upload a prescription and enter delivery address',
//         variant: 'destructive',
//       });
//       return;
//     }

//     if (!user) return;

//     setUploading(true);

//     try {
//       // Upload file to Firebase Storage
//       const { url, error: uploadError } = await prescriptionService.uploadFile(user.uid, file);
//       if (uploadError || !url) {
//         throw uploadError || new Error('File upload failed');
//       }
//       const fileUrl = url;

//       // Save prescription record to Firestore
//       const { id, error } = await prescriptionService.create(
//         user.uid,
//         fileUrl,
//         file.name,
//         address,
//         notes
//       );

//       if (error) throw error;

//       toast({
//         title: 'Prescription Uploaded!',
//         description: 'We will contact you shortly to confirm your order',
//       });

//       navigate('/');
//     } catch (error: any) {
//       console.error('Upload error:', error);
//       toast({
//         title: 'Upload Failed',
//         description: error.message || 'Failed to upload prescription',
//         variant: 'destructive',
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (authLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Header cartItemCount={cartItemCount} />

//       <div className="container mx-auto px-4 py-8">
//         <Button
//           variant="ghost"
//           onClick={() => navigate(-1)}
//           className="mb-6"
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back
//         </Button>

//         <Card className="max-w-2xl mx-auto">
//           <CardHeader>
//             <CardTitle className="text-2xl flex items-center gap-2">
//               <FileCheck className="h-6 w-6 text-primary" />
//               Upload Prescription
//             </CardTitle>
//             <CardDescription>
//               Upload your prescription and we'll deliver your medicines
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-2">
//                 <Label htmlFor="prescription">Prescription Image/PDF *</Label>
//                 <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
//                   <Input
//                     id="prescription"
//                     type="file"
//                     accept="image/*,.pdf"
//                     onChange={handleFileChange}
//                     className="hidden"
//                   />
//                   <label
//                     htmlFor="prescription"
//                     className="cursor-pointer flex flex-col items-center"
//                   >
//                     {file ? (
//                       <>
//                         <FileCheck className="h-12 w-12 text-primary mb-2" />
//                         <p className="text-sm font-medium">{file.name}</p>
//                         <p className="text-xs text-muted-foreground mt-1">
//                           Click to change file
//                         </p>
//                       </>
//                     ) : (
//                       <>
//                         <Upload className="h-12 w-12 text-muted-foreground mb-2" />
//                         <p className="text-sm font-medium">Click to upload prescription</p>
//                         <p className="text-xs text-muted-foreground mt-1">
//                           PNG, JPG, WEBP or PDF (max 5MB)
//                         </p>
//                       </>
//                     )}
//                   </label>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="address">Delivery Address *</Label>
//                 <Textarea
//                   id="address"
//                   placeholder="Enter your complete delivery address"
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                   required
//                   rows={3}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="notes">Additional Notes (Optional)</Label>
//                 <Textarea
//                   id="notes"
//                   placeholder="Any specific instructions or requirements"
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   rows={2}
//                 />
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full"
//                 size="lg"
//                 disabled={uploading}
//               >
//                 {uploading ? 'Uploading...' : 'Submit Prescription'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default UploadPrescription;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { prescriptionService, profileService } from '@/firebase/services';
import { emailService } from '@/services/email.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { Upload, ArrowLeft, FileCheck, Mail } from 'lucide-react';
import { cartStore } from '@/lib/cartStore';

const UploadPrescription = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const unsubscribe = cartStore.subscribe((items) => {
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(count);
    });
    const initialCount = cartStore.getItemCount();
    setCartItemCount(initialCount);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: 'Login Required',
        description: 'Please login to upload prescription',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user, authLoading, navigate, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid File',
          description: 'Please upload an image or PDF file',
          variant: 'destructive',
        });
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'File size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !address) {
      toast({
        title: 'Missing Information',
        description: 'Please upload a prescription and enter delivery address',
        variant: 'destructive',
      });
      return;
    }

    if (!user) return;

    setUploading(true);

    try {
      console.log('🚀 Starting prescription upload...');

      // Step 1: Upload file to Supabase Storage
      const { url, error: uploadError } = await prescriptionService.uploadFile(user.uid, file);
      if (uploadError || !url) {
        throw uploadError || new Error('File upload failed');
      }
      console.log('✅ File uploaded:', url);

      // Step 2: Save prescription record to Firestore
      const { id, error } = await prescriptionService.create(
        user.uid,
        url,
        file.name,
        address,
        notes
      );

      if (error || !id) throw error || new Error('Failed to create prescription record');
      console.log('✅ Prescription record created:', id);

      // Step 3: Get user profile for email
      const userProfile = await profileService.getProfile(user.uid);
      console.log('✅ User profile fetched');

      // Step 4: Send email notification to admin
      console.log('📧 Sending email to admin...');
      const emailResult = await emailService.notifyAdminNewPrescription({
        userName: userProfile?.full_name || 'Unknown User',
        userEmail: userProfile?.email || user.email || '',
        userPhone: userProfile?.phone,
        deliveryAddress: address,
        userNotes: notes,
        prescriptionId: id,
        fileUrl: url,
      });

      if (emailResult.success) {
        console.log('✅ Admin email sent successfully!');
        toast({
          title: 'Prescription Uploaded! 📧',
          description: 'Admin has been notified and will contact you shortly',
        });
      } else {
        console.warn('⚠️ Email sending failed, but prescription was saved');
        toast({
          title: 'Prescription Uploaded!',
          description: 'We will contact you shortly to confirm your order',
        });
      }

      // Navigate to home
      navigate('/');
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload prescription',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              Upload Prescription
            </CardTitle>
            <CardDescription>
              Upload your prescription and we'll deliver your medicines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prescription">Prescription Image/PDF *</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Input
                    id="prescription"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="prescription"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {file ? (
                      <>
                        <FileCheck className="h-12 w-12 text-primary mb-2" />
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to change file
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Click to upload prescription</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WEBP or PDF (max 5MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific instructions or requirements"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium">After submission:</p>
                  <p className="mt-1">Our pharmacist will review your prescription and send you a list of medicines to order.</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Submit Prescription
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPrescription;