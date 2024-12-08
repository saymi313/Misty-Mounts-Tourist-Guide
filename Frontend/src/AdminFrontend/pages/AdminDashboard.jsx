import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import SideMenu from "../components/SideMenu";
import TopBar from "../components/TopBar";
import axios from "axios";
const navitem = [
  { img: "/home.png", name: "Home" },
  { img: "/accomodation.png", name: "Accommodation" },
  { img: "/landmark.png", name: "Tourist Spot" },
];

const options2 = {
  chart: {
    type: "areaspline",
    height: 250,
    // width: 500,
    backgroundColor: "transparent",
    spacingBottom: 0,
    spacingLeft: 0,
  },
  tooltip: {
    formatter: function () {
      return this.y;
    },
  },
  plotOptions: {
    areaspline: {
      color: {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [
          [0, "rgba(17, 232, 162, 1)"], // Start color
          [1, "rgba(17, 232, 162, 0)"], // End color (transparent)
        ],
      },
      marker: {
        enabled: false,
      },
    },
  },
  xAxis: {
    lineColor: "transparent",
    lineWidth: 0,
    tickWidth: 0,
    categories: null,
    title: { text: null },
    labels: {
      enabled: false,
    },
    gridLineWidth: 0,
  },
  yAxis: {
    lineColor: "transparent",
    lineWidth: 0,
    categories: null,
    title: {
      text: null,
    },
    labels: {
      enabled: false,
    },
    gridLineWidth: 0,
  },
  title: false,
  series: [
    {
      data: [20, 12, 16, 7, 9, 3, 2],
    },
  ],
  exporting: {
    enabled: false,
  },
  credits: {
    enabled: false,
  },
  legend: {
    enabled: false,
  },
};
const AdminDashboard = () => {
  const [NavOpen, IsNavOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [ChangeOption, SetOptions] = useState(options2);
  const [Reviews, setReviews] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [totalSpots, setTotalSpots] = useState(0);
  const [approvedPercentage, setApprovedPercentage] = useState(0);
  const [unapprovedPercentage, setUnapprovedPercentage] = useState(0);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [totalAmount, setTotalAmount] = useState(0);
  const generateReport = () => {
    const profit = 0.45 * totalAmount;

    // Example Report Data
    const reportData = `
      Profit Report:
      --------------------
      Total Revenue: PKR ${totalAmount}
      Profit Margin: 45%
      Total Profit: PKR ${profit.toFixed(2)}
    `;

    // Log Report in Console
    console.log(reportData);

    // Optionally download as a file
    const blob = new Blob([reportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Profit_Report.txt";
    link.click();
    URL.revokeObjectURL(url);
  };
  const fetchSpotAnalytics = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/spots");
      const spots = response.data;

      // Calculate analytics
      const total = spots.length;
      const approvedCount = spots.filter((spot) => spot.isApproved).length;
      const unapprovedCount = total - approvedCount;

      setTotalSpots(total);
      setApprovedPercentage(((approvedCount / total) * 100).toFixed(2));
      setUnapprovedPercentage(((unapprovedCount / total) * 100).toFixed(2));
    } catch (error) {
      console.error("Error fetching spot analytics:", error);
    }
  };
  const fetchPaymentsAndCalculateTotal = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/payment/");
      console.log("API Response:", data);

      // Extract payments and calculate total amount
      const payments = data.payments; // Adjust based on the response structure
      setPayments(payments);

      // Calculate the total amount
      const totalAmount = payments.reduce(
        (sum, payment) => sum + payment.totalAmount,
        0
      );
      console.log("Total Amount:", totalAmount);

      // Optionally set it to state if required for display
      setTotalAmount(totalAmount);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/feedback/");

      // Check if response has a specific structure
      if (response.data && response.data.feedbacks) {
        setReviews(response.data.feedbacks);
      } else {
        setReviews([]); // Set an empty array if no feedbacks are available
      }

      setLoading(false); // Stop loading spinner after data is fetched
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false); // Stop loading spinner in case of error
    }
  };

  const fetchTopHotels = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/accommodations"
      );
      setAccommodations(response.data);
      setLoading(false); // Set loading to false when data is fetched
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
    fetchTopHotels();
    fetchSpotAnalytics();
    fetchPaymentsAndCalculateTotal();
  }, []);
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };
  // Items per page
  const itemsPerPage = 5;
  // const pageCount = Math.ceil(historydata.length / itemsPerPage);
  // Slice data for current page
  const paginatedData = Reviews.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  // Function to navigate to Tourist Spot Management
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
            <div className="flex flex-col md:flex-col xl:flex-row w-full gap-5">
              <div className="w-full bg-[#FDFDFD] rounded-md shadow-md pt-5 pb-2 flex flex-col gap-5">
                <div className="flex flex-col gap-7 mb-6 px-5 ">
                  <div className="flex justify-between">
                    <h1 className="font-bold text-2xl">Travel History</h1>
                    <button
                      className="bg-green-200 px-4 py-2 rounded-lg hover:scale-105 transition-all"
                      onClick={generateReport}
                    >
                      Generate Report
                    </button>
                  </div>
                  <div className="flex gap-10 justify-between">
                    <div className="flex flex-col lg:flex-row w-full gap-5 justify-between">
                      <div className="bg-gradient-to-b from-teal-400 to-blue-500 p-[1px] rounded-xl cursor-pointer w-full">
                        <div className="hover:shadow-lg p-5 w-full bg-white flex-col rounded-[11px] xl:rounded-[13px] flex gap-4 ">
                          <div className="text-[#637381] text-sm font-semibold">
                            Total Revenue
                          </div>
                          <div className="flex justify-between">
                            <div className="text-black text-2xl font-extrabold">
                              PKR {totalAmount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:flex-row w-full gap-5 justify-between">
                      <div className="bg-gradient-to-b from-teal-400 to-blue-500 p-[1px] rounded-xl cursor-pointer w-full">
                        <div className="hover:shadow-lg p-5 w-full bg-white flex-col rounded-[11px] xl:rounded-[13px] flex gap-4 ">
                          <div className="text-[#637381] text-sm font-semibold">
                            Total Profit
                          </div>
                          <div className="flex justify-between">
                            <div className="text-black text-2xl font-extrabold">
                              PKR {0.45 * totalAmount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <h1 className="ml-4 text-2xl font-bold">Recent Reviews</h1>
                <div className="overflow-x-auto flex flex-col min-h-[300px]">
                  <div className="w-full overflow-x-scroll md:overflow-auto max-w-xl xs:max-w-xl sm:max-w-xl md:max-w-7xl 2xl:max-w-none mt-1">
                    <div className="overflow-scroll md:overflow-auto w-full text-left">
                      {paginatedData.map((data, index) => (
                        <div
                          key={index}
                          className="cursor-pointer border-gray-100 hover:bg-[#D8FFFF] transition-colors duration-300 flex items-center w-full h-[80px] justify-between text-[#637381] font-semibold text-sm border-t border-b px-5"
                        >
                          <div className="flex gap-5 min-w-[200px]">
                            <h1 className="text-black font-normal">
                              {data.locationName}
                            </h1>
                          </div>
                          <div className="px-4">{data.rating}</div>
                          <div className="flex gap-1 px-4 w-[20vw]">
                            <h3>{data.message}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between px-5 items-end text-[#637381] mt-3 text-sm">
                    <ReactPaginate
                      className="flex gap-3 items-center"
                      previousLabel={
                        <img
                          src="/left.png"
                          alt="previous"
                          className="w-5 h-5" // Adjust size as needed
                        />
                      }
                      nextLabel={
                        <img
                          src="/next.png"
                          alt="next"
                          className="w-5 h-5" // Adjust size as needed
                        />
                      }
                      breakLabel={"..."}
                      pageCount={2}
                      pageLinkClassName="w-5 h-5 text-center"
                      pageClassName="hover:bg-gray-200 rounded-[2px] w-5 h-5 flex items-center justify-center"
                      marginPagesDisplayed={1}
                      pageRangeDisplayed={3}
                      onPageChange={handlePageChange}
                      containerClassName={"pagination"}
                      activeClassName={
                        "bg-[#D8FFFF] rounded-[2px] w-5 h-5 flex justify-center items-center border-[#12ECA1] border"
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="w-full xl:w-3/12 gap-5 flex flex-col md:flex-row xl:flex-col ">
                <div className="w-full xl:w-full md:h-auto xl:h-1/2 bg-[#FDFDFD] rounded-xl px-5 py-5 flex flex-col justify-between gap-10 ">
                  <div className="flex justify-between">
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <h2>
                      Total{" "}
                      <span className="text-[#09D7C9] text-lg">
                        {totalSpots}
                      </span>
                    </h2>
                  </div>
                  <div className="flex flex-col gap-6 text-sm">
                    <div>
                      <div className="flex justify-between">
                        <div className="text-[#637381] font-semibold">
                          Confirm
                        </div>
                        <div className="text-[#3056D3]">
                          {approvedPercentage}%
                        </div>
                      </div>
                      <div className="bg-gray-200 rounded-3xl">
                        <div
                          className="h-2 bg-[#3056D3] rounded-3xl"
                          style={{ width: `${approvedPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <div className="text-[#637381] font-semibold">
                          Cancelled
                        </div>
                        <div className="text-[#DC3545]">
                          {unapprovedPercentage}%
                        </div>
                      </div>
                      <div className="bg-gray-200 rounded-3xl">
                        <div
                          className="h-2 w-[12%] bg-[#DC3545] rounded-3xl"
                          style={{ width: `${unapprovedPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-[#637381] font-normal">
                    Spots analytics calculated based on approval and disapproval
                  </div>
                </div>
                <div className="lg:h-auto xl:h-1/2 bg-[#FDFDFD] flex flex-col  rounded-xl">
                  <div className="text-[24px] p-5 flex flex-col gap-3 justify-between">
                    <h1 className="text-[#212B36] font-bold ">Expense</h1>
                    <h2 className="font-extrabold">
                      PKR {(0.2 * totalAmount).toFixed(1)}
                    </h2>
                  </div>
                  <div>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={options2}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#FDFDFD] rounded-xl shadow-lg p-5 flex flex-col gap-4 max-w-[100vw]">
              <div className="text-2xl text-[#212B36] font-bold">
                Top Hotels
              </div>
              <div className="flex-col flex md:flex-row gap-5 overflow-auto no-scrollbar py-2 px-2">
                {accommodations.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="hover:shadow-md xl:max-w-full drop-shadow-md w-full bg-white shadow-sm rounded-2xl p-5 cursor-pointer flex flex-col gap-4 justify-center items-center"
                    >
                      <div className="flex justify-center w-[260px] md:w-[299px] opacity-100 transition duration-300 ease-in-out hover:opacity-80">
                        <img src={data.picture} alt="" className="h-[224px]" />
                      </div>
                      <div className="w-full flex flex-col gap-4">
                        <div className="text-xl font-semibold text-[#212B36] w-full">
                          {data.name}
                        </div>
                        <div className="text-lg font-semibold text-[#212B36] w-full">
                          {data.location}
                        </div>
                        <div className="text-[#637381] flex justify-between items-center">
                          <div className=" font-bold text-xl">
                            Rs: {data.price} / day
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
const LeftArrow = () => {
  return <img src="/assets/travelagency-admin/leftarrow.svg" />;
};
const RightArrow = () => {
  return <img src="/assets/travelagency-admin/rightarrow.svg" />;
};
