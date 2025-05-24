import PublicLayout from "@/components/layout/PublicLayout";
import FilterBar from "@/components/organiser/FilterBar";
import OrganiserCard from "@/components/organiser/OrganiserCard";

const DiscoverOrganiserPage = () => {
  const organisers = [
    {
      id: 1,
      name: "Organiser name will show in this two lines if longer",
      totalEvents: 3,
      colorDots: ["#F59E0B", "#EF4444", "#10B981"],
      categories: [
        "Category Title",
        "Category Title",
        "Category Title long as this is",
        "Category Title long as this is",
        "Category Title long",
        "Category Title",
      ],
      description:
        "This section will display all updates made by the organiser, including any changes to their profile details or newly added activity links. As the organiser shares more updates, they will automatically appear here, keeping participants informed about the latest offerings, schedules, or announcements.",
    },
    {
      id: 2,
      name: "Organiser name will show in this two lines if longer",
      totalEvents: 4,
      colorDots: ["#F59E0B", "#EF4444", "#10B981"],
      categories: [
        "Category Title",
        "Category Title",
        "Category Title long as this is",
        "Category Title long as this is",
        "Category Title long",
        "Category Title",
      ],
      description:
        "This section will display all updates made by the organiser, including any changes to their profile details or newly added activity links. As the organiser shares more updates, they will automatically appear here, keeping participants informed about the latest offerings, schedules, or announcements.",
    },
    {
      id: 3,
      name: "Organiser name will show in this two lines if longer",
      totalEvents: 4,
      colorDots: ["#F59E0B", "#EF4444", "#10B981"],
      categories: [
        "Category Title",
        "Category Title",
        "Category Title long as this is",
        "Category Title long as this is",
        "Category Title long",
        "Category Title",
      ],
      description:
        "This section will display all updates made by the organiser, including any changes to their profile details or newly added activity links. As the organiser shares more updates, they will automatically appear here, keeping participants informed about the latest offerings, schedules, or announcements.",
    },
    {
      id: 4,
      name: "Organiser name will show in this two lines if longer",
      totalEvents: 2,
      colorDots: ["#F59E0B", "#EF4444", "#10B981"],
      categories: [
        "Category Title",
        "Category Title",
        "Category Title long as this is",
        "Category Title long as this is",
        "Category Title long",
        "Category Title",
      ],
      description:
        "This section will display all updates made by the organiser, including any changes to their profile details or newly added activity links. As the organiser shares more updates, they will automatically appear here, keeping participants informed about the latest offerings, schedules, or announcements.",
    },
    {
      id: 5,
      name: "Organiser name will show in this two lines if longer",
      totalEvents: 5,
      colorDots: ["#F59E0B", "#EF4444", "#10B981"],
      categories: [
        "Category Title",
        "Category Title",
        "Category Title long as this is",
        "Category Title long as this is",
        "Category Title long",
        "Category Title",
      ],
      description:
        "This section will display all updates made by the organiser, including any changes to their profile details or newly added activity links. As the organiser shares more updates, they will automatically appear here, keeping participants informed about the latest offerings, schedules, or announcements.",
    },
    {
      id: 6,
      name: "Organiser name will show in this two lines if longer",
      totalEvents: 3,
      colorDots: ["#F59E0B", "#EF4444", "#10B981"],
      categories: [
        "Category Title",
        "Category Title",
        "Category Title long as this is",
        "Category Title long as this is",
        "Category Title long",
        "Category Title",
      ],
      description:
        "This section will display all updates made by the organiser, including any changes to their profile details or newly added activity links. As the organiser shares more updates, they will automatically appear here, keeping participants informed about the latest offerings, schedules, or announcements.",
    },
  ];

  return (
    <PublicLayout>
      <FilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organisers.map((organiser) => (
          <OrganiserCard
            key={organiser.id}
            id={organiser.id}
            name={organiser.name}
            totalEvents={organiser.totalEvents}
            categories={organiser.categories}
            description={organiser.description}
            colorDots={organiser.colorDots}
          />
        ))}
      </div>
    </PublicLayout>
  );
};

export default DiscoverOrganiserPage;
