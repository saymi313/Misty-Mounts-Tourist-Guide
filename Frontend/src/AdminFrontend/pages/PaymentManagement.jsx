import React, { useEffect, useState } from "react";
import axios from "axios";
import TopBar from "../components/TopBar";
import SideMenu from "../components/SideMenu";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [editMode, setEditMode] = useState(null); // Tracks payment being edited
  const [editData, setEditData] = useState({}); // Temporary storage for editing
  const [loading, setLoading] = useState(true); // Loading state
  const [NavOpen, IsNavOpen] = useState(false);

  // Fetch payments from the backend
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/payment/");
      console.log("API Response:", data);
      setPayments(data.payments); // Adjust based on response structure
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Approve or disapprove a payment
  const handleApproval = async (paymentId, isApproved) => {
    try {
      await axios.put("http://localhost:5000/api/payment/approve", {
        paymentId,
        isApproveBooking: isApproved,
      });
      fetchPayments(); // Refresh list after approval
    } catch (error) {
      console.error("Error approving payment:", error);
    }
  };

  // Enable editing mode
  const handleEdit = (paymentId) => {
    setEditMode(paymentId);
    const payment = payments.find((p) => p._id === paymentId);
    setEditData(payment || {}); // Pre-fill form with current data or empty object
  };

  // Save edited payment details
  const saveEdit = async () => {
    try {
      await axios.put("http://localhost:5000/api/payment/approve", {
        paymentId: editMode,
        ...editData, // Updated details
      });
      setEditMode(null);
      fetchPayments();
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };
  const navigate = useNavigate(); // Initialize navigate

  const goToTouristSpotManagement = () => {
    navigate("/admin/tourist-spots"); // Navigating to the tourist spots management page
  };

  const goToAccommodationManagement = () => {
    navigate("/admin/accommodation"); // Navigating to the tourist spots management page
  };

  const goToAdminDashboard = () => {
    navigate("/admin/dashboard"); // Navigating to the tourist spots management page
  };

  const goToTransportManagement = () => {
    navigate("/admin/transportation"); // Navigating to the tourist spots management page
  };
  const goToPaymentManagement = () => {
    navigate("/admin/payments"); // Navigating to the tourist spots management page
  };


  return (
    <div className="flex">
      <SideMenu
        NavOpen={NavOpen}
        IsNavOpen={IsNavOpen}
        goToAdminDashboard={goToAdminDashboard}
        goToAccommodationManagement={goToAccommodationManagement}
        goToTouristSpotManagement={goToTouristSpotManagement}
        goToTransportManagement={goToTransportManagement}
        goToPaymentManagement={goToPaymentManagement}
      />
      <div className="w-full flex flex-col md:ml-20">
        <TopBar NavOpen={NavOpen} IsNavOpen={IsNavOpen} />
        <div className="transition-all duration-1000 ease-in-out">
          <div
            className={`flex flex-col w-full justify-between gap-5 p-5 mt-20 ${
              NavOpen
                ? "md:max-w-[calc(100vw_-_100px)] sm:max-w-[calc(100vw_-_160px)] md:pl-36 transition-all duration-500"
                : "md:max-w-[calc(100vw_-_100px)] transition-all duration-500"
            }`}
          >
            <div className="p-6 bg-gray-100 min-h-screen">
              <h2 className="text-2xl font-bold mb-6">Manage Payments</h2>

              {loading ? (
                <div>Loading payments...</div>
              ) : payments.length === 0 ? (
                <div>No payments found.</div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                  <table className="table-auto w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200 text-left text-sm uppercase">
                        <th className="px-4 py-2">First Name</th>
                        <th className="px-4 py-2">Last Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Phone</th>
                        <th className="px-4 py-2">Hotel</th>
                        <th className="px-4 py-2">Total</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id} className="border-t">
                          {editMode === payment._id ? (
                            <>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={editData.firstName || ""}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      firstName: e.target.value,
                                    })
                                  }
                                  className="border p-2 rounded w-full"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={editData.lastName || ""}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      lastName: e.target.value,
                                    })
                                  }
                                  className="border p-2 rounded w-full"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="email"
                                  value={editData.email || ""}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      email: e.target.value,
                                    })
                                  }
                                  className="border p-2 rounded w-full"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={editData.phone || ""}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      phone: e.target.value,
                                    })
                                  }
                                  className="border p-2 rounded w-full"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={editData.hotelName || ""}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      hotelName: e.target.value,
                                    })
                                  }
                                  className="border p-2 rounded w-full"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={editData.totalAmount || ""}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      totalAmount: e.target.value,
                                    })
                                  }
                                  className="border p-2 rounded w-full"
                                />
                              </td>
                              <td className="px-4 py-2">
                                {editData.isApproveBooking
                                  ? "Approved"
                                  : "Pending"}
                              </td>
                              <td className="px-4 py-2 space-y-0">
                                <button
                                  onClick={saveEdit}
                                  className="bg-green-500 text-white px-4 py-2 rounded mb-2 w-20"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditMode(null)}
                                  className="bg-gray-500 text-white px-4 py-2 rounded w-20"
                                >
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-2">{payment.firstName}</td>
                              <td className="px-4 py-2">{payment.lastName}</td>
                              <td className="px-4 py-2">{payment.email}</td>
                              <td className="px-4 py-2">{payment.phone}</td>
                              <td className="px-4 py-2">{payment.hotelName}</td>
                              <td className="px-4 py-2">
                                {payment.totalAmount}
                              </td>
                              <td className="px-4 py-2">
                                {payment.isApproveBooking
                                  ? "Approved"
                                  : "Pending"}
                              </td>
                              <td className="px-4 py-2 ">
                                <button
                                  onClick={() =>
                                    handleApproval(payment._id, true)
                                  }
                                  className="h-16 w-16 text-white rounded-full hover:bg-gray-200 px-4 py-2 transition duration-300"
                                >
                                  <img src="/mark.png" alt="Approve" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleApproval(payment._id, false)
                                  }
                                  className="h-16 w-16 text-white rounded-full hover:bg-gray-200 px-4 py-2 transition duration-300"
                                >
                                  <img src="/trash.png" alt="Disapprove" />
                                </button>
                                <button
                                  onClick={() => handleEdit(payment._id)}
                                  className="h-16 w-16 text-white rounded-full hover:bg-gray-200 px-4 py-2 transition duration-300"
                                >
                                  <img src="/pen.png" alt="Edit" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsManagement;
