import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, X, Info } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  alt: string;
  type: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  category?: string | string[];
  totalPhotos?: number;
}

const isVideo = (mediaType: string): boolean => {
  return mediaType === "VIDEO" || mediaType.toLowerCase().startsWith("video");
};

const renderMedia = (media: Photo, className: string) => {
  if (isVideo(media.type)) {
    return (
      <video
        src={media.url}
        className={className}
        muted
        preload="metadata"
        poster=""
      >
        <source src={media.url} type="video/mp4" />
        Su navegador no admite la etiqueta de video.
      </video>
    );
  } else {
    return <img src={media.url} alt={media.alt} className={className} />;
  }
};

// Sample data for demonstration
const samplePhotos = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop",
    alt: "Green nature",
    type: "image"
  },
  {
    id: "2", 
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    alt: "Landscape",
    type: "image"
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop",
    alt: "Ocean",
    type: "image"
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop",
    alt: "Forest",
    type: "image"
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop",
    alt: "Mountain",
    type: "image"
  }
];

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos = samplePhotos,
  category = ["Adventure Travel", "Nature Photography", "Outdoor Activities", "Landscape", "Wildlife"],
  totalPhotos,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCategoryInfo, setShowCategoryInfo] = useState(false);

  const displayPhotos = photos.slice(0, 5);
  const remainingPhotos = totalPhotos ? totalPhotos - 5 : 0;

  const categories = Array.isArray(category) ? category : [category];
  const allCategoriesText = categories.join(", ");
  
  // Truncate to 15 characters and add ellipsis if needed
  const displayCategory = allCategoriesText.length > 15 
    ? allCategoriesText.substring(0, 15) + "..." 
    : allCategoriesText;

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImageIndex(null);
    document.body.style.overflow = "unset";
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < photos.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (event.key) {
        case "Escape":
          closeModal();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, selectedImageIndex]);
  
  return (
    <div className="w-full mb-8 sm:mb-12 relative">
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="grid grid-cols-2 gap-2 h-[280px] overflow-hidden">
          <div
            className="relative overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group h-full"
            onClick={() => openModal(0)}
          >
            {displayPhotos[0] && (
              <>
                {renderMedia(
                  displayPhotos[0],
                  "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                )}
                {isVideo(displayPhotos[0].type) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="absolute top-2 left-2 right-2 z-10">
              <div className="flex items-center justify-between">
                <span className="bg-white/20 backdrop-blur-md border border-white/30 px-2 py-1 rounded-full text-xs font-medium text-white shadow-lg max-w-[calc(100%-40px)] truncate">
                  {displayCategory}
                </span>
                {allCategoriesText.length > 15 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCategoryInfo(true);
                    }}
                    className="bg-white/20 backdrop-blur-md border border-white/30 p-1 rounded-full text-white hover:bg-white/30 transition-all duration-200 shadow-lg flex-shrink-0 ml-1 flex items-center justify-center"
                    title="View all categories"
                  >
                    <Info size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 h-full" style={{ gridTemplateRows: '1fr 1fr' }}>
            {displayPhotos.slice(1, 5).map((photo, index) => (
              <div
                key={photo.id || index}
                className="relative overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
                style={{ height: 'calc((280px - 8px) / 2)' }}
                onClick={() => openModal(index + 1)}
              >
                {renderMedia(
                  photo,
                  "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                )}
                {isVideo(photo.type) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-1">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                {index === 3 && remainingPhotos > 0 && (
                  <div className="absolute bottom-1 right-1 z-10">
                    <span className="bg-black/70 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-md text-xs font-medium border border-white/20">
                      +{remainingPhotos}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-2 gap-3 h-[350px] overflow-hidden">
          <div
            className="relative overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group h-full"
            onClick={() => openModal(0)}
          >
            {displayPhotos[0] && (
              <>
                {renderMedia(
                  displayPhotos[0],
                  "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                )}
                {isVideo(displayPhotos[0].type) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-3">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-sm font-medium text-white shadow-lg">
                {displayCategory}
              </span>
              {allCategoriesText.length > 15 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCategoryInfo(true);
                  }}
                  className="bg-white/20 backdrop-blur-md border border-white/30 p-1.5 rounded-full text-white hover:bg-white/30 transition-all duration-200 shadow-lg flex items-center justify-center"
                  title="View all categories"
                >
                  <Info size={14} />
                </button>
              )}
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 h-full" style={{ gridTemplateRows: '1fr 1fr' }}>
            {displayPhotos.slice(1, 5).map((photo, index) => (
              <div
                key={photo.id || index}
                className="relative overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
                style={{ height: 'calc((350px - 12px) / 2)' }}
                onClick={() => openModal(index + 1)}
              >
                {renderMedia(
                  photo,
                  "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                )}
                {isVideo(photo.type) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                {index === 3 && remainingPhotos > 0 && (
                  <div className="absolute bottom-2 right-2 z-10">
                    <span className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm font-medium border border-white/20">
                      +{remainingPhotos}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Info Modal */}
      {showCategoryInfo && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCategoryInfo(false)}
          ></div>
          <div className="relative z-10 bg-white rounded-lg shadow-xl max-w-sm sm:max-w-md w-full mx-4 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Categories</h3>
              <button
                onClick={() => setShowCategoryInfo(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {categories.map((cat, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm mr-1 sm:mr-2 mb-2"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          <div className="relative z-10 w-full h-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex items-center justify-center">
            <button
              onClick={closeModal}
              className="cursor-pointer absolute -top-2 -right-2 sm:-top-4 sm:-right-4 z-50 bg-white hover:bg-gray-100 rounded-full p-2 sm:p-3 text-gray-700 hover:text-gray-900 transition-all duration-300 shadow-xl border border-gray-300 group"
            >
              <X
                size={20}
                className="sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
            <button
              onClick={goToPrevious}
              disabled={selectedImageIndex === 0}
              className={`cursor-pointer absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 text-gray-700 transition-all duration-300 shadow-lg group ${
                selectedImageIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:scale-110 hover:-translate-x-1"
              }`}
            >
              <ArrowLeft
                size={18}
                className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300"
              />
            </button>
            <button
              onClick={goToNext}
              disabled={selectedImageIndex === photos.length - 1}
              className={`cursor-pointer absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 text-gray-700 transition-all duration-300 shadow-lg group ${
                selectedImageIndex === photos.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:scale-110 hover:translate-x-1"
              }`}
            >
              <ArrowRight
                size={18}
                className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full h-full max-w-5xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex-1 flex items-center justify-center bg-gray-50 p-3 sm:p-6 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  {isVideo(photos[selectedImageIndex].type) ? (
                    <video
                      src={photos[selectedImageIndex].url}
                      className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-md"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "calc(90vh - 80px)",
                        width: "auto",
                        height: "auto",
                      }}
                      controls
                      autoPlay={false}
                      muted={false}
                      preload="metadata"
                    >
                      <source
                        src={photos[selectedImageIndex].url}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={photos[selectedImageIndex].url}
                      alt={photos[selectedImageIndex].alt}
                      className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-md"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "calc(90vh - 80px)",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 bg-white px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 h-16 sm:h-20 flex items-center justify-center">
                <span className="bg-orange-100 text-orange-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                  {selectedImageIndex + 1} of {photos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;