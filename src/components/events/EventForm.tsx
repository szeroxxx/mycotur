import React from 'react';
import { Event } from '../../types/event';

interface EventFormProps {
  event: Partial<Event>;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  activities: { id: string; title: string; }[];
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  onChange,
  onImageUpload,
  onCancel,
  activities
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Select Activity*
        </label>
        <select
          name="activityName"
          value={event.activityName || ''}
          onChange={onChange}
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        >
          <option value="">Select Activity</option>
          {activities.map(activity => (
            <option key={activity.id} value={activity.title}>
              {activity.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Event Title*
        </label>
        <input
          type="text"
          name="event"
          value={event.event || ''}
          onChange={onChange}
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">
            Event Date*
          </label>
          <input
            type="date"
            name="eventDate"
            value={event.eventDate || ''}
            onChange={onChange}
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">
            Event Time*
          </label>
          <input
            type="time"
            name="eventTime"
            value={event.eventTime || ''}
            onChange={onChange}
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Event Category*
        </label>
        <select
          name="category"
          value={event.category || ''}
          onChange={onChange}
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        >
          <option value="">Select Category</option>
          <option value="Experiences">Experiences</option>
          <option value="Cultural">Cultural</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Location*
        </label>
        <input
          type="text"
          name="location"
          value={event.location || ''}
          onChange={onChange}
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Contact Information*
        </label>
        <div className="space-y-4">
          <input
            type="email"
            name="email"
            value={event.email || ''}
            onChange={onChange}
            placeholder="Email address"
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />
          <input
            type="tel"
            name="phone"
            value={event.phone || ''}
            onChange={onChange}
            placeholder="Phone number"
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Fees
        </label>
        <textarea
          name="fees"
          value={event.fees || ''}
          onChange={onChange}
          placeholder="Maximum if there are any fees involved, such as a €50 charge per person covering food and all activities"
          rows={3}
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Description*
        </label>
        <textarea
          name="description"
          value={event.description || ''}
          onChange={onChange}
          placeholder="Write more details about the event"
          rows={3}
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          Event Images
        </label>
        <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center">
          <input
            type="file"
            name="images"
            onChange={onImageUpload}
            multiple
            accept="image/*"
            className="hidden"
            id="event-images"
          />
          <label
            htmlFor="event-images"
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
          {event.id ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
};