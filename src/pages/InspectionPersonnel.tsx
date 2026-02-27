import { useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { InspectionAgent, CategoriePersonnel, CategorieInspection, Sexe } from "@/data/schoolData";
import { useAppStore } from "@/hooks/useAppStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const categorieColors: Record<CategorieInspection, string> = {
  Administratif: "bg-accent/15 text-accent-foreground border-accent/30",
  Inspecteur: "bg-primary/10 text-primary border-primary/20",
  Appui: "bg-success/15 text-success border-success/30",
};

export default function InspectionPersonnelPage() {
  const { getInspectionAgents, addInspectionAgent, updateInspectionAgent, deleteInspectionAgent } = useAppStore();
  const agentsList = getInspectionAgents();
  
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<InspectionAgent | null>(null);
  
  const [formData, setFormData] = useState({
    id: "",
    matricule: "",
    nom: "",
    prenoms: "",
    specialite: "",
    poste: "",
    sexe: "M" as Sexe,
    dateNaissance: "",
    categorie: "Administratif" as CategorieInspection,
  });

  const filtered = agentsList.filter(a => {
    const matchSearch = `${a.nom} ${a.prenoms} ${a.matricule} ${a.specialite}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || a.categorie === filterCat;
    return matchSearch && matchCat;
  });

  const handleAddAgent = () => {
    setEditingAgent(null);
    setFormData({
      id: `ia_${Date.now()}`,
      matricule: "",
      nom: "",
      prenoms: "",
      specialite: "",
      poste: "",
      sexe: "M",
      dateNaissance: "",
      categorie: "Administratif",
    });
    setIsDialogOpen(true);
  };

  const handleEditAgent = (agent: InspectionAgent) => {
    setEditingAgent(agent);
    setFormData(agent);
    setIsDialogOpen(true);
  };

  const handleDeleteAgent = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce personnel ?")) {
      deleteInspectionAgent(id);
      toast({ title: "Succès", description: "Personnel supprimé avec succès." });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgent) {
      updateInspectionAgent(editingAgent.id, formData);
      toast({ title: "Succès", description: "Personnel mis à jour avec succès." });
    } else {
      addInspectionAgent(formData);
      toast({ title: "Succès", description: "Personnel ajouté avec succès." });
    }
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="Administratif">Administratif</SelectItem>
              <SelectItem value="Inspecteur">Inspecteur</SelectItem>
              <SelectItem value="Appui">Appui</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddAgent}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Personnel
        </Button>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">{filtered.length} agent(s) d'inspection</span>
        <span className="text-muted-foreground">•</span>
        <span>{agentsList.filter(a => a.sexe === "M").length} H / {agentsList.filter(a => a.sexe === "F").length} F</span>
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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
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
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditAgent(agent)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteAgent(agent.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingAgent ? "Modifier le personnel" : "Ajouter un personnel"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Matricule</Label>
                <Input 
                  value={formData.matricule} 
                  onChange={e => handleInputChange("matricule", e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label>Sexe</Label>
                <Select value={formData.sexe} onValueChange={value => handleInputChange("sexe", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Homme</SelectItem>
                    <SelectItem value="F">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input 
                  value={formData.nom} 
                  onChange={e => handleInputChange("nom", e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label>Prénoms</Label>
                <Input 
                  value={formData.prenoms} 
                  onChange={e => handleInputChange("prenoms", e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Spécialité</Label>
                <Input 
                  value={formData.specialite} 
                  onChange={e => handleInputChange("specialite", e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label>Poste</Label>
                <Input 
                  value={formData.poste} 
                  onChange={e => handleInputChange("poste", e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de naissance</Label>
                <Input 
                  type="date" 
                  value={formData.dateNaissance} 
                  onChange={e => handleInputChange("dateNaissance", e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select value={formData.categorie} onValueChange={value => handleInputChange("categorie", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administratif">Administratif</SelectItem>
                    <SelectItem value="Inspecteur">Inspecteur</SelectItem>
                    <SelectItem value="Appui">Appui</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingAgent ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}