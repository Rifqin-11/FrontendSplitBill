'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { BillData, Person } from '@/app/page';

interface ItemAssignmentProps {
  billData: BillData;
  setBillData: (data: BillData) => void;
  people: Person[];
  onNext: () => void;
  onBack: () => void;
}

export function ItemAssignment({ billData, setBillData, people, onNext, onBack }: ItemAssignmentProps) {
  const togglePersonForItem = (itemId: string, personId: string) => {
    const updatedItems = billData.items.map(item => {
      if (item.id === itemId) {
        const isAssigned = item.assignedTo.includes(personId);
        return {
          ...item,
          assignedTo: isAssigned
            ? item.assignedTo.filter(id => id !== personId)
            : [...item.assignedTo, personId]
        };
      }
      return item;
    });

    setBillData({ ...billData, items: updatedItems });
  };

  const assignItemToAll = (itemId: string) => {
    const updatedItems = billData.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          assignedTo: people.map(p => p.id)
        };
      }
      return item;
    });

    setBillData({ ...billData, items: updatedItems });
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
    }).format(value);

  const clearItemAssignments = (itemId: string) => {
    const updatedItems = billData.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          assignedTo: []
        };
      }
      return item;
    });

    setBillData({ ...billData, items: updatedItems });
  };

  const getPersonById = (id: string) => people.find(p => p.id === id);

  const unassignedItems = billData.items.filter(item => item.assignedTo.length === 0);
  const allItemsAssigned = unassignedItems.length === 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Assign Items to People
        </h2>
        <p className="text-gray-600">
          Select who ordered each item. Items can be shared between multiple
          people.
        </p>
      </div>

      {!allItemsAssigned && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-800 font-medium">
                  {unassignedItems.length} item
                  {unassignedItems.length !== 1 ? "s" : ""} still need to be
                  assigned
                </p>
                <p className="text-orange-600 text-sm">
                  Assign all items to continue to the summary
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-orange-700 border-orange-300"
              >
                {billData.items.length - unassignedItems.length} /{" "}
                {billData.items.length} assigned
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {billData.items.map((item) => (
          <Card
            key={item.id}
            className={`${
              item.assignedTo.length === 0
                ? "border-orange-200"
                : "border-green-200"
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <p className="text-gray-600">
                    {formatRupiah(item.price_per_item)} × {item.quantity} ={" "}
                    {formatRupiah(item.price_per_item * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {item.assignedTo.length > 0 && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                  <Badge
                    variant={
                      item.assignedTo.length > 0 ? "default" : "secondary"
                    }
                  >
                    {item.assignedTo.length} assigned
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {people.map((person) => {
                    const isAssigned = item.assignedTo.includes(person.id);
                    return (
                      <Button
                        key={person.id}
                        variant={isAssigned ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePersonForItem(item.id, person.id)}
                        className={isAssigned ? "text-white" : ""}
                        style={
                          isAssigned
                            ? {
                                backgroundColor: person.color,
                                borderColor: person.color,
                              }
                            : {}
                        }
                      >
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: person.color }}
                        />
                        {person.name}
                        {isAssigned && <Check className="h-4 w-4 ml-1" />}
                      </Button>
                    );
                  })}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => assignItemToAll(item.id)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Assign to All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearItemAssignments(item.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                </div>

                {item.assignedTo.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-2">Assigned to:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.assignedTo.map((personId) => {
                        const person = getPersonById(personId);
                        return person ? (
                          <Badge
                            key={personId}
                            variant="secondary"
                            style={{
                              backgroundColor: `${person.color}20`,
                              color: person.color,
                            }}
                          >
                            {person.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRupiah(
                        ((item.price_per_item * item.quantity) /
                          item.assignedTo.length) *
                          ((billData.subtotal - billData.discount) /
                            billData.subtotal)
                      )}{" "}
                      per person
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex space-x-4 mt-8">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to People
        </Button>
        <Button
          onClick={onNext}
          className="flex-1"
          disabled={!allItemsAssigned}
        >
          View Split Results
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
