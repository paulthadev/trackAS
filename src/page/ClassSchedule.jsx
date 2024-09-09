import { useState } from "react";
import Input from "../component/Input";
import useUserDetails from "../hooks/useUserDetails";
import MapModal from "../component/MapModal";

const ClassSchedule = () => {
  const { userDetails } = useUserDetails();
  const [formData, setFormData] = useState({
    courseTitle: "",
    courseCode: "",
    lectureVenue: "",
    time: "",
    date: "",
    note: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <section>
      <div className="grid md:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="px-6 lg:px-[133px] overflow-scroll h-[100vh]"
        >
          <img src="/trackAS.png" alt="logo" className="my-24" />
          <h2 className="text-[#000D46] font-bold text-2xl mt-5 mb-7">
            Welcome{userDetails ? `, ${userDetails.fullName}` : "!"}
          </h2>
          <div className="grid gap-y-4">
            <Input
              label="Course Title"
              name="courseTitle"
              type="text"
              placeholder="Enter Lecturer title"
              onChange={handleInputChange}
              value={formData.courseTitle}
            />

            <Input
              label="Course Code"
              name="courseCode"
              type="text"
              placeholder="Enter your course code"
              onChange={handleInputChange}
              value={formData.courseCode}
            />

            <Input
              label="Lecture Venue"
              name="lectureVenue"
              type="text"
              placeholder="Enter the venue for lecture"
              onChange={handleInputChange}
              value={formData.lectureVenue}
              MapModal={openModal} // Open the modal
            />

            {/* DaisyUI Modal in a separate component */}
            {isModalOpen && <MapModal onClose={closeModal} />}

            <div className="grid grid-cols-2 justify-stretch gap-x-10">
              <Input
                name="time"
                type="time"
                label="Time"
                placeholder="12:00AM"
                onChange={handleInputChange}
                value={formData.time}
              />
              <Input
                name="date"
                type="date"
                label="Date"
                onChange={handleInputChange}
                value={formData.date}
              />
            </div>

            <Input
              name="note"
              type="text"
              label="Note"
              placeholder="Write a note..."
              onChange={handleInputChange}
              value={formData.note}
            />
          </div>

          <button
            className="btn bg-[#000D46] text-white btn-block mt-6 text-base font-bold"
            type="submit"
          >
            Generate QR code
          </button>
        </form>
        <div>
          <img
            src="/scheduleImg.jpg"
            alt="schedule image"
            className="h-screen hidden md:block w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default ClassSchedule;
