import {
  Clock,
  Package,
  Truck,
  Users,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  ChevronRight,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useGetAllOrdersAdminQuery } from "@/app/slices/adminApiSlice";
import { Badge } from "../ui/badge";

function AdminDashboard() {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      processing: { color: "bg-blue-100 text-blue-800", label: "Processing" },
      shipped: { color: "bg-purple-100 text-purple-800", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
      <Badge className={`${config.color} hover:${config.color}`}>
        {config.label}
      </Badge>
    );
  };
  const { data } = useGetAllOrdersAdminQuery();
  const orders = data?.orders || [];
  const navigator = useNavigate();
  return (
    <ScrollArea className="flex-1 h-[calc(100vh-1px)]  ">
      <div>
        {/* Main Content */}
        <div className="  pt-16 m-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-1">
                Dashboard Overview
              </h2>
              <p className="text-gray-600">
                Welcome back, Admin! Here's what's happening today.
              </p>
            </div>

          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Orders",
                value: "2,451",
                change: "+12.5%",
                isPositive: true,
                icon: Package,
                color: "blue",
              },
              {
                title: "Active Shipments",
                value: "145",
                change: "+8.2%",
                isPositive: true,
                icon: Truck,
                color: "green",
              },
              {
                title: "Pending Deliveries",
                value: "48",
                change: "-2.4%",
                isPositive: false,
                icon: Clock,
                color: "yellow",
              },
              {
                title: "Customer Issues",
                value: "5",
                change: "-18.3%",
                isPositive: true,
                icon: AlertCircle,
                color: "red",
              },
            ].map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 ring-2 ring-${stat.color}-100 ring-offset-2`}
                  >
                    <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
                  </div>
                  <span
                    className={`flex items-center text-sm font-medium px-2 py-1 rounded-lg ${
                      stat.isPositive
                        ? "text-green-700 bg-green-50"
                        : "text-red-700 bg-red-50"
                    }`}
                  >
                    {stat.change}
                    {stat.isPositive ? (
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 ml-1" />
                    )}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Recent Activity
                </h3>
                <button
                  className="text-blue-600 text-sm hover:text-blue-700 font-medium flex items-center gap-1"
                  onClick={() => navigator("./shipments")}
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 4).map((order, index) => {
                  return (
                    <div key={index} className="activity-item">
                      <div className="flex-1">
                        <div className="flex gap-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-0.5">
                            Order #{order._id.slice(-5).toUpperCase()}
                          </h4>
                          <span>-{order.user.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.orderItems.length} item
                          {order.orderItems.length !== 1 ? "s" : ""} • Total:
                          Rs. {order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Recent Payment
              </h3>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export default AdminDashboard;
