import axios from 'axios';
import type { Laptop, LaptopCreate, LaptopUpdate } from '../types';

const API_URL = 'http://localhost:8001';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const laptopService = {
  // Get all laptops
  getAll: async (): Promise<Laptop[]> => {
    const response = await axios.get(`${API_URL}/laptops/`);
    return response.data;
  },

  // Create a new laptop
  create: async (laptop: LaptopCreate): Promise<Laptop> => {
    const response = await axios.post(`${API_URL}/laptops/`, laptop, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Update a laptop
  update: async (id: number, laptop: LaptopUpdate): Promise<Laptop> => {
    const response = await axios.put(`${API_URL}/laptops/${id}`, laptop, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Delete a laptop
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/laptops/${id}`, {
      headers: getAuthHeader()
    });
  }
};
