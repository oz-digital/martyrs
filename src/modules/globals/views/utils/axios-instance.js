// axiosInstance.js
import axios from 'axios';
// Создаем один экземпляр axios
const $axios = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true,
});

// Функция для установки токена в заголовки
export function setAuthToken(token) {
  if (token) {
    $axios.defaults.headers.common['x-access-token'] = token; // Устанавливаем токен в заголовок
  } else {
    delete $axios.defaults.headers.common['x-access-token']; // Удаляем токен из заголовка
  }
}

// Функция для получения текущего базового URL
export function getBaseURL() {
  return $axios.defaults.baseURL;
}

// Функция для изменения базового URL
export function setBaseURL(url) {
  $axios.defaults.baseURL = url;
}

export function resetBaseURL() {
  $axios.defaults.baseURL = process.env.API_URL;
}

export default $axios;