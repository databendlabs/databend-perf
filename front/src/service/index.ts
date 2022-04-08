import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
const { VITE_APP_BASEN_URL } = import.meta.env;
const axiosInstance: AxiosInstance = axios.create({
	baseURL: `${VITE_APP_BASEN_URL}`,
	headers: {
		'Content-Type': 'application/json;'
	}
});

axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => {
		if (response.status && response.status === 200) {
			return Promise.resolve(response.data);
		} else {
			return Promise.reject(response.data);
		}
	},
	// error
	(error: any) => {
		if (error === undefined || error.code === 'ECONNABORTED') {
			message.warning('timeout');
			return Promise.reject(error);
		}
	}
);

// axios instance
axiosInstance.interceptors.request.use(
	(config: AxiosRequestConfig) => {
		// Request to intercept
		return config;
	},
	(error: any) => {
		return Promise.reject(error);
	}
);

export default axiosInstance;