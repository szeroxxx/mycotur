import React, { useState } from "react";
import Head from "next/head";
import { Activity } from "../../types/activity";
import { ActivityList } from "../../components/activities/ActivityList";
import { ActivityForm } from "../../components/activities/ActivityForm";
import { DeleteModal } from "../../components/activities/DeleteModal";
import { Pagination } from "../../components/pagination/Pagination";
import { useActivities } from "../../hooks/useActivities";
import { FiPlus } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";

const ActivitiesPage: React.FC = () => {
  const {
    activities,
    pagination,
    toast,
    searchTerm,
    setSearchTerm,
    setPage,
    createActivity,
    updateActivity,
    deleteActivity,
    showToast,
  } = useActivities();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(
    null
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (selectedActivity) {
      setSelectedActivity((prev) => ({
        ...prev!,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && selectedActivity) {
      setSelectedActivity((prev) => ({
        ...prev!,
        images: Array.from(e.target.files || []),
      }));
    }
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleDelete = (activity: Activity) => {
    setActivityToDelete(activity);
    setIsDeleteModalOpen(true);
  };

  const handleDuplicate = (activity: Activity) => {
    const duplicatedActivity = {
      ...activity,
      id: "",
      title: `${activity.title} (Copy)`,
    };
    setSelectedActivity(duplicatedActivity);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    try {
      if (selectedActivity.id) {
        await updateActivity(selectedActivity);
      } else {
        await createActivity(selectedActivity);
      }
      setIsModalOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      showToast("error", "Failed to save activity");
    }
  };

  const confirmDelete = async () => {
    if (activityToDelete) {
      try {
        await deleteActivity(activityToDelete.id);
        setIsDeleteModalOpen(false);
        setActivityToDelete(null);
      } catch (error) {
        showToast("error", "Failed to delete activity");
      }
    }
  };

  const openAddModal = () => {
    setSelectedActivity({
      id: "",
      title: "",
      category: "",
      location: "",
      startMonth: "",
      endMonth: "",
      email: "",
      phone: "",
      url: "",
      notes: "",
      description: "",
      images: [],
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Activities | Mycotur</title>
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
          <div className="mb-4 relative ">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgba(142,133,129)]" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-[rgba(199,195,193)] shadow-sm shadow-[rgba(24,27,37,0.04)] text-[rgba(142,133,129)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[rgba(194,91,52)] focus:border-[rgba(194,91,52)]"
            />
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-[rgba(194,91,52)] hover:bg-[#C44D16] text-[rgba(255,255,255)] rounded-lg text-sm font-medium transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Activity
          </button>
        </div>

        <div className="bg-[rgba(255,255,255)] rounded-[16px] border border-[rgba(226,225,223)]">
          <ActivityList
            activities={activities}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
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
          <div
            className="bg-[rgba(255,255,255)] rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#111827] mb-4">
                {selectedActivity?.id ? "Edit Activity" : "Add Activity"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedActivity(null);
                }}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                ✕
              </button>
            </div>
            <ActivityForm
              activity={selectedActivity!}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
              onImageUpload={handleImageUpload}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedActivity(null);
              }}
            />
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActivityToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default ActivitiesPage;
