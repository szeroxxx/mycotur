import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Activity } from "../../types/activity";
import { ActivityList } from "../../components/activities/ActivityList";
import { ActivityForm } from "../../components/activities/ActivityForm";
import { DeleteModal } from "../../components/activities/DeleteModal";
import { Pagination } from "../../components/pagination/Pagination";
import { useActivities } from "../../hooks/useActivities";
import { useProfile } from "../../hooks/useProfile";
import { CircleCheck } from "lucide-react";
import { FiPlus } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
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
          mediaUrls: typeof value === 'string' ? JSON.parse(value) : value,
        }));
      } else if (name === "images" && Array.isArray(value)) {
        // Handle direct array updates for images
        setSelectedActivity((prev: Activity | null) => ({
          ...prev!,
          images: value,
        }));
      } else if (name === "videos" && Array.isArray(value)) {
        // Handle direct array updates for videos
        setSelectedActivity((prev: Activity | null) => ({
          ...prev!,
          videos: value,
        }));
      } else {
        setSelectedActivity((prev: Activity | null) => ({
          ...prev!,
          [name]: value,
        }));
      }
    }
  };
  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files || !selectedActivity) return;

  //   const existingImages = selectedActivity.images || [];
  //   const newImages = Array.from(e.target.files);

  //   setSelectedActivity((prev) => ({
  //     ...prev!,
  //     images: [...existingImages, ...newImages],
  //   }));
  // };

  const handleEdit = (activity: Activity) => {
    console.log("Editing activity:", activity);

    const activityCopy = {
      ...activity,
      images: activity.images || [],
      videos: activity.videos || [],
      mediaUrls: activity.mediaUrls ? [...activity.mediaUrls] : [],
    };

    console.log("Activity copy for editing:", activityCopy);
    setSelectedActivity(activityCopy);
    setIsModalOpen(true);
  };

  const handleDelete = (activity: Activity) => {
    setActivityToDelete(activity);
    setIsDeleteModalOpen(true);
  };

  const handleDuplicate = async (activity: Activity) => {
    const duplicatedActivity = {
      ...activity,
      id: "",
      title: `${activity.title} (Copy)`,
      images: [],
      videos: [],
      mediaUrls:
        activity.mediaUrls?.map((media) => ({
          name: media.name,
          type: media.type,
        })) || [],
      originalActivityId: activity.id,
    };

    console.log("Duplicated activity ready:", duplicatedActivity);
    setSelectedActivity(duplicatedActivity);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

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

        console.log("Update data:", updateData);
        await updateActivity(updateData);
      } else {
        const createData = {
          ...selectedActivity,
          images: selectedActivity.images || [],
          videos: selectedActivity.videos || [],
        };

        console.log("Create data:", createData);
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
  };
  const openAddModal = () => {
    const newActivity = {
      id: "",
      title: "",
      category: "",
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

    console.log("Opening add modal with new activity:", newActivity);
    setSelectedActivity(newActivity);
    setIsModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Activities | Mycotur</title>
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
            disabled={isAgent && profileStatus?.needsUpdate}
            className={`inline-flex items-center px-4 py-2 ${
              isAgent && profileStatus?.needsUpdate
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[rgba(194,91,52)] hover:bg-[#C44D16]"
            } text-[rgba(255,255,255)] rounded-lg text-sm font-medium transition-colors`}
          >
            <FiPlus className="mr-2" />
            Add Activity
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
          {activities.length > 0 && (
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div
            className="bg-[rgba(255,255,255)] rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-[rgba(68,63,63)] mb-4">
                {selectedActivity?.id ? "Edit Activity" : "Add Activity"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedActivity(null);
                }}
                className="text-[rgba(68,63,63)] hover:text-[#111827]"
              >
                ✕
              </button>
            </div>
            {selectedActivity && (
              <ActivityForm
                activity={selectedActivity}
                categories={categories}
                onSubmit={handleSubmit}
                onChange={handleInputChange}
                // onImageUpload={handleImageUpload}
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
    </>
  );
};

export default ActivitiesPage;
