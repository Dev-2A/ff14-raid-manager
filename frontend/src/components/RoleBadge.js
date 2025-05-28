import React from 'react';
import { getRoleDisplayName, getRoleBgColorClass, getRoleColorClass } from '../utils/helpers';

const RoleBadge = ({ role, size = 'default' }) => {
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-0.5 text-sm',
    large: 'px-3 py-1 text-base',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${getRoleBgColorClass(role)} ${getRoleColorClass(role)}`}>
      {getRoleDisplayName(role)}
    </span>
  );
};

export default RoleBadge;