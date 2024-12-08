import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { getFeedback } from '../api/feedbackApi';

const FeedbackSection = () => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await getFeedback();
    
      // Check if the response contains feedbacks directly, not inside data
      if (response && Array.isArray(response.feedbacks)) {
        setReviews(response.feedbacks);
      } else {
        console.error('Feedbacks are not available in the response:', response);
        setReviews([]); // Set an empty array if no feedbacks are found
      }
    
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };
  
  

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const itemsPerPage = 5;
  const paginatedData = reviews.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-md shadow-md pt-5 pb-2 flex flex-col gap-5">
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
                  <h1 className="text-black font-normal">{data.locationName}</h1>
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
            previousLabel={<img src="/left.png" alt="previous" className="w-5 h-5" />}
            nextLabel={<img src="/next.png" alt="next" className="w-5 h-5" />}
            breakLabel={"..."}
            pageCount={Math.ceil(reviews.length / itemsPerPage)}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
            onPageChange={handlePageChange}
            containerClassName={"pagination"}
            activeClassName={"bg-[#D8FFFF] rounded-[2px] w-5 h-5 flex justify-center items-center border-[#12ECA1] border"}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;

