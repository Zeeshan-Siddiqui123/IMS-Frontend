// components/Account.jsx
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { API } from '../../API';

const Account = () => {
  const [data, setData] = useState({
    name: '',
    bq_id: '',
    email: '',
    password: '',
    phone: '',
    CNIC: '',
    course: '',
  });
  const [error, setError] = useState('');
  const [invalidField, setInvalidField] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setInvalidField('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/user/signup`, data);

      setMessage(res.data.message);
      setError('');
      setInvalidField('');
      setData({ name: '', bq_id: '', email: '', password: '', phone: '', CNIC: '', course: '' });

      setTimeout(() => {
        setMessage('');
        // navigate('/verify');
      }, 2000);
    } catch (err) {
      const errData = err.response?.data;
      setError(errData?.message || 'Signup failed');
      setInvalidField(errData?.field || '');
      setMessage('');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700"
      >
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

        <div className="flex flex-col gap-4">
          {[
            { name: 'name', placeholder: 'Full Name' },
            { name: 'bq_id', placeholder: 'BQ ID' },
            { name: 'email', placeholder: 'Email', type: 'email' },
            { name: 'phone', placeholder: 'Phone' },
            { name: 'CNIC', placeholder: 'CNIC' },
            { name: 'course', placeholder: 'Course' },
          ].map((input) => (
            <input
              key={input.name}
              type={input.type || 'text'}
              name={input.name}
              placeholder={input.placeholder}
              value={data[input.name]}
              onChange={handleChange}
              className={`px-4 py-2 rounded-md bg-gray-900 border ${
                invalidField === input.name ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          ))}

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter Password"
              value={data.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-md bg-gray-900 border ${
                invalidField === 'password' ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <input
            type="submit"
            value="Sign Up"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md cursor-pointer transition"
          />

          {message && <p className="text-green-400 text-center">{message}</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}

          <p className="text-center text-gray-300 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="underline text-blue-400 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Account;
