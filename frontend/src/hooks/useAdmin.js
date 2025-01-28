import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const useAdmin = (adminId) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        // Remove the extra 'api' from the URL
        const response = await axios.get(`${API_URL}/admin/${adminId}`);
        setAdmin(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin:', err);
        setError(err);
        setLoading(false);
      }
    };

    if (adminId) {
      fetchAdmin();
    }
  }, [adminId]);

  return { admin, loading, error };
};

export default useAdmin;
