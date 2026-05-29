import { useState } from "react";

export function useWorkspaceFeedback(initialFeedback: any[]) {
  const hasRealData = Array.isArray(initialFeedback) && initialFeedback.length > 0;
  const [feedbackList] = useState<any[]>(initialFeedback || []);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. Dynamic Searching & Filtering
  const filteredFeedback = feedbackList.filter((item) => {
    const orderInfo = item.order || {};
    const studentName = orderInfo.requester?.full_name || "";
    const orderName = orderInfo.order_name || "";
    const commentsText = item.comments || "";

    const matchesSearch =
      orderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commentsText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      ratingFilter === "all" || item.rating === parseInt(ratingFilter, 10);

    return matchesSearch && matchesRating;
  });

  // 2. Metrics for Distribution Graph matrix
  const latestSixForGraph = filteredFeedback.slice(0, 6);
  const graphTotalReviews = latestSixForGraph.length;
  const graphAverageRating = graphTotalReviews
    ? (latestSixForGraph.reduce((acc, curr) => acc + curr.rating, 0) / graphTotalReviews).toFixed(1)
    : "0.0";

  // Distribution map tracking
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  latestSixForGraph.forEach((item) => {
    if (item.rating >= 1 && item.rating <= 5) {
      distribution[item.rating as 1 | 2 | 3 | 4 | 5]++;
    }
  });

  const maxDistributionValue = Math.max(...Object.values(distribution), 1);

  // Pagination Window Calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPagedItems = filteredFeedback.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(Math.ceil(filteredFeedback.length / itemsPerPage), 1);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleRatingChange = (val: string) => {
    setRatingFilter(val);
    setCurrentPage(1);
  };

  return {
    hasRealData,
    searchQuery,
    ratingFilter,
    currentPage,
    setCurrentPage,
    filteredFeedback,
    graphTotalReviews,
    graphAverageRating,
    distribution,
    maxDistributionValue,
    currentPagedItems,
    totalPages,
    handleSearchChange,
    handleRatingChange,
  };
}