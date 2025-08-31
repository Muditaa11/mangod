const API_BASE_URL = 'https://mangod.onrender.com/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/users/login`,
  
  // Book endpoints
  BOOKS: `${API_BASE_URL}/books`,
  USER_BOOKS: `${API_BASE_URL}/book/user`,
  
  // Helper function to get book by ID
  BOOK_BY_ID: (id) => `${API_BASE_URL}/books/${id}`,
};

export default API_ENDPOINTS;

