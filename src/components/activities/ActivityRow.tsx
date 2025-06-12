import React, { useState, useRef, useEffect } from "react";
import { FiEdit2, FiTrash2, FiCopy } from "react-icons/fi";
import { Activity } from "../../types/activity";
import { createActivityUrl } from "../../utils/urlHelpers";

interface ActivityRowProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onDuplicate?: (activity: Activity) => void;
}

export const ActivityRow: React.FC<ActivityRowProps> = ({
  activity,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setShowCategoryPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCategoryPopup(!showCategoryPopup);
  };

  return (
    <tr className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] scrollbar-hide">
      <td className="py-4 px-6 text-sm text-[#82abcb] max-w-xs">
        <a
          href={createActivityUrl(activity.title, activity.uuid)}
          rel="noopener noreferrer"
          className="cursor-pointer hover:text-[#111827] hover:underline transition-colors"
          title={activity.title}
        >
          {activity.title}
        </a>
      </td>

      <td className="py-4 px-6 text-sm text-[rgba(68,63,63)] max-w-xs relative">
        <div
          className="truncate"
          title={(activity.categories || []).join(", ")}
        >
          {activity.categories && activity.categories.length > 0 ? (
            activity.categories.length === 1 ? (
              activity.categories[0]
            ) : (
              <>
                {activity.categories[0]} +
                <span
                  ref={moreButtonRef}
                  onClick={handleMoreClick}
                  className="text-[#82abcb] hover:text-[#111827] cursor-pointer underline ml-1"
                >
                  {activity.categories.length - 1} más
                </span>
              </>
            )
          ) : (
            "No categorías"
          )}
        </div>
        {showCategoryPopup &&
          activity.categories &&
          activity.categories.length > 1 && (
            <div
              ref={popupRef}
              className="fixed z-[9999] p-3 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[200px] max-w-[300px]"
              style={{
                top: moreButtonRef.current
                  ? moreButtonRef.current.getBoundingClientRect().bottom +
                    window.scrollY +
                    8
                  : "100%",
                left: moreButtonRef.current
                  ? moreButtonRef.current.getBoundingClientRect().left +
                    window.scrollX
                  : "0",
              }}
            >
              <div className="space-y-1">
                {activity.categories.map((category, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 py-1 px-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    {category}
                  </div>
                ))}
              </div>
              <div
                className="absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45"
                style={{
                  top: "-6px",
                  left: "16px",
                }}
              ></div>
            </div>
          )}
      </td>
      <td className="py-4 px-6 text-sm text-[rgba(68,63,63)] max-w-md">
        <div className="truncate" title={activity.location}>
          {activity.location}
        </div>
      </td>
      <td className="py-4 px-6 text-sm text-[rgba(68,63,63)] whitespace-nowrap w-24">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onEdit(activity)}
            className="cursor-pointer text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
            title="Edit"
          >
            <FiEdit2 size={16} />
          </button>
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(activity)}
              className="cursor-pointer text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
              title="Duplicate"
            >
              <FiCopy size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete(activity)}
            className="cursor-pointer text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
