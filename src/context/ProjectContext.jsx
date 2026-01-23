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

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            const userInfo = {
              id: user.uid,
              email: user.email,
              name: userData.name || "",
              department: userData.department || "",
              role: userData.role || "user",
            };

            setCurrentUser(userInfo);

            // Save to localStorage
            localStorage.setItem("userId", user.uid);
            localStorage.setItem("userRole", userData.role || "user");
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("userName", userData.name || "");
            localStorage.setItem("userDepartment", userData.department);
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("userDepartment");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch team members
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
            email: userData.email || "",
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

  // Fetch projects after auth is loaded
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

        // Handle timestamp conversion
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

      setProjects(projectsData);
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

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

      // Return project with Firebase ID and current dates for immediate use
      const addedProject = {
        ...projectData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: currentUser.email,
      };

      // Update local state
      setProjects((prev) => [addedProject, ...prev]);

      toast.success("Project created successfully!");
      return addedProject;
    } catch (error) {
      console.error("❌ Error adding project:", error);
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

      // ✅ FIX: Fetch fresh data from Firebase after update
      const updatedDoc = await getDoc(projectRef);
      const freshData = updatedDoc.data();

      // ✅ FIX: Create a completely new object to trigger React re-renders
      const updatedProject = {
        id: projectId,
        ...freshData,
        updatedAt: freshData.updatedAt?.toDate() || new Date(),
        createdAt: freshData.createdAt?.toDate() || new Date(),
      };

      // ✅ FIX: Replace the entire array to ensure reference change
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? updatedProject : p
        )
      );

      toast.success("Project updated successfully!");
      return updatedProject;
    } catch (error) {
      console.error("❌ Error updating project:", error);
      toast.error("Failed to update project");
      throw error;
    }
  };

  // ✅ NEW: Silent update for real-time listeners (no toast)
  const updateProjectSilent = (projectId, freshData) => {
    const updatedProject = {
      id: projectId,
      ...freshData,
      updatedAt: freshData.updatedAt?.toDate?.() || new Date(freshData.updatedAt || Date.now()),
      createdAt: freshData.createdAt?.toDate?.() || new Date(freshData.createdAt || Date.now()),
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? updatedProject : p
      )
    );
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

    // Try to find by name first (since form uses names)
    let member = teamMembers.find((m) => m.name === assignedToValue);

    // Fallback to ID
    if (!member) {
      member = teamMembers.find((m) => m.id === assignedToValue);
    }

    // Fallback to email
    if (!member) {
      member = teamMembers.find((m) => m.email === assignedToValue);
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
    updateProjectSilent, // ⭐ Added for real-time updates
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