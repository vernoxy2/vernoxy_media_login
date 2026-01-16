import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp 
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
    { id: '1', name: 'Bhumika Patel', role: 'Content Writer' },
    { id: '2', name: 'Nikhil Lad', role: 'Graphic Designer' },
    { id: '3', name: 'Mayur Patel', role: 'Graphic Designer' },
    { id: '4', name: 'Dhruv Mistry', role: 'Front-End Developer' },
    { id: '5', name: 'Vrunda Patel', role: 'Front-End Developer' },
    { id: '6', name: 'Divya Patel', role: 'Front-End Developer' },
    { id: '7', name: 'Jenil Dhimmar', role: 'Video Editor' },
  ]);

  // ✅ Fetch current logged-in user data from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              id: user.uid,
              email: user.email,
              name: userData.name || '',
              department: userData.department || '',
              role: userData.role || 'user',
            });
            
          } else {
            console.warn('⚠️ User document not found in Firestore');
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const projectsData = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        });
      });
      
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData) => {
    try {
      const userRole = localStorage.getItem('userRole');
      if (!userRole) {
        toast.error('Please login to add projects');
        return;
      }
      const newProject = {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: localStorage.getItem('userEmail') || 'unknown',
      };
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      const addedProject = {
        ...newProject,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProjects((prev) => [addedProject, ...prev]);
      toast.success('Project created successfully!');
      return addedProject;
    } catch (error) {
      console.error('Error adding project:', error);
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
      const projectRef = doc(db, 'projects', projectId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: localStorage.getItem('userEmail') || 'unknown',
      };
      await updateDoc(projectRef, updateData);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, ...updateData, updatedAt: new Date() }
            : p
        )
      );
      toast.success('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      // Check if user is admin
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      
      console.log('🗑️ Delete attempt:', {
        projectId,
        userRole,
        userEmail,
        isAdmin: userRole === 'admin',
        currentUser: currentUser
      });
      
      if (userRole !== 'admin') {
        console.error('❌ Not authorized - user role:', userRole);
        toast.error('Only admins can delete projects');
        throw new Error('Unauthorized: Only admins can delete projects');
      }
      // Delete from Firebase
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success('Project deleted successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      // More specific error messages
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

  const value = {
    projects,
    loading,
    teamMembers,
    currentUser,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    refreshProjects: fetchProjects,
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