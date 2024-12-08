
import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import SideMenu from "../components/SideMenu";
import TopBar from "../components/TopBar";
const navitem = [
  { img: "/home.png", name: "Home" },
  { img: "/accomodation.png", name: "Accommodation" },
  { img: "/landmark.png", name: "Tourist Spot" },
];
const cardinfo = [
  {
    title: "Total Profit",
    digit: "52,329",
  },
  {
    title: "Total Revenue",
    digit: "78,200",
  },
  {
    title: "Total Visitors",
    digit: "22,500",
  },
];
const historydata = [
  {
    img: "/assets/travelagency-admin/china.svg",
    country: "China",
    place: "The great wall of China",
    night: "5",
    departuredate: "10Jan, 2023",
    arrivaldate: "16Jan, 2023",
    people: "2",
    price: "$124",
  },
  {
    img: "/assets/travelagency-admin/tajmahal.svg",
    country: "India",
    place: "Taj Mahal",
    night: "4",
    departuredate: "8Dec, 2023",
    arrivaldate: "21 Dec, 2023",
    people: "2",
    price: "$140",
  },
  {
    img: "/assets/travelagency-admin/niagrafall.svg",
    country: "Canada",
    place: "Niagara Falls",
    night: "12",
    departuredate: "11 Dec, 2023",
    arrivaldate: "11 Dec, 2023",
    people: "5",
    price: "$560",
  },
  {
    img: "/assets/travelagency-admin/italy.svg",
    country: "Italy",
    place: "Greate Barrier Reef",
    night: "3",
    departuredate: "22 Dec, 2023",
    arrivaldate: "25 Dec, 2023",
    people: "2",
    price: "$200",
  },
  {
    img: "/assets/travelagency-admin/piramid.svg",
    country: "Greek",
    place: "Piramid",
    night: "4",
    departuredate: "24 Dec, 2023",
    arrivaldate: "28 Dec, 2023",
    people: "3",
    price: "$900",
  },
  // Pagination check
  {
    img: "/assets/travelagency-admin/china.svg",
    country: "China",
    place: "The great wall of China",
    night: "5",
    departuredate: "10Jan, 2023",
    arrivaldate: "16Jan, 2023",
    people: "2",
    price: "$124",
  },
  {
    img: "/assets/travelagency-admin/tajmahal.svg",
    country: "India",
    place: "Taj Mahal",
    night: "4",
    departuredate: "8Dec, 2023",
    arrivaldate: "21 Dec, 2023",
    people: "2",
    price: "$140",
  },
  {
    img: "/assets/travelagency-admin/niagrafall.svg",
    country: "Canada",
    place: "Niagara Falls",
    night: "12",
    departuredate: "11 Dec, 2023",
    arrivaldate: "11 Dec, 2023",
    people: "5",
    price: "$560",
  },
  {
    img: "/assets/travelagency-admin/italy.svg",
    country: "Italy",
    place: "Greate Barrier Reef",
    night: "3",
    departuredate: "22 Dec, 2023",
    arrivaldate: "25 Dec, 2023",
    people: "2",
    price: "$200",
  },
  {
    img: "/assets/travelagency-admin/piramid.svg",
    country: "Greek",
    place: "Piramid",
    night: "4",
    departuredate: "24 Dec, 2023",
    arrivaldate: "28 Dec, 2023",
    people: "3",
    price: "$900",
  },
  {
    img: "/assets/travelagency-admin/italy.svg",
    country: "Italy",
    place: "Greate Barrier Reef",
    night: "3",
    departuredate: "22 Dec, 2023",
    arrivaldate: "25 Dec, 2023",
    people: "2",
    price: "$200",
  },
  {
    img: "/assets/travelagency-admin/piramid.svg",
    country: "Greek",
    place: "Piramid",
    night: "4",
    departuredate: "24 Dec, 2023",
    arrivaldate: "28 Dec, 2023",
    people: "3",
    price: "$900",
  },
  {
    img: "/assets/travelagency-admin/china.svg",
    country: "China",
    place: "The great wall of China",
    night: "5",
    departuredate: "10Jan, 2023",
    arrivaldate: "16Jan, 2023",
    people: "2",
    price: "$124",
  },
  {
    img: "/assets/travelagency-admin/tajmahal.svg",
    country: "India",
    place: "Taj Mahal",
    night: "4",
    departuredate: "8Dec, 2023",
    arrivaldate: "21 Dec, 2023",
    people: "2",
    price: "$140",
  },
  {
    img: "/assets/travelagency-admin/niagrafall.svg",
    country: "Canada",
    place: "Niagara Falls",
    night: "12",
    departuredate: "11 Dec, 2023",
    arrivaldate: "11 Dec, 2023",
    people: "5",
    price: "$560",
  },
  {
    img: "/assets/travelagency-admin/italy.svg",
    country: "Italy",
    place: "Greate Barrier Reef",
    night: "3",
    departuredate: "22 Dec, 2023",
    arrivaldate: "25 Dec, 2023",
    people: "2",
    price: "$200",
  },
  {
    img: "/assets/travelagency-admin/piramid.svg",
    country: "Greek",
    place: "Piramid",
    night: "4",
    departuredate: "24 Dec, 2023",
    arrivaldate: "28 Dec, 2023",
    people: "3",
    price: "$900",
  },
  {
    img: "/assets/travelagency-admin/italy.svg",
    country: "Italy",
    place: "Greate Barrier Reef",
    night: "3",
    departuredate: "22 Dec, 2023",
    arrivaldate: "25 Dec, 2023",
    people: "2",
    price: "$200",
  },
  {
    img: "/assets/travelagency-admin/piramid.svg",
    country: "Greek",
    place: "Piramid",
    night: "4",
    departuredate: "24 Dec, 2023",
    arrivaldate: "28 Dec, 2023",
    people: "3",
    price: "$900",
  },
];
const tophotel = [
  {
    img: "/assets/travelagency-admin/billashotel.svg",
    hotelname: "Billas hotel&Motel",
    type: "Lux",
    beds: "2",
    adult: "3",
    perdayprice: "62",
    rating: "4.8",
  },
  {
    img: "/assets/travelagency-admin/tajhotel.svg",
    hotelname: "Taj Hotel",
    type: "Lux",
    beds: "2",
    adult: "2",
    perdayprice: "78",
    rating: "4.6",
  },
  {
    img: "/assets/travelagency-admin/greatwallhotel.svg",
    hotelname: "The great wall of China",
    type: "penthouse",
    beds: "3",
    adult: "6",
    perdayprice: "102",
    rating: "4.2",
  },
  {
    img: "/assets/travelagency-admin/elitehotel.svg",
    hotelname: "Elite Hotel",
    type: "Plus",
    beds: "1",
    adult: "2",
    perdayprice: "92",
    rating: "4.1",
  },
  {
    img: "/assets/travelagency-admin/elitehotel.svg",
    hotelname: "Elite Hotel",
    type: "Plus",
    beds: "1",
    adult: "2",
    perdayprice: "92",
    rating: "4.1",
  },
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
  useEffect(() => {
    SetOptions(options2);
  }, [ChangeOption]);
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };
  // Items per page
  const itemsPerPage = 5;
  // const pageCount = Math.ceil(historydata.length / itemsPerPage);
  // Slice data for current page
  const paginatedData = historydata.slice(
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
                  </div>
                  <div className="flex flex-col lg:flex-row w-full gap-5 justify-between">
                    {cardinfo.map((data, index) => {
                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-b from-teal-400 to-blue-500 p-[1px] rounded-xl cursor-pointer w-full"
                        >
                          <div className="hover:shadow-lg p-5 w-full bg-white flex-col rounded-[11px] xl:rounded-[13px] flex gap-4 ">
                            <div className="text-[#637381] text-sm font-semibold">
                              {data.title}
                            </div>
                            <div className="flex justify-between">
                              <div className="text-black text-2xl font-extrabold">
                                {data.digit}
                              </div>
                              <a
                                href="#_"
                                className="flex items-end text-[#10B860] text-sm font-medium"
                              >
                                Get report
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="overflow-x-auto flex flex-col min-h-[300px]">
                  <div className="w-full overflow-x-scroll md:overflow-auto max-w-xl xs:max-w-xl sm:max-w-xl md:max-w-7xl 2xl:max-w-none mt-1">
                    <table className="table-auto overflow-scroll md:overflow-auto w-full text-left border-separate border-spacing-y-1">
                      <tbody>
                        {paginatedData.map((data, index) => {
                          return (
                            <tr
                              key={index}
                              className="cursor-pointer border-gray-100 hover:bg-[#D8FFFF] transition-colors duration-300 whitespace-nowrap border-t border-b flex px-5 justify-between items-center w-full h-[80px] text-[#637381] font-semibold text-sm"
                            >
                              <td className="flex gap-5">
                                <div className="w-8">
                                  <img src={data.img} alt="" />
                                </div>
                                <div className="whitespace-nowrap min-w-[200px]">
                                  <h1 className="text-black font-normal">
                                    {data.place}
                                  </h1>
                                  <h2>{data.country}</h2>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4">
                                {data.night} Night
                              </td>
                              <td className="flex gap-1 whitespace-nowrap px-4">
                                <div className="flex items-center w-5">
                                  <img
                                    src="/assets/travelagency-admin/plane.svg"
                                    alt=""
                                  />
                                </div>
                                <h3>{data.departuredate}</h3>
                              </td>
                              <td className="flex gap-1 px-4">
                                <div className="flex items-center w-5">
                                  <img
                                    src="/assets/travelagency-admin/plane.svg"
                                    alt=""
                                  />
                                </div>
                                <h3>{data.arrivaldate}</h3>
                              </td>
                              <td className="px-2">{data.people} Adult</td>
                              <td className="px-2 ">{data.price}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between px-5 items-end text-[#637381] mt-3 text-sm">
                    <div>1-10 Of 10 Entries</div>
                    <ReactPaginate
                      className="flex gap-3 items-center"
                      previousLabel={<LeftArrow />}
                      nextLabel={<RightArrow />}
                      breakLabel={"..."}
                      pageCount={10}
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
                      Total <span className="text-[#09D7C9] text-lg"> 250</span>
                    </h2>
                  </div>
                  <div className="flex flex-col gap-6 text-sm">
                    <div>
                      <div className="flex justify-between">
                        <div className="text-[#637381] font-semibold">
                          Confirm
                        </div>
                        <div className="text-[#3056D3]">70%</div>
                      </div>
                      <div className="bg-gray-200 rounded-3xl">
                        <div className="h-2 w-[70%] bg-[#3056D3] rounded-3xl"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <div className="text-[#637381] font-semibold">
                          Pending
                        </div>
                        <div className="text-[#F9C107]">18%</div>
                      </div>
                      <div className="bg-gray-200 rounded-3xl">
                        <div className="h-2 w-[17%] bg-[#F9C107] rounded-3xl"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <div className="text-[#637381] font-semibold">
                          Cancelled
                        </div>
                        <div className="text-[#DC3545]">12%</div>
                      </div>
                      <div className="bg-gray-200 rounded-3xl">
                        <div className="h-2 w-[12%] bg-[#DC3545] rounded-3xl"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-[#637381] font-normal">
                    Traveling analytics calculated based on travels count
                  </div>
                </div>
                <div className="lg:h-auto xl:h-1/2 bg-[#FDFDFD] flex flex-col  rounded-xl">
                  <div className="text-[24px] p-5 flex flex-col gap-3 justify-between">
                    <h1 className="text-[#212B36] font-bold ">Expense</h1>
                    <h2 className="font-extrabold">$29.2k</h2>
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
                {tophotel.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="hover:shadow-md xl:max-w-full drop-shadow-md w-full bg-white shadow-sm rounded-2xl p-5 cursor-pointer flex flex-col gap-4 justify-center items-center"
                    >
                      <div className="flex justify-center w-[260px] md:w-[299px] opacity-100 transition duration-300 ease-in-out hover:opacity-80">
                        <img src={data.img} alt="" className="h-[224px]" />
                      </div>
                      <div className="w-full flex flex-col gap-4">
                        <div className="text-xl font-semibold text-[#212B36] w-full">
                          {data.hotelname}
                        </div>
                        <div className="flex gap-2 sm:gap-10 items-center xl:justify-between">
                          <button
                            className={`${
                              data.type === "Plus"
                                ? "bg-[#09D7C9]"
                                : data.type === "Lux"
                                ? "bg-[#F9C107]"
                                : "bg-blue-600"
                            }  text-white rounded-3xl px-5 py-1 uppercase text-base`}
                          >
                            {data.type}
                          </button>
                          <div className="text-[#637381] font-semibold text-sm tracking-wider whitespace-nowrap truncate">
                            {data.beds} BEDS | {data.adult} ADULT
                          </div>
                        </div>
                        <div className="text-[#637381] flex justify-between items-center">
                          <div className=" font-bold text-xl">
                            $ {data.perdayprice}/day
                          </div>
                          <div className="text-sm flex items-center gap-1">
                            <div>
                              <img
                                src="/assets/travelagency-admin/star.svg"
                                alt=""
                              />
                            </div>
                            {data.rating}
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
