import { useState } from "react";
import { Search } from "lucide-react";
import { Agent, CategoriePersonnel, Sexe, getAggregateAgents } from "@/data/schoolData";
import { useAppStore } from "@/hooks/useAppStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const categorieColors: Record<CategoriePersonnel, string> = {
  Administratif: "bg-accent/15 text-accent-foreground border-accent/30",
  Enseignant: "bg-primary/10 text-primary border-primary/20",
  Appui: "bg-success/15 text-success border-success/30",
};

export default function PersonnelPage() {
  const { data, selectedYear } = useAppStore();
  
  // Get all agents with their school information
  const agentsWithSchool = Object.entries(data.ecoles).flatMap(([schoolId, schoolData]) => {
    const yearData = schoolData.annees[selectedYear];
    if (!yearData) return [];
    
    return yearData.agents.map(agent => ({
      ...agent,
      schoolId,
      schoolName: schoolData.etablissement.nom
    }));
  });

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterSchool, setFilterSchool] = useState<string>("all");

  const filtered = agentsWithSchool.filter(agent => {
    const matchSearch = `${agent.nom} ${agent.prenoms} ${agent.matricule} ${agent.specialite}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || agent.categorie === filterCat;
    const matchSchool = filterSchool === "all" || agent.schoolId === filterSchool;
    return matchSearch && matchCat && matchSchool;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un agent..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="Administratif">Administratif</SelectItem>
              <SelectItem value="Enseignant">Enseignant</SelectItem>
              <SelectItem value="Appui">Appui</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSchool} onValueChange={setFilterSchool}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les écoles</SelectItem>
              {Object.entries(data.ecoles).map(([id, schoolData]) => (
                <SelectItem key={id} value={id}>{schoolData.etablissement.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">
          {filtered.length} agent(s) dans {filterSchool === "all" ? Object.keys(data.ecoles).length : 1} école{filterSchool === "all" ? (Object.keys(data.ecoles).length > 1 ? "(s)" : "") : ""}
        </span>
        <span className="text-muted-foreground">•</span>
        <span>{filtered.filter(a => a.sexe === "M").length} H / {filtered.filter(a => a.sexe === "F").length} F</span>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Matricule</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom & Prénoms</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Spécialité</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Poste</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Sexe</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">École</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(agent => (
                <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{agent.matricule}</td>
                  <td className="px-4 py-3 font-medium">{agent.nom} {agent.prenoms}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{agent.specialite}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{agent.poste}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={categorieColors[agent.categorie]}>{agent.categorie}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{agent.sexe === "M" ? "Homme" : "Femme"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{agent.schoolName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}