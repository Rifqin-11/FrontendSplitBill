'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Users, Calculator, Share2, ChevronRight, Receipt, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BillEditor } from '@/components/BillEditor';
import { PeopleManager } from '@/components/PeopleManager';
import { ItemAssignment } from '@/components/ItemAssignment';
import { BillSummary } from '@/components/BillSummary';

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  assignedTo: string[];

}

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface BillData {
  items: BillItem[];
  tax: number;
  serviceCharge: number;
  subtotal: number;
  discount: number;
  total: number;

}

const steps = [
  { id: 'upload', title: 'Upload Receipt', icon: Upload },
  { id: 'edit', title: 'Review & Edit', icon: Receipt },
  { id: 'people', title: 'Add People', icon: Users },
  { id: 'assign', title: 'Assign Items', icon: Calculator },
  { id: 'summary', title: 'Split Results', icon: Share2 },
];



export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload');
  const [billData, setBillData] = useState<BillData | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileUpload = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);

    try {
      const formData = new FormData();
      formData.append("image", file); // ✅ cocok dengan backend

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/receipt`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to process receipt");

      const extracted = await response.json();

      const formattedData: BillData = {
        items: extracted.parsed.items.map((item: any, index: number) => ({
          id: String(index + 1),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          assignedTo: [],
        })),
        subtotal: extracted.parsed.subtotal,
        tax: extracted.parsed.tax,
        serviceCharge: extracted.parsed.serviceCharge ?? 0,
        discount: extracted.parsed.discount ?? 0,
        total: extracted.parsed.total,
      };


      setBillData(formattedData);
      setCurrentStep("edit");
    } catch (error) {
      console.error("OCR extraction failed:", error);
      alert("Failed to process receipt. Please try again.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                SplitBill
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Smart bill splitting made simple. Upload, assign, and split in
                seconds.
              </p>
            </div>

            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-8">
                <div
                  className="text-center"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Your Receipt
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Drag and drop your receipt image here, or click to browse
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <label htmlFor="receipt-upload">
                    <Button onClick={triggerFileInput} size="lg">
                      <Upload className="h-5 w-5 mr-2" />
                      Choose Receipt Image
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    1. Upload
                  </h3>
                  <p className="text-gray-600">
                    Take a photo or upload an image of your receipt
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    2. Assign
                  </h3>
                  <p className="text-gray-600">
                    Add people and assign items to each person
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Calculator className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Split</h3>
                  <p className="text-gray-600">
                    Get the exact amount each person owes instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'edit':
        return billData && (
          <BillEditor
            billData={billData}
            setBillData={setBillData}
            onNext={() => setCurrentStep('people')}
            uploadedImage={uploadedImage}
          />
        );

      case 'people':
        return (
          <PeopleManager
            people={people}
            setPeople={setPeople}
            onNext={() => setCurrentStep('assign')}
            onBack={() => setCurrentStep('edit')}
          />
        );

      case 'assign':
        return billData && (
          <ItemAssignment
            billData={billData}
            setBillData={setBillData}
            people={people}
            onNext={() => setCurrentStep('summary')}
            onBack={() => setCurrentStep('people')}
          />
        );

      case 'summary':
        return billData && (
          <BillSummary
            billData={billData}
            people={people}
            onStartOver={() => {
              setCurrentStep('upload');
              setBillData(null);
              setPeople([]);
              setUploadedImage(null);
            }}
          />
        );

      default:
        return null;
    }
  };

  // Show loading placeholder during server-side rendering
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">SplitBill</h1>
              <p className="text-xl text-gray-600 mb-8">
                Smart bill splitting made simple. Upload, assign, and split in seconds.
              </p>
            </div>
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-8">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Your Receipt
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Loading...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {currentStep !== "upload" && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm overflow-x-auto">
              <div className="flex items-center gap-x-4 gap-y-2 flex-wrap min-w-full">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted =
                    steps.findIndex((s) => s.id === currentStep) > index;

                  return (
                    <div
                      key={step.id}
                      className="flex items-center space-x-2 shrink-0"
                    >
                      <div
                        className={`flex items-center justify-center rounded-full text-white text-xs md:text-sm
                  ${
                    isActive
                      ? "bg-blue-600"
                      : isCompleted
                      ? "bg-green-500"
                      : "bg-gray-300 text-gray-600"
                  }
                  w-8 h-8 md:w-10 md:h-10
                `}
                      >
                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <span
                        className={`text-xs md:text-sm font-medium ${
                          isActive
                            ? "text-blue-600"
                            : isCompleted
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {step.title}
                      </span>
                      {index < steps.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {renderCurrentStep()}
      </div>
    </div>
  );
}
