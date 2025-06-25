import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiEdit3, FiDownload, FiPlus, FiList } from 'react-icons/fi';

const Dashboard = () => {
  // This would typically fetch user's saved resumes and other data
  const savedResumes = [
    { id: 1, title: 'Software Engineer Resume', lastUpdated: '2 days ago' },
    { id: 2, title: 'Product Manager Resume', lastUpdated: '1 week ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1>The My Resume Rewrite section is working....</h1>
           <h1>To be worked upon  <p>Coming Soon.......</p></h1> 
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your resumes and job applications</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <Link to="/resume/new" className="block p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <FiPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">New Resume</h3>
                    <p className="mt-1 text-sm text-gray-500">Create a new resume from scratch</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <Link to="/resume/template" className="block p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <FiFileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Use a Template</h3>
                    <p className="mt-1 text-sm text-gray-500">Start with a professional template</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <Link to="/my-resumes" className="block p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <FiList className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">My Resume Rewrites</h3>
                    <p className="mt-1 text-sm text-gray-500">View and manage your saved resumes</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <Link to="/resume/upload" className="block p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <FiDownload className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Upload Resume</h3>
                    <p className="mt-1 text-sm text-gray-500">Import your existing resume</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <Link to="/profile" className="block p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <FiEdit3 className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Edit Profile</h3>
                    <p className="mt-1 text-sm text-gray-500">Update your personal information</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Recent Resumes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Resumes</h2>
            <Link to="/resume" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {savedResumes.map((resume) => (
                <li key={resume.id}>
                  <Link to={`/resume/${resume.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {resume.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {resume.lastUpdated}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {savedResumes.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new resume.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/resume/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                      New Resume
                    </Link>
                  </div>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
