import React from 'react';
import { Banner } from '../../types/banner';

interface BannerProps {
  banner: Banner;
}

const BannerComponent: React.FC<BannerProps> = ({ banner }) => {
  if (!banner.activo) return null;

  return (
    <div className="w-full flex justify-center items-center my-4">
      {banner.link ? (
        <a href={banner.link} target="_blank" rel="noopener noreferrer">
          <img
            src={banner.imagen_url}
            alt={banner.titulo}
            className="rounded-lg shadow-md max-h-60 object-contain w-full"
          />
        </a>
      ) : (
        <img
          src={banner.imagen_url}
          alt={banner.titulo}
          className="rounded-lg shadow-md max-h-60 object-contain w-full"
        />
      )}
    </div>
  );
};

export default BannerComponent;
