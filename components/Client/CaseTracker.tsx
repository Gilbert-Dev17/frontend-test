"use client";

import { useState, useMemo } from "react";
import {  LayoutGrid,  List as ListIcon,  Plus, Filter,} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { CASETRACKER_TABS, CASE_STATUS_FILTERS } from "@/lib/case-tracker/constant"

import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { CaseTrackerGridView, CaseTrackerListView } from "./CaseTrackerContent";

type CasetrackerProps ={
  attorneys: {user_id: string; name: string}[],
  cases: any[],

}

export default function CaseTracker( {attorneys, cases}: CasetrackerProps) {
  const [view, setView] = useState("grid");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = useMemo(() => {
    return cases.filter((legalCase) => {
      const title = legalCase.title?.toLowerCase() ?? "";
      const caseNumber = legalCase.case_number?.toLowerCase() ?? "";
      const caseId = legalCase.case_id?.toLowerCase() ?? "";

      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        title.includes(query) ||
        caseNumber.includes(query) ||
        caseId.includes(query);

       const matchesType = (() => {
          if (typeFilter === "all") {
            return !legalCase.is_archived;
          }

          if (typeFilter === "archived") {
            return legalCase.is_archived;
          }

        return (
          legalCase.case_type === typeFilter &&
          !legalCase.is_archived
        );
      })();

      const matchesStatus =
        statusFilter === "all" || legalCase.status === statusFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [cases, searchQuery, statusFilter, typeFilter]);

  return (
    <div className="min-h-screen p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">

      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 border-b pb-6">
        <Tabs
          defaultValue="all"
          onValueChange={setTypeFilter}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-transparent p-0 h-auto gap-2">
            {CASETRACKER_TABS.map((tabs) => (
              <TabsTrigger key={tabs.value} value={tabs.value}>{tabs.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="p-1 rounded-lg flex flex-col md:flex-row items-center gap-3 self-end xl:self-auto w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Case ID or Title..."
                className="pl-8 bg-background w-full md:w-50 lg:w-75"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline-block">
                  Filter by:
                </span>
                <Select onValueChange={setStatusFilter} value={statusFilter}>
                  <SelectTrigger className="w-33.5">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_STATUS_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={view} onValueChange={setView} className="w-auto">
                <TabsList className="bg-transparent border">
                  <TabsTrigger value="grid" className="px-2">
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" className="px-2">
                    <ListIcon className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((item) => (
           <CaseTrackerGridView
            key={item.case_id}
            caseId={item.case_id}
            caseStatus={item.status}
            caseTitle={item.title}
            caseNumber={item.case_number}
            caseAttorney={item.lead_attorney_name}
            createdAt={item.created_at}
            caseArchived={item.is_archived}
           />
          ))}

          {filteredCases.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No cases found matching these filters.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-75">Case Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lead Attorney</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((item) => (
                <CaseTrackerListView
                  key={item.case_id}
                  caseId={item.case_id}
                  caseStatus={item.status}
                  caseTitle={item.title}
                  caseNumber={item.case_number}
                  caseAttorney={item.lead_attorney_name}
                  createdAt={item.created_at}
                  caseArchived={item.is_archived}
                />
              ))}
              {filteredCases.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No cases found matching these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
