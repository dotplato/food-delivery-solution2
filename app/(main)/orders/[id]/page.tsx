import { ClientOrderDetails } from "./client-order-details";

export const metadata = {
  title: "Order Details | Bunhub Burger",
  description: "View your order details and track its status",
};

// Remove generateStaticParams since we're using dynamic rendering
export const dynamic = "force-dynamic";

export default function OrderDetailsPage() {
  return <ClientOrderDetails />;
}
