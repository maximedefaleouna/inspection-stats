import { useState, useMemo } from "react";
import { GraduationCap, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/hooks/useAppStore";
import {
  cycles, filieres, niveaux, classes,
  getEffectifClasse, getTotalEffectifs, getAggregateEffectifs
} from "@/data/schoolData";

export default function EffectifsPage() {
  const { data, selectedYear, getAggregatedData } = useAppStore();
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  
  // Get aggregated data for all schools or specific school
  const aggregatedData = useMemo(() => {
    if (selectedSchool === "all") {
      return getAggregatedData();
    } else {
      const school = data.ecoles[selectedSchool];
      if (!school) return getAggregatedData();
      
      const yearData = school.annees[selectedYear] || { effectifs: [], agents: [] };
      return {
        etablissement: school.etablissement,
        annee: selectedYear,
        data: yearData
      };
    }
  }, [selectedSchool, selectedYear, data, getAggregatedData]);
  
  const effectifs = aggregatedData.data.effectifs;

  const [selectedCycle, setSelectedCycle] = useState<string>("all");
  const [selectedFiliere, setSelectedFiliere] = useState<string>("all");
  const [selectedNiveau, setSelectedNiveau] = useState<string>("all");

  const filteredFilieres = selectedCycle === "all" ? filieres : filieres.filter(f => f.cycleId === selectedCycle);
  const filteredNiveaux = selectedCycle === "all" ? niveaux : niveaux.filter(n => n.cycleId === selectedCycle);

  const filteredClasses = useMemo(() => {
    return classes.filter(cl => {
      if (selectedNiveau !== "all" && cl.niveauId !== selectedNiveau) return false;
      if (selectedFiliere !== "all" && cl.filiereId !== selectedFiliere) return false;
      if (selectedCycle !== "all") {
        const niv = niveaux.find(n => n.id === cl.niveauId);
        if (niv && niv.cycleId !== selectedCycle) return false;
      }
      return true;
    });
  }, [selectedCycle, selectedFiliere, selectedNiveau]);

  const filteredEffectifs = effectifs.filter(e => filteredClasses.some(cl => cl.id === e.classeId));
  const totals = getTotalEffectifs(filteredEffectifs);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedSchool} onValueChange={setSelectedSchool}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Sélectionner une école" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les écoles</SelectItem>
            {Object.entries(data.ecoles).map(([id, school]) => (
              <SelectItem key={id} value={id}>{school.etablissement.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCycle} onValueChange={v => { setSelectedCycle(v); setSelectedFiliere("all"); setSelectedNiveau("all"); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Cycle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les cycles</SelectItem>
            {cycles.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filière" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes filières</SelectItem>
            {filteredFilieres.map(f => <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedNiveau} onValueChange={setSelectedNiveau}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Niveau" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous niveaux</SelectItem>
            {filteredNiveaux.map(n => <SelectItem key={n.id} value={n.id}>{n.nom}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 items-center rounded-xl bg-card border border-border p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold text-lg">{totals.total}</span>
          <span className="text-sm text-muted-foreground">
            élèves {selectedSchool === "all" ? `dans ${Object.keys(data.ecoles).length} école(s)` : `à ${data.ecoles[selectedSchool]?.etablissement.nom}`}
          </span>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-info" />
          <span className="text-sm"><strong>{totals.garcons}</strong> garçons</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <span className="text-sm"><strong>{totals.filles}</strong> filles</span>
        </div>
        <div className="h-6 w-px bg-border" />
        <span className="text-sm text-muted-foreground">{filteredClasses.length} classe(s)</span>
      </div>

      {/* Classes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map(cl => {
          const e = getEffectifClasse(effectifs, cl.id);
          const total = e.garcons + e.filles;
          const filiere = filieres.find(f => f.id === cl.filiereId);
          const niveau = niveaux.find(n => n.id === cl.niveauId);
          const cycle = cycles.find(c => c.id === niveau?.cycleId);

          return (
            <div key={cl.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-heading font-bold">{cl.nom}</h4>
                <Badge variant="outline" className="text-xs">{cycle?.nom}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{filiere?.nom} • {niveau?.nom}</p>

              <>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-heading font-bold">{total}</p>
                    <p className="text-xs text-muted-foreground">élèves</p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-info">{e.garcons}</p>
                      <p className="text-xs text-muted-foreground">G</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-accent">{e.filles}</p>
                      <p className="text-xs text-muted-foreground">F</p>
                    </div>
                  </div>
                </div>
                {total > 0 && (
                  <div className="mt-3 flex h-1.5 rounded-full overflow-hidden bg-muted">
                    <div className="bg-info" style={{ width: `${(e.garcons / total) * 100}%` }} />
                    <div className="bg-accent" style={{ width: `${(e.filles / total) * 100}%` }} />
                  </div>
                )}
              </>
            </div>
          );
        })}
      </div>
    </div>
  );
}