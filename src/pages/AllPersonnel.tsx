import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { ConsolidatedAgent, Agent, CategoriePersonnel, getConsolidatedAgents, filterAgentsBySchool, getSchoolList } from "@/data/schoolData";
import { useAppStore } from "@/hooks/useAppStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportJSON, exportExcel, exportPDF } from "@/lib/exportUtils";
import { toast } from "@/hooks/use-toast";

const categorieColors: Record<string, string> = {
  Administratif: "bg-accent/15 text-accent-foreground border-accent/30",
  Enseignant: "bg-primary/10 text-primary border-primary/20",
  Appui: "bg-success/15 text-success border-success/30",
};

export default function AllPersonnelPage() {
  const { data, selectedYear, getAggregatedData } = useAppStore();
  const allAgents = getConsolidatedAgents(data, selectedYear);
  
  const [search, setSearch] = useState("");
  const [filterSchool, setFilterSchool] = useState<string>("all");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterSex, setFilterSex] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const schools = getSchoolList(data);
  const inspectionAgents = data.inspectionAgents || [];

  const filtered = allAgents.filter(agent => {
    const matchSearch = `${agent.nom} ${agent.prenoms} ${agent.matricule} ${agent.specialite}`.toLowerCase().includes(search.toLowerCase());
    const matchSchool = filterSchool === "all" || agent.schoolId === filterSchool;
    const matchCat = filterCat === "all" || agent.categorie === filterCat;
    const matchSex = filterSex === "all" || agent.sexe === filterSex;
    return matchSearch && matchSchool && matchCat && matchSex;
  });

  const handleExport = (format: "json" | "excel" | "pdf") => {
    // Convert ConsolidatedAgent to Agent for export compatibility
    const exportableAgents: Agent[] = filtered.map(agent => ({
      id: agent.id,
      matricule: agent.matricule,
      nom: agent.nom,
      prenoms: agent.prenoms,
      specialite: agent.specialite,
      poste: agent.poste,
      sexe: agent.sexe,
      dateNaissance: agent.dateNaissance,
      categorie: agent.categorie as CategoriePersonnel // Type assertion - only include valid categories
    }));

    const payload = {
      etablissement: data.inspection, // Use inspection object directly for multi-school view
      annee: selectedYear,
      data: {
        agents: exportableAgents,
        effectifs: [] // No effectifs in consolidated view
      }
    };
    
    if (format === "json") exportJSON(payload);
    else if (format === "excel") exportExcel(payload);
    else exportPDF(payload);
    
    toast({ title: "Export réussi", description: `Données exportées en ${format.toUpperCase()}.` });
  };

  const getSourceBadge = (source: string) => {
    if (source === "inspection") {
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Inspection</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">École</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un agent..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9" 
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-muted" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
            PDF
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-heading">Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>École</Label>
                <Select value={filterSchool} onValueChange={setFilterSchool}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les écoles</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Catégorie</Label>
                <Select value={filterCat} onValueChange={setFilterCat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="Administratif">Administratif</SelectItem>
                    <SelectItem value="Enseignant">Enseignant</SelectItem>
                    <SelectItem value="Appui">Appui</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Sexe</Label>
                <Select value={filterSex} onValueChange={setFilterSex}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="M">Homme</SelectItem>
                    <SelectItem value="F">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">
          {filtered.length} agent(s) trouvés sur {allAgents.length} total
        </span>
        <span className="text-muted-foreground">•</span>
        <span>{filtered.filter(a => a.sexe === "M").length} H / {filtered.filter(a => a.sexe === "F").length} F</span>
        <span className="text-muted-foreground">•</span>
        <span>{filtered.filter(a => a.source === "inspection").length} Inspection / {filtered.filter(a => a.source === "school").length} Écoles</span>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Source</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">École</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Matricule</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom & Prénoms</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Spécialité</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Poste</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Sexe</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(agent => (
                <tr key={`${agent.id}-${agent.schoolId}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">{getSourceBadge(agent.source)}</td>
                  <td className="px-4 py-3 font-medium">{agent.schoolName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{agent.matricule}</td>
                  <td className="px-4 py-3 font-medium">{agent.nom} {agent.prenoms}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{agent.specialite}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{agent.poste}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={categorieColors[agent.categorie]}>{agent.categorie}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{agent.sexe === "M" ? "Homme" : "Femme"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}