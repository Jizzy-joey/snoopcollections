
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatMoney } from "../config/store";
import "../Admin.css";
import { getImageUrl } from "../utils/imageUrl";


function getAdminImageUrl(item) {
  // Use the image filename/path saved with the order.
  const image = item?.image;

  if (image) {
    // If it is already a full URL, use it.
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    // Resolve local images using the current
    // deployment's Vite base path.
    return getImageUrl(image);
  }

  // Fall back to the original URL saved in Supabase.
  return item?.image_url || "";
}



const STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          navigate("/admin/login", {
            replace: true,
          });
          return;
        }

        const { data: admin, error: adminError } =
          await supabase
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (adminError || !admin) {
          await supabase.auth.signOut();
          navigate("/admin/login", {
            replace: true,
          });
          return;
        }

        const { data, error: ordersError } =
          await supabase
            .from("orders")
            .select("*")
            .order("created_at", {
              ascending: false,
            });

        if (ordersError) throw ordersError;

        if (active) setOrders(data || []);
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load orders."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function refreshOrders() {
    setError("");

    const { data, error: fetchError } =
      await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setOrders(data || []);
  }

  async function updateStatus(id, status) {
    setUpdatingId(id);
    setError("");

    const { error: updateError } =
      await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setOrders((previous) =>
        previous.map((order) =>
          order.id === id
            ? { ...order, status }
            : order
        )
      );
    }

    setUpdatingId(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin/login", {
      replace: true,
    });
  }

  if (loading) {
    return (
      <main className="admin-page">
        <p>Checking admin access and loading orders...</p>
      </main>
    );
  }

  const pending = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const delivered = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">
            SNOOPCOLLECTIONS
          </p>
          <h1>Admin Dashboard</h1>
          <p>Manage your sneaker orders.</p>
        </div>

        <div className="admin-actions">
          <button
            type="button"
            onClick={refreshOrders}
          >
            Refresh Orders
          </button>

          <Link to="/">View Store</Link>

          <button
            type="button"
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      </header>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-stats">
        <div className="admin-stat">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div className="admin-stat">
          <span>Pending Orders</span>
          <strong>{pending}</strong>
        </div>

        <div className="admin-stat">
          <span>Delivered Orders</span>
          <strong>{delivered}</strong>
        </div>
      </div>

      <section className="admin-orders">
        <h2>Customer Orders</h2>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="admin-order-card"
            >
              <div className="admin-order-heading">
                <div>
                  <h3>{order.reference}</h3>
                  <small>
                    {new Date(
                      order.created_at
                    ).toLocaleString("en-NG")}
                  </small>
                </div>

                <div className="admin-status">
                  <label htmlFor={`status-${order.id}`}>
                    Order Status
                  </label>

                  <select
                    id={`status-${order.id}`}
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(event) =>
                      updateStatus(
                        order.id,
                        event.target.value
                      )
                    }
                  >
                    {STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-customer">
                <h4>Customer Details</h4>
                <p>
                  <strong>Name:</strong>{" "}
                  {order.customer?.fullName}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {order.customer?.phone}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {order.customer?.email}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {order.customer?.address},{" "}
                  {order.customer?.city},{" "}
                  {order.customer?.state}
                </p>
                <p>
                  <strong>Notes:</strong>{" "}
                  {order.customer?.notes || "None"}
                </p>
              </div>

              <h4>Sneakers Ordered</h4>

              <div className="admin-products">
                {(order.items || []).map(
                  (item, index) => (
                    <div
                      key={`${item.id}-${item.size}-${index}`}
                      className="admin-product"
                    >
                      {item.image_url && (
                        <a
                          href={item.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={getAdminImageUrl(item)}
                            alt={item.name}
                            loading="lazy"
                          />
                        </a>
                      )}

                      <div>
                        <strong>{item.name}</strong>
                        <p>Size: EU {item.size}</p>
                        <p>
                          Quantity: {item.quantity}
                        </p>
                        <p>
                          Unit Price:{" "}
                          {formatMoney(
                            Number(item.price)
                          )}
                        </p>
                        <p>
                          Item Total:{" "}
                          {formatMoney(
                            Number(item.price) *
                            Number(item.quantity)
                          )}
                        </p>
                        {item.image_url && (
                          <a
                            href={item.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open Shoe Picture
                          </a>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="admin-totals">
                <p>
                  Subtotal:{" "}
                  {formatMoney(
                    Number(order.subtotal)
                  )}
                </p>
                <p>
                  Delivery:{" "}
                  {formatMoney(
                    Number(order.delivery_fee)
                  )}
                </p>
                <strong>
                  Total:{" "}
                  {formatMoney(
                    Number(order.total)
                  )}
                </strong>
                <p>
                  Payment Method:{" "}
                  {order.payment_method === "transfer"
                    ? "Bank Transfer"
                    : "WhatsApp"}
                </p>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
