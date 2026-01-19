import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [teamMembers] = useState([
    { id: '1', name: 'Bhoomika Patel', role: 'Content Writer', email: 'bhoomika@example.com' },
    { id: '2', name: 'Nikhil Lad', role: 'Graphic Designer', email: 'nikhil@example.com' },
    { id: '3', name: 'Mayur Patel', role: 'Graphic Designer', email: 'mayur@example.com' },
    { id: '4', name: 'Dhruv Mistry', role: 'Front-End Developer', email: 'dhruv@example.com' },
    { id: '5', name: 'Vrunda Patel', role: 'Front-End Developer', email: 'vrunda@example.com' },
    { id: '6', name: 'Divya Patel', role: 'Front-End Developer', email: 'divya@example.com' },
    { id: '7', name: 'Jenil Dhimmar', role: 'Video Editor', email: 'jenil@example.com' },
  ]);

  // Fetch current logged-in user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userEmail = localStorage.getItem('userEmail');
          const userName = localStorage.getItem('userName');
          const userRole = localStorage.getItem('userRole');
          const userDepartment = localStorage.getItem('userDepartment');

          setCurrentUser({
            id: user.uid,
            email: userEmail || user.email,
            name: userName || user.displayName || '',
            department: userDepartment || '',
            role: userRole || 'user',
          });
          
          console.log('✅ Current user loaded:', {
            id: user.uid,
            email: userEmail,
            role: userRole,
            department: userDepartment
          });
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // FIXED: Use onSnapshot for real-time updates instead of getDocs
  useEffect(() => {
    console.log('🔥 Setting up real-time listener for projects...');
    
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📦 Projects snapshot received:', snapshot.size, 'documents');
        
        const projectsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Handle Firestore Timestamp conversion
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : 
                           (data.createdAt ? new Date(data.createdAt) : new Date());
          const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : 
                           (data.updatedAt ? new Date(data.updatedAt) : new Date());
          
          projectsData.push({
            id: doc.id,
            ...data,
            createdAt,
            updatedAt
          });
        });
        
        console.log('✅ Projects loaded:', projectsData.length);
        setProjects(projectsData);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error fetching projects:', error);
        toast.error('Failed to load projects');
        setLoading(false);
      }
    );

    return () => {
      console.log('🔌 Unsubscribing from projects listener');
      unsubscribe();
    };
  }, []);

  const addProject = async (projectData) => {
    try {
      const userRole = localStorage.getItem('userRole');
      if (!userRole) {
        toast.error('Please login to add projects');
        return;
      }

      console.log('➕ Adding new project:', projectData.projectId);

      // FIXED: Use ISO string instead of serverTimestamp for immediate local state update
      const now = new Date().toISOString();
      
      const newProject = {
        ...projectData,
        createdAt: now,
        updatedAt: now,
        createdBy: localStorage.getItem('userEmail') || 'unknown',
      };

      const docRef = await addDoc(collection(db, 'projects'), newProject);
      
      console.log('✅ Project added to Firebase:', docRef.id);

      // Return the project with Firebase ID
      return {
        id: docRef.id,
        ...newProject,
        createdAt: new Date(now),
        updatedAt: new Date(now)
      };
    } catch (error) {
      console.error('❌ Error adding project:', error);
      toast.error('Failed to create project');
      throw error;
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      const userRole = localStorage.getItem('userRole');
      if (!userRole) {
        toast.error('Please login to update projects');
        return;
      }

      console.log('✏️ Updating project:', projectId);

      const projectRef = doc(db, 'projects', projectId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: localStorage.getItem('userEmail') || 'unknown',
      };

      await updateDoc(projectRef, updateData);
      
      console.log('✅ Project updated successfully');
      
      // Note: onSnapshot will automatically update the local state
      // But we can also update it manually for immediate feedback
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, ...updateData, updatedAt: new Date() }
            : p
        )
      );

      // Don't show toast here since it will be shown by the calling component
    } catch (error) {
      console.error('❌ Error updating project:', error);
      toast.error('Failed to update project');
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      
      console.log('🗑️ Delete attempt:', {
        projectId,
        userRole,
        userEmail,
        isAdmin: userRole === 'admin'
      });
      
      if (userRole !== 'admin') {
        console.error('❌ Not authorized - user role:', userRole);
        toast.error('Only admins can delete projects');
        throw new Error('Unauthorized: Only admins can delete projects');
      }

      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
      
      console.log('✅ Project deleted from Firebase');
      
      // onSnapshot will automatically update the state, but we can do it manually too
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      
      if (error.message.includes('Unauthorized')) {
        toast.error('Only admins can delete projects');
      } else if (error.code === 'permission-denied') {
        toast.error('Permission denied. Check Firebase security rules.');
      } else if (error.code === 'not-found') {
        toast.error('Project not found');
      } else {
        toast.error('Failed to delete project. Please try again.');
      }
      
      throw error;
    }
  };

  const getProjectById = (id) => {
    return projects.find((p) => p.id === id);
  };

  const refreshProjects = () => {
    // Not needed anymore since we're using onSnapshot
    // But keeping it for backwards compatibility
    console.log('🔄 Manual refresh requested (using real-time listener, so this is a no-op)');
  };

  const value = {
    projects,
    loading,
    teamMembers,
    currentUser,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectProvider');
  }
  return context;
}