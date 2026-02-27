import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AgentFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  filterSex: string;
  onFilterSexChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  schools?: { id: string; nom: string }[];
  filterSchool?: string;
  onFilterSchoolChange?: (value: string) => void;
}

export function AgentFilter({
  search,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  filterSex,
  onFilterSexChange,
  showFilters,
  onToggleFilters,
  schools,
  filterSchool,
  onFilterSchoolChange
}: AgentFilterProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un agent..." 
              value={search} 
              onChange={e => onSearchChange(e.target.value)} 
              className="pl-9" 
            />
          </div>
          <Button 
            variant="outline" 
            onClick={onToggleFilters}
            className={showFilters ? "bg-muted" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
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
              {filterSchool !== undefined && onFilterSchoolChange && (
                <div>
                  <label className="text-sm font-medium">École</label>
                  <Select value={filterSchool} onValueChange={onFilterSchoolChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les écoles</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      {schools?.map(school => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
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
                <label className="text-sm font-medium">Sexe</label>
                <Select value={filterSex} onValueChange={onFilterSexChange}>
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
    </div>
  );
}