import React, { useState } from 'react';
import Head from 'next/head';
import { Activity } from '../../types/activity';
import { ActivityList } from '../../components/activities/ActivityList';
import { ActivityForm } from '../../components/activities/ActivityForm';
import { DeleteModal } from '../../components/activities/DeleteModal';
import { Pagination } from '../../components/pagination/Pagination';
import { useActivities } from '../../hooks/useActivities';
import { FiPlus } from 'react-icons/fi';

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
    showToast
  } = useActivities();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (selectedActivity) {
      setSelectedActivity(prev => ({
        ...prev!,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && selectedActivity) {
      setSelectedActivity(prev => ({
        ...prev!,
        images: Array.from(e.target.files || [])
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
      id: '',
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
      showToast('error', 'Failed to save activity');
    }
  };

  const confirmDelete = async () => {
    if (activityToDelete) {
      try {
        await deleteActivity(activityToDelete.id);
        setIsDeleteModalOpen(false);
        setActivityToDelete(null);
      } catch (error) {
        showToast('error', 'Failed to delete activity');
      }
    }
  };

  const openAddModal = () => {
    setSelectedActivity({
      id: '',
      title: '',
      category: '',
      location: '',
      startMonth: '',
      endMonth: '',
      email: '',
      phone: '',
      url: '',
      notes: '',
      description: '',
      images: []
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
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#111827]">Activities</h1>
            <p className="text-sm text-[#6B7280]">Manage your activities here</p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Activity
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-[#E5E7EB] text-black rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          />
        </div>

        <div className="bg-white rounded-lg shadow">
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
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#111827] mb-4">
              {selectedActivity?.id ? 'Edit Activity' : 'Add Activity'}
            </h2>
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