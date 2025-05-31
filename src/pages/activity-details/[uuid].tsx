import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PublicLayout from "@/components/layout/PublicLayout";
import EventHeader from "@/components/activity-detail/EventHeader";
import PhotoGallery from "@/components/activity-detail/PhotoGallery";
import EventDetails from "@/components/activity-detail/EventDetails";
import RSVPForm from "@/components/activity-detail/RSVPForm";
import ActivityContactModal from "@/components/activity-detail/ActivityContactModal";
import { useActivityDetail } from "@/hooks/useActivityDetail";
import { RSVPFormData } from "@/types/activity-detail";
import { CircleCheck } from "lucide-react";

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
      showToast("success", "RSVP submitted successfully!");
      return true;
    } else {
      showToast("error", response.data.message || "Failed to submit RSVP");
      return false;
    }
  } catch (error) {
    let errorMessage = "Failed to submit RSVP";
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
  const { activityData, loading, error } = useActivityDetail(
    typeof uuid === "string" ? uuid : undefined
  );
  console.log('activityData::: ', activityData);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (data: RSVPFormData) => {
    if (!activityData || !uuid) return;

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
          <p className="mt-4 text-gray-600">Loading activity details...</p>
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
            Activity Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The requested activity could not be found."}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <PublicLayout>
      <Head>
        <title>Activity Details | Mycotur</title>
      </Head>

      <ActivityContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contactInfo={activityData.contact}
      />

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-[12px] text-[rgba(255,255,255)] ${
            toast.type === "success"
              ? "bg-[rgba(22,163,74)]"
              : "bg-[rgba(179,38,30)]"
          } flex items-center`}
        >
          <CircleCheck className="mr-2" />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="">
        <EventHeader title={activityData.title} />

        <div className="px-4 py-2">
          <div className="mb-8">
            <PhotoGallery
              photos={activityData.photos}
              category={activityData.category}
              totalPhotos={activityData.totalPhotos}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <EventDetails
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
      </div>
    </PublicLayout>
  );
};

export default ActivityDetailPage;
