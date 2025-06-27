import { useState, useMemo } from 'react';
import { Plus, Users, Trash2, Target, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { TeamDialog } from '../components/TeamDialog';
import { RoleDialog } from '../components/RoleDialog';
import { TeamMemberDialog } from '../components/TeamMemberDialog';
import { QuarterDialog } from '../components/QuarterDialog';
import { TeamCapacityDialog } from '../components/TeamCapacityDialog';
import { MemberCapacityDialog } from '../components/MemberCapacityDialog';

import type { Team, Role, TeamMember, Quarter, TeamCapacity, MemberCapacity } from '../types';

interface TeamsPageProps {
  teams: Team[];
  roles: Role[];
  teamMembers: TeamMember[];
  quarters: Quarter[];
  teamCapacities: TeamCapacity[];
  memberCapacities: MemberCapacity[];
  onTeamSave: (team: Omit<Team, 'id'>) => Promise<void>;
  onTeamEdit: (team: Team) => Promise<void>;
  onTeamDelete?: (teamId: string) => Promise<void>;
  onRoleSave: (role: Omit<Role, 'id' | 'createdAt'>) => Promise<void>;
  onRoleEdit: (role: Role) => Promise<void>;
  onRoleDelete: (roleId: string) => Promise<void>;
  onMemberSave: (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onMemberEdit: (member: TeamMember) => Promise<void>;
  onMemberDelete: (memberId: string) => Promise<void>;
  onQuarterSave: (quarter: Omit<Quarter, 'id' | 'createdAt'>) => Promise<void>;
  onQuarterEdit: (quarter: Quarter) => Promise<void>;
  onTeamCapacitySave: (teamId: string, quarterId: string, capacity: number) => Promise<void>;
  onMemberCapacitySave: (memberId: string, quarterId: string, capacity: number) => Promise<void>;
  getRoleById: (roleId: string) => Role | undefined;
  getTeamCapacity: (teamId: string, quarterId: string) => number;
  getMemberCapacity: (memberId: string, quarterId: string) => number;
}

export function TeamsPage({
  teams,
  roles,
  teamMembers,
  quarters,
  teamCapacities,
  memberCapacities,
  onTeamSave,
  onTeamEdit,
  onTeamDelete,
  onRoleSave,
  onRoleEdit,
  onRoleDelete,
  onMemberSave,
  onMemberEdit,
  onMemberDelete,
  onQuarterSave,
  onQuarterEdit,
  onTeamCapacitySave,
  onMemberCapacitySave,
  getRoleById,
  getTeamCapacity,
  getMemberCapacity,
}: TeamsPageProps) {
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [quarterDialogOpen, setQuarterDialogOpen] = useState(false);
  const [capacityDialogOpen, setCapacityDialogOpen] = useState(false);
  const [memberCapacityDialogOpen, setMemberCapacityDialogOpen] = useState(false);

  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [editingRole, setEditingRole] = useState<Role | undefined>();
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [editingQuarter, setEditingQuarter] = useState<Quarter | undefined>();
  const [editingTeamCapacity, setEditingTeamCapacity] = useState<Team | undefined>();
  const [editingMemberCapacity, setEditingMemberCapacity] = useState<TeamMember | undefined>();

  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<string>(teams[0]?.id || '');

  // Получение выбранной команды для участников
  const selectedTeamForMembersObj = useMemo(() => {
    return teams.find(team => team.id === selectedTeamForMembers);
  }, [teams, selectedTeamForMembers]);

  const getMembersByTeamId = (teamId: string) => {
    return teamMembers.filter(member => member.teamId === teamId);
  };

  const handleTeamSave = async (teamData: Omit<Team, 'id'>) => {
    try {
      if (editingTeam?.id) {
        // Editing existing team
        const updatedTeam: Team = {
          ...editingTeam,
          ...teamData,
        };
        await onTeamEdit(updatedTeam);
      } else {
        // Creating new team
        await onTeamSave(teamData);
      }
      setEditingTeam(undefined);
      setTeamDialogOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения команды:', error);
    }
  };

  const handleTeamEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamDialogOpen(true);
  };

  const openNewTeamDialog = () => {
    setEditingTeam(undefined);
    setTeamDialogOpen(true);
  };

  const handleRoleSave = async (roleData: Omit<Role, 'id' | 'createdAt'>) => {
    try {
      if (editingRole?.id) {
        // Editing existing role
        const updatedRole: Role = {
          ...editingRole,
          ...roleData,
        };
        await onRoleEdit(updatedRole);
      } else {
        // Creating new role
        await onRoleSave(roleData);
      }
      setEditingRole(undefined);
      setRoleDialogOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения роли:', error);
    }
  };

  const handleRoleEdit = (role: Role) => {
    setEditingRole(role);
    setRoleDialogOpen(true);
  };

  const openNewRoleDialog = () => {
    setEditingRole(undefined);
    setRoleDialogOpen(true);
  };

  const handleMemberSave = async (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingMember?.id) {
        // Editing existing member
        const updatedMember: TeamMember = {
          ...editingMember,
          ...memberData,
          updatedAt: new Date(),
        };
        await onMemberEdit(updatedMember);
      } else {
        // Creating new member
        await onMemberSave(memberData);
      }
      setEditingMember(undefined);
      setMemberDialogOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения участника:', error);
    }
  };

  const handleMemberEdit = (member: TeamMember) => {
    setEditingMember(member);
    setMemberDialogOpen(true);
  };

  const openNewMemberDialog = (teamId: string) => {
    setEditingMember({ 
      id: '', 
      name: '', 
      teamId, 
      roleId: roles[0]?.id || '', 
      createdAt: new Date(), 
      updatedAt: new Date() 
    } as TeamMember);
    setMemberDialogOpen(true);
  };

  const handleQuarterSave = async (quarterData: Omit<Quarter, 'id' | 'createdAt'>) => {
    try {
      if (editingQuarter?.id) {
        // Editing existing quarter
        const updatedQuarter: Quarter = {
          ...editingQuarter,
          ...quarterData,
        };
        await onQuarterEdit(updatedQuarter);
      } else {
        // Creating new quarter
        await onQuarterSave(quarterData);
      }
      setEditingQuarter(undefined);
      setQuarterDialogOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения квартала:', error);
    }
  };

  const handleQuarterEdit = (quarter: Quarter) => {
    setEditingQuarter(quarter);
    setQuarterDialogOpen(true);
  };

  const openNewQuarterDialog = () => {
    setEditingQuarter(undefined);
    setQuarterDialogOpen(true);
  };

  const openTeamCapacityDialog = (team: Team) => {
    setEditingTeamCapacity(team);
    setCapacityDialogOpen(true);
  };

  const openMemberCapacityDialog = (member: TeamMember) => {
    setEditingMemberCapacity(member);
    setMemberCapacityDialogOpen(true);
  };



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Управление командами</h1>
        <p className="text-muted-foreground mt-2">
          Управление командами, участниками и ролями в проекте
        </p>
      </div>

      <div className="space-y-8">
        {/* Команды и управление */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Левая колонка - Команды */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5 text-primary" />
                    Команды
                  </CardTitle>
                  <CardDescription>
                    Управление командами проекта
                  </CardDescription>
                </div>
                <Button onClick={openNewTeamDialog} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить команду
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teams.map(team => {
                  const memberCount = getMembersByTeamId(team.id).length;
                  const isSelected = team.id === selectedTeamForMembers;
                  return (
                    <Card 
                      key={team.id} 
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
                      }`} 
                      onClick={() => setSelectedTeamForMembers(team.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                            <div>
                              <span className="font-medium">{team.name}</span>
                              <div className="text-xs text-muted-foreground">
                                {memberCount} участник{memberCount === 1 ? '' : memberCount < 5 ? 'а' : 'ов'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTeamEdit(team);
                                }}
                              >
                                Изменить
                              </Button>
                              {onTeamDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (memberCount > 0) {
                                      alert('Нельзя удалить команду, в которой есть участники');
                                      return;
                                    }
                                    onTeamDelete(team.id);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                  disabled={memberCount > 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Правая колонка - Управление командой */}
          <div className="space-y-6">
            {/* Участники команды */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-primary" />
                      Участники команды
                    </CardTitle>
                    <CardDescription>
                      {selectedTeamForMembersObj ? `Участники команды "${selectedTeamForMembersObj.name}"` : 'Выберите команду для просмотра участников'}
                    </CardDescription>
                  </div>
                  {selectedTeamForMembersObj && (
                    <Button onClick={() => openNewMemberDialog(selectedTeamForMembersObj.id)} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить участника
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedTeamForMembersObj ? (
                  <div className="space-y-2">
                    {getMembersByTeamId(selectedTeamForMembersObj.id).map(member => {
                      const role = getRoleById(member.roleId);
                      return (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {role?.name} {member.email && `• ${member.email}`}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openMemberCapacityDialog(member)}
                              className="text-primary"
                            >
                              Capacity
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMemberEdit(member)}
                            >
                              Изменить
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMemberDelete(member.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              Удалить
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {getMembersByTeamId(selectedTeamForMembersObj.id).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        В команде пока нет участников
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Выберите команду для просмотра участников
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Capacity команды */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-primary" />
                      Capacity команды
                    </CardTitle>
                    <CardDescription>
                      {selectedTeamForMembersObj ? `Настройка capacity команды "${selectedTeamForMembersObj.name}" по кварталам` : 'Выберите команду для настройки capacity'}
                    </CardDescription>
                  </div>
                  {selectedTeamForMembersObj && (
                    <Button onClick={() => openTeamCapacityDialog(selectedTeamForMembersObj)} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Изменить capacity
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedTeamForMembersObj ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedTeamForMembersObj.color }}
                      />
                      <span className="font-medium">{selectedTeamForMembersObj.name}</span>
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      {quarters.map(quarter => {
                        const capacity = getTeamCapacity(selectedTeamForMembersObj.id, quarter.id);
                        return (
                          <div key={quarter.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{quarter.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {quarter.year} год
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">{capacity}</div>
                              <div className="text-xs text-muted-foreground">чел/спр</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Выберите команду для настройки capacity
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Управление ролями */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5 text-primary" />
                  Роли
                </CardTitle>
                <CardDescription>
                  Управление ролями участников
                </CardDescription>
              </div>
              <Button onClick={openNewRoleDialog} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить роль
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map(role => {
                const memberCount = teamMembers.filter(member => member.roleId === role.id).length;
                return (
                  <Card key={role.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {role.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {memberCount} участник{memberCount === 1 ? '' : memberCount < 5 ? 'а' : 'ов'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRoleEdit(role)}
                            className="flex-1"
                          >
                            Изменить
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRoleDelete(role.id)}
                            className="text-destructive hover:text-destructive"
                            disabled={memberCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Кварталы */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-5 w-5 text-primary" />
                  Кварталы
                </CardTitle>
                <CardDescription>
                  Управление кварталами для планирования
                </CardDescription>
              </div>
              <Button onClick={openNewQuarterDialog} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить квартал
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quarters.map(quarter => (
                <Card key={quarter.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{quarter.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {quarter.year} год • Q{quarter.quarter}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuarterEdit(quarter)}
                        >
                          Изменить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {quarters.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Пока нет кварталов. Добавьте первый квартал для планирования.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Диалоги */}
      <TeamDialog
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        team={editingTeam}
        onSave={handleTeamSave}
      />

      <RoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={editingRole}
        onSave={handleRoleSave}
      />

      <TeamMemberDialog
        open={memberDialogOpen}
        onOpenChange={setMemberDialogOpen}
        member={editingMember}
        teamId={editingMember?.teamId || selectedTeamForMembers}
        roles={roles}
        onSave={handleMemberSave}
      />

      <QuarterDialog
        open={quarterDialogOpen}
        onOpenChange={setQuarterDialogOpen}
        quarter={editingQuarter}
        onSave={handleQuarterSave}
      />

      <TeamCapacityDialog
        open={capacityDialogOpen}
        onOpenChange={setCapacityDialogOpen}
        team={editingTeamCapacity}
        quarters={quarters}
        getTeamCapacity={getTeamCapacity}
        onSave={onTeamCapacitySave}
      />

      <MemberCapacityDialog
        open={memberCapacityDialogOpen}
        onOpenChange={setMemberCapacityDialogOpen}
        member={editingMemberCapacity}
        quarters={quarters}
        getMemberCapacity={getMemberCapacity}
        onSave={onMemberCapacitySave}
      />


    </div>
  );
} 