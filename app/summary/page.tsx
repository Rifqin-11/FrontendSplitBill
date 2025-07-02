// app/summary/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/share/${id}`
        );
        if (!res.ok) throw new Error("Gagal fetch data");

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch shared bill data.");
      }
    };

    fetchData();
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p>Loading shared bill...</p>;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Shared Bill Summary</h1>
      <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
