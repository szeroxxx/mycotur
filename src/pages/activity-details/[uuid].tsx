import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PublicLayout from "@/components/layout/PublicLayout";
import EventHeader from "@/components/activity-detail/EventHeader";
import PhotoGallery from "@/components/activity-detail/PhotoGallery";
import EventDetails from "@/components/activity-detail/EventDetails";
import RSVPForm from "@/components/activity-detail/RSVPForm";
import ActivityContactModal from "@/components/organiser/ActivityContactModal";
import { useActivityDetail } from "@/hooks/useActivityDetail";
import { RSVPFormData } from "@/types/activity-detail";
import { CircleCheck } from "lucide-react";
import { extractUuidFromSlug } from "@/utils/urlHelpers";

import axios from "axios";
import axiosInstance from "@/utils/axiosConfig";

const submitRSVP = async (
  rsvpData: RSVPFormData,
  organizerData: { email: string; id: string },
  showToast: (type: "success" | "error", message: string) => void
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post("/api/rsvp", {
      ...rsvpData,
      organizerMail: organizerData.email,
      organizerId: organizerData.id,
    });

    if (response.status === 200 || response.status === 201) {
      showToast(
        "success",
        "Hemos enviado tu información al organizador. Muy \npronto se pondrá en contacto contigo para \ncontarte más"
      );
      return true;
    } else {
      showToast("error", response.data.message || "Fallo al enviar RSVP");
      return false;
    }
  } catch (error) {
    let errorMessage = "Fallo al enviar RSVP";
    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message || error.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    showToast("error", errorMessage);
    return false;
  }
};

const ActivityDetailPage: React.FC = () => {
  const router = useRouter();
  const { uuid } = router.query;
  const actualUuid = useMemo(() => {
    if (typeof uuid !== "string") return undefined;
    const extractedUuid = extractUuidFromSlug(uuid);
    return extractedUuid || uuid;
  }, [uuid]);

  const { activityData, loading, error } = useActivityDetail(actualUuid);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };
  const handleSubmit = async (data: RSVPFormData) => {
    if (!activityData || !actualUuid) {
      return;
    }
    setRsvpError(null);
    const success = await submitRSVP(
      data,
      {
        email: activityData.organizer.socialLinks.email || "",
        id: activityData.organizer.id,
      },
      showToast
    );
    if (!success) {
      setRsvpError("Failed to submit RSVP");
    }
  };

  const recordClick = async (organizerId: string) => {
    try {
      await axiosInstance.post("/api/clicks", {
        organizerId: organizerId,
      });
    } catch (error) {
      console.error("Failed to record click:", error);
    }
  };

  const handleGetContactInfo = async () => {
    if (activityData?.organizer?.id) {
      await recordClick(activityData.organizer.id);
    }
    setIsContactModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Cargando detalles de actividad...
          </p>
        </div>
      </div>
    );
  }

  if (error || !activityData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Actividad No Encontrada
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "La actividad solicitada no se pudo encontrar."}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Regresar
          </button>
        </div>
      </div>
    );
  }
  return (
    <PublicLayout>
      <Head>
        <title>{activityData.title} | Mycotur</title>
      </Head>
      <ActivityContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contactInfo={activityData.contact}
        title={activityData.title}
      />{" "}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[9999] px-3 py-2 rounded-lg text-white shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          } flex items-center transition-all duration-300 text-xs`}
          style={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            fontSize: "12px",
            lineHeight: "1.3",
          }}
        >
          <CircleCheck className="mr-2 w-4 h-4 flex-shrink-0" />
          <span className="text-xs leading-tight max-w-[280px] whitespace-pre-line">
            {toast.message}
          </span>
          <button
            className="ml-3 text-white hover:text-gray-200 text-sm leading-none"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
      <div className="">
        <EventHeader title={activityData.title} />

        <div className="px-4 py-2">
          {" "}
          <div className="mb-8">
            <PhotoGallery
              photos={activityData.photos}
              category={activityData.categories}
              totalPhotos={activityData.totalPhotos}
            />
          </div>
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <EventDetails
                  activityTitle={activityData.title}
                  eventDates={activityData.eventDates}
                  seasons={activityData.seasons}
                  description={activityData.description}
                  organizer={activityData.organizer}
                  location={activityData.location}
                />
              </div>

              <div className="lg:col-span-1">
                <RSVPForm
                  onSubmit={handleSubmit}
                  onGetContactInfo={handleGetContactInfo}
                  error={rsvpError}
                />
              </div>
            </div>
          </div>
          <div className="lg:hidden space-y-8">
            <EventDetails
              activityTitle={activityData.title}
              eventDates={activityData.eventDates}
              seasons={activityData.seasons}
              description={activityData.description}
              organizer={activityData.organizer}
              location={activityData.location}
            />

            <div className="w-full">
              <RSVPForm
                onSubmit={handleSubmit}
                onGetContactInfo={handleGetContactInfo}
                error={rsvpError}
              />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ActivityDetailPage;
