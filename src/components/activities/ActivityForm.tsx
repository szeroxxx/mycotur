import React from 'react';
import { Activity } from '../../types/activity';

interface ActivityFormProps {
  activity: Partial<Activity>;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  activity,
  onSubmit,
  onChange,
  onImageUpload,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Activity Title*
        </label>
        <input
          type="text"
          name="title"
          value={activity.title || ''}
          onChange={onChange}
          className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Activity Category*
        </label>
        <select
          name="category"
          value={activity.category || ''}
          onChange={onChange}
          className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        >
          <option value="">Select Category</option>
          <option value="Experiences">Experiences</option>
          <option value="Interpretation Center">Interpretation Center</option>
          <option value="Cultural Group">Cultural Group</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Location*
        </label>
        <input
          type="text"
          name="location"
          value={activity.location || ''}
          onChange={onChange}
          className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">
            Start Month
          </label>
          <input
            type="month"
            name="startMonth"
            value={activity.startMonth || ''}
            onChange={onChange}
            className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">
            End Month
          </label>
          <input
            type="month"
            name="endMonth"
            value={activity.endMonth || ''}
            onChange={onChange}
            className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Contact Information*
        </label>
        <div className="space-y-4">
          <input
            type="email"
            name="email"
            value={activity.email || ''}
            onChange={onChange}
            placeholder="Email address"
            className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />
          <input
            type="tel"
            name="phone"
            value={activity.phone || ''}
            onChange={onChange}
            placeholder="Phone number"
            className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={activity.notes || ''}
          onChange={onChange}
          placeholder="Maximum if there are any fees involved, such as a €50 charge per person covering food and all activities"
          rows={3}
          className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Description*
        </label>
        <textarea
          name="description"
          value={activity.description || ''}
          onChange={onChange}
          placeholder="Write more details. Activity type will help people can contact you."
          rows={3}
          className="w-full px-4 py-2 text-black border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Activity Images
        </label>
        <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center">
          <input
            type="file"
            name="images"
            onChange={onImageUpload}
            multiple
            accept="image/*"
            className="hidden"
            id="activity-images"
          />
          <label
            htmlFor="activity-images"
            className="cursor-pointer text-sm text-[#6B7280]"
          >
            Click to upload images, videos
          </label>
          <p className="text-xs text-[#6B7280] mt-2">Supported JPG/PNG files</p>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
        >
          {activity.id ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
};