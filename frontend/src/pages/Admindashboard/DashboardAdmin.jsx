import { useState, useEffect } from "react";
import axios from "axios";

export default function DashboardAdmin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/applications");
      setApplications(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await axios.patch(`http://localhost:3000/api/v1/applications/${applicationId}`, { status: newStatus });
      
      fetchApplications();
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  if (loading) {
    return <div className="text-center text-lg font-semibold mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Application Dashboard</h1>

      {applications.length === 0 ? (
        <p className="text-center text-red-500 font-semibold">No applications found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <div key={application.id} className="bg-white p-5 rounded-lg shadow-lg border-l-4 border-blue-500">
              <h2 className="text-xl font-bold">{application.title}</h2>
              <p className="text-gray-700 font-medium">Founder: {application.founder}</p>
              <p className="text-gray-600">{application.email}</p>
              <p className="text-sm text-blue-700 font-semibold">Status: 
                <span className={`ml-1 ${application.status === 'APPROVED' ? 'text-green-600' : 'text-red-500'}`}>
                  {application.status}
                </span>
              </p>

              {/* Approve & Reject Buttons */}
              <div className="mt-3 flex gap-3">
                <button 
                  className="px-4 py-2 bg-green-500 text-white text-sm rounded disabled:opacity-50"
                  onClick={() => updateApplicationStatus(application.id, 'APPROVED')}
                  disabled={application.status === 'APPROVED'}
                >
                  Approve
                </button>
                <button 
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded disabled:opacity-50"
                  onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                  disabled={application.status === 'REJECTED'}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
