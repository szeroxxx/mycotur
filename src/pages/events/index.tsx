import React, { useState } from "react";
import Head from "next/head";
import { Event } from "../../types/event";
import { EventList } from "../../components/events/EventList";
import { EventForm } from "../../components/events/EventForm";
import { DeleteModal } from "../../components/events/DeleteModal";
import { Pagination } from "../../components/pagination/Pagination";
import { useEvents } from "../../hooks/useEvents";
import { FiPlus } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";

const emptyEvent: Event = {
  id: "",
  activityName: "",
  event: "",
  eventDate: "",
  eventTime: "",
  category: "",
  location: "",
  description: "",
  email: "",
  phone: "",
  fees: "",
  images: [],
};

const EventsPage: React.FC = () => {
  const {
    events,
    pagination,
    activities,
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (selectedEvent) {
      setSelectedEvent((prev) => ({
        ...prev!,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && selectedEvent) {
      setSelectedEvent((prev) => ({
        ...prev!,
        images: Array.from(e.target.files || []),
      }));
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
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
    } catch (error) {
      showToast("error", "Failed to save event");
    }
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete.id);
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
      } catch (error) {
        showToast("error", "Failed to delete event");
      }
    }
  };

  const openAddModal = () => {
    setSelectedEvent({ ...emptyEvent });
    setIsModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Events | Mycotur</title>
      </Head>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
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
              <option value="Experiences">Experiences</option>
              <option value="Cultural">Cultural</option>
            </select>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-[rgba(194,91,52)] hover:bg-[#C44D16] text-[rgba(255,255,255)] rounded-lg text-sm font-medium transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Event
          </button>
        </div>

        <div className="bg-[rgba(255,255,255)] rounded-[16px] shadow">
          <EventList
            events={events}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={setPage}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-[rgba(255,255,255)] rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#111827]">
                {selectedEvent?.id ? "Edit Event" : "Add Event"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedEvent(null);
                }}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                ✕
              </button>
            </div>
            <EventForm
              event={selectedEvent!}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
              onImageUpload={handleImageUpload}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedEvent(null);
              }}
              activities={activities}
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
