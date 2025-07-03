"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  CreditCard,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { PaymentMethod } from "@/app/page";

interface PaymentInfoProps {
  paymentMethods: PaymentMethod[];
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ewalletOptions = [
  { value: "gopay", label: "GoPay" },
  { value: "ovo", label: "OVO" },
  { value: "dana", label: "DANA" },
  { value: "shopeepay", label: "ShopeePay" },
  { value: "linkaja", label: "LinkAja" },
  { value: "jenius", label: "Jenius" },
];

const bankOptions = [
  { value: "bca", label: "BCA" },
  { value: "mandiri", label: "Bank Mandiri" },
  { value: "bni", label: "BNI" },
  { value: "bri", label: "BRI" },
  { value: "cimb", label: "CIMB Niaga" },
  { value: "permata", label: "Bank Permata" },
  { value: "danamon", label: "Bank Danamon" },
  { value: "maybank", label: "Maybank" },
];

export function PaymentInfo({
  paymentMethods,
  setPaymentMethods,
  onNext,
  onBack,
}: PaymentInfoProps) {
  const [newPayment, setNewPayment] = useState({
    type: "ewallet" as "ewallet" | "bank",
    name: "",
    number: "",
  });

  const addPaymentMethod = () => {
    if (newPayment.name && newPayment.number) {
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: newPayment.type,
        name: newPayment.name,
        number: newPayment.number,
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      setNewPayment({ type: "ewallet", name: "", number: "" });
    }
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
  };

  const updatePaymentMethod = (
    id: string,
    field: keyof PaymentMethod,
    value: string
  ) => {
    setPaymentMethods(
      paymentMethods.map((method) =>
        method.id === id ? { ...method, [field]: value } : method
      )
    );
  };

  const getPaymentIcon = (type: "ewallet" | "bank") => {
    return type === "ewallet" ? Smartphone : CreditCard;
  };

  const getPaymentOptions = (type: "ewallet" | "bank") => {
    return type === "ewallet" ? ewalletOptions : bankOptions;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Information
        </h2>
        <p className="text-gray-600">
          Add your payment methods so others know where to send their share
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Your Payment Methods ({paymentMethods.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.length === 0 && (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No payment methods added yet</p>
              <p className="text-sm text-gray-400">
                Add your e-wallet or bank account information so others can pay
                you back
              </p>
            </div>
          )}

          {paymentMethods.map((method) => {
            const Icon = getPaymentIcon(method.type);
            return (
              <div
                key={method.id}
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <Select
                    value={method.name}
                    onValueChange={(value) =>
                      updatePaymentMethod(method.id, "name", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${
                          method.type === "ewallet" ? "E-Wallet" : "Bank"
                        }`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getPaymentOptions(method.type).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={method.number}
                    onChange={(e) =>
                      updatePaymentMethod(method.id, "number", e.target.value)
                    }
                    placeholder={
                      method.type === "ewallet"
                        ? "Phone number"
                        : "Account number"
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePaymentMethod(method.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          <div className="border-t pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment-type">Payment Type</Label>
                  <Select
                    value={newPayment.type}
                    onValueChange={(value: "ewallet" | "bank") =>
                      setNewPayment({ ...newPayment, type: value, name: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                      <SelectItem value="bank">Bank Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-provider">
                    {newPayment.type === "ewallet"
                      ? "E-Wallet Provider"
                      : "Bank"}
                  </Label>
                  <Select
                    value={newPayment.name}
                    onValueChange={(value) =>
                      setNewPayment({ ...newPayment, name: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${
                          newPayment.type === "ewallet" ? "E-Wallet" : "Bank"
                        }`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getPaymentOptions(newPayment.type).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="payment-number">
                  {newPayment.type === "ewallet"
                    ? "Phone Number"
                    : "Account Number"}
                </Label>
                <Input
                  id="payment-number"
                  value={newPayment.number}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, number: e.target.value })
                  }
                  placeholder={
                    newPayment.type === "ewallet"
                      ? "e.g., 081234567890"
                      : "e.g., 1234567890"
                  }
                />
              </div>
              <Button
                onClick={addPaymentMethod}
                disabled={!newPayment.name || !newPayment.number}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {paymentMethods.length > 0 && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-4">
                {paymentMethods.map((method) => {
                  const Icon = getPaymentIcon(method.type);
                  return (
                    <div
                      key={method.id}
                      className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                    >
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                  );
                })}
              </div>
              <p className="text-blue-800 font-medium">
                {paymentMethods.length} payment method
                {paymentMethods.length !== 1 ? "s" : ""} added
              </p>
              <p className="text-blue-600 text-sm">
                These will be shown in the final summary for easy payment
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to People
        </Button>
        <Button onClick={onNext} className="flex-1">
          Skip, View Split Results
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
