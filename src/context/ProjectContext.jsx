import { createContext, useContext, useState, useEffect } from "react";
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
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              id: user.uid,
              email: user.email,
              name: userData.name || "",
              department: userData.department || "",
              role: userData.role || "user",
            });
            
            // 🆕 localStorage માં પણ save કરો
            localStorage.setItem("userRole", userData.role || "user");
            localStorage.setItem("userEmail", user.email);
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
      }
      setAuthLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  // Team members fetch
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const membersData = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          membersData.push({
            id: doc.id,
            email: userData.email,
            name: userData.name || "Unknown",
            role: userData.department || userData.role || "User",
            department: userData.department || "",
          });
        });
        setTeamMembers(membersData);
      } catch (error) {
        console.error("❌ Error fetching team members:", error);
      }
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchProjects();
    }
  }, [authLoading]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      if (!auth.currentUser) {
        console.warn("⚠️ No authenticated user");
        setProjects([]);
        setLoading(false);
        return;
      }

      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const projectsData = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();

        let createdAtDate = new Date();
        let updatedAtDate = new Date();

        if (data.createdAt && typeof data.createdAt.toDate === "function") {
          createdAtDate = data.createdAt.toDate();
        } else if (data.createdAt instanceof Date) {
          createdAtDate = data.createdAt;
        } else if (data.createdAt) {
          createdAtDate = new Date(data.createdAt);
        }

        if (data.updatedAt && typeof data.updatedAt.toDate === "function") {
          updatedAtDate = data.updatedAt.toDate();
        } else if (data.updatedAt instanceof Date) {
          updatedAtDate = data.updatedAt;
        } else if (data.updatedAt) {
          updatedAtDate = new Date(data.updatedAt);
        }

        projectsData.push({
          id: docSnap.id,
          ...data,
          createdAt: createdAtDate,
          updatedAt: updatedAtDate,
        });
      });

      console.log("✅ Loaded projects:", projectsData.length);
      setProjects(projectsData);
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      // 🆕 Better errors
      if (error.code === "permission-denied") {
        toast.error("Permission denied. Please check your access rights.");
      } else if (error.code === "unavailable") {
        toast.error("Firebase service unavailable. Please try again.");
      } else {
        toast.error("Failed to load projects. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData) => {
    try {
      if (!currentUser) {
        toast.error("Please login to add projects");
        return;
      }

      const newProject = {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.email,
      };

      const docRef = await addDoc(collection(db, "projects"), newProject);
      
      const addedProject = {
        ...newProject,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setProjects((prev) => [addedProject, ...prev]);
      toast.success("Project created successfully!");
      return addedProject;
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to create project");
      throw error;
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      if (!currentUser) {
        toast.error("Please login to update projects");
        return;
      }

      const projectRef = doc(db, "projects", projectId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.email,
      };

      await updateDoc(projectRef, updateData);
      
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, ...updateData, updatedAt: new Date() }
            : p
        )
      );

      toast.success("Project updated successfully!");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        toast.error("Only admins can delete projects");
        throw new Error("Unauthorized: Only admins can delete projects");
      }

      const projectRef = doc(db, "projects", projectId);
      await deleteDoc(projectRef);
      
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project deleted successfully!");
      return true;
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      
      if (error.message.includes("Unauthorized")) {
        toast.error("Only admins can delete projects");
      } else if (error.code === "permission-denied") {
        toast.error("Permission denied. Check Firebase security rules.");
      } else if (error.code === "not-found") {
        toast.error("Project not found");
      } else {
        toast.error("Failed to delete project. Please try again.");
      }

      throw error;
    }
  };

  const getProjectById = (id) => {
    return projects.find((p) => p.id === id);
  };

  const getTeamMemberName = (assignedToValue) => {
    if (!assignedToValue) return "Unassigned";
    
    let member = teamMembers.find((m) => m.id === assignedToValue);
    if (!member) {
      member = teamMembers.find((m) => m.email === assignedToValue);
    }
    if (!member) {
      member = teamMembers.find((m) => m.name === assignedToValue);
    }
    
    return member?.name || assignedToValue || "Unassigned";
  };

  const value = {
    projects,
    loading: loading || authLoading, 
    teamMembers,
    currentUser,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getTeamMemberName,
    refreshProjects: fetchProjects,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within ProjectProvider");
  }
  return context;
}