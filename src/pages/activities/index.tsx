import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Activity } from "../../types/activity";
import { ActivityList } from "../../components/activities/ActivityList";
import { ActivityForm } from "../../components/activities/ActivityForm";
import { DeleteModal } from "../../components/activities/DeleteModal";
import { Pagination } from "../../components/pagination/Pagination";
import { useActivities } from "../../hooks/useActivities";
import { useProfile } from "../../hooks/useProfile";
import { CircleCheck, Plus, Search } from "lucide-react";
interface Category {
  uuid: string;
  title: string;
  description: string;
}
const ActivitiesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isAgent, setIsAgent] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{
    needsUpdate: boolean;
    fields: string[];
    message: string;
  } | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(
    null
  );
  const { checkProfileCompletion, fetchCategoriesActivity } = useProfile();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData) return;

        const parsedUserData = JSON.parse(userData);
        setIsAgent(parsedUserData.role === "agent");
        if (parsedUserData.role !== "agent") return;

        const status = await checkProfileCompletion();
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
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, files } = target;

    if (selectedActivity) {
      if (type === "file" && files) {
        if (name === "images") {
          const existingImages = selectedActivity.images || [];
          const newImages = Array.from(files);
          setSelectedActivity((prev) => ({
            ...prev!,
            images: [...existingImages, ...newImages],
          }));
        } else if (name === "videos") {
          const existingVideos = selectedActivity.videos || [];
          const newVideos = Array.from(files);
          setSelectedActivity((prev) => ({
            ...prev!,
            videos: [...existingVideos, ...newVideos],
          }));
        } else {
          setSelectedActivity((prev) => ({
            ...prev!,
            [name]: Array.from(files),
          }));
        }
      } else if (name === "mediaUrls") {
        setSelectedActivity((prev: Activity | null) => ({
          ...prev!,
          mediaUrls: typeof value === "string" ? JSON.parse(value) : value,
        }));
      } else if (name === "images" && Array.isArray(value)) {
        setSelectedActivity((prev: Activity | null) => ({
          ...prev!,
          images: value,
        }));      } else if (name === "videos" && Array.isArray(value)) {
        setSelectedActivity((prev: Activity | null) => ({
          ...prev!,
          videos: value,
        }));
      } else if (name === "categories" && Array.isArray(value)) {
        setSelectedActivity((prev: Activity | null) => ({
          ...prev!,
          categories: value,
        }));
      } else {
        setSelectedActivity((prev: Activity | null) => ({
          ...prev!,
          [name]: value,
        }));
      }
    }
  };
  const handleEdit = (activity: Activity) => {
    const activityCopy = {
      ...activity,
      images: activity.images || [],
      videos: activity.videos || [],
      mediaUrls: activity.mediaUrls ? [...activity.mediaUrls] : [],
      categories: activity.categories || [],
    };
    setSelectedActivity(activityCopy);
    setIsModalOpen(true);
  };

  const handleDelete = (activity: Activity) => {
    setActivityToDelete(activity);
    setIsDeleteModalOpen(true);
  };  const handleDuplicate = async (activity: Activity) => {

    const duplicatedActivity = {
      ...activity,
      id: "",
      title: `${activity.title} (Copy)`,
      images: [],
      videos: [],
      mediaUrls: activity.mediaUrls ? [...activity.mediaUrls] : [],
      originalActivityId: activity.uuid,
      categories: activity.categories || [],
    };


    setSelectedActivity(duplicatedActivity);
    setIsModalOpen(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    setIsSubmitting(true);
    try {
      if (selectedActivity.id) {
        const updateData = {
          ...selectedActivity,
          images:
            selectedActivity.images?.filter((img) => img instanceof File) || [],
          videos:
            selectedActivity.videos?.filter((vid) => vid instanceof File) || [],
          mediaUrls: selectedActivity.mediaUrls || [],
        };

        await updateActivity(updateData);
      } else {
        const createData = {
          ...selectedActivity,
          images: selectedActivity.images || [],
          videos: selectedActivity.videos || [],
          mediaUrls: selectedActivity.mediaUrls || [],
        };

        await createActivity(createData);
      }

      setIsModalOpen(false);
      setSelectedActivity(null);
    } catch (err) {
      console.error("Error saving activity:", err);
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to save activity"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (activityToDelete) {
      try {
        await deleteActivity(activityToDelete.id);
        setIsDeleteModalOpen(false);
        setActivityToDelete(null);
      } catch (err) {
        showToast(
          "error",
          err instanceof Error ? err.message : "Failed to delete activity"
        );
      }
    }
  };  const openAddModal = () => {
    const newActivity = {
      id: "",
      uuid: "",
      title: "",
      categories: [],
      location: "",
      lat: "",
      lon: "",
      startMonth: "",
      endMonth: "",
      email: "",
      phone: "",
      url: "",
      notes: "",
      description: "",
      images: [],
      videos: [],
      mediaUrls: [],
    };

    setSelectedActivity(newActivity);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>Actividades | Mycotur</title>
      </Head>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 ${
            toast.type === "success"
              ? "bg-[rgba(22,163,74)]"
              : "bg-[rgba(179,38,30)]"
          } flex items-center max-w-sm`}
        >
          <CircleCheck className="mr-2 flex-shrink-0" size={20} />
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="relative w-full sm:w-80 lg:w-96">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgba(142,133,129)]"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isAgent && profileStatus?.needsUpdate}
              className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border border-[rgba(199,195,193)] shadow-sm shadow-[rgba(24,27,37,0.04)] text-[rgba(142,133,129)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[rgba(194,91,52)] focus:border-[rgba(194,91,52)] transition-colors ${
                isAgent && profileStatus?.needsUpdate
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>
          <button
            onClick={openAddModal}
            disabled={isAgent && profileStatus?.needsUpdate}
            className={`w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-colors ${
              isAgent && profileStatus?.needsUpdate
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-[rgba(194,91,52)] hover:bg-[#C44D16] text-[rgba(255,255,255)] cursor-pointer"
            }`}
          >
            <Plus className="mr-2" size={18} />
            Agregar Actividad
          </button>
        </div>
        <div className="bg-[rgba(255,255,255)] rounded-[16px] border border-[rgba(226,225,223)] flex flex-col">
          <div className="flex-grow overflow-hidden">
            <ActivityList
              profileStatus={profileStatus}
              activities={activities}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          </div>
          {activities.length > 0 && !(isAgent && profileStatus?.needsUpdate) && (
            <div className="border-t border-[rgba(226,225,223)] bg-white rounded-b-[16px] ">
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
      </div>{" "}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-2 sm:p-4 z-50">
          <div
            className="bg-[rgba(255,255,255)] rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-medium text-[rgba(68,63,63)]">
                {selectedActivity?.id ? "Editar Actividades" : "Agregar Nuevas Actividades"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedActivity(null);
                }}
                className="text-[rgba(68,63,63)] hover:text-[#111827] text-xl sm:text-base"
              >
                ✕
              </button>
            </div>{" "}
            {selectedActivity && (
              <ActivityForm
                activity={selectedActivity}
                categories={categories}
                onSubmit={handleSubmit}
                onChange={handleInputChange}
                isLoading={isSubmitting}
                onCancel={() => {
                  setIsModalOpen(false);
                  setSelectedActivity(null);
                }}
              />
            )}
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
    </div>
  );
};

export default ActivitiesPage;
