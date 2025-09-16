import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { ToastProvider } from './components/Toast'
import { GlobalLoading } from './components/LoadingOverlay'
import Calendar from './tools/Calendar'
import ImageGenerator from './tools/ImageGenerator'
import VideoGenerator from './tools/VideoGenerator'
import FileGenerator from './tools/FileGenerator'
import DataGenerator from './tools/DataGenerator'
import WordCounter from './tools/WordCounter'
import './App.css'

function App() {
  return (
    <ToastProvider>
      <GlobalLoading>
        <Router>
          <div className="app">
            <Layout>
                                                  <Routes>
                          <Route path="/" element={<Calendar />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/image-generator" element={<ImageGenerator />} />
                          <Route path="/video-generator" element={<VideoGenerator />} />
                          <Route path="/file-generator" element={<FileGenerator />} />
                          <Route path="/data-generator" element={<DataGenerator />} />
                          <Route path="/word-counter" element={<WordCounter />} />
                        </Routes>
            </Layout>
          </div>
        </Router>
      </GlobalLoading>
    </ToastProvider>
  )
}

export default App
