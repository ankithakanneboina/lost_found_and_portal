import { useState, useEffect } from 'react';
import { itemsAPI } from '../services/api';

export function useItemForm(type) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    itemName: '', description: '', category: '', location: '',
    [type === 'lost' ? 'dateLost' : 'dateFound']: '',
    contact: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    itemsAPI.getCategories().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    return fd;
  };

  return { form, setForm, handleChange, image, setImage, loading, setLoading, categories, buildFormData };
}
