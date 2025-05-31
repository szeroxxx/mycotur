import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

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
  totalPhotos,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayPhotos = photos.slice(0, 5);
  const remainingPhotos = totalPhotos ? totalPhotos - 5 : 0;

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
            <img
              src={displayPhotos[0].url}
              alt={displayPhotos[0].alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-sm font-medium text-indigo-700 shadow-lg">
              {category}
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
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in"
            onClick={closeModal}
          ></div>

          <div className="relative z-10 max-w-6xl max-h-[90vh] mx-4 animate-scale-in">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-2 text-[rgba(229,114,0)] hover:bg-white/30 hover:scale-110 transition-all duration-300 shadow-lg group"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>

            <button
              onClick={goToPrevious}
              disabled={selectedImageIndex === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 text-[rgba(229,114,0)] transition-all duration-300 shadow-lg group ${
                selectedImageIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-white/30 hover:scale-110 hover:-translate-x-1"
              }`}
            >
              <ArrowLeft
                size={24}
                className="group-hover:-translate-x-1 transition-transform duration-300"
              />
            </button>
            <button
              onClick={goToNext}
              disabled={selectedImageIndex === photos.length - 1}
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 text-[rgba(229,114,0)] transition-all duration-300 shadow-lg group ${
                selectedImageIndex === photos.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-white/30 hover:scale-110 hover:translate-x-1"
              }`}
            >
              <ArrowRight
                size={24}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-2xl">
              <img
                src={photos[selectedImageIndex].url}
                alt={photos[selectedImageIndex].alt}
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-lg"
              />

              <div className="mt-4 text-center">
                <span className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full text-[rgba(229,114,0)] text-sm font-medium shadow-lg">
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
