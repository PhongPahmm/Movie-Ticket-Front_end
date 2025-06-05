import axiosConfig from "./axiosConfig";

// Lấy tất cả phim (hoặc theo status)
export const getMoviesByStatus = async (status = "all", page = 0) => {
  try {
    let url = "/movies";
    if (status === "now_showing") url = "/movies/now-showing";
    else if (status === "coming_soon") url = "/movies/coming-soon";

    const params = { page };
    const response = await axiosConfig.get(url, { params });
    return {
      items: response.data.data?.items || [],
      currentPage: response.data.data?.currentPage ?? 0,
      totalPages: response.data.data?.totalPages ?? 1,
      totalItems: response.data.data?.totalItems ?? 0,
      pageSize: response.data.data?.pageSize ?? 10,
    };
  } catch (error) {
    console.error("Get movies by status API error:", error);
    throw error;
  }
};

// Lọc phim theo thể loại
export const getMoviesByGenre = async (genreIds = [], page = 0) => {
  try {
    const response = await axiosConfig.post("/movies/find-by-genre", genreIds, {
      params: { page },
      headers: { "Content-Type": "application/json" },
    });

    return {
      items: response.data.data?.items || [],
      currentPage: response.data.data?.currentPage ?? 0,
      totalPages: response.data.data?.totalPages ?? 1,
      totalItems: response.data.data?.totalItems ?? 0,
      pageSize: response.data.data?.pageSize ?? 10,
    };
  } catch (error) {
    console.error(
      "Get movies by genre API error:",
      error.response?.data || error.message || error
    );
    throw error;
  }
};

// Lọc phim theo ngày chiếu
export const getMoviesByReleaseDate = async (releaseDate, page = 0) => {
  try {
    const response = await axiosConfig.get("/movies/release-date", {
      params: { "release-date": releaseDate, page },
    });
    return {
      items: response.data.data?.items || [],
      currentPage: response.data.data?.currentPage ?? 0,
      totalPages: response.data.data?.totalPages ?? 1,
      totalItems: response.data.data?.totalItems ?? 0,
      pageSize: response.data.data?.pageSize ?? 10,
    };
  } catch (error) {
    console.error("Lỗi khi lấy phim theo ngày chiếu:", error);
    throw error;
  }
};

// Lấy chi tiết phim theo ID
export const getMovieById = async (id) => {
  try {
    const response = await axiosConfig.get(`/movies/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết phim:", error);
    throw error;
  }
};
