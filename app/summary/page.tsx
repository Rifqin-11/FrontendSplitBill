"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, DollarSign, Users } from "lucide-react";

interface BillData {
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    assignedTo: string[];
  }>;
}

interface Person {
  id: string;
  name: string;
  color: string;
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

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [billData, setBillData] = useState<BillData | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/share/${id}`
        );
        const json = await res.json();
        setBillData(json.billData);
        setPeople(json.people);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data tagihan");
      }
    };
    fetchData();
  }, [id]);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
    }).format(value);

  const calculatePersonSummaries = (): PersonSummary[] => {
    return people.map((person) => {
      const personItems = billData!.items
        .filter((item) => item.assignedTo.includes(person.id))
        .map((item) => ({
          name: item.name,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          splitPrice: (item.price * item.quantity) / item.assignedTo.length,
          sharedWith: item.assignedTo.length,
        }));

      const itemsTotal = personItems.reduce(
        (sum, item) => sum + item.splitPrice,
        0
      );
      const itemsProportion = itemsTotal / billData!.subtotal;
      const taxPortion = billData!.tax * itemsProportion;
      const servicePortion = billData!.serviceCharge * itemsProportion;
      const discountPortion = billData!.discount * itemsProportion;
      const finalTotal =
        itemsTotal + taxPortion + servicePortion - discountPortion;

      return {
        person,
        items: personItems,
        itemsTotal,
        taxPortion,
        servicePortion,
        discountPortion,
        finalTotal,
      };
    });
  };

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!billData || people.length === 0)
    return <p className="text-center mt-10">Loading...</p>;

  const personSummaries = calculatePersonSummaries();
  const totalCheck = personSummaries.reduce(
    (sum, summary) => sum + summary.finalTotal,
    0
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 mt-4">Split Results</h2>
        <p className="text-gray-600">
          Here&apos;s what everyone owes, including their fair share of tax and
          service charges
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8 mx-2">
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
