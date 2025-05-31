import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PublicLayout from "@/components/layout/PublicLayout";
import EventHeader from "@/components/activity-detail/EventHeader";
import PhotoGallery from "@/components/activity-detail/PhotoGallery";
import EventDetails from "@/components/event/EventDetails";
import RSVPForm from "@/components/event-detail/RSVPForm";
import ContactModal from "@/components/activity-detail/ContactModal";
import { CircleCheck } from "lucide-react";
import { useEventDetail } from "@/hooks/useEventDetail";
import axios from "axios";
import axiosInstance from "@/utils/axiosConfig";
import { Button } from "@/components/ui/button";

import { RSVPFormData } from "@/components/event-detail/RSVPForm";

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

const EventDetailPage: React.FC = () => {
  const router = useRouter();
  const { uuid } = router.query;
  const { eventData, loading, error } = useEventDetail(uuid as string);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (data: RSVPFormData) => {
    console.log("data::: ", data);
    if (!eventData || !uuid) return;

    setRsvpError(null);

    const success = await submitRSVP(
      data,
      {
        email: eventData.organizer.socialLinks.email || "",
        id: eventData.organizer.id,
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
    if (eventData?.organizer?.id) {
      await recordClick(eventData.organizer.id);
    }
    setIsContactModalOpen(true);
  };

  const isEventInPast = () => {
    if (!eventData?.eventDate?.date) return false;
    const eventDate = new Date(eventData.eventDate.date);
    const today = new Date();
    // Remove time components for date comparison
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Event Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The requested event could not be found."}
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

  console.log('eventData::: ', eventData);
  return (
    <PublicLayout>
      <Head>
        <title>{eventData.title} | Mycotur</title>

      </Head>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contactInfo={{
          email: eventData.contact.email,
          facebook: eventData.organizer.socialLinks.facebook,
          instagram: eventData.organizer.socialLinks.instagram,
          youtube: eventData.organizer.socialLinks.youtube,
        }}
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
        <EventHeader title={eventData.title} />

        <div className="px-4 py-2">
          <div className="mb-8">
            <PhotoGallery
              photos={eventData.photos}
              category={eventData.category}
              totalPhotos={eventData.totalPhotos}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <EventDetails
                date={eventData.eventDate.date}
                time={eventData.eventDate.time}
                description={{ main: eventData.description }}
                organizer={eventData.organizer}
                location={eventData.location}
              />
            </div>
            <div className="lg:col-span-1">
              {isEventInPast() ? (
                <div className="mt-2 px-6 py-6 bg-[rgba(255,255,255)] rounded-xl shadow-lg border border-[rgba(244,242,242)]">
                  <h3
                    className="text-lg font-semibold mb-4 leading-tight"
                    style={{ color: "rgba(68, 63, 63, 1)" }}
                  >
                    This event is{" "}
                    <span style={{ color: "rgba(22, 163, 74, 1)" }}>
                      Completed
                    </span>{" "}
                    you can View organiser details and contact them for more
                    information
                  </h3>
                  <Button
                    variant="outline"
                    className="w-full bg-[rgba(68,63,63)] text-[rgba(255,255,255)] hover:bg-gray-900 border-gray-800 py-3 font-medium rounded-md transition-colors"
                    onClick={handleGetContactInfo}
                  >
                    Get Contact Information
                  </Button>
                </div>
              ) : (
                <RSVPForm
                  onSubmit={handleSubmit}
                  onGetContactInfo={handleGetContactInfo}
                  error={rsvpError}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default EventDetailPage;
