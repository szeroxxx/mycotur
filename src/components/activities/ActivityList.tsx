import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Activity } from "../../types/activity";
import { ActivityRow } from "./ActivityRow";

interface ActivityListProps {
  profileStatus: {
    needsUpdate: boolean;
    fields: string[];
    message: string;
  } | null;
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onDuplicate?: (activity: Activity) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  profileStatus,
  activities,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const [isAgent, setIsAgent] = useState(false);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setIsAgent(parsedUserData.role === "agent");
      }
    } catch (err) {
      console.error("Error checking user role:", err);
    }
  }, []);

  if (isAgent && profileStatus?.needsUpdate) {
    return (
      <div
        className="bg-[rgba(255,255,255)] border border-red-400 text-red-700 p-4 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Perfil Incompleto</strong>
        <span className="block sm:inline">
          {" "}
          Por favor completa tu perfil antes de añadir actividades.
        </span>
        <div>
          <span className="block sm:inline"> {profileStatus?.message}</span>
        </div>
      </div>
    );
  }
  if (activities.length === 0) {
    return (
      <div className="bg-[rgba(255,255,255)] rounded-[16px] p-8 text-center">
        {" "}
        <Image
          src="/file.svg"
          alt="No Agents"
          width={80}
          height={80}
          className="mx-auto mb-4 opacity-50"
        />
        <h3 className="text-lg font-medium text-[rgba(68,63,63)] mb-2">
          No se encontraron actividades
        </h3>
        <p className="text-sm text-[rgba(100,92,90)]">
          {" "}
          No se han añadido actividades aún. Haz clic en el botón &quot;Añadir actividad&quot;
          para crear una.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col rounded-[16px] max-h-[calc(100vh-220px)]">
      <div className="overflow-x-auto scrollbar-hide rounded-[16px]">
        <div className="inline-block min-w-full rounded-[16px]">
          <div className="overflow-hidden rounded-[16px]">
            <table className="min-w-full divide-y divide-[#F3F4F6] rounded-[16px] overflow-hidden">
              <thead className="bg-[rgba(244,242,242)] sticky top-0 z-10 ">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider bg-[rgba(244,242,242)]"
                  >
                    Actividad
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider bg-[rgba(244,242,242)]"
                  >
                    Categoría
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider bg-[rgba(244,242,242)]"
                  >
                    Ubicación
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider bg-[rgba(244,242,242)]"
                  >
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[rgba(255,255,255)] divide-y divide-[#F3F4F6] ">
                {activities.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
