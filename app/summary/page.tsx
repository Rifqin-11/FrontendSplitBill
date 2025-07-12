"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  DollarSign,
  Users,
  Smartphone,
  CreditCard,
} from "lucide-react";

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

interface PaymentMethod {
  id: string;
  type: "ewallet" | "bank";
  name: string;
  number: string;
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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [error, setError] = useState("");

  // Fetch data when component mounts or id changes
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
        setPaymentMethods(json.paymentMethods || []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data tagihan");
      }
    };
    fetchData();
  }, [id]);

  // Format numbers as Indonesian Rupiah
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
    }).format(value);

  // Get payment method label based on type
  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<string, string> = {
      gopay: "GoPay",
      ovo: "OVO",
      dana: "DANA",
      shopeepay: "ShopeePay",
      linkaja: "LinkAja",
      jenius: "Jenius",
      bca: "BCA",
      mandiri: "Bank Mandiri",
      bni: "BNI",
      bri: "BRI",
      cimb: "CIMB Niaga",
      permata: "Bank Permata",
      danamon: "Bank Danamon",
      maybank: "Maybank",
      linebank: "Line Bank",
      bankjago: "Bank Jago",
    };
    return labels[method.name] || method.name;
  };

  const calculatePersonSummaries = (): PersonSummary[] => {
    // calculate individual summaries
    const personSummaries = people.map((person) => {
      const personItems = billData!.items
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

      // proportion of items to subtotal
      const itemsProportion =
        billData!.subtotal > 0 ? itemsTotal / billData!.subtotal : 0;
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

    // calculate unassigned items
    const unassignedItems = billData!.items.filter(
      (item) => item.assignedTo.length === 0
    );
    const unassignedSubtotal = unassignedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // if there are unassigned items, distribute their cost evenly
    if (unassignedSubtotal > 0 && billData!.subtotal > 0) {
      const unassignedProportion = unassignedSubtotal / billData!.subtotal;
      const unassignedTax = billData!.tax * unassignedProportion;
      const unassignedSvc = billData!.serviceCharge * unassignedProportion;
      const unassignedDisc = billData!.discount * unassignedProportion;

      const totalUnassignedCost =
        unassignedSubtotal + unassignedTax + unassignedSvc - unassignedDisc;

      const sharePerPerson = totalUnassignedCost / people.length;
      personSummaries.forEach((summary) => {
        summary.finalTotal += sharePerPerson;
      });
    }

    return personSummaries;
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
    <div className="max-w-4xl mx-auto px-4 mt-6 mb-10">
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

      {/* Payment Methods */}
      {paymentMethods.length > 0 && (
        <Card className="mb-8 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => {
                const Icon =
                  method.type === "ewallet" ? Smartphone : CreditCard;
                return (
                  <div
                    key={method.id}
                    className="flex items-center p-3 bg-white rounded-lg border"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mr-3">
                      <Icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getPaymentMethodLabel(method)}
                      </p>
                      <p className="text-sm text-gray-600">{method.number}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
