"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Search,
  Mail,
  Check,
  Shield,
  UserPlus,
  Users,
  MoreHorizontal,
  Trash2,
  Clock,
  MessageSquare,
  CheckCheck,
  Timer,
  BarChart3,
  UserCheck,
} from "lucide-react";

type Tab = "teams" | "members";

type TeamRule = "admin-approval" | "domain-restrict" | "max-members";

interface Team {
  id: string;
  name: string;
  description: string;
  rules: TeamRule[];
  memberIds: string[];
  createdAt: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
  status: "invited" | "active";
  invitedAt: string;
}

const RULE_LABELS: Record<TeamRule, string> = {
  "admin-approval": "Requires admin approval",
  "domain-restrict": "Restrict to @company.com",
  "max-members": "Max 10 members",
};

const defaultTeams: Team[] = [];
const defaultMembers: Member[] = [];

export default function TeamsPage() {
  const [tab, setTab] = useState<Tab>("teams");
  const [teams, setTeams] = useState<Team[]>(defaultTeams);
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [newTeam, setNewTeam] = useState({ name: "", description: "", rules: [] as TeamRule[] });
  const [inviteEmail, setInviteEmail] = useState("");
  const [teamNameError, setTeamNameError] = useState("");

  const filteredTeams = teams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  const filteredMembers = members.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  const createTeam = () => {
    if (!newTeam.name.trim()) {
      setTeamNameError("Team name is required");
      return;
    }
    const team: Team = {
      id: `t${Date.now()}`,
      name: newTeam.name,
      description: newTeam.description,
      rules: newTeam.rules,
      memberIds: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTeams([...teams, team]);
    setNewTeam({ name: "", description: "", rules: [] });
    setShowCreateTeam(false);
    setTeamNameError("");
  };

  const deleteTeam = (id: string) => {
    setTeams(teams.filter((t) => t.id !== id));
    if (selectedTeam?.id === id) setSelectedTeam(null);
  };

  const inviteMember = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) return;
    const member: Member = {
      id: `m${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "agent",
      status: "invited",
      invitedAt: new Date().toISOString().split("T")[0],
    };
    setMembers([...members, member]);
    setInviteEmail("");
    setShowInviteMember(false);
  };

  const addMembersToTeam = (teamId: string, memberIds: string[]) => {
    setTeams(teams.map((t) => (t.id === teamId ? { ...t, memberIds: [...new Set([...t.memberIds, ...memberIds])] } : t)));
    setShowAddMembers(false);
  };

  const removeMemberFromTeam = (teamId: string, memberId: string) => {
    setTeams(teams.map((t) => (t.id === teamId ? { ...t, memberIds: t.memberIds.filter((m) => m !== memberId) } : t)));
  };

  const toggleRule = (rule: TeamRule) => {
    setNewTeam((prev) => ({
      ...prev,
      rules: prev.rules.includes(rule) ? prev.rules.filter((r) => r !== rule) : [...prev.rules, rule],
    }));
  };

  return (
    <div className="flex h-full flex-col p-0 md:pl-3 md:pt-3">
      <div className="flex flex-1 flex-col overflow-hidden rounded-none md:rounded-tl-lg bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h1 className="text-sm font-semibold text-ink">Teams</h1>
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => setTab("teams")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                tab === "teams" ? "bg-ink text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setTab("members")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                tab === "members" ? "bg-ink text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Members
            </button>
          </div>
        </div>

        <div className="flex flex-1 gap-0 overflow-hidden">
        <div className="flex w-full md:w-72 flex-col border-r border-border">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={tab === "teams" ? "Search teams..." : "Search members..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-surface py-1.5 pl-6 pr-2 text-xs text-ink outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={() => (tab === "teams" ? setShowCreateTeam(true) : setShowInviteMember(true))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {tab === "teams" ? (
              filteredTeams.length === 0 ? (
                <p className="p-3 text-center text-xs text-muted-foreground">No teams yet</p>
              ) : (
                filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      selectedTeam?.id === team.id ? "bg-surface-2" : "hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-ink">{team.name}</p>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{team.memberIds.length}</span>
                      </div>
                    </div>
                    {team.description && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground truncate">{team.description}</p>
                    )}
                    {team.rules.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {team.rules.map((rule) => (
                          <span key={rule} className="inline-flex items-center gap-0.5 rounded bg-accent/10 px-1.5 py-0.5 text-[9px] text-accent">
                            <Shield className="h-2.5 w-2.5" />
                            {RULE_LABELS[rule]}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))
              )
            ) : (
              filteredMembers.length === 0 ? (
                <p className="p-3 text-center text-xs text-muted-foreground">No members yet</p>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                      selectedMember?.id === member.id ? "bg-surface-2" : "hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-[10px] font-medium text-accent">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {member.status === "invited" ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-700">
                          <Clock className="h-2.5 w-2.5" />
                          Invited
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded bg-green-100 px-1.5 py-0.5 text-[9px] text-green-700">
                          <Check className="h-2.5 w-2.5" />
                          Active
                        </span>
                      )}
                      <button className="rounded p-0.5 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </div>
                  </button>
                ))
              )
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {tab === "teams" && selectedTeam ? (
            <div className="flex flex-1 flex-col overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-ink">{selectedTeam.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedTeam.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowAddMembers(true)}
                    className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-ink hover:bg-surface-2"
                  >
                    <UserPlus className="h-3 w-3" />
                    Add Members
                  </button>
                  <button
                    onClick={() => deleteTeam(selectedTeam.id)}
                    className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Users className="h-3 w-3" />
                    <span className="text-[10px] font-medium">Members</span>
                  </div>
                  <p className="text-lg font-semibold text-ink">{selectedTeam.memberIds.length}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-[10px] font-medium">Active Conversations</span>
                  </div>
                  <p className="text-lg font-semibold text-ink">12</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <CheckCheck className="h-3 w-3" />
                    <span className="text-[10px] font-medium">Resolved This Week</span>
                  </div>
                  <p className="text-lg font-semibold text-ink">48</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Timer className="h-3 w-3" />
                    <span className="text-[10px] font-medium">Avg Response Time</span>
                  </div>
                  <p className="text-lg font-semibold text-ink">2.4m</p>
                </div>
              </div>

              {selectedTeam.rules.length > 0 && (
                <div className="mb-4 rounded-lg border border-border bg-surface p-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rules</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTeam.rules.map((rule) => (
                      <span key={rule} className="inline-flex items-center gap-1 rounded bg-accent/10 px-2 py-1 text-[10px] text-accent">
                        <Shield className="h-3 w-3" />
                        {RULE_LABELS[rule]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Members ({selectedTeam.memberIds.length})
                </p>
                {selectedTeam.memberIds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-xs text-muted-foreground">
                    <Users className="mb-2 h-8 w-8 text-border" />
                    <p>No members in this team</p>
                    <button
                      onClick={() => setShowAddMembers(true)}
                      className="mt-2 text-accent hover:underline"
                    >
                      Add members
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {selectedTeam.memberIds.map((mid) => {
                      const member = members.find((m) => m.id === mid);
                      if (!member) return null;
                      return (
                        <div key={mid} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-[10px] font-medium text-accent">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-ink">{member.name}</p>
                              <p className="text-[10px] text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeMemberFromTeam(selectedTeam.id, mid)}
                            className="rounded p-1 text-muted-foreground hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : tab === "members" && selectedMember ? (
            <div className="flex flex-1 flex-col overflow-y-auto p-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-sm font-medium text-accent">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">{selectedMember.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedMember.email}</p>
                </div>
                <div className="ml-auto">
                  {selectedMember.status === "invited" ? (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-[10px] text-amber-700">
                      <Clock className="h-3 w-3" />
                      Invited
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-[10px] text-green-700">
                      <Check className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-[10px] font-medium">Conversations</span>
                  </div>
                  <p className="text-lg font-semibold text-ink">24</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <CheckCheck className="h-3 w-3" />
                    <span className="text-[10px] font-medium">Resolved</span>
                  </div>
                  <p className="text-lg font-semibold text-ink">18</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Timer className="h-3 w-3" />
                    <span className="text-[10px] font-medium">Avg Response</span>
                  </div>
                  <p className="text-lg font-semibold text-ink">1.8m</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Teams</p>
                <div className="space-y-1">
                  {teams.filter((t) => t.memberIds.includes(selectedMember.id)).length === 0 ? (
                    <p className="text-xs text-muted-foreground">Not assigned to any team</p>
                  ) : (
                    teams
                      .filter((t) => t.memberIds.includes(selectedMember.id))
                      .map((team) => (
                        <div key={team.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-ink">{team.name}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</p>
                <div className="space-y-2">
                  {[
                    { action: "Resolved ticket #1024", time: "2 hours ago" },
                    { action: "Joined conversation with John Doe", time: "3 hours ago" },
                    { action: "Assigned to Support team", time: "1 day ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-border px-3 py-2">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      <div>
                        <p className="text-xs text-ink">{activity.action}</p>
                        <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : tab === "teams" ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Users className="mx-auto mb-2 h-10 w-10 text-border" />
                <p className="text-xs text-muted-foreground">Select a team to view details</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Users className="mx-auto mb-2 h-10 w-10 text-border" />
                <p className="text-xs text-muted-foreground">Select a member to view their report</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateTeam && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowCreateTeam(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-96 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Create Team</h3>
              <button onClick={() => { setShowCreateTeam(false); setTeamNameError(""); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => { setNewTeam({ ...newTeam, name: e.target.value }); setTeamNameError(""); }}
                  placeholder="e.g. Support"
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink outline-none placeholder:text-muted-foreground"
                />
                {teamNameError && <p className="mt-0.5 text-[10px] text-red-500">{teamNameError}</p>}
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Description</label>
                <input
                  type="text"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="What is this team for?"
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Rules</label>
                <div className="mt-1 space-y-1.5">
                  {(["admin-approval", "domain-restrict", "max-members"] as TeamRule[]).map((rule) => (
                    <label key={rule} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTeam.rules.includes(rule)}
                        onChange={() => toggleRule(rule)}
                        className="h-3.5 w-3.5 rounded border-border text-accent"
                      />
                      <span className="text-xs text-ink">{RULE_LABELS[rule]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setShowCreateTeam(false); setTeamNameError(""); }} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button onClick={createTeam} className="rounded-md bg-ink px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90">
                Create Team
              </button>
            </div>
          </div>
        </>
      )}

      {showInviteMember && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowInviteMember(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-96 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Invite Member</h3>
              <button onClick={() => setShowInviteMember(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && inviteMember()}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowInviteMember(false)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button onClick={inviteMember} disabled={!inviteEmail.includes("@")} className="rounded-md bg-ink px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90 disabled:opacity-40">
                Send Invite
              </button>
            </div>
          </div>
        </>
      )}

      {showAddMembers && selectedTeam && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowAddMembers(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-96 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Add Members to {selectedTeam.name}</h3>
              <button onClick={() => setShowAddMembers(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-[10px] text-muted-foreground">Select members to add to this team</p>
            <div className="max-h-60 space-y-1 overflow-y-auto">
              {members.filter((m) => !selectedTeam.memberIds.includes(m.id)).length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  All members are already in this team.{" "}
                  <button onClick={() => { setShowAddMembers(false); setShowInviteMember(true); }} className="text-accent hover:underline">
                    Invite more
                  </button>
                </p>
              ) : (
                <>
                  {members
                    .filter((m) => !selectedTeam.memberIds.includes(m.id))
                    .map((member) => (
                      <label key={member.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(member.id)}
                          onChange={() =>
                            setSelectedMemberIds((prev) =>
                              prev.includes(member.id)
                                ? prev.filter((id) => id !== member.id)
                                : [...prev, member.id]
                            )
                          }
                          className="h-3.5 w-3.5 rounded border-border text-accent"
                        />
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-[9px] font-medium text-accent">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-ink truncate">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                        </div>
                        <span className={`text-[9px] ${member.status === "active" ? "text-green-600" : "text-amber-600"}`}>
                          {member.status === "active" ? "Active" : "Invited"}
                        </span>
                      </label>
                    ))}
                  <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
                    <button onClick={() => setShowAddMembers(false)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                      Cancel
                    </button>
                    <button
                      onClick={() => { addMembersToTeam(selectedTeam.id, selectedMemberIds); setSelectedMemberIds([]); }}
                      disabled={selectedMemberIds.length === 0}
                      className="rounded-md bg-ink px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90 disabled:opacity-40"
                    >
                      Add {selectedMemberIds.length > 0 ? `(${selectedMemberIds.length})` : ""}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
