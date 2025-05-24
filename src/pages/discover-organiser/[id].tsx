import React from 'react';
import { useRouter } from 'next/router';
import PublicLayout from '@/components/layout/PublicLayout';
import DetailHeader from '@/components/organiser/DetailHeader';
import OrganiserDetail from '@/components/organiser/OrganiserDetail';

const OrganiserDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  React.useEffect(() => {
    // No auth check needed, this is a public page
  }, []);

  const organiser = {
    id: id,
    name: "Organiser name will show in this two lines if longer",
    totalEvents: 3,
    colorDots: ["#F59E0B", "#EF4444", "#10B981"],
    categories: [
      "Category Title", "Category Title",
      "Category Title long as this is", "Category Title long as this is",
      "Category Title long", "Category Title"
    ],
    description: "This section will display all updates made by the organiser, including any changes to their profile details or newly added activity links. As the organiser shares more updates, they will automatically appear here, keeping participants informed about the latest offerings, schedules, or announcements."
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 md:py-10">
          <DetailHeader organiser={organiser} />
          <OrganiserDetail organiser={organiser} />
        </div>
      </div>
    </PublicLayout>
  );
};

export default OrganiserDetailPage;
