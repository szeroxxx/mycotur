import React from 'react';

interface Photo {
  id: string;
  url: string;
  alt: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  category?: string;
  totalPhotos?: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  photos, 
  category = "experiences", 
  totalPhotos 
}) => {
  // Ensure we have at least 5 photos for the layout
  const displayPhotos = photos.slice(0, 5);
  const remainingPhotos = totalPhotos ? totalPhotos - 5 : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Main large image */}
      <div className="relative overflow-hidden rounded-lg">
        {displayPhotos[0] && (
          <img 
            src={displayPhotos[0].url} 
            alt={displayPhotos[0].alt} 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-[rgba(238,242,255)] backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-[rgba(79,70,229)]">
            {category}
          </span>
        </div>
      </div>
      
      {/* Right column with 4 smaller images */}
      <div className="grid grid-cols-2 gap-3">
        {displayPhotos.slice(1, 5).map((photo, index) => (
          <div key={photo.id || index} className="relative overflow-hidden rounded-lg">
            <img 
              src={photo.url} 
              alt={photo.alt} 
              className="w-full h-full object-cover"
            />
            {/* Show remaining count on last image */}
            {index === 3 && remainingPhotos > 0 && (
              <div className="absolute bottom-2 right-2">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                  +{remainingPhotos}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;
