"use client";
import { useState } from "react";

export default function CheckoutPage() {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerData, setCustomerData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    street: "",
    building: "",
    apartment: "",
    floor: "",
    city: "",
    country: "GB",
    postal_code: "",
    state: "",
  });

  const prices = [100, 300, 1000]; // Prices in GBP

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriceSelect = (price: number) => {
    setSelectedPrice(price);
    setShowCustomerForm(true);
  };

  const handleCheckout = async () => {
    if (!selectedPrice) {
      alert("Please select a service option.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/paymob/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          price: selectedPrice,
          customerData: customerData
        }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        // Reset loading state before redirecting
        setLoading(false);
        // Redirect the user to the Paymob payment page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || "Failed to initiate payment.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(`Checkout error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Select Your Service</h1>
      <div style={{ margin: "1rem 0", textAlign: "center" }}>
        {prices.map((price) => (
          <label key={price} style={{ margin: "0 1rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="price"
              value={price}
              checked={selectedPrice === price}
              onChange={() => handlePriceSelect(price)}
              style={{ marginRight: "0.5rem" }}
            />
            £{price}
          </label>
        ))}
      </div>

      {showCustomerForm && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Your Information</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                First Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={customerData.first_name}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Last Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={customerData.last_name}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Email <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={customerData.email}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={customerData.phone_number}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Street</label>
              <input
                type="text"
                name="street"
                value={customerData.street}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Building</label>
              <input
                type="text"
                name="building"
                value={customerData.building}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Apartment</label>
              <input
                type="text"
                name="apartment"
                value={customerData.apartment}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Floor</label>
              <input
                type="text"
                name="floor"
                value={customerData.floor}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                City <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={customerData.city}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={customerData.postal_code}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Country <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="country"
                value={customerData.country}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>State/Province</label>
              <input
                type="text"
                name="state"
                value={customerData.state}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={handleCheckout}
          disabled={loading || !selectedPrice}
          style={{ 
            padding: "0.75rem 1.5rem", 
            backgroundColor: "#4CAF50", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: loading || !selectedPrice ? "not-allowed" : "pointer",
            opacity: loading || !selectedPrice ? 0.7 : 1
          }}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
