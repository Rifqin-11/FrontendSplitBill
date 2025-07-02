'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Plus, Trash2, Receipt, ArrowRight, CircleCheck } from 'lucide-react';
import { BillData, BillItem } from '@/app/page';
import Image from 'next/image';

interface BillEditorProps {
  billData: BillData;
  setBillData: (data: BillData) => void;
  onNext: () => void;
  uploadedImage: string | null;
}

export function BillEditor({ billData, setBillData, onNext, uploadedImage }: BillEditorProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const updateItem = (
    id: string,
    field: keyof BillItem,
    value: string | number
  ) => {
    const updatedItems = billData.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );

    const newSubtotal = updatedItems.reduce((sum, item) => {
      const discount = item.discount ?? 0;
      const itemTotal = item.price * item.quantity * (1 - discount / 100);
      return sum + itemTotal;
    }, 0);

    const newTotal = newSubtotal + billData.tax + billData.serviceCharge - billData.discount;


    setBillData({
      ...billData,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newTotal,
    });
  };

  const deleteItem = (id: string) => {
    const updatedItems = billData.items.filter(item => item.id !== id);
    const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newTotal = newSubtotal + billData.tax + billData.serviceCharge;

    setBillData({
      ...billData,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newTotal,
    });
  };

  const addNewItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      name: 'New Item',
      quantity: 1,
      price: 0,
      assignedTo: [],
    };

    setBillData({
      ...billData,
      items: [...billData.items, newItem],
    });

    setEditingItem(newItem.id);
  };

  const updateTaxAndService = (field: 'tax' | 'serviceCharge', value: number) => {
    const newData = { ...billData, [field]: value };
    newData.total = newData.subtotal + newData.tax + newData.serviceCharge;
    setBillData(newData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Review Your Receipt
        </h2>
        <p className="text-gray-600">
          Check the extracted items and make any necessary corrections
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {uploadedImage && (
          <Card className="lg:order-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Original Receipt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={uploadedImage}
                alt="Uploaded receipt"
                width={600}
                height={400}
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </CardContent>
          </Card>
        )}

        <div className="lg:order-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bill Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {billData.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    {editingItem === item.id ? (
                      <div className="space-y-2">
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            updateItem(item.id, "name", e.target.value)
                          }
                          className="font-medium"
                        />
                        <div className="grid grid-rows-2 gap-2 items-center">
                          <div className="w-full flex flex-row gap-2 items-center">
                            <p className="w-1/3">Qty:</p>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="Qty"
                              className="w-full"
                            />
                          </div>
                          <div className="w-full flex flex-row gap-2 items-center">
                            <p className="w-1/3">Price:</p>
                            <Input
                              type="number"
                              step="1"
                              value={item.price}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="Price"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity} ×{" "}
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(item.price)}{" "}
                          ={" "}
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(item.quantity * item.price)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingItem(editingItem === item.id ? null : item.id)
                      }
                    >
                      {editingItem === item.id ? (
                        <CircleCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addNewItem}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tax">Tax/PPN (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="1"
                    value={((billData.tax / billData.subtotal) * 100).toFixed(
                      1
                    )}
                    onChange={(e) => {
                      const percentage = parseFloat(e.target.value) || 0;
                      const taxValue = (billData.subtotal * percentage) / 100;
                      updateTaxAndService("tax", taxValue);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="service">Service Charge</Label>
                  <Input
                    id="service"
                    type="number"
                    step="1"
                    value={billData.serviceCharge}
                    onChange={(e) =>
                      updateTaxAndService(
                        "serviceCharge",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="1"
                    value={billData.discount}
                    onChange={(e) => {
                      const discountValue = parseFloat(e.target.value) || 0;
                      const newTotal =
                        billData.subtotal +
                        billData.tax +
                        billData.serviceCharge -
                        discountValue;
                      setBillData({
                        ...billData,
                        discount: discountValue,
                        total: newTotal,
                      });
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(billData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>
                    -{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(billData.discount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(billData.tax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge:</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(billData.serviceCharge)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(billData.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={onNext} className="w-full" size="lg">
            Continue to Add People
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
