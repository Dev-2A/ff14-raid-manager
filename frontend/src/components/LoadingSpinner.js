import React from 'react';

const LoadingSpinner = ({ size = 'default', text = '로딩 중...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className='flex flex-col items-center justify-center p-4'>
      <div className={`spinner ${sizeClasses[size]}`}></div>
      {text && <p className='mt-2 text-gray-600'>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;