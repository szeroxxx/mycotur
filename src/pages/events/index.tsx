import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Event } from "../../types/event";
import { Activity } from "../../types/activity";
import { EventList } from "../../components/events/EventList";
import { EventForm } from "../../components/events/EventForm";
import { DeleteModal } from "../../components/events/DeleteModal";
import { Pagination } from "../../components/pagination/Pagination";
import { useEvents } from "../../hooks/useEvents";
import { useActivities } from "../../hooks/useActivities";
import { FiPlus } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { useProfile } from "../../hooks/useProfile";
import { CircleCheck } from "lucide-react";
const emptyEvent: Event = {
  id: "",
  activityName: "",
  activityId: "",
  event: "",
  eventDate: "",
  eventTime: "",
  category: "",
  location: "",
  description: "",
  email: "",
  phone: "",
  url: "",
  fees: "",
  images: [],
  videos: [],
  mediaUrls: [],
};
interface Category {
  uuid: string;
  title: string;
  description: string;
}

const EventsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [dropdownActivities, setDropdownActivities] = useState<Activity[]>([]);
  const [isAgent, setIsAgent] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{
    needsUpdate: boolean;
    fields: string[];
    message: string;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { fetchAllActivities } = useActivities();

  const {
    events,
    pagination,
    toast,
    searchTerm,
    categoryFilter,
    setSearchTerm,
    setCategoryFilter,
    setPage,
    createEvent,
    updateEvent,
    deleteEvent,
    showToast,
  } = useEvents();
  console.log("eventsxssssssssss::: ", events);
  const { checkProfileCompletion, fetchCategoriesActivity } = useProfile();

  useEffect(() => {
    if (isModalOpen) {
      const loadActivities = async () => {
        try {
          const allActivities = await fetchAllActivities();
          console.log("allActivities::: ", allActivities);
          setDropdownActivities(allActivities);
        } catch (error) {
          console.error("Failed to load activities for dropdown:", error);
        }
      };
      loadActivities();
    }
  }, [isModalOpen, fetchAllActivities]);
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    console.log("name, value::: ", name, value);
    if (selectedEvent) {
      if (name === "images" && Array.isArray(value)) {
        // Handle direct array updates for images
        setSelectedEvent((prev: Event | null) => ({
          ...prev!,
          images: value,
        }));
      } else if (name === "videos" && Array.isArray(value)) {
        // Handle direct array updates for videos
        setSelectedEvent((prev: Event | null) => ({
          ...prev!,
          videos: value,
        }));
      } else if (name === "mediaUrls" && Array.isArray(value)) {
        // Handle direct array updates for mediaUrls
        setSelectedEvent((prev: Event | null) => ({
          ...prev!,
          mediaUrls: value,
        }));
      } else {
        setSelectedEvent((prev) => ({
          ...prev!,
          [name]: value,
        }));
      }
    }
  };
  const handleActivitySelect = (activity: Activity | undefined) => {
    if (!activity || !selectedEvent) return;

    setSelectedEvent((prev) => ({
      ...prev!,
      activityId: activity.id,
      activityName: activity.title,
      description: activity.description,
      email: activity.email,
      phone: activity.phone,
      url: activity.url,
      fees: activity.notes,
    }));
  };

  const handleEdit = (event: Event) => {
    const formattedEvent = {
      ...event,
      eventDate: event.eventDate
        ? new Date(event.eventDate).toISOString().split("T")[0]
        : "",
      eventTime: event.eventTime
        ? new Date(`2000-01-01 ${event.eventTime}`).toLocaleTimeString(
            "en-US",
            { hour12: false, hour: "2-digit", minute: "2-digit" }
          )
        : "",
    };
    console.log("formattedEvent::: ", formattedEvent);
    setSelectedEvent(formattedEvent);
    setIsModalOpen(true);
  };

  const handleDelete = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      if (selectedEvent.id) {
        await updateEvent(selectedEvent);
      } else {
        await createEvent(selectedEvent);
      }
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to save event"
      );
    }
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete.id);
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
      } catch (err) {
        showToast(
          "error",
          err instanceof Error ? err.message : "Failed to delete event"
        );
      }
    }
  };

  const openAddModal = () => {
    setSelectedEvent({ ...emptyEvent });
    setIsModalOpen(true);
  };

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData) return;
        const parsedUserData = JSON.parse(userData);
        setIsAgent(parsedUserData.role === "agent");
        if (parsedUserData.role !== "agent") return;
        const status = await checkProfileCompletion();
        console.log("status::: ", status);
        if (status) {
          setProfileStatus(status);
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };

    const getCategories = async () => {
      try {
        const fetchedCategories = await fetchCategoriesActivity();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    checkProfile();
    getCategories();
  }, []);

  return (
    <>
      <Head>
        <title>Events | Mycotur</title>
      </Head>

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

      <div className="p-4">
        <div className="mb-3 flex justify-between items-center">
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="relative ">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgba(142,133,129)]" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-[rgba(199,195,193)] shadow-sm shadow-[rgba(24,27,37,0.04)] text-[rgba(142,133,129)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[rgba(194,91,52)] focus:border-[rgba(194,91,52)]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-48 px-4 py-2  text-[rgba(142,133,129)] border border-[rgba(199,195,193)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            >
              <option value="">Categories</option>
              {categories.map((category) => (
                <option key={category.uuid} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={openAddModal}
            disabled={isAgent && profileStatus?.needsUpdate}
            className={`inline-flex items-center px-4 py-2 ${
              isAgent && profileStatus?.needsUpdate
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[rgba(194,91,52)] hover:bg-[#C44D16]"
            } text-[rgba(255,255,255)] rounded-lg text-sm font-medium transition-colors`}
          >
            <FiPlus className="mr-2" />
            Add Event
          </button>
        </div>

        <div className="bg-[rgba(255,255,255)] rounded-[16px] border border-[rgba(226,225,223)] flex flex-col">
          <div className="flex-grow overflow-hidden">
            <EventList
              profileStatus={profileStatus}
              events={events}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          {events.length > 0 && (
            <div className="border-t border-[rgba(226,225,223)] bg-white rounded-b-[16px]">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-[rgba(255,255,255)] rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-[rgba(68,63,63)]">
                {selectedEvent?.id ? "Edit Event" : "Add Event"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedEvent(null);
                }}
                className="text-[rgba(68,63,63)] hover:text-[#111827]"
              >
                ✕
              </button>
            </div>{" "}
            <EventForm
              event={selectedEvent!}
              categories={categories}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedEvent(null);
              }}
              activities={dropdownActivities}
              onActivitySelect={handleActivitySelect}
            />
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default EventsPage;
