import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, checkUsername } from '../../api/auth';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  isValidUsername,
  isValidEmail,
  getPasswordStrength,
  isValidCharacterName,
  isValidServerName
} from '../../utils/validators';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    character_name: '',
    server: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const servers = [
    '카벙클', '초코보', '모그리', '톤베리', '펜리르'
  ];

  // 아이디 중복 확인
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!formData.username || !isValidUsername(formData.username)) {
        setUsernameAvailable(null);
        return;
      }

      setCheckingUsername(true);
      try {
        const response = await checkUsername(formData.username);
        setUsernameAvailable(!response.exists);
      } catch (err) {
        console.error('Username check error:', err);
      } finally {
        setCheckingUsername(false);
      }
    };

    const debounceTimer = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 월드별 에러 초기화
    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setError('');
  };
}