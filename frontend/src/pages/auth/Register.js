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

    // 필드별 에러 초기화
    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setError('');
  };

  const validateForm = () => {
    const errors = {};

    // 아이디 검증
    if (!formData.username) {
      errors.username = '아이디를 입력해주세요.';
    } else if (!isValidUsername(formData.username)) {
      errors.username = '아이디는 3~20자의 영문, 숫자, 언더스코어(_)만 사용 가능합니다.';
    } else if (usernameAvailable === false) {
      errors.username = '이미 사용 중인 아이디입니다.';
    }

    // 이메일 검증
    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!isValidEmail(formData.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검증
    const passwordStrength = getPasswordStrength(formData.password);
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (!passwordStrength.isValid) {
      errors.password = passwordStrength.messages.join(', ');
    }

    // 비밀번호 확인
    if (!formData.password_confirm) {
      errors.password_confirm = '비밀번호를 다시 입력해주세요.';
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = '비밀번호가 일치하지 않습니다.';
    }

    // 서버 검증
    if (formData.server && !isValidServerName(formData.server)) {
      errors.server = '올바른 서버를 선택해주세요.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('입력 정보를 확인해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(formData);
      setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.username) {
        setFieldErrors(prev => ({ ...prev, username: err.username }));
      }
      if (err.email) {
        setFieldErrors(prev => ({ ...prev, email: err.email }));
      }
      setError(err.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            FF14 레이드 관리 시스템에 가입하세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 아이디 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                아이디 *
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className={`input ${fieldErrors.username ? 'border-red-500' : ''}`}
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                />
                {checkingUsername && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <LoadingSpinner size='small' text='' />
                  </div>
                )}
                {!checkUsername && usernameAvailable !== null && formData.username && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {usernameAvailable ? (
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {fieldErrors.username && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일 *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 input ${fieldErrors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호 *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 input ${fieldErrors.password ? 'border-red-500' : ''}`}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 runded-full transition-all ${
                          passwordStrength.score < 2 ? 'bg-red-500' :
                          passwordStrength.score < 4 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <span className={`ml-2 text-sm ${
                      passwordStrength.score < 2 ? 'text-red-500' :
                      passwordStrength.score < 4 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                </div>
              )}
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                비밀번호 확인 *
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 input ${fieldErrors.password_confirm ? 'border-red-500' : ''}`}
                value={formData.password_confirm}
                onChange={handleChange}
                disabled={loading}
              />
              {fieldErrors.password_confirm && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password_confirm}</p>
              )}
            </div>

            {/* 캐릭터명 */}
            <div>
              <label htmlFor="character_name" className="block text-sm font-medium text-gray-700">
                캐릭터명 (선택)
              </label>
              <input
                id="character_name"
                name="character_name"
                type="text"
                className={`mt-1 input ${fieldErrors.character_name ? 'border-red-500' : ''}`}
                value={formData.character_name}
                onChange={handleChange}
                disabled={loading}
              />
              {fieldErrors.character_name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.character_name}</p>
              )}
            </div>

            {/* 서버 */}
            <div>
              <label htmlFor="server" className="block text-sm font-medium text-gray-700">
                서버 (선택)
              </label>
              <select
                id="server"
                name="server"
                className={`mt-1 input ${fieldErrors.server ? 'border-red-500' : ''}`}
                value={formData.server}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">서버 선택</option>
                {servers.map(server => (
                  <option key={server} value={server}>{server}</option>
                ))}
              </select>
              {fieldErrors.server && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.server}</p>
              )}
            </div>
          </div>

          {error && <ErrorMessage message={error} onClose={() => setError('')} />}
          {success && <SuccessMessage message={success} />}

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ff14-accent hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ff14-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                '회원가입'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="font-medium text-ff14-accent hover:text-yellow-600">
                로그인
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;