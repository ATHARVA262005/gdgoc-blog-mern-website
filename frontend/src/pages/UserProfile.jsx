import React, { useState } from 'react';
import { User, Calendar, Mail, Github, Twitter, Linkedin, Globe, ThumbsUp, MessageCircle } from 'lucide-react';
import ProfilePictureModal from '../components/ProfilePictureModal';

// Mock comments data
const userComments = [
  {
    id: 1,
    blogTitle: "Getting Started with React Hooks",
    comment: "Great article! I especially liked the section about useEffect dependencies.",
    date: "2 days ago",
    likes: 12
  },
  {
    id: 2,
    blogTitle: "The Future of AI in 2025",
    comment: "The predictions about machine learning frameworks are spot on.",
    date: "5 days ago",
    likes: 8
  },
  {
    id: 3,
    blogTitle: "Building Responsive Layouts",
    comment: "This helped me understand CSS Grid much better. Thanks!",
    date: "1 week ago",
    likes: 15
  }
];

const UserProfile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    username: "Sarah Johnson",
    email: "sarah.j@example.com",
    joinDate: "January 2025",
    bio: "Full-stack developer passionate about React and modern web technologies",
    profilePicture: {
      url: "https://placehold.co/400x400/3B82F6/FFFFFF",
      name: "The Explorer",
      description: "Curious and adventurous reader who loves discovering new topics"
    },
    socialLinks: [
      { platform: 'website', url: 'sarahjohnson.dev', icon: Globe },
      { platform: 'github', url: 'github.com/sarahj', icon: Github },
      { platform: 'twitter', url: 'twitter.com/sarahj', icon: Twitter },
      { platform: 'linkedin', url: 'linkedin.com/in/sarahj', icon: Linkedin }
    ]
  });

  const handleProfilePictureChange = (newImageData) => {
    setUserData(prev => ({
      ...prev,
      profilePicture: newImageData
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative group">
              <img 
                src={userData.profilePicture.url} 
                alt={userData.profilePicture.name} 
                className="w-32 h-32 rounded-full object-cover cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-center p-2"
                   onClick={() => setIsModalOpen(true)}>
                <User className="text-white mb-1" size={20} />
                <span className="text-white text-xs font-medium">{userData.profilePicture.name}</span>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{userData.username}</h1>
              <p className="text-gray-600 mb-4">{userData.bio}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Joined {userData.joinDate}</span>
                </div>
                {userData.socialLinks.map(({ platform, url, icon: Icon }) => (
                  <a
                    key={platform}
                    href={`https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Icon size={16} />
                    <span className="capitalize">{platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Comments</h2>
          <div className="space-y-4">
            {userComments.map(comment => (
              <div key={comment.id} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-blue-600 mb-2">{comment.blogTitle}</h3>
                <p className="text-gray-600 mb-4">{comment.comment}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{comment.date}</span>
                  <div className="flex items-center gap-2">
                    <ThumbsUp size={16} />
                    <span>{comment.likes} likes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProfilePictureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleProfilePictureChange}
        currentImage={userData.profilePicture.url}
      />
    </div>
  );
};

export default UserProfile;
