import React, { useState } from 'react';
import { Calendar, CreditCard } from 'lucide-react';
import axios from 'axios';  // Import Axios

const PaymentForm = ({ subtotal, fee, hotelName, hotelImage }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date: "",
    numberOfDays: "",
    hasPromoCode: false
  });

  const [loading, setLoading] = useState(false);  // To manage the loading state
  const [error, setError] = useState("");  // To handle error messages
  const [successMessage, setSuccessMessage] = useState("");  // To handle success messages

  const totalAmount = subtotal + fee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to be sent to the backend
    const paymentData = {
      ...formData,
      subtotal,
      fee,
      totalAmount,
    };

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      // Sending POST request to the backend
      const response = await axios.post('http://localhost:5000/api/payment/create', paymentData, {
        headers: {
          'Content-Type': 'application/json',  // Ensure the content type is set
        }
      });
      
      // Handle the backend response
      if (response.data.success) {
        setSuccessMessage("Payment processed successfully!");
      } else {
        setError("There was an issue with processing your payment.");
      }
    } catch (err) {
      setError("Error: Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Payment details</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                  <div className="relative">
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out pl-10"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="numberOfDays" className="block text-sm font-medium text-gray-700">Number of Days</label>
                  <input
                    id="numberOfDays"
                    name="numberOfDays"
                    type="number"
                    min="1"
                    value={formData.numberOfDays}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="promoCode"
                  name="hasPromoCode"
                  type="checkbox"
                  checked={formData.hasPromoCode}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                />
                <label htmlFor="promoCode" className="text-sm font-medium text-gray-700">I have promo code</label>
              </div>
            </div>
            <div className="space-y-4 bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fee</span>
                <span className="font-medium">${fee}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>${totalAmount}</span>
              </div>
              <button 
                type="submit" 
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center"
                disabled={loading}
              >
                {loading ? 'Processing...' : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Continue to payment
                  </>
                )}
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
        </div>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4">
            <h2 className="font-bold text-2xl mb-2 text-gray-800">{hotelName}</h2>
          </div>
          {hotelImage ? (
            <img
              src={hotelImage}
              alt={hotelName}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-500">
              <span className="text-lg font-medium">Add hotel image here</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
