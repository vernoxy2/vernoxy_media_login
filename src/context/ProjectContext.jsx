import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers] = useState([
    { id: '1', name: 'Raj Patel', role: 'Designer' },
    { id: '2', name: 'Priya Shah', role: 'Developer' },
    { id: '3', name: 'Amit Kumar', role: 'Content Writer' },
    { id: '4', name: 'Neha Desai', role: 'Project Manager' },
  ]);

  // ✅ 1. Fetch all projects from Firebase
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

  // ✅ 2. Add new project - Both User & Admin can add
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

  // ✅ 3. Update project - Both User & Admin can update
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

  // ✅ 4. Delete project - Only Admin can delete
  const deleteProject = async (projectId) => {
    try {
      const userRole = localStorage.getItem('userRole');
      
      // Check if user is admin
      if (userRole !== 'admin') {
        toast.error('Only admins can delete projects');
        return;
      }

      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      throw error;
    }
  };

  // ✅ 5. Get single project by ID
  const getProjectById = (id) => {
    return projects.find((p) => p.id === id);
  };

  const value = {
    projects,
    loading,
    teamMembers,
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