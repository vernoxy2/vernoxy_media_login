import { useProjects } from "../context/ProjectContext"
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Badge } from '../Components/ui/badge';
import { Mail, Briefcase } from 'lucide-react';

export default function Team() {
  const { teamMembers, projects } = useProjects();

  const getProjectCount = (memberId) => {
    return projects.filter(p => p.assignedTo === memberId).length;
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Admin':
        return 'default';
      case 'Designer':
        return 'secondary';
      case 'Developer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Team</h1>
        <p className="text-muted-foreground">Manage your team members and their assignments</p>
      </div>

      {/* Team Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {member.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                {getProjectCount(member.id)} active projects
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
