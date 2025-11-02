import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, X, Lock } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuthStore } from '../store/store';

const Certificate = ({ isOpen, onClose, certificateData }) => {
  const certificateRef = useRef(null);
  const user = useAuthStore((state) => state.user);

  if (!isOpen || !certificateData) return null;

  // Check if certificate feature is unlocked
  const hasCertificateUnlocked = user?.unlockedRewards?.includes('certificate') || false;

  const { userName, section, completionDate, score, totalLessons, timeSpent } = certificateData;

  // Certificate themes based on section
  const themes = {
    HTML: {
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      icon: '🌐',
      color: '#ff6b6b',
      accent: '#ee5a6f'
    },
    CSS: {
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      icon: '🎨',
      color: '#4dabf7',
      accent: '#5f3dc4'
    },
    JavaScript: {
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      icon: '⚡',
      color: '#ffd43b',
      accent: '#fab005'
    }
  };

  const theme = themes[section] || themes.HTML;

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`IdleLearn-${section}-Certificate-${userName.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const shareCertificate = () => {
    if (!hasCertificateUnlocked) {
      alert('🔒 Certificate feature locked! Purchase in Store to unlock.');
      return;
    }
    
    const text = `🎓 I just completed the ${section} section on IdleLearn! ${totalLessons} lessons mastered with ${score}% score! 🚀 #IdleLearn #WebDevelopment #${section}`;
    
    if (navigator.share) {
      navigator.share({
        title: `IdleLearn ${section} Certificate`,
        text: text,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(text);
      alert('Certificate text copied to clipboard!');
    }
  };

  // If certificate feature is locked, show lock screen
  if (!hasCertificateUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>

          {/* Lock Screen Content */}
          <div className="text-center py-8">
            <div className="inline-block p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
              <Lock className="w-16 h-16 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Certificate Feature Locked 🔒
            </h2>
            
            <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
              Congratulations on completing the <span className="font-bold text-gray-900">{section}</span> section! 
              You've earned this certificate, but you need to unlock the certificate feature first.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What you'll get:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Professional PDF certificates for all completed sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Beautiful designs with your name and achievements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Download and share on LinkedIn, portfolio, or social media</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Section-specific themes (HTML, CSS, JavaScript)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Unique certificate IDs for authenticity</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-6">
              <p className="text-2xl font-bold text-amber-900">
                💰 Only 300 Coins
              </p>
              <p className="text-sm text-amber-700 mt-1">
                One-time purchase • Lifetime access • All certificates
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                // Navigate to store (you might want to use React Router here)
                window.location.hash = '#/store';
              }}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              Go to Store & Unlock Now 🚀
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Your progress is saved • Unlock anytime
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="relative max-w-5xl w-full"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        {/* Certificate */}
        <div
          ref={certificateRef}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ aspectRatio: '297/210' }} // A4 landscape ratio
        >
          {/* Decorative Border */}
          <div className="relative p-8 h-full">
            <div className="absolute inset-4 border-8 border-double border-gray-300 rounded-lg"></div>
            <div className="absolute inset-6 border-2 border-gray-200 rounded-lg"></div>

            {/* Decorative Corners */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-gray-400 rounded-tl-lg"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-gray-400 rounded-tr-lg"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-gray-400 rounded-bl-lg"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-gray-400 rounded-br-lg"></div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-between py-12 px-16 z-10">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Award className="w-12 h-12" style={{ color: theme.color }} />
                  <h1 className="text-4xl font-bold text-gray-800">
                    IdleLearn
                  </h1>
                </div>
                <div className={`inline-block px-6 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-full text-lg font-semibold`}>
                  Certificate of Completion
                </div>
              </div>

              {/* Main Content */}
              <div className="text-center space-y-6 flex-1 flex flex-col items-center justify-center">
                <p className="text-xl text-gray-600 font-medium">
                  This is to certify that
                </p>
                
                <h2 className="text-5xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 px-8">
                  {userName}
                </h2>

                <p className="text-xl text-gray-600 font-medium max-w-2xl">
                  has successfully completed the
                </p>

                <div className="relative">
                  <div className={`text-6xl font-black bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                    {section}
                  </div>
                  <div className="text-3xl mt-2 text-gray-700 font-semibold">
                    Development Course
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: theme.color }}>
                      {totalLessons}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Lessons Completed</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: theme.color }}>
                      {score}%
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Average Score</div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: theme.color }}>
                      {timeSpent}h
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Time Invested</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between w-full pt-8">
                <div className="text-center flex-1">
                  <div className="w-48 border-t-2 border-gray-400 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 font-semibold">Completion Date</p>
                  <p className="text-lg text-gray-800 font-bold">
                    {new Date(completionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="text-center flex-1">
                  <div className={`text-6xl mb-2`}>{theme.icon}</div>
                  <p className="text-xs text-gray-500">Certificate ID: IL-{section.toUpperCase()}-{Date.now().toString(36).toUpperCase()}</p>
                </div>

                <div className="text-center flex-1">
                  <div className="w-48 border-t-2 border-gray-400 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 font-semibold">Authorized Signature</p>
                  <p className="text-lg text-gray-800 font-bold italic">IdleLearn Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadCertificate}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareCertificate}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-lg transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share Achievement
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Certificate;
