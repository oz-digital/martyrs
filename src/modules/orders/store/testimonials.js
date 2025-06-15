// Dependencies
import axios from 'axios';
import { reactive } from 'vue';

const $axios = axios.create({ baseURL: process.env.API_URL, withCredentials: true });

// State
const state = reactive({
  testimonials: [],
});

const actions = {
  async fetchTestimonials() {
    try {
      const response = await axios.get('/api/testimonials');
      state.testimonials = response.data;
    } catch (error) {
      console.error(error);
    }
  },

  async createTestimonial(testimonial) {
    console.log(testimonial.profile.photo);
    try {
      const formData = new FormData();
      formData.append('avatar', testimonial.profile.photo);
      formData.append('rating', testimonial.rating);
      formData.append('name', testimonial.name);
      formData.append('position', testimonial.position);
      formData.append('description', testimonial.description);

      console.log(formData);

      const response = await $axios.post('/api/testimonials/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      state.testimonials.push(response.data);
    } catch (error) {
      console.error(error);
    }
  },

  async updateTestimonial(testimonial) {
    try {
      const response = await axios.post(`/api/testimonials/update`, testimonial);
      const index = state.testimonials.findIndex(t => t._id === testimonial._id);
      if (index !== -1) {
        state.testimonials[index] = response.data;
      }
    } catch (error) {
      console.error(error);
    }
  },

  async deleteTestimonial(testimonialId) {
    try {
      await axios.delete(`/api/testimonials/delete/${testimonialId}`);
      const index = state.testimonials.findIndex(t => t._id === testimonialId);
      if (index !== -1) {
        state.testimonials.splice(index, 1);
      }
    } catch (error) {
      console.error(error);
    }
  },
};

export { actions, state };
