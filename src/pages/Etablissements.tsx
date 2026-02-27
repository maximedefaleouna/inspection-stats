import { useState, useRef } from "react";
import { Plus, Upload, Download, Edit, Trash2, Users, GraduationCap } from "lucide-react";
import { useAppStore } from "@/hooks/useAppStore";
import { Etablissement, SchoolData } from "@/data/schoolData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SchoolStats {
  agentCount: number;
  studentCount: number;
  years: string[];
}

export default function EtablissementsPage() {
  const { data, addSchool, deleteSchool } = useAppStore();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const schools = Object.entries(data.ecoles).map(([id, schoolData]) => ({
    id,
    ...schoolData.etablissement,
    stats: {
      agentCount: Object.values(schoolData.annees).reduce((sum, year) => sum + year.agents.length, 0),
      studentCount: Object.values(schoolData.annees).reduce((sum, year) => 
        sum + year.effectifs.reduce((effSum, eff) => effSum + eff.garcons + eff.filles, 0), 0
      ),
      years: Object.keys(schoolData.annees)
    } as SchoolStats
  }));

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        const parsed = JSON.parse(json);
        
        // Validate the JSON structure
        if (!parsed.etablissement || !parsed.annee || !parsed.data) {
          throw new Error("Invalid JSON structure");
        }
        
        // Check if school already exists
        const existingSchool = Object.values(data.ecoles).find(
          school => school.etablissement.nom === parsed.etablissement.nom
        );
        
        if (existingSchool) {
          // Update existing school
          const schoolId = Object.keys(data.ecoles).find(
            id => data.ecoles[id].etablissement.nom === parsed.etablissement.nom
          );
          if (schoolId) {
            // For now, we'll add as new year data to existing school
            // In a real implementation, you'd want more sophisticated merging
            toast({ 
              title: "École mise à jour", 
              description: `Données de l'année ${parsed.annee} ajoutées à ${parsed.etablissement.nom}` 
            });
          }
        } else {
          // Add new school
          const schoolData: SchoolData = {
            etablissement: {
              ...parsed.etablissement,
              id: `school_${Date.now()}` // Generate unique ID
            },
            annees: {
              [parsed.annee]: parsed.data
            }
          };
          
          addSchool(schoolData);
          toast({ 
            title: "École ajoutée", 
            description: `${parsed.etablissement.nom} a été ajoutée avec succès` 
          });
        }
      } catch (error) {
        toast({ 
          title: "Erreur", 
          description: "Fichier JSON invalide", 
          variant: "destructive" 
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExport = (schoolId: string) => {
    const school = data.ecoles[schoolId];
    if (!school) return;
    
    // Export the most recent year data
    const latestYear = Object.keys(school.annees).sort().pop() || "2025-2026";
    const exportData = {
      etablissement: school.etablissement,
      annee: latestYear,
      data: school.annees[latestYear]
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${school.etablissement.nom} - ${latestYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Export réussi", description: `Données de ${school.etablissement.nom} exportées` });
  };

  const handleDeleteClick = (schoolId: string) => {
    setSchoolToDelete(schoolId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (schoolToDelete) {
      deleteSchool(schoolToDelete);
      toast({ 
        title: "École supprimée", 
        description: "L'école a été supprimée avec succès" 
      });
      setDeleteDialogOpen(false);
      setSchoolToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Gestion des Établissements</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les écoles de votre inspection
          </p>
        </div>
        <Button onClick={handleImport}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une école
        </Button>
      </div>

      <input 
        ref={fileInputRef} 
        type="file" 
        accept=".json" 
        className="hidden" 
        onChange={handleFileImport} 
      />

      {schools.length === 0 ? (
        <div className="text-center py-12">
          <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune école trouvée</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par ajouter une école en important un fichier JSON
          </p>
          <Button onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Importer une école
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school) => (
            <Card key={school.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-heading">{school.nom}</CardTitle>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleExport(school.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(school.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Chef: {school.chef}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">{school.ville}, {school.region}</p>
                    <p className="text-muted-foreground">Tél: {school.telephone}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{school.stats.agentCount} agents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">{school.stats.studentCount} élèves</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Années disponibles:</p>
                    <div className="flex flex-wrap gap-1">
                      {school.stats.years.map(year => (
                        <span 
                          key={year} 
                          className="px-2 py-1 bg-muted rounded text-xs"
                        >
                          {year}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
             Ê-vous sûr de vouloir supprimer cette école ? Cette action est irréversible et toutes les données associées seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}