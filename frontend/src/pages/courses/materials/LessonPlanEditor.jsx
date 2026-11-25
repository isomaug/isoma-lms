import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '@/api/client/apiClient';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';

const LessonPlanEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('orgId');
  
  const [lesson, setLesson] = useState(null);
  const [googleDocUrl, setGoogleDocUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLessonAndDoc = async () => {
      try {
        // Fetch lesson details for titles
        const lessonData = await apiFetch(`/api/courses/lessons/${id}/`);
        setLesson(lessonData);

        if (!orgId) {
            setError("No organization selected. Please go back and select an organization.");
            setLoading(false);
            return;
        }

        // Fetch or Generate the Organization-specific Google Doc
        const docRes = await apiFetch(`/api/docs_integration/edit_link/${id}/${orgId}/`);
        if (!docRes.ok) {
            const errData = await docRes.json();
            throw new Error(errData.error || "Failed to generate document.");
        }
        const docData = await docRes.json();
        setGoogleDocUrl(docData.google_doc_url);

      } catch (err) {
        setError(err.message || 'Failed to load lesson details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonAndDoc();
  }, [id, orgId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Preparing Document...</h2>
        <p className="text-gray-500 mt-2">Generating and uploading organization template to Google Drive. This may take a few seconds.</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0B1120]">
          <div className="flex-grow flex items-center justify-center">
            <div className="text-red-500 font-semibold">{error || 'Lesson not found'}</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0B1120]">
        
        <div className="flex-grow flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a2332] rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col flex-grow"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Organization Lesson Plan
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {lesson.title}
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium"
              >
                Back to Course
              </button>
            </div>

            {!googleDocUrl ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-12 bg-gray-50 dark:bg-[#0f172a] rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Document Linked</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  This document could not be generated.
                </p>
              </div>
            ) : (
              <div className="flex-grow relative rounded-xl overflow-hidden shadow-inner bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 min-h-[600px]">
                <iframe
                  src={googleDocUrl.replace('/edit', '/edit?rm=minimal')}
                  title="Google Docs Editor"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </Layout>
  );
};

export default LessonPlanEditor;
