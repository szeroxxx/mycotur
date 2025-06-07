import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

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

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  category = "experiences",
  totalPhotos,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayPhotos = photos.slice(0, 5);
  const remainingPhotos = totalPhotos ? totalPhotos - 5 : 0;

  const categories = Array.isArray(category) ? category : [category];
  const displayCategory =
    categories.length > 1
      ? `${categories[0]} + ${categories.length - 1} más`
      : categories[0];

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
    <>
      <div className="grid grid-cols-2 gap-3">
        <div
          className="relative overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
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
          )}{" "}
          <div className="absolute top-3 left-3 z-10">
            <span
              className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-sm font-medium text-white shadow-lg"
              title={categories.join(", ")}
            >
              {displayCategory}
            </span>
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {displayPhotos.slice(1, 5).map((photo, index) => (
            <div
              key={photo.id || index}
              className="relative overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
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

      {isModalOpen && selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          <div className="relative z-10 w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
            <button
              onClick={closeModal}
              className="cursor-pointer absolute -top-4 -right-4 z-50 bg-white hover:bg-gray-100 rounded-full p-3 text-gray-700 hover:text-gray-900 transition-all duration-300 shadow-xl border border-gray-300 group"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>

            <button
              onClick={goToPrevious}
              disabled={selectedImageIndex === 0}
              className={`cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-3 text-gray-700 transition-all duration-300 shadow-lg group ${
                selectedImageIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:scale-110 hover:-translate-x-1"
              }`}
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform duration-300"
              />
            </button>
            <button
              onClick={goToNext}
              disabled={selectedImageIndex === photos.length - 1}
              className={`cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-3 text-gray-700 transition-all duration-300 shadow-lg group ${
                selectedImageIndex === photos.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:scale-110 hover:translate-x-1"
              }`}
            >
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>

            <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  {isVideo(photos[selectedImageIndex].type) ? (
                    <video
                      src={photos[selectedImageIndex].url}
                      className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-md"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "calc(85vh - 120px)",
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
                        maxHeight: "calc(85vh - 120px)",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 bg-white px-6 py-4 border-t border-gray-200 h-20 flex items-center justify-center">
                <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium">
                  {selectedImageIndex + 1} of {photos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
