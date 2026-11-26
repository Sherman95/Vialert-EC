import React from 'react';

const sources = {
    horizontal: '/brand/logo-horizontal.png',
    compact: '/brand/logo-compact.png',
    isotype: '/brand/isotype-color.png',
    dark: '/brand/logo-dark.png',
    light: '/brand/isotype-light.png',
};

export const BrandLogo = ({
    variant = 'horizontal',
    className = '',
    alt = 'Vialert-EC — Monitoreo vial en tiempo real',
    priority = false,
}) => (
    <img
        src={sources[variant] || sources.horizontal}
        alt={alt}
        className={`block object-contain ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
    />
);
