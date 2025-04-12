import { useEffect, useState } from "react";
import { TruckIcon, BoxIcon, ShoppingCart, Users } from "lucide-react";
import { useGetDistributorProfileQuery } from "@/app/slices/supplierApiSlice";

import { ChangePassword, DistributorOrders } from "../index";
import { ScrollArea } from "../ui/scroll-area";

function Dashboard() {
  const { data, isLoading } = useGetDistributorProfileQuery();
  const isFirst = data?.distributor.firstlogin;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isFirst === true) {
      setOpen(true);
    }
  }, [isFirst]);

  const dashboardCards = [
    {
      title: "Total Orders",
      value: "1,284",
      change: "+12.5%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Inventory Value",
      value: "$142,384",
      change: "+8.2%",
      trend: "up",
      icon: BoxIcon,
    },
    {
      title: "Active Shipments",
      value: "48",
      change: "-3.1%",
      trend: "down",
      icon: TruckIcon,
    },
    {
      title: "Customers",
      value: "856",
      change: "+5.3%",
      trend: "up",
      icon: Users,
    },
  ];

  const [orders] = useState([
    {
      id: "1",
      orderNumber: "ORD-2024-001",
      customer: "Tech Solutions Inc.",
      status: "in-transit",
      destination: "New York, NY",
      date: "2024-03-15",
      value: "$2,450.00",
    },
    {
      id: "2",
      orderNumber: "ORD-2024-002",
      customer: "Global Retail Co.",
      status: "pending",
      destination: "Los Angeles, CA",
      date: "2024-03-14",
      value: "$1,875.00",
    },
    {
      id: "3",
      orderNumber: "ORD-2024-003",
      customer: "Smart Devices Ltd.",
      status: "delivered",
      destination: "Chicago, IL",
      date: "2024-03-13",
      value: "$3,200.00",
    },
  ]);

  const [inventory] = useState([
    {
      id: "1",
      name: "Premium Laptop",
      sku: "LAP-PRO-001",
      quantity: 45,
      location: "Warehouse A",
      status: "in-stock",
    },
    {
      id: "2",
      name: "Wireless Headphones",
      sku: "ACC-HEAD-002",
      quantity: 12,
      location: "Warehouse B",
      status: "low-stock",
    },
    {
      id: "3",
      name: "Smart Watch",
      sku: "WAT-SMT-003",
      quantity: 0,
      location: "Warehouse A",
      status: "out-of-stock",
    },
  ]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-transit": "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      "in-stock": "bg-green-100 text-green-800",
      "low-stock": "bg-yellow-100 text-yellow-800",
      "out-of-stock": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className=" bg-gray-50">
      <ChangePassword open={open} setOpen={setOpen} />
      <ScrollArea className="flex-1 h-[calc(100vh-65px)]  ">
        <div className=" p-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 my-1 mb-3">
              Welcome back! Here's what's happening with your distribution
              business today.
            </p>
          </div>
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6">
              {dashboardCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white p-6 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <card.icon className="w-8 h-8 text-blue-600" />
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        card.trend === "up"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
            <DistributorOrders />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default Dashboard;
