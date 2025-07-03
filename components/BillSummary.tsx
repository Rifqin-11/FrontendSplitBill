'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, RefreshCw, Receipt, DollarSign, Users } from 'lucide-react';
import { BillData, Person } from '@/app/page';

interface BillSummaryProps {
  billData: BillData;
  people: Person[];
  onStartOver: () => void;
}

interface PersonSummary {
  person: Person;
  items: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
    splitPrice: number;
    sharedWith: number;
  }>;
  itemsTotal: number;
  taxPortion: number;
  servicePortion: number;
  discountPortion: number;
  finalTotal: number;
}

export function BillSummary({ billData, people, onStartOver }: BillSummaryProps) {
  const calculatePersonSummaries = (): PersonSummary[] => {
    // Langkah 1: Kalkulasi seperti biasa untuk item yang sudah dibagikan
    const personSummaries = people.map((person) => {
      const personItems = billData.items
        .filter((item) => item.assignedTo.includes(person.id))
        .map((item) => ({
          name: item.name,
          quantity: item.quantity,
          totalPrice: item.price,
          splitPrice: item.price / item.assignedTo.length,
          sharedWith: item.assignedTo.length,
        }));

      const itemsTotal = personItems.reduce(
        (sum, item) => sum + item.splitPrice,
        0
      );

      const itemsProportion =
        billData.subtotal > 0 ? itemsTotal / billData.subtotal : 0;
      const taxPortion = billData.tax * itemsProportion;
      const servicePortion = billData.serviceCharge * itemsProportion;
      const discountPortion = billData.discount * itemsProportion;
      const finalTotal =
        itemsTotal + taxPortion + servicePortion - discountPortion;

      return {
        person,
        items: personItems,
        itemsTotal,
        taxPortion,
        servicePortion,
        finalTotal,
        discountPortion,
      };
    });

    // ✅ LANGKAH 2: Hitung total biaya dari semua item yang BELUM DIBAGIKAN
    const unassignedItems = billData.items.filter(
      (item) => item.assignedTo.length === 0
    );
    const unassignedSubtotal = unassignedItems.reduce(
      (sum, item) => sum + item.price,
      0
    );

    if (unassignedSubtotal > 0 && billData.subtotal > 0) {
      const unassignedProportion = unassignedSubtotal / billData.subtotal;
      const unassignedTax = billData.tax * unassignedProportion;
      const unassignedService = billData.serviceCharge * unassignedProportion;
      const unassignedDiscount = billData.discount * unassignedProportion;
      const totalUnassignedCost =
        unassignedSubtotal +
        unassignedTax +
        unassignedService -
        unassignedDiscount;

      // ✅ LANGKAH 3: Bagi biaya item tak terbagi secara merata ke semua orang
      if (people.length > 0) {
        const shareOfUnassignedCost = totalUnassignedCost / people.length;
        personSummaries.forEach((summary) => {
          summary.finalTotal += shareOfUnassignedCost;
        });
      }
    }

    return personSummaries;
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
    }).format(value);

  const personSummaries = calculatePersonSummaries();
  const totalCheck = personSummaries.reduce((sum, summary) => sum + summary.finalTotal, 0);

  const copyToClipboard = async () => {
    const summary = generateTextSummary();
    await navigator.clipboard.writeText(summary);
    // You could add a toast notification here
  };

  const generateTextSummary = () => {
    let text = '💰 Bill Split Summary\n\n';

    personSummaries.forEach(summary => {
      text += `${summary.person.name}: Rp.${summary.finalTotal.toFixed(2)}\n`;
      summary.items.forEach(item => {
        const sharedText = item.sharedWith > 1 ? ` (shared with ${item.sharedWith - 1} other${item.sharedWith > 2 ? 's' : ''})` : '';
        text += `  • ${item.name}: Rp.${item.splitPrice.toFixed(2)}${sharedText}\n`;
      });
      text += `  Tax: ${formatRupiah(summary.taxPortion)}\n`;
      text += `  Service: ${formatRupiah(summary.servicePortion)}\n\n`;
    });

    text += `Total Bill: ${formatRupiah(billData.total)}\n`;
    text += `Total Check: ${formatRupiah(totalCheck)}`;

    return text;
  };

  const shareResults = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/share`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ billData, people }),
        }
      );

      const data = await response.json();
      const shareUrl = `${window.location.origin}/summary?id=${data.id}`;

      if (navigator.share) {
        await navigator.share({
          title: "SplitBill Summary",
          text: "Here's what we owe from the bill",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard: " + shareUrl);
      }
    } catch (error) {
      console.error("Failed to share:", error);
      alert("Failed to share result");
    }
  };


  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Split Results</h2>
        <p className="text-gray-600">
          Here&apos;s what everyone owes, including their fair share of tax and
          service charges
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600">Total Bill</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatRupiah(billData.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-600">
                  Split Between
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {people.length} People
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-teal-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-teal-600">Check Total</p>
                <p className="text-2xl font-bold text-teal-900">
                  {formatRupiah(totalCheck)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Summaries */}
      <div className="space-y-6 mb-8">
        {personSummaries.map((summary) => (
          <Card
            key={summary.person.id}
            className="border-l-4"
            style={{ borderLeftColor: summary.person.color }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold mr-3"
                    style={{ backgroundColor: summary.person.color }}
                  >
                    {summary.person.name.charAt(0).toUpperCase()}
                  </div>
                  {summary.person.name}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="text-lg font-bold px-3 py-1"
                  style={{
                    backgroundColor: `${summary.person.color}20`,
                    color: summary.person.color,
                  }}
                >
                  {formatRupiah(summary.finalTotal)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name}
                      {item.sharedWith > 1 && (
                        <span className="text-gray-500 ml-1">
                          (shared with {item.sharedWith - 1} other
                          {item.sharedWith > 2 ? "s" : ""})
                        </span>
                      )}
                    </span>
                    <span>{formatRupiah(item.splitPrice)}</span>
                  </div>
                ))}

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Items subtotal:</span>
                    <span>{formatRupiah(summary.itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax portion:</span>
                    <span>{formatRupiah(summary.taxPortion)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service portion:</span>
                    <span>{formatRupiah(summary.servicePortion)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Discount portion:</span>
                    <span>-{formatRupiah(summary.discountPortion)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t">
                    <span>Total:</span>
                    <span>{formatRupiah(summary.finalTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={shareResults} className="flex-1" size="lg">
          <Share2 className="h-5 w-5 mr-2" />
          Share Results
        </Button>
        <Button
          onClick={copyToClipboard}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <Copy className="h-5 w-5 mr-2" />
          Copy Summary
        </Button>
        <Button
          onClick={onStartOver}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Split Another Bill
        </Button>
      </div>

      {/* Verification Notice */}
      <Card className="mt-6 bg-gray-50">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 text-center">
            ✅ Total verification: Original bill {formatRupiah(billData.total)}{" "}
            = Split total {formatRupiah(totalCheck)}
            {Math.abs(billData.total - totalCheck) < 0.01
              ? " ✓"
              : " ⚠️ Rounding difference detected"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
