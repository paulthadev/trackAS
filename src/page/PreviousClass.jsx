


import toast from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import { useEffect, useState } from "react";
import AttendanceListModal from "../component/AttendanceListModal";
import QRCodeModal from "../component/QRCodeModal";
import { Link } from "react-router-dom";
import Footer from "../component/Footer";

const PreviousClass = () => {
  const { userDetails } = useUserDetails();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [qrData, setQrData] = useState("");

  const lecturerId = userDetails?.id;

  const fetchClasses = async () => {
    if (!lecturerId) return;

    setIsLoading(true);

    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("lecturer_id", lecturerId);

    if (error) {
      toast.error(`Error fetching class data: ${error.message}`);
    } else {
      setClasses(data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, [lecturerId]);

  const handleViewQRCode = (classItem) => {
    if (classItem.qr_code) {
      setQrData(classItem.qr_code);
      setIsQRModalOpen(true);
    } else {
      toast.error("QR code not available");
    }
  };

  const handleDeleteClick = (classItem) => {
    setClassToDelete(classItem);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", classToDelete.id);
      
      if (error) throw error;
      
      toast.success("Class deleted successfully!");
      fetchClasses();
      
    } catch (error) {
      toast.error(`Failed to delete: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
    }
  };

  const handleViewAttendance = (classItem) => {
    setSelectedClass(classItem);
    setIsAttendanceModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAttendanceModalOpen(false);
    setIsQRModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedClass(null);
    setClassToDelete(null);
    setQrData("");
  };

  return (
    <>
      <section className="pb-20 pt-8 px-6 max-w-7xl mx-auto h-[calc(100vh-6rem)]">
        <div className="flex">
          <Link to="/classDetails">
            <button className="btn btn-sm rounded-full bg-blue-500 border-none text-white">
              Back
            </button>
          </Link>

          <h2 className="text-center mx-auto font-bold text-2xl mb-6 text-black">
            List of Previous Classes
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center text-black items-center h-32">
            <div className="flex items-center justify-center">
              <div className="loading loading-spinner bg-blue-500"></div>
            </div>
          </div>
        ) : (
          <>
            {classes.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto">
                <div className="flex overflow-scroll gap-4 md:grid md:grid-cols-8 mb-6">
                  <h2 className="font-bold text-black text-[0.7rem] md:text-base">
                    S/N
                  </h2>
                  <h2 className="font-bold text-black text-[0.7rem] md:text-base">
                    Course Code
                  </h2>
                  <h2 className="font-bold text-black text-[0.7rem] md:text-base">
                    Course Title
                  </h2>
                  <h2 className="font-bold text-black text-[0.7rem] md:text-base">
                    Date
                  </h2>
                  <h2 className="font-bold text-black text-[0.7rem] md:text-base">
                    Time
                  </h2>
                  <h2 className="font-bold text-black text-[0.7rem] md:text-base">
                    Attendance
                  </h2>
                  <h2 className="font-bold text-black text-[0.7rem] md:text-base">
                    QR Code
                  </h2>
                  <h2 className="font-bold text-black text-[0.7rem] md:text-base">
                    Delete
                  </h2>
                </div>
                
                {classes.map((classItem, index) => {
                  const formattedDate = new Date(
                    classItem.date
                  ).toLocaleDateString();
                  const formattedTime = new Date(
                    classItem.time
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={classItem.id}
                      className="flex overflow-scroll mb-4 md:grid md:grid-cols-8 gap-4 items-center p-2 hover:bg-gray-50"
                    >
                      <div className="text-neutral-700 text-sm md:text-base">
                        {index + 1}
                      </div>
                      <div className="text-neutral-700 text-sm md:text-base">
                        {classItem.course_code}
                      </div>
                      <div className="text-neutral-700 text-sm md:text-base">
                        {classItem.course_title}
                      </div>
                      <div className="text-neutral-700 text-sm md:text-base">
                        {formattedDate}
                      </div>
                      <div className="text-neutral-700 text-sm md:text-base">
                        {formattedTime}
                      </div>

                      <div>
                        <button
                          onClick={() => handleViewAttendance(classItem)}
                          className="btn btn-sm font-bold text-white bg-green-500 border-none"
                        >
                          View ({classItem.attendees?.length || 0})
                        </button>
                      </div>

                      <div>
                        <button
                          onClick={() => handleViewQRCode(classItem)}
                          className="btn btn-sm font-bold text-white bg-purple-500 border-none"
                          disabled={!classItem.qr_code}
                        >
                          View QR
                        </button>
                      </div>

                      <div>
                        <button
                          onClick={() => handleDeleteClick(classItem)}
                          className="btn btn-sm font-bold text-white bg-red-500 border-none"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-black">
                No previous classes found.
              </p>
            )}
          </>
        )}

        {/* Attendance Modal */}
        <AttendanceListModal
          isOpen={isAttendanceModalOpen}
          selectedClass={selectedClass}
          onClose={handleCloseModals}
        />

        {/* QR Code Modal - SIMPLIFIED */}
        {isQRModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4 text-center">
                Class QR Code
              </h2>
              <div className="flex justify-center mb-4">
                <img 
                  src={qrData} 
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setIsQRModalOpen(false);
                    setQrData("");
                  }}
                  className="btn bg-blue-500 text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal - SIMPLIFIED */}
        {isDeleteModalOpen && classToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Delete Class</h2>
              <p className="mb-2">Delete {classToDelete.course_title}?</p>
              <p className="text-sm text-gray-600 mb-6">
                This will remove the class and all attendance records.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setClassToDelete(null);
                  }}
                  className="btn bg-gray-300 text-gray-800"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteClass}
                  className="btn bg-red-500 text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
};

 export default PreviousClass;