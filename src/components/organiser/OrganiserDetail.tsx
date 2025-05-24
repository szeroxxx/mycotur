import React from 'react';
import { Calendar, Youtube, Facebook, Instagram } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrganiserDetailProps {
  organiser: {
    id: string | string[] | undefined;
    name: string;
    totalEvents: number;
    categories: string[];
    description: string;
    colorDots?: string[];
  };
}

const OrganiserDetail: React.FC<OrganiserDetailProps> = ({ organiser }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="md:col-span-2">
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">View Upcoming Event Dates</h2>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="bg-gray-light p-2 rounded flex flex-col items-center min-w-[48px]">
                <Calendar className="text-primary-orange h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">20th April, 2025 at 12:00 PM</span>
                  <span className="text-primary-orange text-sm">(Seats Available)</span>
                </div>
                <button className="text-primary-orange text-sm">Read More Detail</button>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-light p-2 rounded flex flex-col items-center min-w-[48px]">
                <Calendar className="text-primary-orange h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">20th April, 2025 at 12:00 PM</span>
                  <span className="text-primary-orange text-sm">(Seats Available)</span>
                </div>
                <button className="text-primary-orange text-sm">Read More Detail</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <p className="text-gray-700 mb-4">
            {organiser.description}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Meet the organizer John.</h2>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="John" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">12 Events Hosted</span>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="bg-red-500 hover:bg-red-600 rounded-full h-8 w-8 p-0">
                <Youtube className="h-4 w-4 text-white" />
              </Button>
              <Button size="icon" variant="ghost" className="bg-blue-600 hover:bg-blue-700 rounded-full h-8 w-8 p-0">
                <Facebook className="h-4 w-4 text-white" />
              </Button>
              <Button size="icon" variant="ghost" className="bg-orange-500 hover:bg-orange-600 rounded-full h-8 w-8 p-0">
                <Instagram className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Event Address</h2>
          <div className="h-[200px] rounded-lg overflow-hidden bg-gray-200 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button className="text-sm text-primary-orange">Get Direction Information</button>
          </div>
        </div>
      </div>

      <div className="col-span-1">
        <div className="bg-gray-light p-5 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Seasons</h2>
          
          <p className="text-sm text-gray-600 mb-4">
            quercus adventure can be organised in between January to April (best photo time from organiser)
          </p>
            <p className="text-sm text-gray-600 mb-6">
            Doesn&apos;t mind can be organization between the selected months. [to find more events contact directly to the organizer]
          </p>
          
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">RSVP Now</h3>
            
            <form>
              <div className="mb-4">
                <Label htmlFor="firstName" className="block text-sm text-gray-600 mb-1">First Name *</Label>
                <Input 
                  id="firstName" 
                  type="text" 
                  className="w-full border border-light p-2 rounded"
                  placeholder="John"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="phoneNumber" className="block text-sm text-gray-600 mb-1">Phone Number *</Label>
                <Input 
                  id="phoneNumber" 
                  type="text" 
                  className="w-full border border-light p-2 rounded"
                  placeholder="Enter your primary phone number"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="email" className="block text-sm text-gray-600 mb-1">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="w-full border border-light p-2 rounded"
                  placeholder="john@example.com"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="hikingPlaces" className="block text-sm text-gray-600 mb-1">Select Hiking Places</Label>
                <div className="flex justify-between border border-light rounded p-2">
                  <span className="text-sm">Low rising places</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center">-</button>
                    <span>0</span>
                    <button type="button" className="border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <Label htmlFor="message" className="block text-sm text-gray-600 mb-1">Tell us more</Label>
                <textarea 
                  id="message"
                  className="w-full border border-light p-2 rounded h-20"
                  placeholder="This message will directly forward to organizer"
                ></textarea>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary-orange text-white py-2 rounded font-medium"
              >
                Submit
              </Button>
            </form>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">View organizer details and contact them for more information</h3>
              <Button className="w-full bg-black text-white py-2 rounded font-medium mt-4">
                Get Contact Information
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganiserDetail;